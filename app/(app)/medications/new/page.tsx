'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Sparkles, ArrowLeft, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { api } from '@/lib/api'
import { useAuth } from '@/lib/auth-context'
import { buildTipCacheKey, getCachedTip, setCachedTip } from '@/lib/ai-tip-cache'
import Link from 'next/link'

const FREQ_OPTIONS = [
  { label: '1 vez', value: 1, hours: 24, times: ['08:00'] },
  { label: '2 veces', value: 2, hours: 12, times: ['08:00', '20:00'] },
  { label: '3 veces', value: 3, hours: 8, times: ['08:00', '14:00', '20:00'] },
  { label: '4 veces', value: 4, hours: 6, times: ['08:00', '12:00', '16:00', '20:00'] },
]

function buildSchedule(startDate: string, times: string[]): string[] {
  // `YYYY-MM-DD` parsed with `new Date()` is UTC and shifts the local day.
  // Build the datetime in local time explicitly to keep the selected date.
  const [y, mo, da] = startDate.split('-').map(Number)
  return times.map((t) => {
    const [h, m] = t.split(':').map(Number)
    const d = new Date(y, (mo ?? 1) - 1, da ?? 1, h ?? 0, m ?? 0, 0, 0)
    return d.toISOString()
  })
}

export default function NewMedicationPage() {
  const router = useRouter()
  const { user } = useAuth()

  const [name, setName] = useState('')
  const [dose, setDose] = useState('')
  const [freq, setFreq] = useState(FREQ_OPTIONS[0])
  const [instructions, setInstructions] = useState('')
  const [startDate, setStartDate] = useState(() => new Date().toISOString().slice(0, 10))
  const [saving, setSaving] = useState(false)
  const [aiLoading, setAiLoading] = useState(false)
  const [aiError, setAiError] = useState('')
  const [error, setError] = useState('')

  const handleAI = async () => {
    if (!name.trim()) {
      setAiError('Primero escribí el nombre del medicamento')
      return
    }

     const conditions = ((user as any)?.conditions ?? []) as string[]
     const cacheKey = buildTipCacheKey({ medicationName: name, dose: dose || undefined, conditions })
     const cached = getCachedTip(cacheKey)
     if (cached) {
       setInstructions(cached)
       setAiError('')
       return
     }

    setAiError('')
    setAiLoading(true)
    try {
      const qParts = [
        `Dame instrucciones simples para tomar "${name}" sin cambiar el tratamiento.`,
        dose?.trim() ? `Dosis: ${dose.trim()}.` : null,
        conditions?.length ? `Condiciones: ${conditions.join(', ')}.` : null,
        'Responde en 1-2 oraciones en español neutro, sin markdown ni tecnicismos.',
      ].filter(Boolean)

      const data = await api.knowledgeAnswer({
        q: qParts.join(' '),
        k: 6,
        scoreMin: 0.8,
        debug: false,
      })

      const text = (data?.answer ?? '').toString().trim()
      if (text) {
        setInstructions(text)
        setCachedTip(cacheKey, text)
      } else {
        setAiError('No se pudo obtener sugerencia')
      }
    } catch (e) {
      setAiError(e instanceof Error ? e.message : 'Error de conexión con IA')
    } finally {
      setAiLoading(false)
    }
  }

  const handleSave = async () => {
    if (!name.trim()) { setError('El nombre es obligatorio'); return }
    if (!dose.trim()) { setError('La dosis es obligatoria'); return }
    setError('')
    setSaving(true)
    try {
      await api.createMedication({
        name: name.trim(),
        dose: dose.trim(),
        frequency: freq.value,
        intervalHours: freq.hours,
        instructions: instructions.trim() || undefined,
        startDate,
        schedule: buildSchedule(startDate, freq.times),
      })
      router.push('/medications')
    } catch (e: any) {
      setError(e?.message ?? 'Error al guardar')
      setSaving(false)
    }
  }

  return (
    <div className="px-4 py-6 md:px-8 md:py-8 max-w-lg mx-auto">
      {/* Header */}
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
        {/* Nombre */}
        <div className="card-elevated p-5 space-y-2">
          <label className="text-sm font-semibold">¿Cómo se llama el medicamento?</label>
          <Input
            placeholder="Ej: Metformina, Atorvastatin..."
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="text-base h-12"
          />
        </div>

        {/* Dosis */}
        <div className="card-elevated p-5 space-y-2">
          <label className="text-sm font-semibold">¿Cuánto tomás por vez?</label>
          <Input
            placeholder="Ej: 500mg, 1 comprimido, 10ml..."
            value={dose}
            onChange={(e) => setDose(e.target.value)}
            className="text-base h-12"
          />
        </div>

        {/* Frecuencia */}
        <div className="card-elevated p-5 space-y-3">
          <label className="text-sm font-semibold">¿Cuántas veces por día?</label>
          <div className="grid grid-cols-4 gap-2">
            {FREQ_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                onClick={() => setFreq(opt)}
                className={`py-3 rounded-xl text-sm font-semibold border transition-all ${
                  freq.value === opt.value
                    ? 'bg-primary text-primary-foreground border-primary shadow-sm'
                    : 'border-border hover:bg-accent'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
          <p className="text-xs text-muted-foreground">
            Horarios sugeridos: {freq.times.join(' · ')}
          </p>
        </div>

        {/* Instrucciones + IA */}
        <div className="card-elevated p-5 space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-sm font-semibold">¿Cómo tomarlo?</label>
            <button
              onClick={handleAI}
              disabled={aiLoading}
              className="flex items-center gap-1.5 text-xs font-semibold text-primary bg-primary/10 hover:bg-primary/15 px-3 py-1.5 rounded-lg transition-colors disabled:opacity-60"
            >
              {aiLoading ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Sparkles className="w-3.5 h-3.5" />
              )}
              Sugerencia IA
            </button>
          </div>
          <textarea
            placeholder="Ej: Tomarlo con el desayuno para evitar molestias..."
            value={instructions}
            onChange={(e) => setInstructions(e.target.value)}
            rows={3}
            className="w-full rounded-xl border border-input bg-background px-4 py-3 text-base resize-none focus:outline-none focus:ring-2 focus:ring-ring"
          />
          {aiError && <p className="text-xs text-destructive">{aiError}</p>}
          {aiLoading && (
            <p className="text-xs text-muted-foreground animate-pulse">Consultando IA...</p>
          )}
        </div>

        {/* Fecha inicio */}
        <div className="card-elevated p-5 space-y-2">
          <label className="text-sm font-semibold">¿Desde cuándo?</label>
          <Input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="text-base h-12"
          />
        </div>

        {error && (
          <p className="text-sm text-destructive font-medium text-center">{error}</p>
        )}

        <Button
          onClick={handleSave}
          disabled={saving}
          size="lg"
          className="w-full h-14 text-base gap-2"
        >
          {saving && <Loader2 className="w-5 h-5 animate-spin" />}
          {saving ? 'Guardando...' : 'Guardar medicamento'}
        </Button>
      </div>
    </div>
  )
}
