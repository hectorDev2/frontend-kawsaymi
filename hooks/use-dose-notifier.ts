'use client'

import { useEffect, useRef, useState } from 'react'
import { useAdherenceStore } from '@/lib/stores/adherence-store'
import { toast } from 'sonner'
import { playAlarmSound, playGentleTone } from '@/lib/dose-alarm'

const CHECK_INTERVAL = 30000
const LOOKAHEAD_MINUTES = 5
const ALARM_REPEAT_INTERVAL = 60000
const ALARM_REPEATS_MAX = 3

export function useDoseNotifier() {
  const notifiedRef = useRef<Set<string>>(new Set())
  const alarmCountRef = useRef<Map<string, number>>(new Map())
  const readyRef = useRef(false)
  const [alarmingEvents, setAlarmingEvents] = useState<string[]>([])
  const [snoozedUntil, setSnoozedUntil] = useState(0)

  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission()
    }
    readyRef.current = true
  }, [])

  useEffect(() => {
    const check = () => {
      if (!readyRef.current) return

      if (Date.now() < snoozedUntil) return

      const state = useAdherenceStore.getState()
      const now = Date.now()
      const windowEnd = now + LOOKAHEAD_MINUTES * 60 * 1000
      const currentAlarming: string[] = []

      const allEvents = [...state.todayEvents, ...state.weekEvents]
      const seen = new Set<string>()

      for (const event of allEvents) {
        if (seen.has(event.id)) continue
        seen.add(event.id)
        if (event.status !== 'PENDING') continue

        const eventTime = new Date(event.dateTimeScheduled).getTime()
        const diff = now - eventTime
        const alarmCount = alarmCountRef.current.get(event.id) ?? 0

        // Event is within lookahead window
        if (eventTime >= now && eventTime <= windowEnd) {
          playGentleTone()
          if (!notifiedRef.current.has(event.id)) {
            notifiedRef.current.add(event.id)

            const timeLabel = new Date(event.dateTimeScheduled).toLocaleTimeString('es', {
              hour: '2-digit', minute: '2-digit',
            })
            const title = `⏰ Hora de tomar ${event.medicationName}`
            const body = `${event.medicationDose} · ${timeLabel}`

            if ('Notification' in window && Notification.permission === 'granted') {
              new Notification(title, { body })
            }
            toast(title, {
              description: body,
              duration: 10000,
              action: {
                label: 'Marcar tomado',
                onClick: () => {
                  const evt = allEvents.find((e) => e.id === event.id)
                  if (evt) state.markTaken(event.id)
                },
              },
            })
          }
        }

        // Event is overdue: trigger repeating alarm
        if (diff > 0 && diff < ALARM_REPEAT_INTERVAL * ALARM_REPEATS_MAX) {
          currentAlarming.push(event.id)
          if (alarmCount < ALARM_REPEATS_MAX) {
            alarmCountRef.current.set(event.id, alarmCount + 1)
            playAlarmSound()
          }
        }
      }

      setAlarmingEvents(currentAlarming)
    }

    check()
    const interval = setInterval(check, CHECK_INTERVAL)
    return () => clearInterval(interval)
  }, [snoozedUntil])

  const snoozeAlarm = () => {
    setSnoozedUntil(Date.now() + 300000) // 5 minutos
    setAlarmingEvents([])
  }

  return { alarmingEvents, snoozeAlarm }
}
