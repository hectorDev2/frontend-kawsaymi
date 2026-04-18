'use client'

import { useEffect, useState } from 'react'
import { CheckCircle2, XCircle, Clock, Plus, Search, Pill, Sparkles } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { api } from '@/lib/api'
import { buildTipCacheKey, getCachedTip, setCachedTip } from '@/lib/ai-tip-cache'
import type { Medication, MedicationEvent } from '@/lib/api'
import Link from 'next/link'

const PILL_COLORS = [
  'bg-blue-50 text-blue-700 border-blue-200',
  'bg-violet-50 text-violet-700 border-violet-200',
  'bg-teal-50 text-teal-700 border-teal-200',
  'bg-orange-50 text-orange-700 border-orange-200',
  'bg-pink-50 text-pink-700 border-pink-200',
]

function pillColor(id: string) {
  const sum = id.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0)
  return PILL_COLORS[sum % PILL_COLORS.length]
}

function freqLabel(n: number) {
  if (n === 1) return 'Una vez al día'
  if (n === 2) return 'Dos veces al día'
  if (n === 3) return 'Tres veces al día'
  return `${n} veces al día`
}

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString('es', { hour: '2-digit', minute: '2-digit', hour12: false })
}

function MedicationTip({
  medicationId,
  medicationName,
  dose,
}: {
  medicationId?: string
  medicationName: string
  dose: string
}) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [suggestion, setSuggestion] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const loadTip = async (opts?: { force?: boolean }) => {
    const key = buildTipCacheKey({ medicationId, medicationName, dose })
    if (!opts?.force) {
      const cached = getCachedTip(key)
      if (cached) {
        setSuggestion(cached)
        setError(null)
        return
      }
    }

    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/ai-suggestions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ medicationName, dose }),
      })

      const data = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(data?.error || 'No se pudo generar el tip')

      const text = (data?.suggestion ?? '').toString().trim()
      const finalText = text || 'No pude generar un tip por ahora.'
      setSuggestion(finalText)
      setCachedTip(key, finalText)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error de conexión')
      setSuggestion(null)
    } finally {
      setLoading(false)
    }
  }

  const onOpenChange = (next: boolean) => {
    setOpen(next)
    if (next && !suggestion && !loading && !error) loadTip()
  }

  return (
    <Popover open={open} onOpenChange={onOpenChange}>
      <Tooltip>
        <PopoverTrigger asChild>
          <TooltipTrigger asChild>
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              className="rounded-full"
              aria-label={`Ver tip para ${medicationName}`}
            >
              <Sparkles className="w-4 h-4" />
            </Button>
          </TooltipTrigger>
        </PopoverTrigger>
        <TooltipContent sideOffset={6}>Ver tip</TooltipContent>
      </Tooltip>
      <PopoverContent align="end" className="w-80">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-sm font-semibold leading-tight">Tip</p>
            <p className="text-xs text-muted-foreground">Para {medicationName}</p>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-7 px-2"
            disabled={loading}
            onClick={() => loadTip({ force: true })}
          >
            {loading ? 'Generando...' : 'Otro'}
          </Button>
        </div>

        <div className="mt-3 text-sm text-foreground">
          {loading ? (
            <p className="text-muted-foreground">Generando tip...</p>
          ) : error ? (
            <p className="text-destructive">{error}</p>
          ) : (
            <p className="leading-relaxed">{suggestion}</p>
          )}
        </div>
      </PopoverContent>
    </Popover>
  )
}

type EventStatus = 'PENDING' | 'TAKEN' | 'MISSED'

const STATUS_LABEL: Record<EventStatus, string> = {
  TAKEN: 'Tomado',
  PENDING: 'Pendiente',
  MISSED: 'Perdido',
}

interface MedWithEvents {
  med: Medication
  events: MedicationEvent[]
  dominantStatus: EventStatus
}

function getDominant(events: MedicationEvent[]): EventStatus {
  if (events.some((e) => e.status === 'PENDING')) return 'PENDING'
  if (events.every((e) => e.status === 'TAKEN')) return 'TAKEN'
  return 'MISSED'
}

export default function MedicationsPage() {
  const [search, setSearch] = useState('')
  const [items, setItems] = useState<MedWithEvents[]>([])
  const [loading, setLoading] = useState(true)

  const load = async () => {
    const [medRes, evtRes] = await Promise.all([api.getMedications(), api.getTodayEvents()])
    const active = (medRes.medications ?? []).filter((m: Medication) => m.status === 'ACTIVE')
    const todayEvents: MedicationEvent[] = evtRes.events ?? []

    const combined: MedWithEvents[] = active.map((med: Medication) => {
      const events = todayEvents.filter((e) => e.medicationId === med.id)
      return { med, events, dominantStatus: events.length ? getDominant(events) : 'PENDING' }
    })
    setItems(combined)
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  const handleMark = async (eventId: string, action: 'taken' | 'missed') => {
    const fn = action === 'taken' ? api.markEventTaken : api.markEventMissed
    await fn(eventId)
    const evtRes = await api.getTodayEvents()
    const todayEvents: MedicationEvent[] = evtRes.events ?? []
    setItems((prev) =>
      prev.map(({ med, events }) => {
        const updated = todayEvents.filter((e) => e.medicationId === med.id)
        return { med, events: updated, dominantStatus: updated.length ? getDominant(updated) : 'PENDING' }
      })
    )
  }

  const filtered = items.filter((i) =>
    i.med.name.toLowerCase().includes(search.toLowerCase())
  )

  const taken = items.filter((i) => i.dominantStatus === 'TAKEN').length
  const pending = items.filter((i) => i.dominantStatus === 'PENDING').length
  const missed = items.filter((i) => i.dominantStatus === 'MISSED').length

  return (
    <div className="px-4 py-6 md:px-8 md:py-8 max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">Mis medicamentos</h1>
          <p className="text-muted-foreground text-sm mt-1">
            {loading ? '...' : `${taken} de ${items.length} tomados hoy`}
          </p>
        </div>
        <Link href="/medications/new">
          <Button size="lg" className="gap-2 shadow-sm">
            <Plus className="w-5 h-5" />
            <span className="hidden sm:inline">Agregar</span>
          </Button>
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        <div className="card-elevated p-4 text-center">
          <CheckCircle2 className="w-6 h-6 text-secondary mx-auto mb-1" />
          <p className="text-2xl font-bold text-secondary">{loading ? '–' : taken}</p>
          <p className="text-xs text-muted-foreground font-medium">Tomados</p>
        </div>
        <div className="card-elevated p-4 text-center">
          <Clock className="w-6 h-6 text-amber-500 mx-auto mb-1" />
          <p className="text-2xl font-bold text-amber-600">{loading ? '–' : pending}</p>
          <p className="text-xs text-muted-foreground font-medium">Pendientes</p>
        </div>
        <div className="card-elevated p-4 text-center">
          <XCircle className="w-6 h-6 text-destructive mx-auto mb-1" />
          <p className="text-2xl font-bold text-destructive">{loading ? '–' : missed}</p>
          <p className="text-xs text-muted-foreground font-medium">Perdidos</p>
        </div>
      </div>

      {/* Search */}
      <div className="relative mb-5">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
        <Input
          placeholder="Buscar medicamento..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-12 h-13 text-base rounded-xl"
        />
      </div>

      {/* List */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="card-elevated h-32 animate-pulse bg-muted" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="card-elevated p-12 text-center">
          <Pill className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
          <p className="text-muted-foreground font-medium">
            {search ? 'No se encontraron resultados' : 'Sin medicamentos activos'}
          </p>
          {!search && (
            <Link href="/medications/new" className="text-primary font-semibold text-sm hover:underline mt-2 block">
              Agregar medicamento
            </Link>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map(({ med, events, dominantStatus }) => {
            const pendingEvents = events.filter((e) => e.status === 'PENDING')
            const color = pillColor(med.id)
            return (
              <div
                key={med.id}
                className={`card-elevated border overflow-hidden ${dominantStatus === 'TAKEN' ? 'opacity-70' : ''}`}
              >
                <div className="p-5 flex items-start gap-4">
                  <div className={`w-12 h-12 rounded-xl border flex items-center justify-center flex-shrink-0 ${color}`}>
                    <Pill className="w-6 h-6" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="font-bold text-lg leading-tight">{med.name}</p>
                        <p className="text-base text-muted-foreground">{med.dose} · {freqLabel(med.frequency)}</p>
                      </div>
                      <div className="flex items-center gap-1.5 flex-shrink-0">
                        <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                          dominantStatus === 'TAKEN'
                            ? 'bg-secondary/10 text-secondary'
                            : dominantStatus === 'MISSED'
                            ? 'bg-destructive/10 text-destructive'
                            : 'bg-amber-100 text-amber-700'
                        }`}>
                          {STATUS_LABEL[dominantStatus]}
                        </span>
                        <MedicationTip medicationId={med.id} medicationName={med.name} dose={med.dose} />
                      </div>
                    </div>
                    {events.length > 0 && (
                      <div className="flex gap-2 mt-2 flex-wrap">
                        {events.map((e) => (
                          <span key={e.id} className="text-xs bg-muted text-muted-foreground px-2 py-0.5 rounded-full font-medium">
                            🕐 {formatTime(e.dateTimeScheduled)}
                          </span>
                        ))}
                      </div>
                    )}
                    {med.instructions && (
                      <p className="text-sm text-muted-foreground mt-1.5 italic">{med.instructions}</p>
                    )}
                  </div>
                </div>

                {pendingEvents.length > 0 && (
                  <div className="border-t border-border flex">
                    <button
                      onClick={() => handleMark(pendingEvents[0].id, 'taken')}
                      className="flex-1 flex items-center justify-center gap-2 py-4 text-sm font-semibold text-secondary hover:bg-secondary/5 transition-colors"
                    >
                      <CheckCircle2 className="w-5 h-5" />
                      Marcar como tomado
                    </button>
                    <div className="w-px bg-border" />
                    <button
                      onClick={() => handleMark(pendingEvents[0].id, 'missed')}
                      className="flex-1 flex items-center justify-center gap-2 py-4 text-sm font-semibold text-destructive hover:bg-destructive/5 transition-colors"
                    >
                      <XCircle className="w-5 h-5" />
                      No pude tomar
                    </button>
                  </div>
                )}

                {dominantStatus === 'TAKEN' && (
                  <div className="border-t border-border px-5 py-3 flex items-center gap-2 text-secondary bg-secondary/5">
                    <CheckCircle2 className="w-5 h-5" />
                    <p className="text-sm font-semibold">¡Perfecto! Ya tomaste este medicamento</p>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
