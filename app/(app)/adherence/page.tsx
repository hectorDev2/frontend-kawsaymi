'use client'

import { useEffect } from 'react'
import { CheckCircle2, XCircle, Clock, Pill, ArrowLeft, ChevronRight } from 'lucide-react'
import Link from 'next/link'
import { useAdherenceStore } from '@/lib/stores/adherence-store'
import { Button } from '@/components/ui/button'

const STATUS = {
  TAKEN: { emoji: '✅', label: 'Ya tomé', color: 'text-secondary bg-secondary/10' },
  PENDING: { emoji: '⏰', label: 'Por tomar', color: 'text-amber-600 bg-amber-50' },
  MISSED: { emoji: '❌', label: 'Olvidé', color: 'text-destructive bg-destructive/10' },
}

function CircularProgressBig({ value }: { value: number }) {
  const r = 70
  const circ = 2 * Math.PI * r
  const offset = circ - (value / 100) * circ

  const getColor = (v: number) => {
    if (v >= 80) return '#10b981'
    if (v >= 50) return '#f59e0b'
    return '#ef4444'
  }

  return (
    <div className="relative w-44 h-44 flex-shrink-0">
      <svg width="176" height="176" viewBox="0 0 176 176" className="-rotate-90">
        <circle cx="88" cy="88" r={r} fill="none" stroke="#e5e7eb" strokeWidth="16" />
        <circle
          cx="88" cy="88" r={r}
          fill="none"
          stroke={getColor(value)}
          strokeWidth="16"
          strokeLinecap="round"
          strokeDasharray={circ}
          strokeDashoffset={offset}
          className="transition-all duration-700"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-4xl font-bold" style={{ color: getColor(value) }}>{value}%</span>
        <span className="text-sm text-muted-foreground">completado</span>
      </div>
    </div>
  )
}

export default function AdherencePage() {
  const todayEvents = useAdherenceStore((s) => s.todayEvents)
  const todayAdherence = useAdherenceStore((s) => s.todayAdherence)
  const isLoading = useAdherenceStore((s) => s.isLoading)
  const loadToday = useAdherenceStore((s) => s.loadToday)
  const markTaken = useAdherenceStore((s) => s.markTaken)
  const markMissed = useAdherenceStore((s) => s.markMissed)
  const subscribeToEvents = useAdherenceStore((s) => s.subscribeToEvents)

  useEffect(() => {
    loadToday()
  }, [loadToday])

  useEffect(() => {
    const unsub = subscribeToEvents()
    return unsub
  }, [subscribeToEvents])

  const takenCount = todayEvents.filter((e) => e.status === 'TAKEN').length
  const pendingCount = todayEvents.filter((e) => e.status === 'PENDING').length
  const missedCount = todayEvents.filter((e) => e.status === 'MISSED').length
  const progress = todayAdherence ? Math.round(todayAdherence.adherenceRate * 100) : 0
  const sortedEvents = [...todayEvents].sort(
    (a, b) => new Date(a.dateTimeScheduled).getTime() - new Date(b.dateTimeScheduled).getTime(),
  )

  const getEmoji = (rate: number) => {
    if (rate >= 80) return '😊'
    if (rate >= 50) return '😐'
    return '😢'
  }

  const getMessage = (rate: number) => {
    if (rate >= 80) return '¡Muy bien! Seguí así'
    if (rate >= 50) return 'Casi lo lográs, un poco más'
    return 'Tomá tus pastillas a horario'
  }

  return (
    <div className="px-4 py-6 md:px-8 md:py-8 max-w-md mx-auto">
      <Button variant="ghost" className="gap-2 mb-4 -ml-2" asChild>
        <Link href="/dashboard">
          <ArrowLeft className="h-5 w-5" />
          Volver
        </Link>
      </Button>

      <h1 className="text-2xl md:text-3xl font-bold mb-2">Mis Pastillas</h1>
      <p className="text-muted-foreground mb-6">Hoy tomaste {takenCount} de {sortedEvents.length}</p>

      <div className="flex justify-center mb-8">
        <CircularProgressBig value={progress} />
      </div>

      <div className="card-elevated p-4 mb-6 text-center">
        <p className="text-3xl mb-2">{getEmoji(progress)}</p>
        <p className="text-lg font-semibold">{getMessage(progress)}</p>
      </div>

      <div className="space-y-3 mb-6">
        <h2 className="font-bold text-lg">¿Qué tomaste hoy?</h2>

        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="card-elevated p-4 h-20 animate-pulse bg-muted rounded-xl" />
            ))}
          </div>
        ) : todayEvents.length === 0 ? (
          <div className="card-elevated p-6 text-center">
            <Pill className="w-10 h-10 mx-auto mb-2 text-muted-foreground" />
            <p className="font-medium">No tenés medicamentos para hoy</p>
          </div>
        ) : (
          sortedEvents.map((evt) => {
            const cfg = STATUS[evt.status]
            const time = new Date(evt.dateTimeScheduled).toLocaleTimeString('es', {
              hour: '2-digit', minute: '2-digit', hour12: false,
            })

            return (
              <div key={evt.id} className="card-elevated p-4 flex items-center gap-4">
                <div className="text-2xl">{cfg.emoji}</div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-base truncate">{evt.medicationName}</p>
                  <p className="text-sm text-muted-foreground">
                    {evt.medicationDose} • {time}
                  </p>
                </div>
                {evt.status === 'PENDING' && (
                  <Button
                    size="sm"
                    className="h-10 px-4 font-bold"
                    onClick={() => markTaken(evt.id)}
                  >
                    Tomar
                  </Button>
                )}
                {evt.status === 'MISSED' && (
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-10 px-4"
                    onClick={() => markTaken(evt.id)}
                  >
                    Ya la tomé
                  </Button>
                )}
                {evt.status === 'TAKEN' && (
                  <span className="text-xs font-medium text-secondary bg-secondary/10 px-3 py-1 rounded-full">
                    ✓ Listo
                  </span>
                )}
              </div>
            )
          })
        )}
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div className="card-elevated p-4 text-center">
          <p className="text-3xl mb-1">✅</p>
          <p className="text-xl font-bold text-secondary">{takenCount}</p>
          <p className="text-xs text-muted-foreground">Tomé</p>
        </div>
        <div className="card-elevated p-4 text-center">
          <p className="text-3xl mb-1">⏰</p>
          <p className="text-xl font-bold text-amber-600">{pendingCount}</p>
          <p className="text-xs text-muted-foreground">Faltan</p>
        </div>
        <div className="card-elevated p-4 text-center">
          <p className="text-3xl mb-1">❌</p>
          <p className="text-xl font-bold text-destructive">{missedCount}</p>
          <p className="text-xs text-muted-foreground">Olvidé</p>
        </div>
      </div>

      <Link
        href="/medications"
        className="flex items-center justify-between p-4 mt-6 card-elevated hover:shadow-md transition-all"
      >
        <span className="font-medium">Ver todos mis medicamentos</span>
        <ChevronRight className="w-5 h-5 text-muted-foreground" />
      </Link>
    </div>
  )
}
