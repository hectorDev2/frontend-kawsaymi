'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Sparkles, ArrowLeft, Loader2, Plus, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { HelpTooltip } from '@/components/help-tooltip'
import { api } from '@/lib/api'
import { useAuth } from '@/lib/auth-context'
import { buildTipCacheKey, getCachedTip, setCachedTip } from '@/lib/ai-tip-cache'
import { useHealthContext } from '@/lib/health-context'
import { useSpeechToText } from '@/lib/use-speech-to-text'
import { useTextToSpeech } from '@/lib/use-text-to-speech'
import { COMMON_MEDICATIONS, PRESCRIPTION_REASONS, ADMINISTRATION_ROUTES, FREQ_OPTIONS } from '@/lib/medication-constants'
import { toast } from 'sonner'
import Link from 'next/link'

function formatScheduleDate(dateStr: string, timeStr: string): string {
  const [y, mo, d] = dateStr.split('-').map(Number)
  const [h, mi] = timeStr.split(':').map(Number)
  return new Date(y ?? 0, (mo ?? 1) - 1, d ?? 1, h ?? 0, mi ?? 0, 0, 0).toISOString()
}

export default function NewMedicationPage() {
  const router = useRouter()
  const { user } = useAuth()
  const healthContext = useHealthContext()

  const [name, setName] = useState('')
  const [nameOpen, setNameOpen] = useState(false)
  const [dose, setDose] = useState('')
  const [reasonForPrescription, setReasonForPrescription] = useState('')
  const [administrationRoute, setAdministrationRoute] = useState('')
  const [freq, setFreq] = useState(FREQ_OPTIONS[0])
  const [customTimes, setCustomTimes] = useState([...FREQ_OPTIONS[0].times])
  const [isPermanent, setIsPermanent] = useState(false)
  const [instructions, setInstructions] = useState('')
  const [startDate, setStartDate] = useState(() => new Date().toISOString().slice(0, 10))
  const [endDate, setEndDate] = useState('')
  const [saving, setSaving] = useState(false)
  const [aiLoading, setAiLoading] = useState(false)
  const [aiError, setAiError] = useState('')
  const [error, setError] = useState('')
  const [alerts, setAlerts] = useState<Array<{ title: string; description: string; severity: string }>>([])

  const stt = useSpeechToText()
  const tts = useTextToSpeech()

  useEffect(() => {
    if (stt.transcript && !stt.isListening) {
      setName(stt.transcript.charAt(0).toUpperCase() + stt.transcript.slice(1))
    }
  }, [stt.transcript, stt.isListening])

  const handleFreqChange = (opt: typeof FREQ_OPTIONS[0]) => {
    setFreq(opt)
    if (opt.times.length > 0) setCustomTimes([...opt.times])
  }

  const addTime = () => setCustomTimes((p) => [...p, '12:00'])
  const updateTime = (i: number, v: string) => setCustomTimes((p) => p.map((t, j) => (j === i ? v : t)))
  const removeTime = (i: number) => setCustomTimes((p) => p.filter((_, j) => j !== i))

  const handleAI = async () => {
    if (!name.trim()) { setAiError('Primero escribe el nombre del medicamento'); return }
    const conditions = ((user as any)?.conditions ?? []) as string[]
    const cacheKey = buildTipCacheKey({ medicationName: name, dose: dose || undefined, conditions })
    const cached = getCachedTip(cacheKey)
    if (cached) { setInstructions(cached); setAiError(''); return }
    setAiError(''); setAiLoading(true)
    try {
      const res = await fetch('/api/ai-suggestions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ medicationName: name, dose, conditions, intent: 'instructions', userContext: healthContext }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(data?.error || 'No se pudo obtener sugerencia')
      const text = (data?.suggestion ?? '').toString().trim()
      if (text) { setInstructions(text); setCachedTip(cacheKey, text) }
      else setAiError('No se pudo obtener sugerencia')
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Error de conexión'
      setAiError(msg.includes('401') || msg.toLowerCase().includes('unauthorized')
        ? 'Necesitas iniciar sesión para generar la sugerencia.'
        : msg.includes('502') || msg.includes('503')
        ? 'El servicio de IA está temporalmente no disponible.'
        : msg)
    } finally { setAiLoading(false) }
  }

  const handleSave = async () => {
    const errors: string[] = []
    if (!name.trim()) errors.push('El nombre del medicamento es obligatorio')
    if (!dose.trim()) errors.push('La dosis es obligatoria')
    if (!reasonForPrescription) errors.push('Selecciona el motivo de prescripción')
    if (!administrationRoute) errors.push('Selecciona la vía de administración')
    if (customTimes.length === 0 && freq.value > 0) errors.push('Agrega al menos un horario')
    if (!isPermanent && endDate && startDate && new Date(endDate) < new Date(startDate)) {
      errors.push('La fecha de finalización no puede ser anterior a la fecha de inicio')
    }
    if (errors.length > 0) { setError(errors.join('. ')); return }
    setError(''); setSaving(true)
    try {
      const start = new Date(startDate)
      let effectiveEndDate: string | undefined
      if (!isPermanent && endDate) effectiveEndDate = endDate
      else if (!isPermanent) {
        const e = new Date(start); e.setDate(e.getDate() + 29)
        effectiveEndDate = e.toISOString().slice(0, 10)
      }
      const schedule = customTimes.length > 0 ? customTimes.map((t) => formatScheduleDate(startDate, t)) : []

      const result = await api.createMedication({
        name: name.trim(), dose: dose.trim(),
        frequency: freq.value, intervalHours: freq.hours,
        reasonForPrescription: reasonForPrescription || undefined,
        administrationRoute: administrationRoute || undefined,
        isPermanent: isPermanent || undefined,
        instructions: instructions.trim() || undefined,
        startDate, endDate: effectiveEndDate || undefined, schedule,
      })

      const createdAlerts = (result as any)?.alerts
      if (createdAlerts?.length > 0) setAlerts(createdAlerts)
      else { toast.success('Medicamento guardado correctamente'); router.push('/medications') }
    } catch (e: any) { setError(e?.message ?? 'Error al guardar'); setSaving(false) }
  }

  if (alerts.length > 0) {
    return (
      <div className="px-4 py-6 md:px-8 md:py-8 max-w-lg mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <Link href="/medications">
            <button className="w-9 h-9 rounded-xl border border-border flex items-center justify-center hover:bg-accent transition-colors">
              <ArrowLeft className="w-4 h-4" />
            </button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold">Alertas generadas</h1>
            <p className="text-sm text-muted-foreground">El sistema detectó posibles interacciones</p>
          </div>
        </div>
        <div className="space-y-4">
          {alerts.map((a, i) => (
            <div key={i} className={`card-elevated p-5 ${a.severity === 'HIGH' ? 'bg-destructive/5' : 'bg-amber-50'}`}>
              <p className="font-bold text-base">{a.title}</p>
              <p className="text-sm text-muted-foreground mt-2">{a.description}</p>
              <span className={`inline-block mt-2 text-xs font-semibold px-2.5 py-1 rounded-full ${a.severity === 'HIGH' ? 'bg-destructive/10 text-destructive' : 'bg-amber-100 text-amber-700'}`}>
                {a.severity === 'HIGH' ? 'Alta prioridad' : 'Precaución'}
              </span>
            </div>
          ))}
        </div>
        <div className="flex gap-3 mt-6">
          <Button variant="outline" onClick={() => router.push('/medications')} className="flex-1 h-12">Volver a medicamentos</Button>
          <Button onClick={() => { setAlerts([]); setSaving(false) }} className="flex-1 h-12">Agregar otro</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="px-4 py-6 md:px-8 md:py-8 max-w-lg mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <Link href="/medications">
          <button className="w-9 h-9 rounded-xl border border-border flex items-center justify-center hover:bg-accent transition-colors">
            <ArrowLeft className="w-4 h-4" />
          </button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold">Nuevo medicamento</h1>
          <p className="text-sm text-muted-foreground">Completá los datos de tu medicamento</p>
        </div>
      </div>

      <div className="space-y-5">
        <div className="card-elevated p-5 space-y-2">
          <div className="flex items-center gap-1.5">
            <label className="text-sm font-semibold">Medicamento</label>
            <HelpTooltip>Escribí el nombre del medicamento. El sistema te sugerirá opciones mientras escribís.</HelpTooltip>
          </div>
          <div className="flex gap-2">
            <Popover open={nameOpen} onOpenChange={setNameOpen}>
              <PopoverTrigger asChild>
                <Input
                  placeholder="Ej: Losartán, Metformina..."
                  value={name}
                  onChange={(e) => { setName(e.target.value); setNameOpen(true) }}
                  className="text-base h-12 flex-1"
                />
              </PopoverTrigger>
              <PopoverContent align="start" className="p-0 w-[var(--radix-popover-trigger-width)]">
                <Command>
                  <CommandInput placeholder="Buscar medicamento..." value={name} onValueChange={setName} />
                  <CommandList>
                    <CommandEmpty>
                      <button onClick={() => setNameOpen(false)} className="w-full text-left px-3 py-2 text-sm text-primary font-semibold hover:bg-accent rounded-sm">
                        Usar &ldquo;{name}&rdquo; como otro medicamento
                      </button>
                    </CommandEmpty>
                    <CommandGroup heading="Sugerencias">
                      {COMMON_MEDICATIONS.filter((m) => m.toLowerCase().includes(name.toLowerCase())).map((med) => (
                        <CommandItem key={med} value={med} onSelect={(value) => { setName(value); setNameOpen(false) }}>
                          {med}
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
            {stt.supported && (
              <button
                type="button"
                onClick={stt.isListening ? stt.stop : stt.start}
                className={`w-12 h-12 rounded-xl border flex items-center justify-center transition-all flex-shrink-0 ${
                  stt.isListening
                    ? 'bg-destructive text-destructive-foreground border-destructive animate-pulse'
                    : 'border-border hover:bg-accent text-muted-foreground hover:text-foreground'
                }`}
                aria-label={stt.isListening ? 'Detener grabación' : 'Grabar por voz'}
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
                  <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" />
                  <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
                  <line x1="12" x2="12" y1="19" y2="22" />
                </svg>
              </button>
            )}
          </div>
          {stt.error && <p className="text-xs text-destructive">{stt.error}</p>}
          {stt.isListening && <p className="text-xs text-muted-foreground animate-pulse">Escuchando... hablá claramente.</p>}
        </div>

        <div className="card-elevated p-5 space-y-2">
          <div className="flex items-center gap-1.5">
            <label className="text-sm font-semibold">Motivo de prescripción</label>
            <HelpTooltip>Es la razón por la que tu médico recetó este medicamento, por ejemplo: hipertensión, diabetes.</HelpTooltip>
          </div>
          <Select value={reasonForPrescription} onValueChange={setReasonForPrescription}>
            <SelectTrigger className="text-base h-12">
              <SelectValue placeholder="Seleccioná el motivo..." />
            </SelectTrigger>
            <SelectContent>
              {PRESCRIPTION_REASONS.map((r) => (<SelectItem key={r} value={r}>{r}</SelectItem>))}
            </SelectContent>
          </Select>
        </div>

        <div className="card-elevated p-5 space-y-2">
          <div className="flex items-center gap-1.5">
            <label className="text-sm font-semibold">Dosis</label>
            <HelpTooltip>Es la cantidad del medicamento que debés tomar cada vez. Ej: 50 mg, 1 tableta, 10 ml.</HelpTooltip>
          </div>
          <Input placeholder="Ej: 500mg, 1 comprimido, 10ml..." value={dose} onChange={(e) => setDose(e.target.value)} className="text-base h-12" />
        </div>

        <div className="card-elevated p-5 space-y-2">
          <div className="flex items-center gap-1.5">
            <label className="text-sm font-semibold">Vía de administración</label>
            <HelpTooltip>Indica cómo se administra el medicamento: oral (por boca), tópica (sobre la piel), inhalatoria, etc.</HelpTooltip>
          </div>
          <Select value={administrationRoute} onValueChange={setAdministrationRoute}>
            <SelectTrigger className="text-base h-12">
              <SelectValue placeholder="Seleccioná la vía..." />
            </SelectTrigger>
            <SelectContent>
              {ADMINISTRATION_ROUTES.map((r) => (<SelectItem key={r} value={r}>{r}</SelectItem>))}
            </SelectContent>
          </Select>
        </div>

        <div className="card-elevated p-5 space-y-3">
          <div className="flex items-center gap-1.5">
            <label className="text-sm font-semibold">Frecuencia</label>
            <HelpTooltip>Cada cuánto tiempo debés tomar el medicamento. El sistema sugerirá horarios automáticamente.</HelpTooltip>
          </div>
          <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
            {FREQ_OPTIONS.map((opt) => (
              <button key={opt.value} onClick={() => handleFreqChange(opt)}
                className={`py-3 rounded-xl text-sm font-semibold border transition-all ${freq.value === opt.value ? 'bg-primary text-primary-foreground border-primary shadow-sm' : 'border-border hover:bg-accent'}`}>
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {freq.value > 0 && (
          <div className="card-elevated p-5 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <label className="text-sm font-semibold">Horarios</label>
                <HelpTooltip>Horas del día en que debés tomar el medicamento. Podés agregar o modificar horarios.</HelpTooltip>
              </div>
              <button onClick={addTime} className="flex items-center gap-1 text-xs font-semibold text-primary bg-primary/10 hover:bg-primary/15 px-3 py-1.5 rounded-lg transition-colors">
                <Plus className="w-3.5 h-3.5" /> Agregar horario
              </button>
            </div>
            <div className="space-y-2">
              {customTimes.map((time, i) => (
                <div key={i} className="flex items-center gap-2">
                  <Input type="time" value={time} onChange={(e) => updateTime(i, e.target.value)} className="text-base h-12 flex-1" />
                  {customTimes.length > 1 && (
                    <button onClick={() => removeTime(i)} className="w-10 h-10 rounded-lg border border-border flex items-center justify-center hover:bg-destructive/10 hover:text-destructive transition-colors">
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="card-elevated p-5 space-y-2">
          <div className="flex items-center gap-1.5">
            <label className="text-sm font-semibold">Fecha de inicio</label>
            <HelpTooltip>El día en que comenzaste o comenzarás a tomar este medicamento.</HelpTooltip>
          </div>
          <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="text-base h-12" />
        </div>

        <div className="card-elevated p-5 space-y-3">
          <div className="flex items-center gap-1.5">
            <label className="text-sm font-semibold">Fecha de finalización</label>
            <HelpTooltip>Si tu tratamiento tiene una fecha de término, indicála acá. Si es crónico, marcá &quot;Tratamiento permanente&quot;.</HelpTooltip>
          </div>
          <div className="flex items-center gap-3">
            <Checkbox id="isPermanent" checked={isPermanent} onCheckedChange={(c) => setIsPermanent(c === true)} />
            <label htmlFor="isPermanent" className="text-sm font-medium cursor-pointer">Tratamiento permanente</label>
          </div>
          {!isPermanent && (
            <Input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="text-base h-12" placeholder="Opcional" />
          )}
          {!isPermanent && !endDate && (
            <p className="text-xs text-muted-foreground">Si no indicás fecha, se asumirá una duración de 30 días.</p>
          )}
        </div>

        <div className="card-elevated p-5 space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <label className="text-sm font-semibold">Cómo tomarlo</label>
              <HelpTooltip>Instrucciones específicas sobre cómo tomar este medicamento. Podés usar la IA para generar sugerencias.</HelpTooltip>
            </div>
            <button onClick={handleAI} disabled={aiLoading}
              className="flex items-center gap-1.5 text-xs font-semibold text-primary bg-primary/10 hover:bg-primary/15 px-3 py-1.5 rounded-lg transition-colors disabled:opacity-60">
              {aiLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
              Sugerencia IA
            </button>
          </div>
          <textarea placeholder="Ej: Tomarlo con el desayuno para evitar molestias..." value={instructions}
            onChange={(e) => setInstructions(e.target.value)} rows={3}
            className="w-full rounded-xl border border-input bg-background px-4 py-3 text-base resize-none focus:outline-none focus:ring-2 focus:ring-ring" />
          {aiError && <p className="text-xs text-destructive">{aiError}</p>}
          {aiLoading && <p className="text-xs text-muted-foreground animate-pulse">Consultando IA...</p>}
        </div>

        {error && <p className="text-sm text-destructive font-medium text-center">{error}</p>}

        <Button onClick={handleSave} disabled={saving} size="lg" className="w-full h-14 text-base gap-2">
          {saving && <Loader2 className="w-5 h-5 animate-spin" />}
          {saving ? 'Guardando...' : 'Guardar medicamento'}
        </Button>
      </div>
    </div>
  )
}
