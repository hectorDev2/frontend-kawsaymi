'use client'

import { useEffect, useState } from 'react'
import { CheckCircle2, XCircle, Clock, Smile, AlertCircle, Pill, Sparkles } from 'lucide-react'
import { api } from '@/lib/api'
import type { AdherenceStats, MedicationEvent } from '@/lib/api'
import { Button } from '@/components/ui/button'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { getCachedTip, setCachedTip } from '@/lib/ai-tip-cache'

const DAY_LABELS = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb']

interface DayStat {
  label: string
  rate: number
  taken: number
  missed: number
}

function buildWeekStats(events: MedicationEvent[]): DayStat[] {
  const today = new Date()
  const days: DayStat[] = []
  for (let i = 6; i >= 0; i--) {
    const d = new Date(today)
    d.setDate(today.getDate() - i)
    const dayKey = d.toDateString()
    const dayEvents = events.filter((e) => new Date(e.dateTimeScheduled).toDateString() === dayKey)
    const taken = dayEvents.filter((e) => e.status === 'TAKEN').length
    const missed = dayEvents.filter((e) => e.status === 'MISSED').length
    const total = dayEvents.length
    days.push({
      label: DAY_LABELS[d.getDay()],
      rate: total > 0 ? Math.round((taken / total) * 100) : 0,
      taken,
      missed,
    })
  }
  return days
}

function barColor(rate: number) {
  if (rate >= 80) return 'bg-secondary'
  if (rate >= 50) return 'bg-amber-500'
  return 'bg-destructive'
}

function adherenceTipCacheKey(scope: 'week' | 'today', stats: { taken: number; total: number; missed: number; pending: number }) {
  return `kw_ai_tip:v1:adherence:${scope}:${stats.taken}:${stats.total}:${stats.missed}:${stats.pending}`
}

function AdherenceTip({
  scope,
  stats,
}: {
  scope: 'week' | 'today'
  stats: { taken: number; total: number; missed: number; pending: number; adherenceRate?: number }
}) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [tip, setTip] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const load = async (opts?: { force?: boolean }) => {
    const key = adherenceTipCacheKey(scope, stats)
    if (!opts?.force) {
      const cached = getCachedTip(key)
      if (cached) {
        setTip(cached)
        setError(null)
        return
      }
    }

    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/ai-adherence-tip', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ scope, ...stats }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(data?.error || 'No se pudo generar el tip')
      const text = (data?.tip ?? '').toString().trim()
      const finalText = text || 'No pude generar un tip por ahora.'
      setTip(finalText)
      setCachedTip(key, finalText)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error de conexión')
      setTip(null)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Popover
      open={open}
      onOpenChange={(next) => {
        setOpen(next)
        if (next && !tip && !loading && !error) load()
      }}
    >
      <Tooltip>
        <PopoverTrigger asChild>
          <TooltipTrigger asChild>
            <Button
              type="button"
              variant={scope === 'week' ? 'secondary' : 'ghost'}
              size="icon-sm"
              className={scope === 'week' ? 'rounded-full bg-white/15 text-white hover:bg-white/20 hover:text-white' : 'rounded-full'}
              aria-label={scope === 'week' ? 'Ver tip de la semana' : 'Ver tip de hoy'}
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
            <p className="text-xs text-muted-foreground">{scope === 'week' ? 'Esta semana' : 'Hoy'}</p>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-7 px-2"
            disabled={loading}
            onClick={() => load({ force: true })}
          >
            {loading ? 'Generando...' : 'Otro'}
          </Button>
        </div>
        <div className="mt-3 text-sm">
          {loading ? (
            <p className="text-muted-foreground">Generando tip...</p>
          ) : error ? (
            <p className="text-destructive">{error}</p>
          ) : (
            <p className="leading-relaxed">{tip}</p>
          )}
        </div>
      </PopoverContent>
    </Popover>
  )
}

export default function AdherencePage() {
  const [week, setWeek] = useState<AdherenceStats | null>(null)
  const [today, setToday] = useState<AdherenceStats | null>(null)
  const [days, setDays] = useState<DayStat[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      api.getWeekAdherence(),
      api.getTodayAdherence(),
      api.getWeekEvents(),
    ]).then(([w, t, evtRes]) => {
      setWeek(w)
      setToday(t)
      setDays(buildWeekStats(evtRes.events ?? []))
    }).finally(() => setLoading(false))
  }, [])

  const weekRate = week ? Math.round(week.adherenceRate * 100) : 0

  return (
    <div className="px-4 py-6 md:px-8 md:py-8 max-w-2xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl md:text-3xl font-bold">Mis pastillas</h1>
        <p className="text-muted-foreground text-sm mt-1">¿Cuántas tomé esta semana?</p>
      </div>

      {/* Resumen principal */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="card-elevated gradient-brand p-5 text-white">
          <div className="flex items-start justify-between gap-3">
            <p className="text-white/80 text-sm font-medium mb-2">Esta semana tomé</p>
            {!loading && week && (
              <AdherenceTip
                scope="week"
                stats={{ taken: week.taken, total: week.total, missed: week.missed, pending: week.pending, adherenceRate: week.adherenceRate }}
              />
            )}
          </div>
          {loading ? (
            <div className="h-10 w-28 bg-white/20 rounded animate-pulse" />
          ) : (
            <>
              <p className="text-2xl font-bold leading-tight">
                {week?.taken ?? 0} de {week?.total ?? 0}
              </p>
              <p className="text-white/80 text-xs font-medium mt-1">pastillas</p>
            </>
          )}
        </div>
        <div className="card-elevated p-5">
          <div className="flex items-start justify-between gap-3">
            <p className="text-muted-foreground text-sm font-medium mb-2">Hoy tomé</p>
            {!loading && today && (
              <AdherenceTip
                scope="today"
                stats={{ taken: today.taken, total: today.total, missed: today.missed, pending: today.pending, adherenceRate: today.adherenceRate }}
              />
            )}
          </div>
          {loading ? (
            <div className="h-10 w-20 bg-muted rounded animate-pulse" />
          ) : (
            <>
              <p className="text-2xl font-bold text-primary leading-tight">
                {today?.taken ?? 0} de {today?.total ?? 0}
              </p>
              <p className="text-xs text-muted-foreground mt-1">pastillas</p>
            </>
          )}
        </div>
      </div>

      {/* Gráfico de la semana */}
      <div className="card-elevated p-5 mb-6">
        <h2 className="font-bold text-base mb-1 flex items-center gap-2">
          <Pill className="w-5 h-5 text-primary" />
          Cómo me fue cada día
        </h2>
        <p className="text-xs text-muted-foreground mb-4">Verde = bien · Amarillo = más o menos · Rojo = olvidé</p>
        {loading ? (
          <div className="h-24 bg-muted rounded animate-pulse" />
        ) : (
          <div className="flex items-end gap-2 h-28">
            {days.map((d, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-1">
                <div className="w-full flex items-end justify-center" style={{ height: '80px' }}>
                  <div
                    className={`w-full rounded-t-lg transition-all ${barColor(d.rate)}`}
                    style={{ height: `${Math.max(d.rate, 4)}%` }}
                  />
                </div>
                <span className="text-xs text-muted-foreground font-medium">{d.label}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Contadores simples */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        <div className="card-elevated p-4 text-center">
          <CheckCircle2 className="w-6 h-6 text-secondary mx-auto mb-1" />
          <p className="text-2xl font-bold text-secondary">{loading ? '–' : week?.taken ?? 0}</p>
          <p className="text-xs text-muted-foreground font-medium">Tomé</p>
        </div>
        <div className="card-elevated p-4 text-center">
          <XCircle className="w-6 h-6 text-destructive mx-auto mb-1" />
          <p className="text-2xl font-bold text-destructive">{loading ? '–' : week?.missed ?? 0}</p>
          <p className="text-xs text-muted-foreground font-medium">Olvidé</p>
        </div>
        <div className="card-elevated p-4 text-center">
          <Clock className="w-6 h-6 text-amber-500 mx-auto mb-1" />
          <p className="text-2xl font-bold text-amber-600">{loading ? '–' : week?.pending ?? 0}</p>
          <p className="text-xs text-muted-foreground font-medium">Me faltan</p>
        </div>
      </div>

      {/* Mensaje motivacional */}
      <div className="card-elevated p-5 space-y-4">
        <h2 className="font-bold text-base">¿Cómo voy?</h2>
        {loading ? (
          <div className="h-16 bg-muted rounded-xl animate-pulse" />
        ) : weekRate >= 80 ? (
          <div className="p-4 rounded-xl bg-secondary/10 border border-secondary/20 flex items-start gap-3">
            <Smile className="w-5 h-5 text-secondary flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-secondary">¡Muy bien! Seguí así</p>
              <p className="text-sm text-muted-foreground mt-1">
                Esta semana tomé {week?.taken} de {week?.total} pastillas. ¡Excelente trabajo!
              </p>
            </div>
          </div>
        ) : (
          <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-amber-900">Puedo mejorar</p>
              <p className="text-sm text-amber-800 mt-1">
                Esta semana tomé {week?.taken} de {week?.total} pastillas. Intentá tomarlas siempre a la misma hora del día.
              </p>
            </div>
          </div>
        )}
        <div className="p-4 rounded-xl bg-primary/5 border border-primary/15 flex items-start gap-3">
          <Clock className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-primary">Recordatorio de horarios</p>
            <p className="text-sm text-muted-foreground mt-1">
              Si activás los recordatorios, la app te avisa cuando es hora de tomar cada pastilla.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
