'use client'

import { useEffect, useState, useMemo } from 'react'
import { ChevronLeft, ChevronRight, Pill, Clock, CheckCircle2, XCircle, AlertTriangle, CalendarDays } from 'lucide-react'
import { api } from '@/lib/api'
import Link from 'next/link'
import type { Medication, MedicationEvent } from '@/lib/api'

const STATUS_BADGE: Record<string, { label: string; class: string }> = {
  TAKEN: { label: 'Tomado', class: 'bg-secondary/10 text-secondary' },
  PENDING: { label: 'Pendiente', class: 'bg-amber-100 text-amber-700' },
  MISSED: { label: 'Perdido', class: 'bg-destructive/10 text-destructive' },
}

const MONTHS = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre']
const DAYS = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb']

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString('es', { hour: '2-digit', minute: '2-digit', hour12: false })
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('es', { day: 'numeric', month: 'short' })
}

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate()
}

function getFirstDayOfMonth(year: number, month: number) {
  return new Date(year, month, 1).getDay()
}

export default function SchedulePage() {
  const [medications, setMedications] = useState<Medication[]>([])
  const [events, setEvents] = useState<MedicationEvent[]>([])
  const [loading, setLoading] = useState(true)
  const [today] = useState(() => new Date())
  const [viewMonth, setViewMonth] = useState(() => today.getMonth())
  const [viewYear, setViewYear] = useState(() => today.getFullYear())
  const [selectedDate, setSelectedDate] = useState<string | null>(null)

  useEffect(() => {
    Promise.all([
      api.getMedications().catch(() => ({ medications: [] })),
      api.getWeekEvents().catch(() => ({ events: [] })),
    ]).then(([medRes, evtRes]) => {
      setMedications(medRes.medications ?? [])
      setEvents(evtRes.events ?? [])
      setLoading(false)
    })
  }, [])

  const eventsByDate = useMemo(() => {
    const map = new Map<string, { events: MedicationEvent[]; meds: Set<string> }>()
    for (const event of events) {
      const dateKey = new Date(event.dateTimeScheduled).toLocaleDateString('es')
      if (!map.has(dateKey)) map.set(dateKey, { events: [], meds: new Set() })
      const entry = map.get(dateKey)!
      entry.events.push(event)
      if (event.medicationName) entry.meds.add(event.medicationName)
    }
    return map
  }, [events])

  const daysInMonth = getDaysInMonth(viewYear, viewMonth)
  const firstDay = getFirstDayOfMonth(viewYear, viewMonth)
  const todayStr = today.toLocaleDateString('es')

  const activeMeds = medications.filter((m) => m.status === 'ACTIVE')
  const selectedEvents = selectedDate ? eventsByDate.get(selectedDate)?.events ?? [] : []

  const prevMonth = () => {
    if (viewMonth === 0) { setViewMonth(11); setViewYear((v) => v - 1) }
    else setViewMonth((v) => v - 1)
    setSelectedDate(null)
  }

  const nextMonth = () => {
    if (viewMonth === 11) { setViewMonth(0); setViewYear((v) => v + 1) }
    else setViewMonth((v) => v + 1)
    setSelectedDate(null)
  }

  const goToday = () => {
    setViewMonth(today.getMonth())
    setViewYear(today.getFullYear())
    setSelectedDate(todayStr)
  }

  const days = []
  for (let i = 0; i < firstDay; i++) days.push(null)
  for (let d = 1; d <= daysInMonth; d++) {
    const date = new Date(viewYear, viewMonth, d)
    const dateStr = date.toLocaleDateString('es')
    const isToday = dateStr === todayStr
    const isSelected = dateStr === selectedDate
    const dayEvents = eventsByDate.get(dateStr)
    const hasEvents = !!dayEvents
    const hasMissed = dayEvents?.events.some((e) => e.status === 'MISSED')
    const allTaken = dayEvents?.events.every((e) => e.status === 'TAKEN') && (dayEvents?.events.length ?? 0) > 0
    const isPast = date < new Date(today.getFullYear(), today.getMonth(), today.getDate())

    days.push({ day: d, dateStr, isToday, isSelected, hasEvents, hasMissed, allTaken, isPast })
  }

  return (
    <div className="px-4 py-6 md:px-8 md:py-8 max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">Calendario</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {loading ? '...' : `${activeMeds.length} medicamento${activeMeds.length !== 1 ? 's' : ''} activo${activeMeds.length !== 1 ? 's' : ''}`}
          </p>
        </div>
        <button onClick={goToday} className="text-sm font-semibold text-primary bg-primary/10 hover:bg-primary/15 px-4 py-2 rounded-lg transition-colors">
          Hoy
        </button>
      </div>

      {/* Month navigator */}
      <div className="card-elevated p-4 mb-4">
        <div className="flex items-center justify-between mb-4">
          <button onClick={prevMonth} className="w-9 h-9 rounded-lg border border-border flex items-center justify-center hover:bg-accent transition-colors">
            <ChevronLeft className="w-4 h-4" />
          </button>
          <p className="font-bold text-lg">{MONTHS[viewMonth]} {viewYear}</p>
          <button onClick={nextMonth} className="w-9 h-9 rounded-lg border border-border flex items-center justify-center hover:bg-accent transition-colors">
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Day headers */}
        <div className="grid grid-cols-7 mb-2">
          {DAYS.map((d) => (
            <div key={d} className="text-center text-xs font-semibold text-muted-foreground py-1">{d}</div>
          ))}
        </div>

        {/* Calendar grid */}
        <div className="grid grid-cols-7 gap-1">
          {days.map((d, i) => (
            d ? (
              <button
                key={i}
                onClick={() => setSelectedDate(d.dateStr)}
                className={`relative p-2 rounded-xl text-sm transition-all min-h-[3rem] ${
                  d.isSelected
                    ? 'bg-primary text-primary-foreground shadow-sm'
                    : d.isToday
                    ? 'bg-primary/10 text-primary font-bold'
                    : d.isPast && !d.hasEvents
                    ? 'text-muted-foreground/40'
                    : 'hover:bg-accent'
                }`}
              >
                <span className="relative z-10">{d.day}</span>
                {d.hasEvents && !d.isSelected && (
                  <div className={`absolute bottom-1.5 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full ${
                    d.hasMissed ? 'bg-destructive' : d.allTaken ? 'bg-secondary' : 'bg-amber-500'
                  }`} />
                )}
              </button>
            ) : (
              <div key={i} />
            )
          ))}
        </div>
      </div>

      {/* Selected day details */}
      <div className="card-elevated p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <CalendarDays className="w-5 h-5 text-primary" />
            <p className="font-bold text-base">{selectedDate || 'Seleccioná un día'}</p>
          </div>
          {selectedDate && (
            <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
              selectedEvents.length === 0
                ? 'bg-muted text-muted-foreground'
                : selectedEvents.every((e) => e.status === 'TAKEN')
                ? 'bg-secondary/10 text-secondary'
                : selectedEvents.some((e) => e.status === 'MISSED')
                ? 'bg-destructive/10 text-destructive'
                : 'bg-amber-100 text-amber-700'
            }`}>
              {selectedEvents.length === 0
                ? 'Sin tomas'
                : selectedEvents.every((e) => e.status === 'TAKEN')
                ? 'Completado'
                : selectedEvents.some((e) => e.status === 'MISSED')
                ? 'Con pérdidas'
                : 'Pendiente'}
            </span>
          )}
        </div>

        {selectedDate ? (
          selectedEvents.length > 0 ? (
            <div className="space-y-3">
              {selectedEvents.map((event) => {
                const statusCfg = STATUS_BADGE[event.status] ?? STATUS_BADGE.PENDING
                return (
                  <div key={event.id} className="flex items-center gap-3 p-3 rounded-xl border border-border">
                    <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${
                      event.status === 'TAKEN' ? 'bg-secondary/10 text-secondary' :
                      event.status === 'MISSED' ? 'bg-destructive/10 text-destructive' :
                      'bg-amber-100 text-amber-700'
                    }`}>
                      {event.status === 'TAKEN' ? <CheckCircle2 className="w-4 h-4" /> :
                       event.status === 'MISSED' ? <XCircle className="w-4 h-4" /> :
                       <Clock className="w-4 h-4" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm truncate">{event.medicationName}</p>
                      <p className="text-xs text-muted-foreground">{event.medicationDose}</p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="text-sm font-semibold">{formatTime(event.dateTimeScheduled)}</p>
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${statusCfg.class}`}>
                        {statusCfg.label}
                      </span>
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <CalendarDays className="w-10 h-10 mx-auto mb-2 opacity-40" />
              <p className="font-medium">Sin tomas para este día</p>
              <p className="text-xs mt-1">No hay medicamentos programados para esta fecha</p>
            </div>
          )
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            <CalendarDays className="w-10 h-10 mx-auto mb-2 opacity-40" />
            <p className="font-medium">Seleccioná un día</p>
            <p className="text-xs mt-1">Tocá cualquier día del calendario para ver las tomas</p>
          </div>
        )}
      </div>

      {/* Active medications overview */}
      {activeMeds.length > 0 && (
        <div className="card-elevated p-5 mt-4">
          <p className="font-bold text-base mb-3">Tratamientos activos</p>
          <div className="space-y-3">
            {activeMeds.map((med) => (
              <Link key={med.id} href={`/medications/${med.id}`} className="flex items-center gap-3 p-3 rounded-xl border border-border hover:bg-accent/50 transition-colors">
                <div className="w-9 h-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center flex-shrink-0">
                  <Pill className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm truncate">{med.name}</p>
                  <p className="text-xs text-muted-foreground">{med.dose} · {med.frequency} vez/veces al día</p>
                </div>
                <div className="text-right text-xs text-muted-foreground flex-shrink-0">
                  {med.isPermanent ? (
                    <span className="text-secondary font-semibold">Permanente</span>
                  ) : med.endDate ? (
                    <span>Hasta {formatDate(med.endDate)}</span>
                  ) : null}
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
