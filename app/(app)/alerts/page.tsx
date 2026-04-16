'use client'

import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { AlertCircle, Check, MessageCircle, Trash2 } from 'lucide-react'

interface Alert {
  id: string
  patientName: string
  type: 'missed_dose' | 'low_adherence' | 'side_effect' | 'health_metric'
  title: string
  description: string
  severity: 'high' | 'medium' | 'low'
  timestamp: string
  read: boolean
}

const MOCK_ALERTS: Alert[] = [
  {
    id: '1',
    patientName: 'Maria Garcia',
    type: 'missed_dose',
    title: 'Alerta de dosis perdida',
    description: 'Maria no tomó su Metformin a las 8:00 AM',
    severity: 'high',
    timestamp: 'hace 30 minutos',
    read: false,
  },
  {
    id: '2',
    patientName: 'James Smith',
    type: 'low_adherence',
    title: 'Advertencia de baja adherencia',
    description: 'James perdió 3 dosis esta semana. La adherencia bajó al 60%',
    severity: 'medium',
    timestamp: 'hace 2 horas',
    read: false,
  },
  {
    id: '3',
    patientName: 'John Doe',
    type: 'side_effect',
    title: 'Efecto secundario reportado',
    description: 'John reportó mareos después de tomar su medicamento',
    severity: 'high',
    timestamp: 'hace 4 horas',
    read: true,
  },
  {
    id: '4',
    patientName: 'Lisa Chen',
    type: 'health_metric',
    title: 'Presión arterial elevada',
    description: 'La presión arterial de Lisa es más alta de lo usual: 145/90',
    severity: 'medium',
    timestamp: 'hace 6 horas',
    read: true,
  },
]

export default function AlertsPage() {
  const [alerts, setAlerts] = useState(MOCK_ALERTS)
  const [filter, setFilter] = useState<'all' | 'unread' | 'high'>('all')

  const filtered = alerts.filter((alert) => {
    if (filter === 'unread') return !alert.read
    if (filter === 'high') return alert.severity === 'high'
    return true
  })

  const unreadCount = alerts.filter((a) => !a.read).length
  const highCount = alerts.filter((a) => a.severity === 'high').length

  const severityColor = {
    high: 'bg-red-100 text-red-900 border-red-200',
    medium: 'bg-amber-100 text-amber-900 border-amber-200',
    low: 'bg-green-100 text-green-900 border-green-200',
  }

  const severityBadge = {
    high: 'bg-red-600',
    medium: 'bg-amber-600',
    low: 'bg-green-600',
  }

  return (
    <div className="space-y-6 p-4 md:p-6">
      <div>
        <h1 className="text-3xl font-bold">Alertas</h1>
        <p className="text-muted-foreground mt-1">
          Actualizaciones importantes sobre tus pacientes
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-muted-foreground text-sm">Total de alertas</p>
              <p className="text-3xl font-bold">{alerts.length}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-blue-900 text-sm">Sin leer</p>
              <p className="text-3xl font-bold text-blue-900">{unreadCount}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-red-50 border-red-200">
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-red-900 text-sm">Alta prioridad</p>
              <p className="text-3xl font-bold text-red-900">{highCount}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex gap-2">
        <Button variant={filter === 'all' ? 'default' : 'outline'} onClick={() => setFilter('all')}>
          Todas
        </Button>
        <Button variant={filter === 'unread' ? 'default' : 'outline'} onClick={() => setFilter('unread')}>
          Sin leer ({unreadCount})
        </Button>
        <Button variant={filter === 'high' ? 'default' : 'outline'} onClick={() => setFilter('high')}>
          Alta prioridad ({highCount})
        </Button>
      </div>

      <div className="space-y-3">
        {filtered.length > 0 ? (
          filtered.map((alert) => (
            <Card
              key={alert.id}
              className={`border-l-4 ${severityColor[alert.severity]} ${
                !alert.read ? 'border-l-primary' : 'border-l-transparent'
              }`}
            >
              <CardContent className="p-4">
                <div className="flex items-start gap-4">
                  <div className={`p-2 rounded-lg ${severityBadge[alert.severity]} text-white flex-shrink-0`}>
                    <AlertCircle className="w-5 h-5" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h3 className="font-semibold">{alert.title}</h3>
                        <p className="text-sm mt-1">{alert.patientName}</p>
                        <p className="text-xs opacity-75 mt-2">{alert.description}</p>
                      </div>
                      <div className="text-right text-xs text-muted-foreground whitespace-nowrap flex-shrink-0">
                        {alert.timestamp}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex gap-2 mt-4 ml-14">
                  {!alert.read && (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setAlerts(alerts.map((a) => (a.id === alert.id ? { ...a, read: true } : a)))}
                    >
                      <Check className="w-4 h-4 mr-1" />
                      Marcar leída
                    </Button>
                  )}
                  <Button size="sm" variant="ghost">
                    <MessageCircle className="w-4 h-4 mr-1" />
                    Contactar
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-red-600 hover:text-red-700"
                    onClick={() => setAlerts(alerts.filter((a) => a.id !== alert.id))}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <Card>
            <CardContent className="pt-6 text-center py-12">
              <p className="text-muted-foreground">Sin alertas</p>
              <p className="text-sm text-muted-foreground mt-2">¡Todos tus pacientes están bien!</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
