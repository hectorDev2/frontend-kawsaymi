'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { AdherenceChart } from '@/components/adherence-chart'
import { Badge } from '@/components/ui/badge'
import { TrendingUp } from 'lucide-react'

const MOCK_ADHERENCE_DATA = [
  { date: 'Lun', adherence: 85, taken: 3, missed: 1 },
  { date: 'Mar', adherence: 100, taken: 4, missed: 0 },
  { date: 'Mié', adherence: 75, taken: 3, missed: 1 },
  { date: 'Jue', adherence: 90, taken: 4, missed: 1 },
  { date: 'Vie', adherence: 100, taken: 4, missed: 0 },
  { date: 'Sáb', adherence: 80, taken: 3, missed: 1 },
  { date: 'Dom', adherence: 95, taken: 4, missed: 0 },
]

export default function AdherencePage() {
  const weeklyAverage = Math.round(
    MOCK_ADHERENCE_DATA.reduce((sum, d) => sum + d.adherence, 0) / MOCK_ADHERENCE_DATA.length
  )

  return (
    <div className="space-y-6 p-4 md:p-6">
      <div>
        <h1 className="text-3xl font-bold">Cumplimiento</h1>
        <p className="text-muted-foreground mt-1">
          Seguí tu adherencia a medicamentos y tendencias
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-muted-foreground text-sm">Promedio semanal</p>
                <p className="text-4xl font-bold mt-2">{weeklyAverage}%</p>
              </div>
              <Badge className="bg-green-100 text-green-900">
                <TrendingUp className="w-3 h-3 mr-1" />
                Bien
              </Badge>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-2">
              <p className="text-muted-foreground text-sm">Esta semana</p>
              <div className="flex gap-2 mt-2">
                {[85, 100, 75, 90, 100, 80, 95].map((rate, i) => (
                  <div
                    key={i}
                    className="flex-1 h-12 rounded-sm flex items-end justify-center"
                    style={{
                      backgroundColor: `hsl(${rate >= 80 ? '142, 76%, 36%' : '40, 96%, 40%'})`,
                      opacity: 0.8,
                    }}
                  >
                    <span className="text-xs font-semibold text-white">{rate}%</span>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-3">
              <div>
                <p className="text-muted-foreground text-xs">Dosis tomadas</p>
                <p className="text-2xl font-bold">27</p>
              </div>
              <div>
                <p className="text-muted-foreground text-xs">Dosis perdidas</p>
                <p className="text-2xl font-bold text-red-600">4</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-6">
        <AdherenceChart
          data={MOCK_ADHERENCE_DATA}
          type="line"
          title="Tendencia de adherencia semanal"
          description="Tu tasa de adherencia durante la última semana"
        />
        <AdherenceChart
          data={MOCK_ADHERENCE_DATA}
          type="bar"
          title="Dosis tomadas vs perdidas"
          description="Desglose diario de medicamentos"
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Análisis de salud</CardTitle>
          <CardDescription>Basado en tus patrones de adherencia</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-4 rounded-lg bg-blue-50 border border-blue-200">
            <p className="text-sm font-semibold text-blue-900">¡Excelente consistencia!</p>
            <p className="text-sm text-blue-800 mt-1">
              Mantuviste un promedio de {weeklyAverage}% de adherencia esta semana. ¡Seguí así!
            </p>
          </div>
          <div className="p-4 rounded-lg bg-amber-50 border border-amber-200">
            <p className="text-sm font-semibold text-amber-900">Los recordatorios pueden ayudar</p>
            <p className="text-sm text-amber-800 mt-1">
              Considerá activar las notificaciones para que te recuerde tus medicamentos en los horarios pautados.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
