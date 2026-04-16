'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Clock, Pill } from 'lucide-react'
import { useState } from 'react'

export interface MedicationCardProps {
  id: string
  name: string
  dosage: string
  frequency: string
  nextDue?: string
  status?: 'pending' | 'completed' | 'missed'
  instructions?: string
  onMarkTaken?: () => void
  onMarkMissed?: () => void
  onEdit?: () => void
}

export function MedicationCard({
  id,
  name,
  dosage,
  frequency,
  nextDue,
  status = 'pending',
  instructions,
  onMarkTaken,
  onMarkMissed,
  onEdit,
}: MedicationCardProps) {
  const [isExpanded, setIsExpanded] = useState(false)

  const statusColors = {
    pending: 'bg-amber-50 border-amber-200 text-amber-900',
    completed: 'bg-green-50 border-green-200 text-green-900',
    missed: 'bg-red-50 border-red-200 text-red-900',
  }

  const statusLabels = {
    pending: 'Pending',
    completed: 'Completed',
    missed: 'Missed',
  }

  return (
    <Card className={statusColors[status]}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex gap-3 flex-1">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
              <Pill className="w-5 h-5 text-primary" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-sm">{name}</h3>
              <p className="text-xs opacity-75 mt-1">{dosage}</p>
              <div className="flex items-center gap-1 text-xs opacity-75 mt-1">
                <Clock className="w-3 h-3" />
                {frequency}
              </div>
              {nextDue && (
                <p className="text-xs opacity-75 mt-1">Next: {nextDue}</p>
              )}
            </div>
          </div>
          <div className="flex flex-col gap-2 flex-shrink-0">
            <span className="text-xs font-medium px-2 py-1 rounded-full bg-white/50">
              {statusLabels[status]}
            </span>
          </div>
        </div>

        {isExpanded && instructions && (
          <div className="mt-4 pt-4 border-t border-current opacity-50">
            <p className="text-xs">{instructions}</p>
          </div>
        )}

        {status === 'pending' && (
          <div className="flex gap-2 mt-4">
            <Button
              size="sm"
              variant="default"
              onClick={onMarkTaken}
              className="flex-1"
            >
              Taken
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={onMarkMissed}
              className="flex-1"
            >
              Missed
            </Button>
          </div>
        )}

        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full text-left text-xs opacity-75 mt-3 hover:opacity-100 transition"
        >
          {isExpanded ? 'Hide details' : 'Show details'}
        </button>
      </CardContent>
    </Card>
  )
}
