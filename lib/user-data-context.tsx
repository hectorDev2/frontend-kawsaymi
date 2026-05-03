'use client'

import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from 'react'
import { api } from '@/lib/api'
import { onDataChanged } from '@/lib/data-events'
import type { UserProfile, Medication, MedicationEvent, AdherenceStats, HealthProfile, PolypharmacyInfo } from '@/lib/api'

interface UserData {
  user: UserProfile | null
  medications: Medication[]
  events: MedicationEvent[]
  todayEvents: MedicationEvent[]
  weekEvents: MedicationEvent[]
  todayAdherence: AdherenceStats | null
  weekAdherence: AdherenceStats | null
  healthProfile: HealthProfile | null
  polypharmacy: PolypharmacyInfo | null
  isLoading: boolean
}

interface UserDataContextType extends UserData {
  refresh: () => Promise<void>
  refreshEvents: () => Promise<void>
}

const UserDataContext = createContext<UserDataContextType | undefined>(undefined)

export function UserDataProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<UserData>({
    user: null,
    medications: [],
    events: [],
    todayEvents: [],
    weekEvents: [],
    todayAdherence: null,
    weekAdherence: null,
    healthProfile: null,
    polypharmacy: null,
    isLoading: true,
  })

  const loadAll = useCallback(async () => {
    const [
      userRes,
      medsRes,
      todayEvtRes,
      weekEvtRes,
      todayAdhRes,
      weekAdhRes,
      healthRes,
      polyRes,
    ] = await Promise.allSettled([
      api.getMe(),
      api.getMedications(),
      api.getTodayEvents(),
      api.getWeekEvents(),
      api.getTodayAdherence(),
      api.getWeekAdherence(),
      api.getHealthProfile(),
      api.getPolypharmacy(),
    ])

    setData({
      user: userRes.status === 'fulfilled' ? userRes.value.user : null,
      medications: medsRes.status === 'fulfilled' ? medsRes.value.medications : [],
      events: [],
      todayEvents: todayEvtRes.status === 'fulfilled' ? todayEvtRes.value.events : [],
      weekEvents: weekEvtRes.status === 'fulfilled' ? weekEvtRes.value.events : [],
      todayAdherence: todayAdhRes.status === 'fulfilled' ? todayAdhRes.value : null,
      weekAdherence: weekAdhRes.status === 'fulfilled' ? weekAdhRes.value : null,
      healthProfile: healthRes.status === 'fulfilled' ? healthRes.value.health : null,
      polypharmacy: polyRes.status === 'fulfilled' ? polyRes.value : null,
      isLoading: false,
    })
  }, [])

  const refreshEvents = useCallback(async () => {
    const [todayEvtRes, weekEvtRes, todayAdhRes] = await Promise.allSettled([
      api.getTodayEvents(),
      api.getWeekEvents(),
      api.getTodayAdherence(),
    ])

    setData(d => ({
      ...d,
      todayEvents: todayEvtRes.status === 'fulfilled' ? todayEvtRes.value.events : d.todayEvents,
      weekEvents: weekEvtRes.status === 'fulfilled' ? weekEvtRes.value.events : d.weekEvents,
      todayAdherence: todayAdhRes.status === 'fulfilled' ? todayAdhRes.value : d.todayAdherence,
    }))
  }, [])

  useEffect(() => {
    loadAll()

    const off = onDataChanged((type) => {
      if (type === 'user' || type === 'medications') {
        loadAll()
      } else if (type === 'events' || type === 'adherence') {
        refreshEvents()
      }
    })
    return off
  }, [loadAll, refreshEvents])

  return (
    <UserDataContext.Provider value={{ ...data, refresh: loadAll, refreshEvents }}>
      {children}
    </UserDataContext.Provider>
  )
}

export function useUserData() {
  const ctx = useContext(UserDataContext)
  if (!ctx) throw new Error('useUserData must be used within UserDataProvider')
  return ctx
}