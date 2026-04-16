'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { AlertCircle, CheckCircle2, TrendingDown } from 'lucide-react'

export interface PatientStatusCardProps {
  id: string
  name: string
  initials?: string
  adherenceRate: number
  medicationCount: number
  missedToday: number
  alert?: 'high' | 'medium' | 'low'
  onClick?: () => void
}

export function PatientStatusCard({
  id,
  name,
  initials = 'JP',
  adherenceRate,
  medicationCount,
  missedToday,
  alert,
  onClick,
}: PatientStatusCardProps) {
  const adherenceColor =
    adherenceRate >= 80
      ? 'bg-green-50 text-green-900 border-green-200'
      : adherenceRate >= 60
        ? 'bg-amber-50 text-amber-900 border-amber-200'
        : 'bg-red-50 text-red-900 border-red-200'

  const alertIcon = {
    high: <AlertCircle className="w-4 h-4 text-red-600" />,
    medium: <TrendingDown className="w-4 h-4 text-amber-600" />,
    low: <CheckCircle2 className="w-4 h-4 text-green-600" />,
  }

  return (
    <Card
      onClick={onClick}
      className={`cursor-pointer hover:shadow-md transition-shadow ${adherenceColor}`}
    >
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-4">
          <div className="flex gap-3">
            <Avatar className="w-10 h-10">
              <AvatarFallback className="bg-primary/20 text-primary font-semibold">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div>
              <h3 className="font-semibold text-sm">{name}</h3>
              <p className="text-xs opacity-75">{medicationCount} medications</p>
            </div>
          </div>
          {alert && <div>{alertIcon[alert]}</div>}
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="p-2 rounded bg-white/50">
            <p className="text-xs opacity-75">Adherence</p>
            <p className="text-lg font-bold">{adherenceRate}%</p>
          </div>
          <div className="p-2 rounded bg-white/50">
            <p className="text-xs opacity-75">Missed Today</p>
            <p className="text-lg font-bold">{missedToday}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
