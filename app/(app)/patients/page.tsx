'use client'

import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { PatientStatusCard } from '@/components/patient-status-card'
import { Input } from '@/components/ui/input'
import { Search } from 'lucide-react'
import Link from 'next/link'

const MOCK_PATIENTS = [
  { id: '1', name: 'John Doe', initials: 'JD', adherenceRate: 85, medicationCount: 4, missedToday: 1, alert: 'low' as const },
  { id: '2', name: 'Maria Garcia', initials: 'MG', adherenceRate: 65, medicationCount: 3, missedToday: 2, alert: 'high' as const },
  { id: '3', name: 'James Smith', initials: 'JS', adherenceRate: 78, medicationCount: 5, missedToday: 1, alert: 'medium' as const },
  { id: '4', name: 'Lisa Chen', initials: 'LC', adherenceRate: 92, medicationCount: 2, missedToday: 0, alert: 'low' as const },
]

export default function PatientsPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [patients] = useState(MOCK_PATIENTS)

  const filteredPatients = patients.filter((p) =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const highAlertCount = patients.filter((p) => p.alert === 'high').length
  const averageAdherence = Math.round(
    patients.reduce((sum, p) => sum + p.adherenceRate, 0) / patients.length
  )

  return (
    <div className="space-y-6 px-4 py-6 md:px-8 md:py-8 max-w-2xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold">Lista de pacientes</h1>
        <p className="text-muted-foreground mt-1">
          Monitoreá la adherencia a medicamentos de tus pacientes
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-muted-foreground text-sm">Total pacientes</p>
              <p className="text-3xl font-bold">{patients.length}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-muted-foreground text-sm">Adherencia promedio</p>
              <p className="text-3xl font-bold text-secondary">{averageAdherence}%</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-muted-foreground text-sm">Alertas</p>
              <p className="text-3xl font-bold text-destructive">{highAlertCount}</p>
              <p className="text-xs text-destructive/75 mt-1">alta prioridad</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-muted-foreground text-sm">En línea</p>
              <p className="text-3xl font-bold text-green-600">
                {Math.floor(Math.random() * patients.length) + 1}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Buscar pacientes..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredPatients.map((patient) => (
          <Link key={patient.id} href={`/patients/${patient.id}`}>
            <PatientStatusCard
              {...patient}
              onClick={() => console.log('Ver paciente:', patient.id)}
            />
          </Link>
        ))}
      </div>

      {filteredPatients.length === 0 && (
        <Card>
          <CardContent className="pt-6 text-center py-12">
            <p className="text-muted-foreground">Sin pacientes para monitorear aún</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
