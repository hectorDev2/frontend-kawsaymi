'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { MedicationCard } from '@/components/medication-card'
import { Plus, Search } from 'lucide-react'
import { Input } from '@/components/ui/input'

const MOCK_MEDICATIONS = [
  {
    id: '1',
    name: 'Metformin',
    dosage: '500mg',
    frequency: 'Dos veces al día',
    nextDue: 'en 2 horas',
    status: 'pending' as const,
    instructions: 'Tomar con comida para reducir malestar estomacal',
  },
  {
    id: '2',
    name: 'Lisinopril',
    dosage: '10mg',
    frequency: 'Una vez al día',
    nextDue: 'Mañana 8:00 AM',
    status: 'completed' as const,
    instructions: 'Tomar por la mañana',
  },
  {
    id: '3',
    name: 'Atorvastatin',
    dosage: '20mg',
    frequency: 'Una vez al día',
    nextDue: 'Mañana 8:00 PM',
    status: 'pending' as const,
    instructions: 'Tomar por la noche',
  },
]

export default function MedicationsPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [medications] = useState(MOCK_MEDICATIONS)

  const filteredMedications = medications.filter((med) =>
    med.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="space-y-6 p-4 md:p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Mis medicamentos</h1>
          <p className="text-muted-foreground mt-1">
            Gestioná tus medicamentos y seguí tu adherencia
          </p>
        </div>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          Agregar medicamento
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-muted-foreground text-sm">Total</p>
              <p className="text-3xl font-bold">{medications.length}</p>
              <p className="text-xs text-muted-foreground mt-1">medicamentos</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-green-50 border-green-200">
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-green-900 text-sm">Completados</p>
              <p className="text-3xl font-bold text-green-900">
                {medications.filter((m) => m.status === 'completed').length}
              </p>
              <p className="text-xs text-green-900/75 mt-1">hoy</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-amber-50 border-amber-200">
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-amber-900 text-sm">Pendientes</p>
              <p className="text-3xl font-bold text-amber-900">
                {medications.filter((m) => m.status === 'pending').length}
              </p>
              <p className="text-xs text-amber-900/75 mt-1">hoy</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-red-50 border-red-200">
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-red-900 text-sm">Perdidos</p>
              <p className="text-3xl font-bold text-red-900">
                {medications.filter((m) => m.status === 'missed').length}
              </p>
              <p className="text-xs text-red-900/75 mt-1">hoy</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Buscar medicamentos..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      <div className="space-y-3">
        {filteredMedications.length > 0 ? (
          filteredMedications.map((medication) => (
            <MedicationCard
              key={medication.id}
              {...medication}
              onMarkTaken={() => console.log('Marcado como tomado:', medication.id)}
              onMarkMissed={() => console.log('Marcado como perdido:', medication.id)}
              onEdit={() => console.log('Editar:', medication.id)}
            />
          ))
        ) : (
          <Card>
            <CardContent className="pt-6 text-center py-12">
              <p className="text-muted-foreground">Aún no hay medicamentos asignados</p>
              <Button className="mt-4">
                <Plus className="w-4 h-4 mr-2" />
                Agregar medicamento
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
