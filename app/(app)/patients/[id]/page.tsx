'use client'

import { useParams } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { AdherenceChart } from '@/components/adherence-chart'
import { MedicationCard } from '@/components/medication-card'
import { Button } from '@/components/ui/button'
import { ArrowLeft, MessageCircle, Phone } from 'lucide-react'
import Link from 'next/link'

const MOCK_PATIENT = {
  id: '1',
  name: 'John Doe',
  email: 'john@example.com',
  phone: '+1 555-0123',
  initials: 'JD',
  adherenceRate: 85,
  medicationCount: 4,
  missedToday: 1,
}

const MOCK_MEDICATIONS = [
  { id: '1', name: 'Metformin', dosage: '500mg', frequency: 'Dos veces al día', nextDue: 'en 2 horas', status: 'pending' as const },
  { id: '2', name: 'Lisinopril', dosage: '10mg', frequency: 'Una vez al día', nextDue: 'Mañana 8:00 AM', status: 'completed' as const },
]

const MOCK_ADHERENCE_DATA = [
  { date: 'Lun', adherence: 85, taken: 3, missed: 1 },
  { date: 'Mar', adherence: 100, taken: 4, missed: 0 },
  { date: 'Mié', adherence: 75, taken: 3, missed: 1 },
  { date: 'Jue', adherence: 90, taken: 4, missed: 1 },
  { date: 'Vie', adherence: 85, taken: 3, missed: 1 },
]

export default function PatientDetailPage() {
  const params = useParams()

  return (
    <div className="space-y-6 p-4 md:p-6">
      <div className="flex items-center gap-4 mb-6">
        <Link href="/patients">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="w-5 h-5" />
          </Button>
        </Link>
        <div className="flex-1">
          <div className="flex items-center gap-4">
            <Avatar className="w-12 h-12">
              <AvatarFallback className="bg-primary/20 text-primary font-semibold">
                {MOCK_PATIENT.initials}
              </AvatarFallback>
            </Avatar>
            <div>
              <h1 className="text-3xl font-bold">{MOCK_PATIENT.name}</h1>
              <p className="text-muted-foreground">{MOCK_PATIENT.email}</p>
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="icon"><Phone className="w-5 h-5" /></Button>
          <Button variant="outline" size="icon"><MessageCircle className="w-5 h-5" /></Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-muted-foreground text-sm">Tasa de adherencia</p>
              <p className="text-3xl font-bold text-secondary">{MOCK_PATIENT.adherenceRate}%</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-muted-foreground text-sm">Medicamentos activos</p>
              <p className="text-3xl font-bold">{MOCK_PATIENT.medicationCount}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-muted-foreground text-sm">Perdidos hoy</p>
              <p className="text-3xl font-bold text-destructive">{MOCK_PATIENT.missedToday}</p>
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

        <TabsContent value="medications" className="space-y-4 mt-6">
          <div className="space-y-3">
            {MOCK_MEDICATIONS.map((med) => (
              <MedicationCard key={med.id} {...med} />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="adherence" className="mt-6">
          <AdherenceChart
            data={MOCK_ADHERENCE_DATA}
            type="line"
            title="Tendencia de adherencia del paciente"
            description="Últimos 5 días"
          />
        </TabsContent>

        <TabsContent value="notes" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Notas de atención</CardTitle>
              <CardDescription>Agregá notas sobre el cuidado de tu paciente</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-4 rounded-lg border bg-card">
                  <p className="text-sm">El paciente ha sido cumplido con los medicamentos. Continuar con el régimen actual.</p>
                  <p className="text-xs text-muted-foreground mt-2">hace 2 días</p>
                </div>
                <div className="p-4 rounded-lg border bg-card">
                  <p className="text-sm">Lecturas de presión arterial estables. Seguimiento la próxima semana.</p>
                  <p className="text-xs text-muted-foreground mt-2">hace 5 días</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
