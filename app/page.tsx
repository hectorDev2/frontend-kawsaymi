'use client'

import { useAuth } from '@/lib/auth-context'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { Heart, Pill, BarChart3, Users } from 'lucide-react'

export default function RootPage() {
  const { isAuthenticated, isLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.push('/dashboard')
    }
  }, [isAuthenticated, isLoading, router])

  if (isLoading) return null

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5">
      <header className="border-b border-border/50 bg-background/80 backdrop-blur-sm sticky top-0 z-40">
        <nav className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2 font-bold text-lg">
            <div className="w-8 h-8 rounded-lg bg-primary text-primary-foreground flex items-center justify-center text-sm">
              KC
            </div>
            Kawsaymi Care
          </div>
          <div className="flex gap-2">
            <Button variant="outline" asChild>
              <Link href="/auth/login">Iniciar sesión</Link>
            </Button>
            <Button asChild>
              <Link href="/auth/signup">Comenzar</Link>
            </Button>
          </div>
        </nav>
      </header>

      <section className="container mx-auto px-4 py-20 text-center">
        <h1 className="text-5xl md:text-6xl font-bold mb-6 text-balance">
          Tu Compañero de Adherencia a Medicamentos
        </h1>
        <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto text-balance">
          Kawsaymi Care te ayuda a mantenerte al día con tus medicamentos con recordatorios inteligentes, seguimiento fácil y apoyo de cuidadores.
        </p>
        <div className="flex gap-4 justify-center mb-16">
          <Button size="lg" asChild>
            <Link href="/auth/signup">Comenzar gratis</Link>
          </Button>
          <Button size="lg" variant="outline" asChild>
            <Link href="/auth/login">Iniciar sesión</Link>
          </Button>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mt-12">
          <div className="p-6 rounded-lg border border-border bg-card hover:shadow-lg transition-shadow">
            <Pill className="w-12 h-12 mx-auto mb-4 text-primary" />
            <h3 className="font-semibold mb-2">Seguimiento fácil</h3>
            <p className="text-sm text-muted-foreground">Registrá tus medicamentos con un solo toque</p>
          </div>
          <div className="p-6 rounded-lg border border-border bg-card hover:shadow-lg transition-shadow">
            <BarChart3 className="w-12 h-12 mx-auto mb-4 text-secondary" />
            <h3 className="font-semibold mb-2">Análisis inteligente</h3>
            <p className="text-sm text-muted-foreground">Seguí tu adherencia con datos detallados</p>
          </div>
          <div className="p-6 rounded-lg border border-border bg-card hover:shadow-lg transition-shadow">
            <Users className="w-12 h-12 mx-auto mb-4 text-accent" />
            <h3 className="font-semibold mb-2">Apoyo de cuidadores</h3>
            <p className="text-sm text-muted-foreground">Compartí tu progreso con cuidadores de confianza</p>
          </div>
          <div className="p-6 rounded-lg border border-border bg-card hover:shadow-lg transition-shadow">
            <Heart className="w-12 h-12 mx-auto mb-4 text-destructive" />
            <h3 className="font-semibold mb-2">Enfoque en salud</h3>
            <p className="text-sm text-muted-foreground">Diseñado pensando en el cuidado de la salud</p>
          </div>
        </div>
      </section>

      <section className="container mx-auto px-4 py-20 text-center">
        <div className="bg-gradient-to-r from-primary to-secondary rounded-lg p-12 text-white">
          <h2 className="text-3xl font-bold mb-4">¿Listo para tomar el control?</h2>
          <p className="mb-8 text-white/90">Únete a miles de pacientes y cuidadores que gestionan mejor sus medicamentos.</p>
          <Button size="lg" variant="secondary" asChild>
            <Link href="/auth/signup">Crear cuenta gratis</Link>
          </Button>
        </div>
      </section>

      <footer className="border-t border-border mt-20 py-8">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>&copy; 2024 Kawsaymi Care. Todos los derechos reservados.</p>
        </div>
      </footer>
    </div>
  )
}
