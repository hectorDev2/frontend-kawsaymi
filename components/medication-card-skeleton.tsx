import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/skeleton'

export function MedicationCardSkeleton() {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex gap-3 flex-1">
            <Skeleton className="w-10 h-10 rounded-lg flex-shrink-0" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-1/3" />
              <Skeleton className="h-3 w-1/4" />
              <Skeleton className="h-3 w-1/3" />
            </div>
          </div>
          <Skeleton className="w-16 h-6 flex-shrink-0" />
        </div>
      </CardContent>
    </Card>
  )
}
