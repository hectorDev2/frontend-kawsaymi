'use client'

import { create } from 'zustand'
import { api } from '@/lib/api'
import { onDataChanged } from '@/lib/data-events'
import type { MedicationEvent, AdherenceStats } from '@/lib/api'

interface AdherenceState {
  todayEvents: MedicationEvent[]
  weekEvents: MedicationEvent[]
  todayAdherence: AdherenceStats | null
  weekAdherence: AdherenceStats | null
  nextDose: MedicationEvent | null
  isLoading: boolean
  error: string | null
}

interface AdherenceActions {
  loadToday: () => Promise<void>
  loadWeek: () => Promise<void>
  markTaken: (eventId: string) => Promise<void>
  markMissed: (eventId: string) => Promise<void>
  refresh: () => Promise<void>
  subscribeToEvents: () => () => void
}

type AdherenceStore = AdherenceState & AdherenceActions

function computeNextDose(todayEvents: MedicationEvent[], weekEvents: MedicationEvent[]): MedicationEvent | null {
  const all = [...todayEvents, ...weekEvents]
  const pending = all.filter((e) => e.status === 'PENDING')
  if (pending.length === 0) return null
  return pending.sort(
    (a, b) => new Date(a.dateTimeScheduled).getTime() - new Date(b.dateTimeScheduled).getTime(),
  )[0]
}

function makeSet(events: {
  todayEvents: MedicationEvent[]
  weekEvents: MedicationEvent[]
}) {
  return {
    ...events,
    nextDose: computeNextDose(events.todayEvents, events.weekEvents),
  }
}

export const useAdherenceStore = create<AdherenceStore>((set, get) => ({
  todayEvents: [],
  weekEvents: [],
  todayAdherence: null,
  weekAdherence: null,
  nextDose: null,
  isLoading: true,
  error: null,

  loadToday: async () => {
    const [evtRes, adhRes] = await Promise.allSettled([
      api.getTodayEvents(),
      api.getTodayAdherence(),
    ])

    const todayEvents =
      evtRes.status === 'fulfilled' ? evtRes.value.events : get().todayEvents

    set(
      makeSet({
        todayEvents,
        weekEvents: get().weekEvents,
      }),
    )

    set({
      todayAdherence: adhRes.status === 'fulfilled' ? adhRes.value : get().todayAdherence,
      isLoading: false,
      error:
        evtRes.status === 'rejected'
          ? (evtRes.reason as Error).message
          : adhRes.status === 'rejected'
            ? (adhRes.reason as Error).message
            : null,
    })
  },

  loadWeek: async () => {
    const [evtRes, adhRes] = await Promise.allSettled([
      api.getWeekEvents(),
      api.getWeekAdherence(),
    ])

    const weekEvents =
      evtRes.status === 'fulfilled' ? evtRes.value.events : get().weekEvents

    set(
      makeSet({
        todayEvents: get().todayEvents,
        weekEvents,
      }),
    )

    set({
      weekAdherence: adhRes.status === 'fulfilled' ? adhRes.value : get().weekAdherence,
      error:
        evtRes.status === 'rejected'
          ? (evtRes.reason as Error).message
          : adhRes.status === 'rejected'
            ? (adhRes.reason as Error).message
            : null,
    })
  },

  markTaken: async (eventId: string) => {
    const prev = get()

    const todayEvents = prev.todayEvents.map((e) =>
      e.id === eventId ? { ...e, status: 'TAKEN' as const } : e,
    )
    const weekEvents = prev.weekEvents.map((e) =>
      e.id === eventId ? { ...e, status: 'TAKEN' as const } : e,
    )

    set(makeSet({ todayEvents, weekEvents }))

    try {
      await api.markEventTaken(eventId)
      await get().loadToday()
    } catch {
      set(makeSet({ todayEvents: prev.todayEvents, weekEvents: prev.weekEvents }))
    }
  },

  markMissed: async (eventId: string) => {
    const prev = get()

    const todayEvents = prev.todayEvents.map((e) =>
      e.id === eventId ? { ...e, status: 'MISSED' as const } : e,
    )
    const weekEvents = prev.weekEvents.map((e) =>
      e.id === eventId ? { ...e, status: 'MISSED' as const } : e,
    )

    set(makeSet({ todayEvents, weekEvents }))

    try {
      await api.markEventMissed(eventId)
      await get().loadToday()
    } catch {
      set(makeSet({ todayEvents: prev.todayEvents, weekEvents: prev.weekEvents }))
    }
  },

  refresh: async () => {
    set({ isLoading: true })
    await get().loadToday()
    await get().loadWeek()
  },

  subscribeToEvents: () => {
    const unsub = onDataChanged((type) => {
      if (type === 'events' || type === 'adherence') {
        get().loadToday()
        get().loadWeek()
      }
    })

    return unsub
  },
}))
