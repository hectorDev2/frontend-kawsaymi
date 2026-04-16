'use client'

import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

interface DataPoint {
  date: string
  adherence: number
  taken: number
  missed: number
}

export interface AdherenceChartProps {
  data: DataPoint[]
  type?: 'line' | 'bar'
  title?: string
  description?: string
}

export function AdherenceChart({
  data,
  type = 'line',
  title = 'Adherence Over Time',
  description = 'Your medication adherence trends',
}: AdherenceChartProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          {type === 'line' ? (
            <LineChart data={data} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line
                type="monotone"
                dataKey="adherence"
                stroke="hsl(var(--color-primary))"
                name="Adherence %"
              />
            </LineChart>
          ) : (
            <BarChart data={data} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="taken" stackId="a" fill="hsl(var(--color-secondary))" name="Taken" />
              <Bar dataKey="missed" stackId="a" fill="hsl(var(--color-destructive))" name="Missed" />
            </BarChart>
          )}
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
