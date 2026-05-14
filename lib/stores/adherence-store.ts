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

export const useAdherenceStore = create<AdherenceStore>((set, get) => ({
  todayEvents: [],
  weekEvents: [],
  todayAdherence: null,
  weekAdherence: null,
  isLoading: true,
  error: null,

  loadToday: async () => {
    const [evtRes, adhRes] = await Promise.allSettled([
      api.getTodayEvents(),
      api.getTodayAdherence(),
    ])

    set({
      todayEvents: evtRes.status === 'fulfilled' ? evtRes.value.events : get().todayEvents,
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

    set({
      weekEvents: evtRes.status === 'fulfilled' ? evtRes.value.events : get().weekEvents,
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
    const prevEvents = get().todayEvents

    set({
      todayEvents: prevEvents.map((e) =>
        e.id === eventId ? { ...e, status: 'TAKEN' as const } : e,
      ),
    })

    try {
      await api.markEventTaken(eventId)
      await get().loadToday()
    } catch {
      set({ todayEvents: prevEvents })
    }
  },

  markMissed: async (eventId: string) => {
    const prevEvents = get().todayEvents

    set({
      todayEvents: prevEvents.map((e) =>
        e.id === eventId ? { ...e, status: 'MISSED' as const } : e,
      ),
    })

    try {
      await api.markEventMissed(eventId)
      await get().loadToday()
    } catch {
      set({ todayEvents: prevEvents })
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
