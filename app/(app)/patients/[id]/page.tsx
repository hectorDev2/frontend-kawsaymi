'use client'

import { useParams } from 'next/navigation'
import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { AdherenceChart } from '@/components/adherence-chart'
import { MedicationCard } from '@/components/medication-card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { toast } from 'sonner'
import { api } from '@/lib/api'
import { ArrowLeft, MessageCircle, Phone, Plus, Trash2 } from 'lucide-react'
import Link from 'next/link'
import type { Medication, MedicationEvent, AdherenceStats } from '@/lib/api'

interface Note {
  id: string
  text: string
  createdAt: string
}

export default function PatientDetailPage() {
  const params = useParams()
  const [medications, setMedications] = useState<Medication[]>([])
  const [todayEvents, setTodayEvents] = useState<MedicationEvent[]>([])
  const [adherence, setAdherence] = useState<AdherenceStats | null>(null)
  const [loading, setLoading] = useState(true)

  const [notes, setNotes] = useState<Note[]>([
    { id: '1', text: 'El paciente ha cumplido con los medicamentos. Continuar con el régimen actual.', createdAt: new Date(Date.now() - 2 * 86400000).toISOString() },
    { id: '2', text: 'Lecturas de presión arterial estables. Seguimiento la próxima semana.', createdAt: new Date(Date.now() - 5 * 86400000).toISOString() },
  ])
  const [newNote, setNewNote] = useState('')

  useEffect(() => {
    Promise.all([
      api.getMedications().catch(() => ({ medications: [] })),
      api.getTodayEvents().catch(() => ({ events: [] })),
      api.getWeekAdherence().catch(() => null),
    ]).then(([medRes, evtRes, adhRes]) => {
      setMedications(medRes.medications ?? [])
      setTodayEvents(evtRes.events ?? [])
      setAdherence(adhRes)
      setLoading(false)
    })
  }, [])

  const activeMeds = medications.filter((m) => m.status === 'ACTIVE')
  const todayPending = todayEvents.filter((e) => e.status === 'PENDING').length
  const todayMissed = todayEvents.filter((e) => e.status === 'MISSED').length
  const adherenceRate = adherence ? Math.round(adherence.adherenceRate * 100) : 0

  const adherenceData = [
    { date: 'Lun', adherence: 85, taken: 3, missed: 1 },
    { date: 'Mar', adherence: 100, taken: 4, missed: 0 },
    { date: 'Mié', adherence: 75, taken: 3, missed: 1 },
    { date: 'Jue', adherence: 90, taken: 4, missed: 1 },
    { date: 'Vie', adherence: Math.max(adherenceRate, 50), taken: activeMeds.length > 0 ? activeMeds.length - todayMissed : 3, missed: todayMissed },
  ]

  const markAs = (medId: string, action: 'completed' | 'missed') => {
    const med = medications.find((m) => m.id === medId)
    if (!med) return
    const pendingEvent = todayEvents.find((e) => e.medicationId === medId && e.status === 'PENDING')
    if (!pendingEvent) return

    const fn = action === 'completed' ? api.markEventTaken : api.markEventMissed
    fn(pendingEvent.id).then(() => {
      setTodayEvents((prev) =>
        prev.map((e) => (e.id === pendingEvent.id ? { ...e, status: action === 'completed' ? 'TAKEN' as const : 'MISSED' as const } : e))
      )
      toast.success(`${med.name} ${action === 'completed' ? 'marcado como tomado' : 'marcado como perdido'}`)
    }).catch(() => {
      toast.error('No se pudo registrar. Verificá la conexión.')
    })
  }

  const addNote = () => {
    if (!newNote.trim()) return
    setNotes((prev) => [{ id: Date.now().toString(), text: newNote.trim(), createdAt: new Date().toISOString() }, ...prev])
    setNewNote('')
    toast.success('Nota agregada')
  }

  const deleteNote = (id: string) => {
    setNotes((prev) => prev.filter((n) => n.id !== id))
    toast.success('Nota eliminada')
  }

  const formatRelative = (iso: string) => {
    const diff = Date.now() - new Date(iso).getTime()
    const hours = Math.floor(diff / 3600000)
    if (hours < 1) return 'hace unos minutos'
    if (hours < 24) return `hace ${hours} hora${hours !== 1 ? 's' : ''}`
    const days = Math.floor(hours / 24)
    return `hace ${days} día${days !== 1 ? 's' : ''}`
  }

  return (
    <div className="space-y-6 px-4 py-6 md:px-8 md:py-8 max-w-2xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Link href="/patients">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="w-5 h-5" />
          </Button>
        </Link>
        <div className="flex-1">
          <div className="flex items-center gap-4">
            <Avatar className="w-12 h-12">
              <AvatarFallback className="bg-primary/20 text-primary font-semibold">EG</AvatarFallback>
            </Avatar>
            <div>
              <h1 className="text-3xl font-bold">Elena González</h1>
              <p className="text-muted-foreground">paciente@demo.com</p>
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="icon"><MessageCircle className="w-5 h-5" /></Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-muted-foreground text-sm">Adherencia</p>
              <p className="text-3xl font-bold text-secondary">{loading ? '...' : `${adherenceRate}%`}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-muted-foreground text-sm">Medicamentos activos</p>
              <p className="text-3xl font-bold">{loading ? '...' : activeMeds.length}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-muted-foreground text-sm">Pendientes hoy</p>
              <p className={`text-3xl font-bold ${todayPending > 0 ? 'text-amber-600' : 'text-secondary'}`}>{loading ? '...' : todayPending}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="medications" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="medications">Medicamentos</TabsTrigger>
          <TabsTrigger value="adherence">Adherencia</TabsTrigger>
          <TabsTrigger value="notes">Notas</TabsTrigger>
        </TabsList>

        {/* Medicamentos tab */}
        <TabsContent value="medications" className="space-y-4 mt-6">
          {loading ? (
            <div className="space-y-3">{[1, 2].map((i) => <div key={i} className="card-elevated h-24 animate-pulse bg-muted" />)}</div>
          ) : activeMeds.length === 0 ? (
            <div className="card-elevated p-8 text-center text-muted-foreground">
              <p className="font-medium">Sin medicamentos activos</p>
            </div>
          ) : (
            <div className="space-y-3">
              {activeMeds.map((med) => {
                const events = todayEvents.filter((e) => e.medicationId === med.id)
                const pendingEvent = events.find((e) => e.status === 'PENDING')
                return (
                  <MedicationCard
                    key={med.id}
                    id={med.id}
                    name={med.name}
                    dosage={med.dose}
                    frequency={`${med.frequency} vez/veces al día`}
                    nextDue={pendingEvent ? new Date(pendingEvent.dateTimeScheduled).toLocaleTimeString('es', { hour: '2-digit', minute: '2-digit' }) : undefined}
                    status={events.every((e) => e.status === 'TAKEN') ? 'completed' : events.some((e) => e.status === 'MISSED') ? 'missed' : 'pending'}
                    instructions={med.instructions}
                    onMarkTaken={() => markAs(med.id, 'completed')}
                    onMarkMissed={() => markAs(med.id, 'missed')}
                  />
                )
              })}
            </div>
          )}
        </TabsContent>

        {/* Adherencia tab */}
        <TabsContent value="adherence" className="mt-6">
          <AdherenceChart
            data={adherenceData}
            type="line"
            title="Tendencia de adherencia"
            description="Últimos 5 días"
          />
        </TabsContent>

        {/* Notas tab */}
        <TabsContent value="notes" className="mt-6">
          <div className="card-elevated p-5 space-y-4">
            <div className="flex gap-2">
              <Input
                placeholder="Agregá una nota sobre el paciente..."
                value={newNote}
                onChange={(e) => setNewNote(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') addNote() }}
                className="flex-1 h-12"
              />
              <Button onClick={addNote} disabled={!newNote.trim()} className="h-12 px-4 flex-shrink-0">
                <Plus className="w-4 h-4" />
              </Button>
            </div>
            <div className="space-y-3">
              {notes.map((note) => (
                <div key={note.id} className="p-4 rounded-xl border border-border bg-card">
                  <div className="flex items-start justify-between gap-3">
                    <p className="text-sm leading-relaxed flex-1">{note.text}</p>
                    <button onClick={() => deleteNote(note.id)} className="text-muted-foreground hover:text-destructive transition-colors flex-shrink-0">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">{formatRelative(note.createdAt)}</p>
                </div>
              ))}
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
