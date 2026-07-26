'use client'

import { useAuth } from '@/lib/auth-context'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { Navigation } from '@/components/navigation'
import { HealthContextProvider } from '@/lib/health-context'
import { useDoseNotifier } from '@/hooks/use-dose-notifier'
import { AlertTriangle, X } from 'lucide-react'

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth()
  const router = useRouter()
  const { alarmingEvents, snoozeAlarm } = useDoseNotifier()

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/auth/login')
    }
  }, [isAuthenticated, isLoading, router])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center space-y-3">
          <div className="w-12 h-12 rounded-full border-4 border-primary border-t-transparent animate-spin mx-auto" />
          <p className="text-muted-foreground font-medium">Cargando...</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) return null

  return (
    <HealthContextProvider>
      <div className="flex min-h-screen flex-col bg-background">
        {alarmingEvents.length > 0 && (
          <div className="sticky top-0 z-50 bg-destructive/10 border-b border-destructive/20 px-4 py-2 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-sm font-semibold text-destructive">
              <AlertTriangle className="w-4 h-4" />
              <span>{alarmingEvents.length} dosis {alarmingEvents.length === 1 ? 'está' : 'están'} por tomar</span>
            </div>
            <button
              onClick={snoozeAlarm}
              className="text-xs font-semibold bg-destructive/20 hover:bg-destructive/30 text-destructive px-3 py-1 rounded-lg transition-colors flex items-center gap-1"
            >
              <X className="w-3 h-3" /> Posponer
            </button>
          </div>
        )}
        <Navigation />
        <main className="flex-1 md:pl-64 pb-24 md:pb-0">
          {children}
        </main>
      </div>
    </HealthContextProvider>
  )
}
