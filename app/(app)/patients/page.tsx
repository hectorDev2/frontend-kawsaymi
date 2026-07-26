'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Search, Users } from 'lucide-react'
import Link from 'next/link'
import { api } from '@/lib/api'

interface PatientSummary {
  id: string
  name: string
  email: string
  conditions: string[]
  adherenceRate: number
  activeMedications: number
  pendingToday: number
}

export default function PatientsPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [patients, setPatients] = useState<PatientSummary[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.getMe().then(async (meRes) => {
      const user = (meRes as any).user
      if (user?.role !== 'CAREGIVER') { setLoading(false); return }

      const token = typeof window !== 'undefined' ? localStorage.getItem('kw_token') : null
      if (!token) { setLoading(false); return }

      const res = await fetch('http://localhost:3001/caregivers/my-patients', {
        headers: { Authorization: `Bearer ${token}` },
      })
      const data = await res.json().catch(() => ({ relations: [] }))
      const relations = data.relations ?? []

      const summaries: PatientSummary[] = await Promise.all(
        relations.map(async (r: any) => {
          const p = r.patient
          let activeMeds = 0, pendingToday = 0, adherenceRate = 0
          try {
            const medsRes = await fetch(`http://localhost:3001/medications?userId=${p.id}`, {
              headers: { Authorization: `Bearer ${token}` },
            })
            const medsData = await medsRes.json()
            const meds = medsData.medications ?? []
            activeMeds = meds.filter((m: any) => m.status === 'ACTIVE').length

            const eventsRes = await fetch(`http://localhost:3001/events/today?userId=${p.id}`, {
              headers: { Authorization: `Bearer ${token}` },
            })
            const evtsData = await eventsRes.json()
            const events = evtsData.events ?? []
            pendingToday = events.filter((e: any) => e.status === 'PENDING').length
            const total = events.length
            const taken = events.filter((e: any) => e.status === 'TAKEN').length
            adherenceRate = total > 0 ? Math.round((taken / total) * 100) : 0
          } catch {}

          return {
            id: p.id, name: p.name, email: p.email,
            conditions: p.conditions ?? [],
            adherenceRate, activeMedications: activeMeds, pendingToday,
          }
        })
      )
      setPatients(summaries)
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [])

  const filtered = patients.filter((p) =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const avgAdherence = patients.length > 0
    ? Math.round(patients.reduce((s, p) => s + p.adherenceRate, 0) / patients.length)
    : 0

  const totalPending = patients.reduce((s, p) => s + p.pendingToday, 0)

  return (
    <div className="space-y-6 px-4 py-6 md:px-8 md:py-8 max-w-2xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold">Mis pacientes</h1>
        <p className="text-muted-foreground mt-1">Monitoreá la adherencia de tus pacientes</p>
      </div>

      {loading ? (
        <div className="space-y-4">{[1, 2].map((i) => <div key={i} className="card-elevated h-24 animate-pulse bg-muted" />)}</div>
      ) : (
        <>
          <div className="grid grid-cols-3 gap-3">
            <Card>
              <CardContent className="pt-6 text-center">
                <p className="text-3xl font-bold text-primary">{patients.length}</p>
                <p className="text-xs text-muted-foreground font-medium mt-0.5">Pacientes</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6 text-center">
                <p className="text-3xl font-bold text-secondary">{avgAdherence}%</p>
                <p className="text-xs text-muted-foreground font-medium mt-0.5">Adherencia prom.</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6 text-center">
                <p className={`text-3xl font-bold ${totalPending > 0 ? 'text-amber-600' : 'text-secondary'}`}>{totalPending}</p>
                <p className="text-xs text-muted-foreground font-medium mt-0.5">Pendientes</p>
              </CardContent>
            </Card>
          </div>

          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Buscar pacientes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 h-12 rounded-xl"
            />
          </div>

          {filtered.length === 0 ? (
            <div className="card-elevated p-12 text-center text-muted-foreground">
              <Users className="w-12 h-12 mx-auto mb-3 opacity-40" />
              <p className="font-medium">Sin pacientes</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filtered.map((p) => (
                <Link key={p.id} href={`/patients/${p.id}`}
                  className="card-elevated p-4 flex items-center gap-4 hover:shadow-md transition-all active:scale-[0.98] block"
                >
                  <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold text-sm flex-shrink-0">
                    {p.name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold">{p.name}</p>
                    <p className="text-xs text-muted-foreground truncate">{p.conditions.join(', ') || 'Sin condiciones registradas'}</p>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="text-xs text-muted-foreground">{p.activeMedications} medicamentos</span>
                      <span className="text-xs text-muted-foreground">{p.pendingToday > 0 ? `${p.pendingToday} pendiente(s)` : 'sin pendientes'}</span>
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className={`text-lg font-bold ${p.adherenceRate >= 80 ? 'text-secondary' : p.adherenceRate >= 60 ? 'text-amber-600' : 'text-destructive'}`}>
                      {p.adherenceRate}%
                    </p>
                    <p className="text-xs text-muted-foreground">adherencia</p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  )
}
