'use client'

import { useEffect, useState } from 'react'
import { TrendingUp, CheckCircle2, XCircle, Clock, Activity } from 'lucide-react'
import { api } from '@/lib/api'
import type { AdherenceStats, MedicationEvent } from '@/lib/api'

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
  const todayRate = today ? Math.round(today.adherenceRate * 100) : 0

  const rateColor = (r: number) =>
    r >= 80 ? 'bg-secondary' : r >= 50 ? 'bg-amber-500' : 'bg-destructive'

  const rateLabel = (r: number) =>
    r >= 80 ? 'Excelente' : r >= 50 ? 'Regular' : 'Necesita mejorar'

  return (
    <div className="px-4 py-6 md:px-8 md:py-8 max-w-2xl mx-auto md:mx-0">
      <div className="mb-6">
        <h1 className="text-2xl md:text-3xl font-bold">Mi adherencia</h1>
        <p className="text-muted-foreground text-sm mt-1">Seguí tu cumplimiento de medicamentos</p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="card-elevated gradient-brand p-5 text-white">
          <p className="text-white/80 text-sm font-medium mb-1">Esta semana</p>
          {loading ? (
            <div className="h-10 w-20 bg-white/20 rounded animate-pulse" />
          ) : (
            <>
              <p className="text-4xl font-bold">{weekRate}%</p>
              <div className="flex items-center gap-1 mt-1">
                <TrendingUp className="w-4 h-4 text-white/80" />
                <span className="text-white/80 text-xs font-medium">{rateLabel(weekRate)}</span>
              </div>
            </>
          )}
        </div>
        <div className="card-elevated p-5">
          <p className="text-muted-foreground text-sm font-medium mb-1">Hoy</p>
          {loading ? (
            <div className="h-10 w-20 bg-muted rounded animate-pulse" />
          ) : (
            <>
              <p className="text-4xl font-bold text-primary">{todayRate}%</p>
              <p className="text-xs text-muted-foreground mt-1">{today?.taken ?? 0} de {today?.total ?? 0} tomados</p>
            </>
          )}
        </div>
      </div>

      {/* Week bar chart */}
      <div className="card-elevated p-5 mb-6">
        <h2 className="font-bold text-base mb-4 flex items-center gap-2">
          <Activity className="w-5 h-5 text-primary" />
          Últimos 7 días
        </h2>
        {loading ? (
          <div className="h-24 bg-muted rounded animate-pulse" />
        ) : (
          <div className="flex items-end gap-2 h-28">
            {days.map((d, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-1">
                <div className="w-full flex items-end justify-center" style={{ height: '80px' }}>
                  <div
                    className={`w-full rounded-t-lg transition-all ${rateColor(d.rate)}`}
                    style={{ height: `${Math.max(d.rate, 4)}%` }}
                  />
                </div>
                <span className="text-xs text-muted-foreground font-medium">{d.label}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Stats detail */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        <div className="card-elevated p-4 text-center">
          <CheckCircle2 className="w-6 h-6 text-secondary mx-auto mb-1" />
          <p className="text-2xl font-bold text-secondary">{loading ? '–' : week?.taken ?? 0}</p>
          <p className="text-xs text-muted-foreground font-medium">Tomadas</p>
        </div>
        <div className="card-elevated p-4 text-center">
          <XCircle className="w-6 h-6 text-destructive mx-auto mb-1" />
          <p className="text-2xl font-bold text-destructive">{loading ? '–' : week?.missed ?? 0}</p>
          <p className="text-xs text-muted-foreground font-medium">Perdidas</p>
        </div>
        <div className="card-elevated p-4 text-center">
          <Clock className="w-6 h-6 text-amber-500 mx-auto mb-1" />
          <p className="text-2xl font-bold text-amber-600">{loading ? '–' : week?.pending ?? 0}</p>
          <p className="text-xs text-muted-foreground font-medium">Pendientes</p>
        </div>
      </div>

      {/* Tips */}
      <div className="card-elevated p-5 space-y-4">
        <h2 className="font-bold text-base">Consejos</h2>
        {weekRate >= 80 ? (
          <div className="p-4 rounded-xl bg-secondary/10 border border-secondary/20">
            <p className="text-sm font-semibold text-secondary">¡Excelente consistencia!</p>
            <p className="text-sm text-muted-foreground mt-1">
              Mantuviste un {weekRate}% de adherencia esta semana. ¡Seguí así!
            </p>
          </div>
        ) : (
          <div className="p-4 rounded-xl bg-amber-50 border border-amber-200">
            <p className="text-sm font-semibold text-amber-900">Podés mejorar</p>
            <p className="text-sm text-amber-800 mt-1">
              Tu adherencia esta semana fue del {weekRate}%. Intentá tomar tus medicamentos siempre a la misma hora.
            </p>
          </div>
        )}
        <div className="p-4 rounded-xl bg-primary/5 border border-primary/15">
          <p className="text-sm font-semibold text-primary">Activá los recordatorios</p>
          <p className="text-sm text-muted-foreground mt-1">
            Los recordatorios en el horario justo te ayudan a no olvidar ninguna toma.
          </p>
        </div>
      </div>
    </div>
  )
}
