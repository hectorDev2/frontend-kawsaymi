'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useAuth } from '@/lib/auth-context'
import { useToast } from '@/hooks/use-toast'
import { Eye, EyeOff, Heart } from 'lucide-react'

export default function LoginPage() {
  const router = useRouter()
  const { login } = useAuth()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    try {
      await login(email, password)
      router.push('/dashboard')
    } catch (error) {
      toast({
        title: 'No pudimos iniciar sesión',
        description: 'Verificá tu correo y contraseña',
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <div className="gradient-brand px-6 pt-12 pb-16 text-white text-center">
        <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur flex items-center justify-center mx-auto mb-4 text-xl font-bold">
          KC
        </div>
        <h1 className="text-2xl font-bold">Kawsaymi Care</h1>
        <p className="text-white/80 mt-1 text-base">Cuidando tu salud, paso a paso</p>
      </div>

      {/* Card flotante */}
      <div className="flex-1 -mt-6 bg-background rounded-t-3xl px-6 pt-8 pb-6">
        <h2 className="text-2xl font-bold mb-1">Bienvenido</h2>
        <p className="text-muted-foreground mb-8">Ingresá tus datos para continuar</p>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <label className="text-base font-semibold block">Correo electrónico</label>
            <Input
              type="email"
              placeholder="tunombre@correo.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={isLoading}
              className="h-14 text-base rounded-xl px-4"
              autoComplete="email"
            />
          </div>

          <div className="space-y-2">
            <label className="text-base font-semibold block">Contraseña</label>
            <div className="relative">
              <Input
                type={showPassword ? 'text' : 'password'}
                placeholder="Tu contraseña"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={isLoading}
                className="h-14 text-base rounded-xl px-4 pr-14"
                autoComplete="current-password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors p-1"
                aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          <Button
            type="submit"
            className="w-full h-14 text-base font-bold rounded-xl shadow-sm mt-2"
            disabled={isLoading}
          >
            {isLoading ? 'Ingresando...' : 'Ingresar'}
          </Button>
        </form>

        <p className="mt-6 text-center text-base text-muted-foreground">
          ¿No tenés cuenta?{' '}
          <Link href="/auth/signup" className="text-primary font-bold hover:underline">
            Registrarse
          </Link>
        </p>

        {/* Demo box */}
        <div className="mt-8 p-5 rounded-2xl bg-muted border border-border">
          <p className="text-sm font-bold text-foreground mb-3 flex items-center gap-2">
            <Heart className="w-4 h-4 text-primary" />
            Credenciales de prueba
          </p>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Paciente:</span>
              <button
                onClick={() => { setEmail('paciente@demo.com'); setPassword('12345678') }}
                className="font-mono text-primary hover:underline"
              >
                paciente@demo.com
              </button>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Cuidador:</span>
              <button
                onClick={() => { setEmail('cuidador@demo.com'); setPassword('12345678') }}
                className="font-mono text-primary hover:underline"
              >
                cuidador@demo.com
              </button>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Contraseña:</span>
              <span className="font-mono font-semibold">12345678</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
