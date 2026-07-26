'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/lib/auth-context'
import { useUserData } from '@/lib/user-data-context'
import { useAdherenceStore } from '@/lib/stores/adherence-store'
import type { Medication, MedicationEvent, AdherenceStats } from '@/lib/api'
import Link from 'next/link'
import { CheckCircle2, Clock, Circle, ChevronRight, Users, AlertCircle, Activity, Heart, Pill, Sparkles, FileText, CalendarDays } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog'
import { toast } from 'sonner'
import { getCachedTip, setCachedTip } from '@/lib/ai-tip-cache'
import { useHealthContext } from '@/lib/health-context'

// ─── Circular Progress ───────────────────────────────────────────────────────

function CircularProgress({ value }: { value: number }) {
  const r = 52
  const circ = 2 * Math.PI * r
  const offset = circ - (value / 100) * circ
  return (
    <div className="relative w-32 h-32 flex-shrink-0" role="progressbar" aria-valuenow={value} aria-valuemin={0} aria-valuemax={100} aria-label={`${value}% de progreso`}>
      <svg width="128" height="128" viewBox="0 0 120 120" className="-rotate-90">
        <circle cx="60" cy="60" r={r} fill="none" stroke="rgba(255,255,255,0.25)" strokeWidth="10" />
        <circle cx="60" cy="60" r={r} fill="none" stroke="white" strokeWidth="10" strokeLinecap="round"
          strokeDasharray={circ} strokeDashoffset={offset} className="transition-all duration-700 motion-reduce:transition-none" />
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

function adherenceTipCacheKey(stats: { taken: number; total: number; missed: number; pending: number }) {
  return `kw_ai_tip:v1:adherence:today:${stats.taken}:${stats.total}:${stats.missed}:${stats.pending}`
}

function DashboardAdherenceTip({ stats }: { stats: { taken: number; total: number; missed: number; pending: number; adherenceRate?: number } }) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [tip, setTip] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const healthContext = useHealthContext()

  const load = async (opts?: { force?: boolean }) => {
    const key = adherenceTipCacheKey(stats)
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
        body: JSON.stringify({ scope: 'today', ...stats, userContext: healthContext }),
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
              variant="secondary"
              size="icon-sm"
              className="rounded-full bg-white/15 text-white hover:bg-white/20 hover:text-white"
              aria-label="Ver tip de hoy"
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
            <p className="text-xs text-muted-foreground">Para hoy</p>
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

function eventTipCacheKey(input: { eventId: string; scheduledIso: string; status: string }) {
  return `kw_ai_tip:v1:event:${input.eventId}:${input.status}:${input.scheduledIso}`
}

function EventDoseTip({
  eventId,
  medicationName,
  dose,
  scheduledIso,
  scheduledLabel,
  instructions,
  eventStatus,
}: {
  eventId: string
  medicationName: string
  dose: string
  scheduledIso: string
  scheduledLabel: string
  instructions?: string
  eventStatus: MedicationEvent['status']
}) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [tip, setTip] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const healthContext = useHealthContext()

  const load = async (opts?: { force?: boolean }) => {
    const key = eventTipCacheKey({ eventId, scheduledIso, status: 'PENDING' })
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
      const res = await fetch('/api/ai-dose-tip', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          medicationName,
          dose,
          scheduledTime: scheduledLabel,
          instructions,
          eventStatus,
          contextLabel: 'toma de hoy',
          userContext: healthContext,
        }),
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
            <p className="text-xs text-muted-foreground">Para la toma de las {scheduledLabel}</p>
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
            <div className="space-y-2">
              <p className="leading-relaxed">{tip}</p>
              <p className="text-xs text-muted-foreground">
                Tip contextual para la toma de hoy de {medicationName}.
              </p>
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  )
}

// ─── Patient Dashboard ───────────────────────────────────────────────────────

function timeBasedGreeting(): string {
  const h = new Date().getHours()
  if (h < 12) return 'Buenos días'
  if (h < 20) return 'Buenas tardes'
  return 'Buenas noches'
}

function PatientDashboard({ user }: { user: any }) {
  const events = useAdherenceStore((s) => s.todayEvents)
  const adherence = useAdherenceStore((s) => s.todayAdherence)
  const adhLoading = useAdherenceStore((s) => s.isLoading)
  const nextDose = useAdherenceStore((s) => s.nextDose)
  const markTaken = useAdherenceStore((s) => s.markTaken)
  const markMissed = useAdherenceStore((s) => s.markMissed)
  const loadToday = useAdherenceStore((s) => s.loadToday)
  const subscribeToEvents = useAdherenceStore((s) => s.subscribeToEvents)
  const { medications, isLoading } = useUserData()
  const [demoTaken, setDemoTaken] = useState(false)
  const [confirmMissed, setConfirmMissed] = useState<{ id: string; name: string } | null>(null)

  useEffect(() => { loadToday() }, [loadToday])
  useEffect(() => { const unsub = subscribeToEvents(); return unsub }, [subscribeToEvents])

  const handleMark = async (id: string, action: 'taken' | 'missed') => {
    if (action === 'taken') {
      try {
        await markTaken(id)
      } catch {
        toast.error('No se pudo registrar. Verificá tu conexión e intentá de nuevo.')
      }
    }
  }

  const handleMissed = (id: string, name: string) => {
    setConfirmMissed({ id, name })
  }

  const confirmMissedDose = async () => {
    if (!confirmMissed) return
    setConfirmMissed(null)
    try {
      await markMissed(confirmMissed.id)
      toast.success('Registrado como no tomado. Lo retomamos en la próxima dosis.')
    } catch {
      toast.error('No se pudo registrar. Verificá tu conexión e intentá de nuevo.')
    }
  }

  const isDemoMode = process.env.NEXT_PUBLIC_USE_MOCK === 'true'

  const demoAdh: AdherenceStats = {
    taken: demoTaken ? 1 : 0,
    total: 1,
    pending: demoTaken ? 0 : 1,
    missed: 0,
    adherenceRate: demoTaken ? 1 : 0,
    activeMedications: 1,
  }

  const effectiveAdherence = isDemoMode && !isLoading && events.length === 0 ? demoAdh : adherence

  const progress = effectiveAdherence ? Math.round(effectiveAdherence.adherenceRate * 100) : 0
  const taken = effectiveAdherence?.taken ?? 0
  const total = effectiveAdherence?.total ?? 0

  return (
    <div className="px-4 py-6 md:px-8 md:py-8 max-w-2xl mx-auto">
      <div className="mb-6">
        <p className="text-muted-foreground text-base">{timeBasedGreeting()} 👋</p>
        <h1 className="text-2xl md:text-3xl font-bold mt-0.5">{user?.name}</h1>
      </div>

      {/* Banner de progreso */}
      <div className="card-elevated gradient-brand p-6 mb-6">
        <div className="flex items-center justify-between gap-4">
          <div className="flex-1 text-white">
              <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-2">
                <p className="text-white/80 text-sm font-medium mb-1">Progreso del día</p>
                {process.env.NODE_ENV === 'development' && isDemoMode && !isLoading && events.length === 0 && (
                  <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-white/15 text-white/90">DEMO</span>
                )}
              </div>
              {!isLoading && effectiveAdherence && (
                <DashboardAdherenceTip
                  stats={{
                    taken: effectiveAdherence.taken,
                    total: effectiveAdherence.total,
                    missed: effectiveAdherence.missed,
                    pending: effectiveAdherence.pending,
                    adherenceRate: effectiveAdherence.adherenceRate,
                  }}
                />
              )}
              </div>
            {isLoading ? (
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

      {/* Próxima toma */}
      {nextDose && (
        <div className="card-elevated p-5 mb-6 bg-primary/5">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center flex-shrink-0">
              <Clock className="w-6 h-6" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Próxima toma</p>
              <p className="font-bold text-lg leading-tight mt-0.5">{nextDose.medicationName}</p>
              <p className="text-base text-muted-foreground">
                {nextDose.medicationDose} ·{' '}
                {new Date(nextDose.dateTimeScheduled).toLocaleTimeString('es', {
                  hour: '2-digit', minute: '2-digit', hour12: false,
                })}{' '}
                hs
              </p>
              {(() => {
                const diff = new Date(nextDose.dateTimeScheduled).getTime() - Date.now()
                if (diff <= 0) return <p className="text-sm text-destructive font-semibold mt-1">¡Ya deberías haberla tomado!</p>
                const hours = Math.floor(diff / 3600000)
                const mins = Math.floor((diff % 3600000) / 60000)
                return (
                  <div className="mt-2">
                    <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
                      <div
                        className="bg-primary h-2 rounded-full transition-all"
                        style={{ width: `${Math.min(100, Math.max(0, 100 - (diff / 86400000) * 100))}%` }}
                      />
                    </div>
                    <p className="text-xs text-muted-foreground mt-1 font-medium">
                      Faltan {hours > 0 ? `${hours}h ` : ''}{mins}min
                    </p>
                  </div>
                )
              })()}
            </div>
            <Button
              size="sm"
              className="h-10 px-4 font-bold flex-shrink-0 self-center"
              onClick={() => handleMark(nextDose.id, 'taken')}
            >
              <CheckCircle2 className="w-4 h-4 mr-1.5" />
              Tomar
            </Button>
          </div>
        </div>
      )}

      {/* Tomas de hoy */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold">Tomas de hoy</h2>
          <Link href="/medications" className="text-sm text-primary font-semibold flex items-center gap-1 hover:underline">
            Ver todas <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="card-elevated p-4 h-20 animate-pulse bg-muted" />
            ))}
          </div>
        ) : events.length === 0 ? (
          medications.length > 0 ? (
            <div className="card-elevated p-6">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="font-bold text-base">Tus medicamentos</p>
                  <p className="text-sm text-muted-foreground mt-0.5">
                    No hay tomas programadas para hoy, pero estos son tus medicamentos activos.
                  </p>
                </div>
                <Link href="/medications" className="text-primary text-sm font-semibold hover:underline whitespace-nowrap">
                  Ver todos
                </Link>
              </div>
              <div className="mt-4 space-y-2">
                {medications.slice(0, 3).map((m) => (
                  <div key={m.id} className="flex items-center justify-between rounded-xl border border-border px-4 py-3">
                    <div className="min-w-0">
                      <p className="font-semibold truncate">{m.name}</p>
                      <p className="text-sm text-muted-foreground truncate">{m.dose}</p>
                    </div>
                    <Pill className="w-5 h-5 text-muted-foreground flex-shrink-0" />
                  </div>
                ))}
              </div>
              {medications.length > 3 && (
                <p className="mt-3 text-xs text-muted-foreground">
                  Y {medications.length - 3} más...
                </p>
              )}
            </div>
          ) : (
            <div className="card-elevated p-8 text-center text-muted-foreground">
              <Pill className="w-10 h-10 mx-auto mb-2 opacity-40" />
              <p className="font-medium">Sin medicamentos programados para hoy</p>
              <Link href="/medications" className="text-primary text-sm font-semibold hover:underline mt-2 block">
                Agregar medicamento
              </Link>
            </div>
          )
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
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <EventDoseTip
                          eventId={evt.id}
                          medicationName={evt.medicationName ?? ''}
                          dose={evt.medicationDose ?? ''}
                          scheduledIso={evt.dateTimeScheduled}
                          scheduledLabel={time}
                          instructions={medications.find((m) => m.id === evt.medicationId)?.instructions}
                          eventStatus={evt.status}
                        />
                      </div>
                    ) : (
                      <span className={`flex-shrink-0 flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-full ${cfg.badge}`}>
                        <Icon className="w-4 h-4" />
                        {cfg.label}
                      </span>
                    )}
                  </div>
                  {isDue && (
                    <div className="border-t border-border flex">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => handleMark(evt.id, 'taken')}
                        className="flex-1 h-auto py-3 rounded-none text-secondary hover:bg-secondary/5"
                      >
                        <CheckCircle2 className="w-4 h-4" /> Tomar ahora
                      </Button>
                      <div className="w-px bg-border" />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => handleMissed(evt.id, evt.medicationName ?? '')}
                        className="flex-1 h-auto py-3 rounded-none text-destructive hover:bg-destructive/5"
                      >
                        <Circle className="w-4 h-4" /> No pude tomar
                      </Button>
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
          { label: 'Calendario', href: '/schedule', icon: CalendarDays, color: 'bg-teal-100 text-teal-700' },
          { label: 'Datos de salud', href: '/health-data', icon: Heart, color: 'bg-secondary/10 text-secondary' },
          { label: 'Antecedentes médicos', href: '/medical-background', icon: FileText, color: 'bg-amber-100 text-amber-700' },
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

      <AlertDialog open={!!confirmMissed} onOpenChange={(open) => { if (!open) setConfirmMissed(null) }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Confirmar que no se tomó?</AlertDialogTitle>
            <AlertDialogDescription>
              {confirmMissed && (
                <>Vas a registrar <strong>{confirmMissed.name}</strong> como no tomado. Esta información se usa para medir la adherencia al tratamiento.</>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={confirmMissedDose}>Confirmar</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

// ─── Caregiver Dashboard ─────────────────────────────────────────────────────

function CaregiverDashboard({ user }: { user: any }) {
  const [patients, setPatients] = useState<Array<{ id: string; name: string; adherenceRate: number; medicationCount: number; pendingToday: number }>>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('kw_token') : null
    if (!token) { setLoading(false); return }

    fetch('http://localhost:3001/caregivers/my-patients', {
      headers: { Authorization: `Bearer ${token}` },
    }).then((r) => r.json()).then(async (data) => {
      const relations = data.relations ?? []
      const summaries = await Promise.all(
        relations.map(async (r: any) => {
          const p = r.patient
          let activeMeds = 0, pendingToday = 0
          try {
            const [medsRes, evtsRes] = await Promise.all([
              fetch(`http://localhost:3001/medications`, { headers: { Authorization: `Bearer ${token}` } }),
              fetch(`http://localhost:3001/events/today`, { headers: { Authorization: `Bearer ${token}` } }),
            ])
            const medsData = await medsRes.json()
            activeMeds = (medsData.medications ?? []).filter((m: any) => m.status === 'ACTIVE').length
            const evtsData = await evtsRes.json()
            pendingToday = (evtsData.events ?? []).filter((e: any) => e.status === 'PENDING').length
          } catch {}
          return { id: p.id, name: p.name, adherenceRate: 0, medicationCount: activeMeds, pendingToday }
        })
      )
      setPatients(summaries)
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [])

  const totalPending = patients.reduce((s, p) => s + p.pendingToday, 0)
  const totalMeds = patients.reduce((s, p) => s + p.medicationCount, 0)

  return (
    <div className="px-4 py-6 md:px-8 md:py-8 max-w-2xl mx-auto">
      <div className="mb-6">
        <p className="text-muted-foreground text-base">{timeBasedGreeting()} 👋</p>
        <h1 className="text-2xl md:text-3xl font-bold mt-0.5">{user?.name}</h1>
      </div>

      <div className="grid grid-cols-3 gap-3 mb-6">
        <div className="card-elevated p-4 text-center">
          <p className="text-2xl font-bold text-primary">{loading ? '...' : patients.length}</p>
          <p className="text-xs text-muted-foreground font-medium mt-0.5">Pacientes</p>
        </div>
        <div className="card-elevated p-4 text-center">
          <p className="text-2xl font-bold text-secondary">{loading ? '...' : totalMeds}</p>
          <p className="text-xs text-muted-foreground font-medium mt-0.5">Medicamentos</p>
        </div>
        <div className="card-elevated p-4 text-center">
          <p className={`text-2xl font-bold ${totalPending > 0 ? 'text-amber-600' : 'text-secondary'}`}>{loading ? '...' : totalPending}</p>
          <p className="text-xs text-muted-foreground font-medium mt-0.5">Pendientes</p>
        </div>
      </div>

      <div className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-bold">Resumen de pacientes</h2>
          <Link href="/patients" className="text-xs text-primary font-semibold flex items-center gap-1 hover:underline">
            Ver todos <ChevronRight className="w-3 h-3" />
          </Link>
        </div>
        {loading ? (
          <div className="space-y-3">{[1].map((i) => <div key={i} className="card-elevated h-20 animate-pulse bg-muted" />)}</div>
        ) : patients.length === 0 ? (
          <div className="card-elevated p-6 text-center text-muted-foreground">
            <p className="font-medium">Sin pacientes asignados</p>
          </div>
        ) : (
          <div className="space-y-3">
            {patients.map((p) => (
              <Link key={p.id} href={`/patients/${p.id}`} className="card-elevated p-4 flex items-center gap-3 hover:shadow-md transition-all active:scale-[0.98]">
                <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold text-sm flex-shrink-0">
                  {p.name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm">{p.name}</p>
                  <div className="flex gap-3 mt-0.5">
                    <span className="text-xs text-muted-foreground">{p.medicationCount} medicamentos</span>
                    <span className="text-xs text-muted-foreground">{p.pendingToday > 0 ? `${p.pendingToday} pendiente(s)` : 'sin pendientes'}</span>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-muted-foreground flex-shrink-0" />
              </Link>
            ))}
          </div>
        )}
      </div>

      <h2 className="text-lg font-bold mb-3">Accesos rápidos</h2>
      <div className="grid grid-cols-2 gap-3">
        {[
          { label: 'Mis pacientes', href: '/patients', icon: Users, color: 'bg-primary/10 text-primary' },
          { label: 'Calendario', href: '/schedule', icon: CalendarDays, color: 'bg-teal-100 text-teal-700' },
          { label: 'Alertas', href: '/alerts', icon: AlertCircle, color: 'bg-destructive/10 text-destructive' },
          { label: 'Configuración', href: '/settings', icon: Heart, color: 'bg-amber-100 text-amber-700' },
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

// ─── Page ────────────────────────────────────────────────────────────────────

export default function DashboardPage() {
  const { user } = useAuth()
  if (user?.role === 'CAREGIVER') return <CaregiverDashboard user={user} />
  return <PatientDashboard user={user} />
}
