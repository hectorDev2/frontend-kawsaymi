'use client'

import { useEffect, useState } from 'react'
import { CheckCircle2, XCircle, Clock, Plus, Search, Pill, AlertTriangle, Pencil, MoreHorizontal } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { api } from '@/lib/api'
import { buildTipCacheKey, getCachedTip, setCachedTip } from '@/lib/ai-tip-cache'
import type { Medication, MedicationEvent } from '@/lib/api'
import Link from 'next/link'
import { onDataChanged } from '@/lib/data-events'
import { useHealthContext } from '@/lib/health-context'

const PILL_COLORS = [
  'bg-blue-50 text-blue-700 border-blue-200',
  'bg-violet-50 text-violet-700 border-violet-200',
  'bg-teal-50 text-teal-700 border-teal-200',
  'bg-orange-50 text-orange-700 border-orange-200',
  'bg-pink-50 text-pink-700 border-pink-200',
]

const STATUS_CONFIG: Record<string, { label: string; class: string }> = {
  ACTIVE: { label: 'Activo', class: 'bg-secondary/10 text-secondary' },
  SUSPENDED: { label: 'Suspendido', class: 'bg-amber-100 text-amber-700' },
  COMPLETED: { label: 'Finalizado', class: 'bg-muted text-muted-foreground' },
}

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

type EventStatus = 'PENDING' | 'TAKEN' | 'MISSED'

const STATUS_LABEL: Record<EventStatus, string> = {
  TAKEN: 'Tomado',
  PENDING: 'Pendiente',
  MISSED: 'Perdido',
}

export default function MedicationsPage() {
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<string | null>(null)
  const [medications, setMedications] = useState<Medication[]>([])
  const [todayEvents, setTodayEvents] = useState<MedicationEvent[]>([])
  const [polyInfo, setPolyInfo] = useState<{ activeMedications: number; level: string; risk: string } | null>(null)
  const [loading, setLoading] = useState(true)

  const load = async () => {
    const [medRes, evtRes, polyRes] = await Promise.all([
      api.getMedications(),
      api.getTodayEvents(),
      api.getPolypharmacy().catch(() => null),
    ])
    setMedications(medRes.medications ?? [])
    setTodayEvents(evtRes.events ?? [])
    if (polyRes) setPolyInfo(polyRes)
    setLoading(false)
  }

  useEffect(() => {
    load()
    const off = onDataChanged((type) => {
      if (type === 'medications' || type === 'events') load()
    })
    return off
  }, [])

  const handleMark = async (eventId: string, action: 'taken' | 'missed') => {
    const fn = action === 'taken' ? api.markEventTaken : api.markEventMissed
    await fn(eventId)
    const evtRes = await api.getTodayEvents()
    setTodayEvents(evtRes.events ?? [])
  }

  const handleStatusChange = async (medId: string, newStatus: string) => {
    await api.patchMedicationStatus(medId, newStatus as any)
    load()
  }

  const filtered = medications.filter((m) => {
    const matchesSearch = m.name.toLowerCase().includes(search.toLowerCase())
    const matchesStatus = !statusFilter || m.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const activeMeds = medications.filter((m) => m.status === 'ACTIVE')
  const activeEvents = todayEvents.filter((e) =>
    activeMeds.some((m) => m.id === e.medicationId)
  )
  const takenCount = activeEvents.filter((e) => e.status === 'TAKEN').length

  return (
    <div className="px-4 py-6 md:px-8 md:py-8 max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">Mis medicamentos</h1>
          <p className="text-muted-foreground text-sm mt-1">
            {loading ? '...' : `${takenCount} de ${activeEvents.length} tomados hoy`}
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
          <p className="text-2xl font-bold text-secondary">{loading ? '–' : activeEvents.filter((e) => e.status === 'TAKEN').length}</p>
          <p className="text-xs text-muted-foreground font-medium">Tomados hoy</p>
        </div>
        <div className="card-elevated p-4 text-center">
          <Pill className="w-6 h-6 text-primary mx-auto mb-1" />
          <p className="text-2xl font-bold text-primary">{loading ? '–' : activeMeds.length}</p>
          <p className="text-xs text-muted-foreground font-medium">Activos</p>
        </div>
        <div className="card-elevated p-4 text-center">
          <AlertTriangle className="w-6 h-6 text-amber-500 mx-auto mb-1" />
          <p className="text-2xl font-bold text-amber-600">{loading ? '–' : medications.filter((m) => m.status !== 'ACTIVE').length}</p>
          <p className="text-xs text-muted-foreground font-medium">Inactivos</p>
        </div>
      </div>

      {/* Polifarmacia */}
      {polyInfo && (
        <div className={`card-elevated p-4 mb-5 flex items-center justify-between ${
          polyInfo.risk === 'ALTO' ? 'bg-destructive/5' :
          polyInfo.risk === 'MODERADO' ? 'bg-amber-50' :
          'bg-secondary/5'
        }`}>
          <div>
            <p className="text-sm font-semibold">Polifarmacia</p>
            <p className="text-xs text-muted-foreground">
              {polyInfo.activeMedications} medicamento{polyInfo.activeMedications !== 1 ? 's' : ''} activo{polyInfo.activeMedications !== 1 ? 's' : ''}
            </p>
          </div>
          <span className={`text-xs font-bold px-3 py-1.5 rounded-full ${
            polyInfo.risk === 'ALTO' ? 'bg-destructive/10 text-destructive' :
            polyInfo.risk === 'MODERADO' ? 'bg-amber-100 text-amber-700' :
            'bg-secondary/10 text-secondary'
          }`}>
            {polyInfo.risk === 'ALTO' ? 'Alto' : polyInfo.risk === 'MODERADO' ? 'Moderado' : 'Bajo'}
          </span>
        </div>
      )}

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

      {/* Filter tabs */}
      <div className="flex gap-2 mb-5 overflow-x-auto pb-1">
        {[{ label: 'Todos', filter: null }, { label: 'Activos', filter: 'ACTIVE' }, { label: 'Suspendidos', filter: 'SUSPENDED' }, { label: 'Finalizados', filter: 'COMPLETED' }].map((tab) => {
          const active = statusFilter === tab.filter
          return (
            <button key={tab.label} onClick={() => { setStatusFilter(tab.filter); setSearch('') }}
              className={`whitespace-nowrap text-sm font-semibold px-4 py-2 rounded-lg border transition-colors ${
                active ? 'bg-primary text-primary-foreground border-primary' : 'border-border hover:bg-accent'
              }`}>
              {tab.label}
            </button>
          )
        })}
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
          <p className="text-muted-foreground font-medium">Sin medicamentos</p>
          <Link href="/medications/new" className="text-primary font-semibold text-sm hover:underline mt-2 block">
            Agregar medicamento
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((med) => {
            const events = todayEvents.filter((e) => e.medicationId === med.id)
            const isActive = med.status === 'ACTIVE'
            const color = pillColor(med.id)
            const statusCfg = STATUS_CONFIG[med.status] ?? STATUS_CONFIG.ACTIVE
            return (
              <div key={med.id} className={`card-elevated border overflow-hidden ${!isActive ? 'opacity-70' : ''}`}>
                <div className="p-5 flex items-start gap-4">
                  <div className={`w-12 h-12 rounded-xl border flex items-center justify-center flex-shrink-0 ${color}`}>
                    <Pill className="w-6 h-6" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="font-bold text-lg leading-tight truncate">{med.name}</p>
                          <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${statusCfg.class}`}>
                            {statusCfg.label}
                          </span>
                        </div>
                        <p className="text-base text-muted-foreground">{med.dose} · {freqLabel(med.frequency)}</p>
                        {med.reasonForPrescription && (
                          <p className="text-xs text-muted-foreground mt-0.5">Motivo: {med.reasonForPrescription}</p>
                        )}
                      </div>
                      <div className="flex items-center gap-1 flex-shrink-0">
                        {isActive && events.length > 0 && (
                          <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                            events.every((e) => e.status === 'TAKEN')
                              ? 'bg-secondary/10 text-secondary'
                              : events.some((e) => e.status === 'MISSED')
                              ? 'bg-destructive/10 text-destructive'
                              : 'bg-amber-100 text-amber-700'
                          }`}>
                            {events.every((e) => e.status === 'TAKEN')
                              ? 'Completado'
                              : events.some((e) => e.status === 'MISSED')
                              ? 'Perdido'
                              : 'Pendiente'}
                          </span>
                        )}
                        <Link href={`/medications/${med.id}`}>
                          <Button type="button" variant="ghost" size="icon-sm" className="rounded-full" aria-label="Editar">
                            <Pencil className="w-4 h-4" />
                          </Button>
                        </Link>
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button type="button" variant="ghost" size="icon-sm" className="rounded-full">
                              <MoreHorizontal className="w-4 h-4" />
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent align="end" className="w-44 p-2">
                            <div className="space-y-1">
                              <p className="text-xs font-semibold text-muted-foreground px-2 py-1">Cambiar estado</p>
                              {['ACTIVE', 'SUSPENDED', 'COMPLETED'].map((s) => (
                                s !== med.status && (
                                  <button key={s} onClick={() => handleStatusChange(med.id, s)}
                                    className="w-full text-left px-2 py-1.5 text-sm rounded-md hover:bg-accent transition-colors">
                                    {STATUS_CONFIG[s]?.label ?? s}
                                  </button>
                                )
                              ))}
                            </div>
                          </PopoverContent>
                        </Popover>
                      </div>
                    </div>
                    {events.length > 0 && (
                      <div className="flex gap-2 mt-2 flex-wrap">
                        {events.map((e) => (
                          <span key={e.id} className={`text-xs px-2 py-0.5 rounded-full font-medium flex items-center gap-1 ${
                            e.status === 'TAKEN' ? 'bg-secondary/10 text-secondary' :
                            e.status === 'MISSED' ? 'bg-destructive/10 text-destructive' :
                            'bg-muted text-muted-foreground'
                          }`}>
                            🕐 {formatTime(e.dateTimeScheduled)}
                          </span>
                        ))}
                      </div>
                    )}
                    {isActive && events.length > 0 && (() => {
                      const taken = events.filter((e) => e.status === 'TAKEN').length
                      const pct = Math.round((taken / events.length) * 100)
                      return (
                        <div className="mt-2 flex items-center gap-2">
                          <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                            <div className={`h-full rounded-full transition-all ${
                              pct === 100 ? 'bg-secondary' : pct >= 50 ? 'bg-amber-500' : 'bg-destructive'
                            }`} style={{ width: `${pct}%` }} />
                          </div>
                          <span className={`text-xs font-semibold ${
                            pct === 100 ? 'text-secondary' : pct >= 50 ? 'text-amber-600' : 'text-destructive'
                          }`}>
                            {taken}/{events.length}
                          </span>
                        </div>
                      )
                    })()}
                    {med.instructions && (
                      <p className="text-sm text-muted-foreground mt-1.5 italic">{med.instructions}</p>
                    )}
                  </div>
                </div>

                {/* Action buttons for ACTIVE medications with pending events */}
                {isActive && (() => {
                  const pendingEvent = events.find((e) => e.status === 'PENDING')
                  if (!pendingEvent) return null
                  return (
                    <div className="border-t border-border flex">
                      <button onClick={() => handleMark(pendingEvent.id, 'taken')}
                        className="flex-1 flex items-center justify-center gap-2 py-4 text-sm font-semibold text-secondary hover:bg-secondary/5 transition-colors">
                        <CheckCircle2 className="w-5 h-5" />
                        Marcar tomado
                      </button>
                      <div className="w-px bg-border" />
                      <button onClick={() => handleMark(pendingEvent.id, 'missed')}
                        className="flex-1 flex items-center justify-center gap-2 py-4 text-sm font-semibold text-destructive hover:bg-destructive/5 transition-colors">
                        <XCircle className="w-5 h-5" />
                        No pude tomar
                      </button>
                    </div>
                  )
                })()}

                {isActive && events.length > 0 && events.every((e) => e.status === 'TAKEN') && (
                  <div className="border-t border-border px-5 py-3 flex items-center gap-2 text-secondary bg-secondary/5">
                    <CheckCircle2 className="w-5 h-5" />
                    <p className="text-sm font-semibold">¡Perfecto! Ya tomaste este medicamento hoy</p>
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
