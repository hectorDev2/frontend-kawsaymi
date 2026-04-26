'use client'

import { useAuth } from '@/lib/auth-context'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { Navigation } from '@/components/navigation'
import { HealthContextProvider } from '@/lib/health-context'

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth()
  const router = useRouter()

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
        <Navigation />
        {/* md:pl-64 por el sidebar desktop | pb-24 por el bottom nav mobile */}
        <main className="flex-1 md:pl-64 pb-24 md:pb-0">
          {children}
        </main>
      </div>
    </HealthContextProvider>
  )
}
