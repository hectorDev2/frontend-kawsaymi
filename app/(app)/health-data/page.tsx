'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Plus, Heart, Droplet, Weight, Activity } from 'lucide-react'

interface HealthRecord {
  id: string
  type: 'blood_pressure' | 'blood_sugar' | 'weight' | 'heart_rate'
  value: string
  unit: string
  date: string
  notes?: string
}

const MOCK_HEALTH_DATA: HealthRecord[] = [
  { id: '1', type: 'blood_pressure', value: '120/80', unit: 'mmHg', date: 'Hoy, 8:00 AM', notes: 'Lectura normal' },
  { id: '2', type: 'blood_sugar', value: '115', unit: 'mg/dL', date: 'Hoy, 12:00 PM' },
  { id: '3', type: 'weight', value: '72.5', unit: 'kg', date: 'Ayer, 7:00 AM' },
  { id: '4', type: 'heart_rate', value: '72', unit: 'bpm', date: 'Hoy, 6:00 PM' },
]

const getIcon = (type: string) => {
  switch (type) {
    case 'blood_pressure': return <Heart className="w-5 h-5 text-red-600" />
    case 'blood_sugar': return <Droplet className="w-5 h-5 text-orange-600" />
    case 'weight': return <Weight className="w-5 h-5 text-blue-600" />
    case 'heart_rate': return <Activity className="w-5 h-5 text-pink-600" />
    default: return null
  }
}

const getLabel = (type: string) => {
  switch (type) {
    case 'blood_pressure': return 'Presión arterial'
    case 'blood_sugar': return 'Glucemia'
    case 'weight': return 'Peso'
    case 'heart_rate': return 'Frecuencia cardíaca'
    default: return ''
  }
}

export default function HealthDataPage() {
  const [healthData] = useState(MOCK_HEALTH_DATA)

  return (
    <div className="space-y-6 p-4 md:p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Datos de salud</h1>
          <p className="text-muted-foreground mt-1">
            Registrá y seguí tus mediciones de salud
          </p>
        </div>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          Agregar lectura
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Presión arterial', icon: Heart, placeholder: '120/80', color: 'bg-red-50 border-red-200' },
          { label: 'Glucemia', icon: Droplet, placeholder: '100', color: 'bg-orange-50 border-orange-200' },
          { label: 'Peso', icon: Weight, placeholder: '70.5', color: 'bg-blue-50 border-blue-200' },
          { label: 'Frec. cardíaca', icon: Activity, placeholder: '72', color: 'bg-pink-50 border-pink-200' },
        ].map((item) => {
          const Icon = item.icon
          return (
            <div key={item.label} className={`p-4 rounded-lg border ${item.color}`}>
              <div className="flex items-center gap-2 mb-3">
                <Icon className="w-5 h-5" />
                <span className="font-semibold text-sm">{item.label}</span>
              </div>
              <Input placeholder={item.placeholder} className="bg-white/50" />
            </div>
          )
        })}
      </div>

      <div>
        <h2 className="text-lg font-semibold mb-4">Registros recientes</h2>
        <div className="space-y-2">
          {healthData.map((record) => (
            <Card key={record.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-lg bg-muted">{getIcon(record.type)}</div>
                  <div>
                    <p className="font-semibold text-sm">{getLabel(record.type)}</p>
                    <p className="text-xs text-muted-foreground">{record.date}</p>
                    {record.notes && <p className="text-xs text-muted-foreground mt-1">{record.notes}</p>}
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold">{record.value}</p>
                  <p className="text-xs text-muted-foreground">{record.unit}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Consejos de salud</CardTitle>
          <CardDescription>Monitoreá tu salud regularmente</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex gap-3">
            <div className="w-2 h-2 rounded-full bg-primary mt-2 flex-shrink-0" />
            <div>
              <p className="text-sm font-semibold">Monitoreo regular</p>
              <p className="text-xs text-muted-foreground">Tomá las lecturas a la misma hora cada día para mayor consistencia</p>
            </div>
          </div>
          <div className="flex gap-3">
            <div className="w-2 h-2 rounded-full bg-primary mt-2 flex-shrink-0" />
            <div>
              <p className="text-sm font-semibold">Compartí con tu médico</p>
              <p className="text-xs text-muted-foreground">Tus cuidadores pueden acceder a estos datos para darte mejor apoyo</p>
            </div>
          </div>
          <div className="flex gap-3">
            <div className="w-2 h-2 rounded-full bg-primary mt-2 flex-shrink-0" />
            <div>
              <p className="text-sm font-semibold">Registrá todo</p>
              <p className="text-xs text-muted-foreground">Incluí notas sobre dieta, actividad y cómo te sentís</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
