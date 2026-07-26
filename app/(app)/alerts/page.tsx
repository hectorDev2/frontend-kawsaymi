'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { AlertCircle, Check, Trash2, Pill, AlertTriangle, HeartPulse } from 'lucide-react'
import { api } from '@/lib/api'
import { onDataChanged } from '@/lib/data-events'
import type { ClinicalAlert } from '@/lib/api'

const SEVERITY_STYLES = {
  HIGH: 'bg-red-100 text-red-900 border-red-200',
  MEDIUM: 'bg-amber-100 text-amber-900 border-amber-200',
  LOW: 'bg-green-100 text-green-900 border-green-200',
}

const SEVERITY_BADGE = {
  HIGH: 'bg-red-600',
  MEDIUM: 'bg-amber-600',
  LOW: 'bg-green-600',
}

const TYPE_ICONS: Record<string, typeof AlertCircle> = {
  CLINICAL_INTERACTION: AlertTriangle,
  POLYPHARMACY_HIGH: AlertTriangle,
  POLYPHARMACY_MODERATE: AlertTriangle,
  ADHERENCE_LOW: HeartPulse,
  MISSED_DOSE: Pill,
  SIDE_EFFECT: AlertCircle,
  HEALTH_METRIC: HeartPulse,
}

const TYPE_LABELS: Record<string, string> = {
  CLINICAL_INTERACTION: 'Interacción medicamentosa',
  POLYPHARMACY_HIGH: 'Polifarmacia crítica',
  POLYPHARMACY_MODERATE: 'Polifarmacia moderada',
  ADHERENCE_LOW: 'Baja adherencia',
  MISSED_DOSE: 'Dosis perdida',
  SIDE_EFFECT: 'Efecto secundario',
  HEALTH_METRIC: 'Métrica de salud',
}

export default function AlertsPage() {
  const [alerts, setAlerts] = useState<ClinicalAlert[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'unread' | 'high'>('all')

  const load = async () => {
    try {
      const res = await api.getAlerts()
      setAlerts(res.alerts ?? [])
    } catch {
      setAlerts([])
    }
    setLoading(false)
  }

  useEffect(() => {
    load()
    const off = onDataChanged((type) => {
      if (type === 'alerts') load()
    })
    return off
  }, [])

  const handleMarkRead = async (id: string) => {
    await api.markAlertRead(id)
    setAlerts((prev) => prev.map((a) => (a.id === id ? { ...a, read: true } : a)))
  }

  const handleMarkAllRead = async () => {
    await api.markAllAlertsRead()
    setAlerts((prev) => prev.map((a) => ({ ...a, read: true })))
  }

  const handleDelete = async (id: string) => {
    await api.deleteAlert(id)
    setAlerts((prev) => prev.filter((a) => a.id !== id))
  }

  const filtered = alerts.filter((alert) => {
    if (filter === 'unread') return !alert.read
    if (filter === 'high') return alert.severity === 'HIGH'
    return true
  })

  const unreadCount = alerts.filter((a) => !a.read).length
  const highCount = alerts.filter((a) => a.severity === 'HIGH').length

  return (
    <div className="space-y-6 px-4 py-6 md:px-8 md:py-8 max-w-2xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Alertas</h1>
          <p className="text-muted-foreground mt-1">
            Alertas clínicas generadas automáticamente
          </p>
        </div>
        {unreadCount > 0 && (
          <Button variant="outline" size="sm" onClick={handleMarkAllRead}>
            <Check className="w-4 h-4 mr-1" />
            Marcar todas leídas
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-muted-foreground text-sm">Total</p>
              <p className="text-3xl font-bold">{loading ? '...' : alerts.length}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-blue-900 text-sm">Sin leer</p>
              <p className="text-3xl font-bold text-blue-900">{loading ? '...' : unreadCount}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-red-50 border-red-200">
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-red-900 text-sm">Alta prioridad</p>
              <p className="text-3xl font-bold text-red-900">{loading ? '...' : highCount}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-wrap gap-2">
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
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <Card key={i}><CardContent className="p-4"><div className="h-16 bg-muted animate-pulse rounded" /></CardContent></Card>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <Card>
            <CardContent className="pt-6 text-center py-12">
              <p className="text-muted-foreground">Sin alertas</p>
              <p className="text-sm text-muted-foreground mt-2">No hay alertas clínicas pendientes</p>
            </CardContent>
          </Card>
        ) : (
          filtered.map((alert) => {
            const Icon = TYPE_ICONS[alert.type] ?? AlertCircle
            const typeLabel = TYPE_LABELS[alert.type] ?? alert.type
            return (
              <Card key={alert.id} className={!alert.read ? 'bg-primary/5' : ''}>
                <CardContent className="p-4">
                  <div className="flex items-start gap-4">
                    <div className={`p-2 rounded-lg ${SEVERITY_BADGE[alert.severity]} text-white flex-shrink-0`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-1 sm:gap-2">
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="font-semibold">{alert.title}</h3>
                            <span className={`text-xs font-semibold px-1.5 py-0.5 rounded-full ${SEVERITY_STYLES[alert.severity].split(' ').slice(0, 2).join(' ')}`}>
                              {typeLabel}
                            </span>
                          </div>
                          <p className="text-sm mt-1">{alert.description}</p>
                        </div>
                        <div className="text-xs text-muted-foreground sm:whitespace-nowrap flex-shrink-0">
                          {new Date(alert.createdAt).toLocaleDateString('es', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2 mt-4 sm:ml-14">
                    {!alert.read && (
                      <Button size="sm" variant="ghost" onClick={() => handleMarkRead(alert.id)}>
                        <Check className="w-4 h-4 mr-1" />
                        Marcar leída
                      </Button>
                    )}
                    <Button size="sm" variant="ghost" className="text-red-600 hover:text-red-700" onClick={() => handleDelete(alert.id)}>
                      <Trash2 className="w-4 h-4 mr-1" />
                      Eliminar
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )
          })
        )}
      </div>
    </div>
  )
}
