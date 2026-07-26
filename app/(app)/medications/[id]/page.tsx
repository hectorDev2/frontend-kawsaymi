'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { ArrowLeft, Loader2, Pill, Clock, AlertTriangle, CheckCircle2, XCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog'
import { HelpTooltip } from '@/components/help-tooltip'
import { api } from '@/lib/api'
import { useAuth } from '@/lib/auth-context'
import { buildTipCacheKey, getCachedTip, setCachedTip } from '@/lib/ai-tip-cache'
import { useHealthContext } from '@/lib/health-context'
import Link from 'next/link'
import type { Medication, ClinicalAlert } from '@/lib/api'
import { getMedicationKnowledge, getInteractions } from '@/lib/medication-knowledge'
import { useTextToSpeech } from '@/lib/use-text-to-speech'
import { useSpeechToText } from '@/lib/use-speech-to-text'
import { COMMON_MEDICATIONS, PRESCRIPTION_REASONS, ADMINISTRATION_ROUTES, FREQ_OPTIONS } from '@/lib/medication-constants'
import { toast } from 'sonner'

const STATUS_CONFIG = {
  ACTIVE: { label: 'Activo', class: 'bg-secondary/10 text-secondary' },
  SUSPENDED: { label: 'Suspendido', class: 'bg-amber-100 text-amber-700' },
  COMPLETED: { label: 'Finalizado', class: 'bg-muted text-muted-foreground' },
}

function formatScheduleDate(dateStr: string, timeStr: string): string {
  const [y, mo, d] = dateStr.split('-').map(Number)
  const [h, mi] = timeStr.split(':').map(Number)
  return new Date(y ?? 0, (mo ?? 1) - 1, d ?? 1, h ?? 0, mi ?? 0, 0, 0).toISOString()
}

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString('es', { hour: '2-digit', minute: '2-digit', hour12: false })
}

export default function EditMedicationPage() {
  const router = useRouter()
  const params = useParams()
  const id = params.id as string
  const { user } = useAuth()
  const healthContext = useHealthContext()

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const [name, setName] = useState('')
  const [nameOpen, setNameOpen] = useState(false)
  const [dose, setDose] = useState('')
  const [reasonForPrescription, setReasonForPrescription] = useState('')
  const [administrationRoute, setAdministrationRoute] = useState('')
  const [freq, setFreq] = useState(FREQ_OPTIONS[0])
  const [customTimes, setCustomTimes] = useState<string[]>([])
  const [isPermanent, setIsPermanent] = useState(false)
  const [instructions, setInstructions] = useState('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [status, setStatus] = useState<string>('ACTIVE')
  const [updatingStatus, setUpdatingStatus] = useState(false)
  const [confirmStatus, setConfirmStatus] = useState<string | null>(null)

  const [educationalInfo, setEducationalInfo] = useState<ReturnType<typeof getMedicationKnowledge> | null>(null)
  const [interactions, setInteractions] = useState<ReturnType<typeof getInteractions>>([])
  const [medAlerts, setMedAlerts] = useState<ClinicalAlert[]>([])
  const tts = useTextToSpeech()
  const stt = useSpeechToText()

  useEffect(() => {
    if (stt.transcript && !stt.isListening) {
      setName(stt.transcript.charAt(0).toUpperCase() + stt.transcript.slice(1))
    }
  }, [stt.transcript, stt.isListening])

  useEffect(() => {
    Promise.all([
      api.getMedication(id),
      api.getAlerts().catch(() => ({ alerts: [] })),
      api.getMe().catch(() => ({ user: { conditions: [] } })),
    ]).then(([medRes, alertsRes, meRes]) => {
      const m = (medRes as any).medication as Medication
      setName(m.name)
      setDose(m.dose)
      setReasonForPrescription(m.reasonForPrescription ?? '')
      setAdministrationRoute(m.administrationRoute ?? '')
      const matched = FREQ_OPTIONS.find((f) => f.value === m.frequency) ?? FREQ_OPTIONS[0]
      setFreq(matched)
      setCustomTimes(m.schedule.map((s) => formatTime(s)))
      setIsPermanent(m.isPermanent ?? false)
      setInstructions(m.instructions ?? '')
      setStartDate(m.startDate.slice(0, 10))
      setEndDate(m.endDate?.slice(0, 10) ?? '')
      setStatus(m.status)

      setEducationalInfo(getMedicationKnowledge(m.name))
      const userConditions: string[] = (meRes as any)?.user?.conditions ?? []
      setInteractions(getInteractions(m.name, userConditions))
      setMedAlerts((alertsRes as any)?.alerts?.filter((a: ClinicalAlert) => a.medicationId === m.id) ?? [])

      setLoading(false)
    }).catch(() => { router.push('/medications') })
  }, [id, router])

  const handleFreqChange = (opt: typeof FREQ_OPTIONS[0]) => {
    setFreq(opt)
    if (opt.times.length > 0) setCustomTimes([...opt.times])
  }

  const addTime = () => setCustomTimes((p) => [...p, '12:00'])
  const updateTime = (i: number, v: string) => setCustomTimes((p) => p.map((t, j) => (j === i ? v : t)))
  const removeTime = (i: number) => setCustomTimes((p) => p.filter((_, j) => j !== i))

  const handleSave = async () => {
    const errors: string[] = []
    if (!name.trim()) errors.push('El nombre es obligatorio')
    if (!dose.trim()) errors.push('La dosis es obligatoria')
    if (!reasonForPrescription) errors.push('Selecciona el motivo de prescripción')
    if (!administrationRoute) errors.push('Selecciona la vía de administración')
    if (!isPermanent && endDate && startDate && new Date(endDate) < new Date(startDate)) {
      errors.push('La fecha de finalización no puede ser anterior a la fecha de inicio')
    }
    if (errors.length > 0) { setError(errors.join('. ')); return }
    setError(''); setSaving(true)
    try {
      const start = new Date(startDate)
      let effectiveEndDate: string | undefined
      if (!isPermanent && endDate) effectiveEndDate = endDate
      else if (!isPermanent && startDate) {
        const e = new Date(start); e.setDate(e.getDate() + 29)
        effectiveEndDate = e.toISOString().slice(0, 10)
      }
      const schedule = customTimes.length > 0 ? customTimes.map((t) => formatScheduleDate(startDate, t)) : []

      await api.updateMedication(id, {
        name: name.trim(), dose: dose.trim(),
        frequency: freq.value, intervalHours: freq.hours,
        reasonForPrescription: reasonForPrescription || undefined,
        administrationRoute: administrationRoute || undefined,
        isPermanent: isPermanent || undefined,
        instructions: instructions.trim() || undefined,
        startDate, endDate: effectiveEndDate || undefined, schedule,
      })
      toast.success('Cambios guardados correctamente')
      router.push('/medications')
    } catch (e: any) { setError(e?.message ?? 'Error al guardar'); setSaving(false) }
  }

  const handleStatusChange = async (newStatus: string) => {
    if (newStatus === 'ACTIVE') {
      setConfirmStatus(newStatus)
      return
    }
    setUpdatingStatus(true)
    try {
      await api.patchMedicationStatus(id, newStatus as any)
      setStatus(newStatus)
      toast.success(`Medicamento ${newStatus === 'COMPLETED' ? 'finalizado' : 'suspendido'}`)
    } catch { /* ignore */ }
    setUpdatingStatus(false)
  }

  const confirmStatusChange = async () => {
    if (!confirmStatus) return
    setConfirmStatus(null)
    setUpdatingStatus(true)
    try {
      await api.patchMedicationStatus(id, confirmStatus as any)
      setStatus(confirmStatus)
      toast.success(`Medicamento ${confirmStatus === 'COMPLETED' ? 'finalizado' : 'suspendido'}`)
    } catch { /* ignore */ }
    setUpdatingStatus(false)
  }

  if (loading) return (
    <div className="px-4 py-6 md:px-8 md:py-8 max-w-lg mx-auto">
      <div className="animate-pulse space-y-5">
        <div className="h-8 w-48 bg-muted rounded" />
        <div className="h-12 bg-muted rounded-xl" />
        <div className="h-12 bg-muted rounded-xl" />
        <div className="h-12 bg-muted rounded-xl" />
      </div>
    </div>
  )

  return (
    <div className="px-4 py-6 md:px-8 md:py-8 max-w-lg mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <Link href="/medications">
          <button className="w-9 h-9 rounded-xl border border-border flex items-center justify-center hover:bg-accent transition-colors">
            <ArrowLeft className="w-4 h-4" />
          </button>
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold">Editar medicamento</h1>
          <p className="text-sm text-muted-foreground">{name}</p>
        </div>
        <span className={`text-xs font-semibold px-3 py-1.5 rounded-full ${STATUS_CONFIG[status as keyof typeof STATUS_CONFIG].class}`}>
          {STATUS_CONFIG[status as keyof typeof STATUS_CONFIG].label}
        </span>
      </div>

      {/* Status changer */}
      <div className="card-elevated p-5 space-y-3 mb-5">
        <div className="flex items-center gap-1.5">
          <label className="text-sm font-semibold">Estado del tratamiento</label>
          <HelpTooltip>Podés cambiar el estado del tratamiento según tu evolución clínica: Activo (lo estás tomando), Suspendido (pausa temporal) o Finalizado (terminaste).</HelpTooltip>
        </div>
        <div className="flex gap-2">
          {(['ACTIVE', 'SUSPENDED', 'COMPLETED'] as const).map((s) => (
            <button key={s} onClick={() => handleStatusChange(s)} disabled={updatingStatus || status === s}
              className={`flex-1 py-2.5 rounded-xl text-sm font-semibold border transition-all ${
                status === s
                  ? 'bg-primary text-primary-foreground border-primary shadow-sm'
                  : 'border-border hover:bg-accent disabled:opacity-50'
              }`}>
              {STATUS_CONFIG[s].label}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-5">
        <div className="card-elevated p-5 space-y-4">
          <p className="text-sm font-bold">Información del medicamento</p>
          <div className="space-y-2">
            <div className="flex items-center gap-1.5">
              <label className="text-sm font-semibold">Medicamento</label>
              <HelpTooltip>Escribí el nombre del medicamento.</HelpTooltip>
            </div>
            <div className="flex gap-2">
            <Popover open={nameOpen} onOpenChange={setNameOpen}>
              <PopoverTrigger asChild>
                <Input value={name} onChange={(e) => { setName(e.target.value); setNameOpen(true) }} className="text-base h-12 flex-1" />
              </PopoverTrigger>
              <PopoverContent align="start" className="p-0 w-[var(--radix-popover-trigger-width)]">
                <Command>
                  <CommandInput placeholder="Buscar..." value={name} onValueChange={setName} />
                  <CommandList>
                    <CommandEmpty><button onClick={() => setNameOpen(false)} className="w-full text-left px-3 py-2 text-sm text-primary font-semibold">Usar &ldquo;{name}&rdquo;</button></CommandEmpty>
                    <CommandGroup heading="Sugerencias">
                      {COMMON_MEDICATIONS.filter((m) => m.toLowerCase().includes(name.toLowerCase())).map((med) => (
                        <CommandItem key={med} value={med} onSelect={(v) => { setName(v); setNameOpen(false) }}>{med}</CommandItem>
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
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="flex items-center gap-1.5">
                <label className="text-sm font-semibold">Motivo de prescripción</label>
                <HelpTooltip>Razón por la que se recetó este medicamento.</HelpTooltip>
              </div>
              <Select value={reasonForPrescription} onValueChange={setReasonForPrescription}>
                <SelectTrigger className="text-base h-12"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {PRESCRIPTION_REASONS.map((r) => (<SelectItem key={r} value={r}>{r}</SelectItem>))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-1.5">
                <label className="text-sm font-semibold">Dosis</label>
                <HelpTooltip>Cantidad del medicamento por toma.</HelpTooltip>
              </div>
              <Input value={dose} onChange={(e) => setDose(e.target.value)} className="text-base h-12" />
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex items-center gap-1.5">
              <label className="text-sm font-semibold">Vía de administración</label>
              <HelpTooltip>Cómo se administra el medicamento.</HelpTooltip>
            </div>
            <Select value={administrationRoute} onValueChange={setAdministrationRoute}>
              <SelectTrigger className="text-base h-12"><SelectValue /></SelectTrigger>
              <SelectContent>
                {ADMINISTRATION_ROUTES.map((r) => (<SelectItem key={r} value={r}>{r}</SelectItem>))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="card-elevated p-5 space-y-4">
          <p className="text-sm font-bold">Frecuencia y horarios</p>
          <div className="space-y-2">
            <div className="flex items-center gap-1.5">
              <label className="text-sm font-semibold">Frecuencia</label>
              <HelpTooltip>Cada cuánto tiempo se toma.</HelpTooltip>
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
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <label className="text-sm font-semibold">Horarios</label>
                  <HelpTooltip>Horas del día en que debés tomar el medicamento. Podés agregar o modificar horarios.</HelpTooltip>
                </div>
                <button onClick={addTime} className="flex items-center gap-1 text-xs font-semibold text-primary bg-primary/10 hover:bg-primary/15 px-3 py-1.5 rounded-lg">
                  + Agregar horario
                </button>
              </div>
              <div className="space-y-2">
                {customTimes.map((time, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <Input type="time" value={time} onChange={(e) => updateTime(i, e.target.value)} className="text-base h-12 flex-1" />
                    {customTimes.length > 1 && (
                      <button onClick={() => removeTime(i)} className="w-10 h-10 rounded-lg border border-border flex items-center justify-center hover:bg-destructive/10 hover:text-destructive">
                        <XCircle className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="card-elevated p-5 space-y-4">
          <p className="text-sm font-bold">Duración del tratamiento</p>
          <div className="space-y-2">
            <div className="flex items-center gap-1.5">
              <label className="text-sm font-semibold">Fecha de inicio</label>
              <HelpTooltip>El día en que comenzaste o comenzarás a tomar este medicamento.</HelpTooltip>
            </div>
            <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="text-base h-12" />
          </div>
          <div className="space-y-2">
            <div className="flex items-center gap-1.5">
              <label className="text-sm font-semibold">Fecha de finalización</label>
              <HelpTooltip>Si tu tratamiento tiene una fecha de término, indicála acá. Si es crónico, marcá "Tratamiento permanente".</HelpTooltip>
            </div>
            <div className="flex items-center gap-3">
              <Checkbox id="isPermanent" checked={isPermanent} onCheckedChange={(c) => setIsPermanent(c === true)} />
              <label htmlFor="isPermanent" className="text-sm font-medium cursor-pointer">Tratamiento permanente</label>
            </div>
            {!isPermanent && <Input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="text-base h-12" />}
          </div>
        </div>

        <div className="card-elevated p-5 space-y-2">
          <div className="flex items-center gap-1.5">
            <label className="text-sm font-semibold">Instrucciones</label>
            <HelpTooltip>Instrucciones específicas sobre cómo tomar este medicamento, como "tomar con alimentos" o "evitar alcohol".</HelpTooltip>
          </div>
          <textarea value={instructions} onChange={(e) => setInstructions(e.target.value)} rows={3}
            className="w-full rounded-xl border border-input bg-background px-4 py-3 text-base resize-none focus:outline-none focus:ring-2 focus:ring-ring" />
        </div>

        {/* Tarjeta educativa */}
        {educationalInfo && (
          <div className="card-elevated p-5 space-y-3 bg-secondary/5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-secondary/10 text-secondary flex items-center justify-center">
                  <Pill className="w-4 h-4" />
                </div>
                <p className="text-sm font-bold">Cómo tomarlo</p>
              </div>
              {tts.supported && (
                <button
                  type="button"
                  onClick={() => {
                    if (tts.isSpeaking) tts.stop()
                    else tts.speak(`${educationalInfo.howToTake}. ${educationalInfo.withWhat}. ${educationalInfo.precaution}`)
                  }}
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
                  aria-label={tts.isSpeaking ? 'Detener' : 'Leer en voz alta'}
                >
                  {tts.isSpeaking ? (
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
                      <rect x="6" y="4" width="4" height="16" />
                      <rect x="14" y="4" width="4" height="16" />
                    </svg>
                  ) : (
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
                      <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
                      <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
                      <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
                    </svg>
                  )}
                </button>
              )}
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex gap-2">
                <span className="font-semibold text-muted-foreground w-24 flex-shrink-0">Administración:</span>
                <span>{educationalInfo.howToTake}</span>
              </div>
              <div className="flex gap-2">
                <span className="font-semibold text-muted-foreground w-24 flex-shrink-0">Con qué:</span>
                <span>{educationalInfo.withWhat}</span>
              </div>
              <div className="flex gap-2">
                <span className="font-semibold text-muted-foreground w-24 flex-shrink-0">Precaución:</span>
                <span>{educationalInfo.precaution}</span>
              </div>
            </div>
            <div className="pt-2 border-t border-border">
              <p className="text-xs text-muted-foreground">
                <span className="font-semibold">Fuente:</span> {educationalInfo.source}
              </p>
            </div>
          </div>
        )}

        {/* Reglas clínicas */}
        {(interactions.length > 0 || medAlerts.length > 0) && (
          <div className="card-elevated p-5 space-y-3 bg-amber-50">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center">
                <AlertTriangle className="w-4 h-4" />
              </div>
              <p className="text-sm font-bold">Alertas clínicas</p>
            </div>
            <div className="space-y-3">
              {interactions.map((interaction, i) => (
                <div key={`interaction-${i}`} className={`p-3 rounded-xl text-sm ${
                  interaction.severity === 'HIGH'
                    ? 'bg-destructive/5 border border-destructive/20'
                    : interaction.severity === 'MEDIUM'
                    ? 'bg-amber-50 border border-amber-200'
                    : 'bg-muted border border-border'
                }`}>
                  <div className="flex items-start gap-2">
                    <AlertTriangle className={`w-4 h-4 mt-0.5 flex-shrink-0 ${
                      interaction.severity === 'HIGH' ? 'text-destructive' :
                      interaction.severity === 'MEDIUM' ? 'text-amber-600' : 'text-muted-foreground'
                    }`} />
                    <div>
                      <p className="font-semibold text-sm">
                        Posible interacción: {interaction.medication} — {interaction.condition}
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5">{interaction.description}</p>
                    </div>
                  </div>
                </div>
              ))}
              {medAlerts.map((alert) => (
                <div key={alert.id} className={`p-3 rounded-xl text-sm ${
                  alert.severity === 'HIGH'
                    ? 'bg-destructive/5 border border-destructive/20'
                    : 'bg-amber-50 border border-amber-200'
                }`}>
                  <div className="flex items-start gap-2">
                    <AlertTriangle className={`w-4 h-4 mt-0.5 flex-shrink-0 ${
                      alert.severity === 'HIGH' ? 'text-destructive' : 'text-amber-600'
                    }`} />
                    <div>
                      <p className="font-semibold text-sm">{alert.title}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{alert.description}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {error && <p className="text-sm text-destructive font-medium text-center">{error}</p>}

        <div className="flex gap-3">
          <Button variant="outline" onClick={() => router.push('/medications')} className="flex-1 h-14 text-base">Cancelar</Button>
          <Button onClick={handleSave} disabled={saving} className="flex-1 h-14 text-base gap-2">
            {saving && <Loader2 className="w-5 h-5 animate-spin" />}
            {saving ? 'Guardando...' : 'Guardar cambios'}
          </Button>
        </div>
      </div>

      <AlertDialog open={!!confirmStatus} onOpenChange={(open) => { if (!open) setConfirmStatus(null) }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Cambiar estado del tratamiento?</AlertDialogTitle>
            <AlertDialogDescription>
              {confirmStatus === 'COMPLETED'
                ? 'Vas a marcar este medicamento como finalizado. Ya no recibirás recordatorios para esta medicación.'
                : 'Vas a suspender este medicamento temporalmente. Los recordatorios se pausarán hasta que lo reactives.'}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={confirmStatusChange}>Confirmar</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
