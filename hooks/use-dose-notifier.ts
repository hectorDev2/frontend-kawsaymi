'use client'

import { useEffect, useRef } from 'react'
import { useAdherenceStore } from '@/lib/stores/adherence-store'
import { toast } from 'sonner'

const CHECK_INTERVAL = 30000
const LOOKAHEAD_MINUTES = 5

export function useDoseNotifier() {
  const notifiedRef = useRef<Set<string>>(new Set())
  const readyRef = useRef(false)

  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission()
    }
    readyRef.current = true
  }, [])

  useEffect(() => {
    const check = () => {
      if (!readyRef.current) return

      const state = useAdherenceStore.getState()
      const now = Date.now()
      const windowEnd = now + LOOKAHEAD_MINUTES * 60 * 1000

      const allEvents = [...state.todayEvents, ...state.weekEvents]
      const seen = new Set<string>()

      for (const event of allEvents) {
        if (seen.has(event.id)) continue
        seen.add(event.id)
        if (event.status !== 'PENDING') continue
        if (notifiedRef.current.has(event.id)) continue

        const eventTime = new Date(event.dateTimeScheduled).getTime()
        if (eventTime >= now && eventTime <= windowEnd) {
          notifiedRef.current.add(event.id)

          const timeLabel = new Date(event.dateTimeScheduled).toLocaleTimeString('es', {
            hour: '2-digit',
            minute: '2-digit',
          })
          const title = `⏰ Hora de tomar ${event.medicationName}`
          const body = `${event.medicationDose} · ${timeLabel}`

          if ('Notification' in window && Notification.permission === 'granted') {
            new Notification(title, { body })
          }

          toast(title, { description: body })
        }
      }
    }

    check()
    const interval = setInterval(check, CHECK_INTERVAL)
    return () => clearInterval(interval)
  }, [])
}
