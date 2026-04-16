'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/lib/auth-context'
import { api } from '@/lib/api'
import type { MedicationEvent, AdherenceStats } from '@/lib/api'
import Link from 'next/link'
import { CheckCircle2, Clock, Circle, ChevronRight, Users, AlertCircle, Activity, Heart, Pill } from 'lucide-react'

// ─── Circular Progress ───────────────────────────────────────────────────────

function CircularProgress({ value }: { value: number }) {
  const r = 52
  const circ = 2 * Math.PI * r
  const offset = circ - (value / 100) * circ
  return (
    <div className="relative w-32 h-32 flex-shrink-0">
      <svg width="128" height="128" viewBox="0 0 120 120" className="-rotate-90">
        <circle cx="60" cy="60" r={r} fill="none" stroke="rgba(255,255,255,0.25)" strokeWidth="10" />
        <circle cx="60" cy="60" r={r} fill="none" stroke="white" strokeWidth="10" strokeLinecap="round"
          strokeDasharray={circ} strokeDashoffset={offset} className="transition-all duration-700" />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-3xl font-bold text-white">{value}%</span>
        <span className="text-white/70 text-xs font-medium">hoy</span>
      </div>
    </div>
  )
}

// ─── Status config ───────────────────────────────────────────────────────────

const STATUS = {
  TAKEN: { label: 'Tomado', icon: CheckCircle2, color: 'text-secondary', badge: 'bg-secondary/10 text-secondary' },
  PENDING: { label: 'Tomar ahora', icon: Clock, color: 'text-amber-500', badge: 'bg-amber-100 text-amber-700' },
  MISSED: { label: 'Perdido', icon: Circle, color: 'text-destructive', badge: 'bg-destructive/10 text-destructive' },
}

// ─── Patient Dashboard ───────────────────────────────────────────────────────

function PatientDashboard({ user }: { user: any }) {
  const [events, setEvents] = useState<MedicationEvent[]>([])
  const [adherence, setAdherence] = useState<AdherenceStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([api.getTodayEvents(), api.getTodayAdherence()])
      .then(([evtRes, adh]) => {
        setEvents(evtRes.events.sort(
          (a, b) => new Date(a.dateTimeScheduled).getTime() - new Date(b.dateTimeScheduled).getTime()
        ))
        setAdherence(adh)
      })
      .finally(() => setLoading(false))
  }, [])

  const handleMark = async (id: string, action: 'taken' | 'missed') => {
    const fn = action === 'taken' ? api.markEventTaken : api.markEventMissed
    const { event } = await fn(id)
    setEvents((prev) => prev.map((e) => (e.id === id ? { ...e, status: event.status } : e)))
    const adh = await api.getTodayAdherence()
    setAdherence(adh)
  }

  const progress = adherence ? Math.round(adherence.adherenceRate * 100) : 0
  const taken = adherence?.taken ?? 0
  const total = adherence?.total ?? 0

  return (
    <div className="px-4 py-6 md:px-8 md:py-8 max-w-2xl mx-auto md:mx-0">
      <div className="mb-6">
        <p className="text-muted-foreground text-base">Buenos días 👋</p>
        <h1 className="text-2xl md:text-3xl font-bold mt-0.5">{user?.name}</h1>
      </div>

      {/* Banner de progreso */}
      <div className="card-elevated gradient-brand p-6 mb-6">
        <div className="flex items-center justify-between gap-4">
          <div className="flex-1 text-white">
            <p className="text-white/80 text-sm font-medium mb-1">Progreso del día</p>
            {loading ? (
              <div className="h-6 w-48 bg-white/20 rounded animate-pulse" />
            ) : (
              <>
                <p className="text-lg font-semibold leading-snug">
                  {taken === total && total > 0
                    ? '¡Completaste todos tus medicamentos!'
                    : `Tomaste ${taken} de ${total} medicamentos`}
                </p>
                {taken < total && (
                  <p className="mt-1 text-white/70 text-sm">
                    Quedan {total - taken} toma{total - taken !== 1 ? 's' : ''} pendiente{total - taken !== 1 ? 's' : ''}
                  </p>
                )}
              </>
            )}
          </div>
          <CircularProgress value={progress} />
        </div>
      </div>

      {/* Tomas de hoy */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold">Tomas de hoy</h2>
          <Link href="/medications" className="text-sm text-primary font-semibold flex items-center gap-1 hover:underline">
            Ver todas <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="card-elevated p-4 h-20 animate-pulse bg-muted" />
            ))}
          </div>
        ) : events.length === 0 ? (
          <div className="card-elevated p-8 text-center text-muted-foreground">
            <Pill className="w-10 h-10 mx-auto mb-2 opacity-40" />
            <p className="font-medium">Sin medicamentos programados para hoy</p>
            <Link href="/medications" className="text-primary text-sm font-semibold hover:underline mt-2 block">
              Agregar medicamento
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {events.map((evt) => {
              const cfg = STATUS[evt.status]
              const Icon = cfg.icon
              const time = new Date(evt.dateTimeScheduled).toLocaleTimeString('es', {
                hour: '2-digit', minute: '2-digit', hour12: false,
              })
              const isDue = evt.status === 'PENDING'
              return (
                <div key={evt.id}
                  className={`card-elevated border overflow-hidden ${
                    evt.status === 'TAKEN' ? 'opacity-65' : evt.status === 'PENDING' ? 'border-primary/30 ring-1 ring-primary/15' : ''
                  }`}
                >
                  <div className="p-4 flex items-center gap-4">
                    <div className="text-center w-14 flex-shrink-0">
                      <p className="text-lg font-bold leading-none">{time}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">hs</p>
                    </div>
                    <div className="w-px h-10 bg-border flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-base truncate">{evt.medicationName}</p>
                      <p className="text-sm text-muted-foreground">{evt.medicationDose}</p>
                    </div>
                    {isDue ? (
                      <button
                        onClick={() => handleMark(evt.id, 'taken')}
                        className="flex-shrink-0 bg-primary text-primary-foreground text-sm font-bold px-4 py-2.5 rounded-xl hover:bg-primary/90 active:scale-95 transition-all"
                      >
                        Tomar ahora
                      </button>
                    ) : (
                      <span className={`flex-shrink-0 flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-full ${cfg.badge}`}>
                        <Icon className="w-4 h-4" />
                        {cfg.label}
                      </span>
                    )}
                  </div>
                  {isDue && (
                    <div className="border-t border-border flex">
                      <button
                        onClick={() => handleMark(evt.id, 'taken')}
                        className="flex-1 py-3 text-sm font-semibold text-secondary hover:bg-secondary/5 transition-colors flex items-center justify-center gap-2"
                      >
                        <CheckCircle2 className="w-4 h-4" /> Marcar como tomado
                      </button>
                      <div className="w-px bg-border" />
                      <button
                        onClick={() => handleMark(evt.id, 'missed')}
                        className="flex-1 py-3 text-sm font-semibold text-destructive hover:bg-destructive/5 transition-colors flex items-center justify-center gap-2"
                      >
                        <Circle className="w-4 h-4" /> No pude tomar
                      </button>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Accesos rápidos */}
      <h2 className="text-xl font-bold mb-4">Accesos rápidos</h2>
      <div className="grid grid-cols-2 gap-3">
        {[
          { label: 'Mi adherencia', href: '/adherence', icon: Activity, color: 'bg-primary/10 text-primary' },
          { label: 'Datos de salud', href: '/health-data', icon: Heart, color: 'bg-secondary/10 text-secondary' },
        ].map((item) => (
          <Link key={item.href} href={item.href}
            className="card-elevated p-4 flex items-center gap-3 hover:shadow-md transition-all active:scale-[0.98]"
          >
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${item.color}`}>
              <item.icon className="w-5 h-5" />
            </div>
            <span className="font-semibold text-sm">{item.label}</span>
          </Link>
        ))}
      </div>
    </div>
  )
}

// ─── Caregiver Dashboard ─────────────────────────────────────────────────────

function CaregiverDashboard({ user }: { user: any }) {
  return (
    <div className="px-4 py-6 md:px-8 md:py-8 max-w-2xl mx-auto md:mx-0">
      <div className="mb-6">
        <p className="text-muted-foreground text-base">Buenos días 👋</p>
        <h1 className="text-2xl md:text-3xl font-bold mt-0.5">{user?.name}</h1>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="card-elevated p-5">
          <p className="text-muted-foreground text-sm mb-1">Pacientes</p>
          <p className="text-4xl font-bold text-primary">4</p>
          <p className="text-sm text-muted-foreground mt-1">activos</p>
        </div>
        <div className="card-elevated p-5">
          <p className="text-muted-foreground text-sm mb-1">Alertas</p>
          <p className="text-4xl font-bold text-destructive">2</p>
          <p className="text-sm text-muted-foreground mt-1">sin revisar</p>
        </div>
      </div>

      <div className="space-y-3">
        {[
          { label: 'Mis pacientes', desc: 'Ver estado y adherencia', href: '/patients', icon: Users, color: 'bg-primary/10 text-primary' },
          { label: 'Alertas', desc: '2 alertas pendientes', href: '/alerts', icon: AlertCircle, color: 'bg-destructive/10 text-destructive', badge: 2 },
        ].map((item) => (
          <Link key={item.href} href={item.href}
            className="card-elevated p-5 flex items-center gap-4 hover:shadow-md transition-all active:scale-[0.98] block"
          >
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${item.color}`}>
              <item.icon className="w-6 h-6" />
            </div>
            <div className="flex-1">
              <p className="font-bold text-base">{item.label}</p>
              <p className="text-sm text-muted-foreground">{item.desc}</p>
            </div>
            <div className="flex items-center gap-2">
              {item.badge && (
                <span className="bg-destructive text-destructive-foreground text-xs font-bold px-2 py-0.5 rounded-full">{item.badge}</span>
              )}
              <ChevronRight className="w-5 h-5 text-muted-foreground" />
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}

// ─── Page ────────────────────────────────────────────────────────────────────

export default function DashboardPage() {
  const { user } = useAuth()
  if (user?.role === 'CAREGIVER') return <CaregiverDashboard user={user} />
  return <PatientDashboard user={user} />
}
