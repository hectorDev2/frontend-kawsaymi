'use client'

import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import { api } from '@/lib/api'
import { buildHealthContext, type UserHealthData } from '@/lib/user-health-context'

const WELLNESS_KEY = 'kw_wellness_planner:v1'
const CLINICAL_KEY = 'kw_clinical_history:v1'
const VACCINES_KEY = 'kw_vaccines:v1'
const HEIGHT_KEY = 'kw_health_height:v1'

const HealthCtx = createContext<string>('')

export function HealthContextProvider({ children }: { children: ReactNode }) {
  const [ctx, setCtx] = useState('')

  useEffect(() => {
    const data: UserHealthData = {}

    if (typeof window !== 'undefined') {
      try {
        const raw = window.localStorage.getItem(WELLNESS_KEY)
        if (raw) data.wellness = JSON.parse(raw)
      } catch {}
      try {
        const raw = window.localStorage.getItem(CLINICAL_KEY)
        if (raw) data.clinicalHistory = JSON.parse(raw)
      } catch {}
      try {
        const raw = window.localStorage.getItem(VACCINES_KEY)
        if (raw) data.vaccines = JSON.parse(raw)
      } catch {}
      const savedHeight = window.localStorage.getItem(HEIGHT_KEY)
      if (savedHeight) {
        const h = Number.parseFloat(savedHeight)
        if (h > 0) data.height = h
      }
    }

    Promise.allSettled([
      api.getHealthProfile(),
      api.getMe(),
      api.getPolypharmacy(),
      api.getWeekAdherence(),
    ]).then(([healthRes, meRes, polyRes, adherenceRes]) => {
      if (healthRes.status === 'fulfilled') {
        const h = healthRes.value.health
        data.weight = h.weight
        // height: prefer API value, fallback to localStorage (already set above)
        if (h.height) data.height = h.height
        data.imc = h.imc
      }
      if (meRes.status === 'fulfilled') {
        const u = meRes.value.user
        data.name = u.name
        data.conditions = u.conditions
        data.allergies = u.allergies
      }
      if (polyRes.status === 'fulfilled') {
        data.activeMedications = polyRes.value.activeMedications
        data.polypharmacy = polyRes.value.polypharmacy
      }
      if (adherenceRes.status === 'fulfilled') {
        data.weekAdherenceRate = adherenceRes.value.adherenceRate
      }
      setCtx(buildHealthContext(data))
    })
  }, [])

  return <HealthCtx.Provider value={ctx}>{children}</HealthCtx.Provider>
}

export function useHealthContext(): string {
  return useContext(HealthCtx)
}
