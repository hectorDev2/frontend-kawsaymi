'use client'

import { useAuth } from '@/lib/auth-context'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { Heart, Pill, BarChart3, Users, Shield, Clock, ArrowRight } from 'lucide-react'

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
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/80 backdrop-blur-sm sticky top-0 z-40">
        <nav className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl gradient-brand text-white flex items-center justify-center text-sm font-bold shadow-sm">
              KC
            </div>
            <div>
              <p className="font-bold text-sm leading-tight">Kawsaymi Care</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" asChild>
              <Link href="/auth/login">Iniciar sesión</Link>
            </Button>
            <Button size="sm" asChild className="shadow-sm">
              <Link href="/auth/signup">Comenzar gratis</Link>
            </Button>
          </div>
        </nav>
      </header>

      {/* Hero */}
      <section className="max-w-6xl mx-auto px-6 pt-20 pb-24 text-center">
        <div className="inline-flex items-center gap-2 bg-primary/8 text-primary text-xs font-semibold px-3 py-1.5 rounded-full mb-6 border border-primary/20">
          <Heart className="w-3.5 h-3.5" />
          Tu salud, nuestra prioridad
        </div>
        <h1 className="text-5xl md:text-6xl font-bold mb-6 text-balance leading-[1.1] tracking-tight">
          Tu compañero de
          <span className="block text-primary">adherencia a medicamentos</span>
        </h1>
        <p className="text-lg text-muted-foreground mb-10 max-w-xl mx-auto leading-relaxed">
          Kawsaymi Care te ayuda a mantenerte al día con tus medicamentos con recordatorios inteligentes y apoyo de cuidadores.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button size="lg" asChild className="shadow-md gap-2">
            <Link href="/auth/signup">
              Comenzar gratis
              <ArrowRight className="w-4 h-4" />
            </Link>
          </Button>
          <Button size="lg" variant="outline" asChild>
            <Link href="/auth/login">Ya tengo cuenta</Link>
          </Button>
        </div>

        {/* Demo credentials hint */}
        <div className="mt-8 inline-flex items-center gap-2 text-xs text-muted-foreground bg-muted px-4 py-2 rounded-full">
          <Shield className="w-3.5 h-3.5" />
          Demo: <strong>paciente@demo.com</strong> o <strong>cuidador@demo.com</strong> — contraseña: <strong>12345678</strong>
        </div>
      </section>

      {/* Features */}
      <section className="bg-card border-y border-border py-20">
        <div className="max-w-6xl mx-auto px-6">
          <p className="text-center text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-12">
            Todo lo que necesitás para tu salud
          </p>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                icon: Pill,
                title: 'Seguimiento fácil',
                desc: 'Registrá tus medicamentos con un solo toque',
                color: 'text-primary bg-primary/10',
              },
              {
                icon: BarChart3,
                title: 'Análisis inteligente',
                desc: 'Seguí tu adherencia con datos detallados',
                color: 'text-secondary bg-secondary/10',
              },
              {
                icon: Users,
                title: 'Apoyo de cuidadores',
                desc: 'Compartí tu progreso con personas de confianza',
                color: 'text-primary bg-primary/10',
              },
              {
                icon: Clock,
                title: 'Recordatorios',
                desc: 'Nunca más olvidés tomar tu medicación',
                color: 'text-secondary bg-secondary/10',
              },
            ].map((f) => (
              <div key={f.title} className="p-6 rounded-xl border border-border bg-background hover:shadow-md transition-all duration-200 hover:-translate-y-0.5 group">
                <div className={`w-10 h-10 rounded-lg ${f.color} flex items-center justify-center mb-4`}>
                  <f.icon className="w-5 h-5" />
                </div>
                <h3 className="font-semibold mb-1.5 text-sm">{f.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="max-w-6xl mx-auto px-6 py-20">
        <h2 className="text-2xl font-bold mb-12 text-center">¿Por qué elegir Kawsaymi Care?</h2>
        <div className="grid md:grid-cols-3 gap-8">
          {[
            {
              title: 'Para pacientes',
              items: ['Recordatorios personalizados', 'Seguimiento diario de adherencia', 'Registro de datos de salud', 'Compartir datos con cuidadores'],
            },
            {
              title: 'Para cuidadores',
              items: ['Monitorear múltiples pacientes', 'Recibir alertas de adherencia', 'Seguir tendencias de salud', 'Comunicación segura'],
            },
            {
              title: 'Para todos',
              items: ['Completamente en español', 'Diseño optimizado para móvil', 'Privacidad garantizada', 'Soporte 24/7'],
            },
          ].map((col) => (
            <div key={col.title} className="p-6 rounded-xl border border-border bg-card">
              <h3 className="font-semibold mb-4 text-primary">{col.title}</h3>
              <ul className="space-y-2.5">
                {col.items.map((item) => (
                  <li key={item} className="flex items-center gap-2.5 text-sm text-muted-foreground">
                    <div className="w-1.5 h-1.5 rounded-full bg-secondary flex-shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-6xl mx-auto px-6 pb-24">
        <div className="gradient-brand rounded-2xl p-12 text-center text-white">
          <h2 className="text-2xl font-bold mb-3">¿Listo para tomar el control?</h2>
          <p className="mb-8 text-white/80 max-w-md mx-auto">
            Únete a miles de pacientes y cuidadores que gestionan mejor sus medicamentos.
          </p>
          <Button size="lg" variant="secondary" asChild className="bg-white text-primary hover:bg-white/90 shadow-md gap-2">
            <Link href="/auth/signup">
              Crear cuenta gratis
              <ArrowRight className="w-4 h-4" />
            </Link>
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-8">
        <div className="max-w-6xl mx-auto px-6 text-center text-sm text-muted-foreground">
          <p>&copy; 2024 Kawsaymi Care. Todos los derechos reservados.</p>
        </div>
      </footer>
    </div>
  )
}
