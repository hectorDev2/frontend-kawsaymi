'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
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
    } catch {
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
    <div className="min-h-screen bg-muted/30 flex flex-col md:items-center md:justify-center md:py-8 md:px-4">
      <div className="flex flex-col w-full md:max-w-md md:rounded-2xl md:overflow-hidden md:shadow-lg md:border md:border-border">

        {/* Brand header */}
        <div className="gradient-brand px-6 pt-14 pb-16 md:pt-10 md:pb-14 text-center text-white">
          <div className="w-20 h-20 bg-white rounded-2xl shadow-sm flex items-center justify-center mx-auto mb-4">
            <Image src="/logo.png" alt="Kawsaymi Care" width={65} height={65} className="object-contain" />
          </div>
          <h1 className="text-2xl font-bold">Kawsaymi Care</h1>
          <p className="text-white/80 mt-1">Cuidando tu salud, paso a paso</p>
        </div>

        {/* Form */}
        <div className="-mt-5 bg-background rounded-t-3xl md:rounded-none md:mt-0 px-6 pt-8 pb-10 md:px-8">
          <h2 className="text-2xl font-bold mb-1">Bienvenido</h2>
          <p className="text-muted-foreground mb-8">Ingresá tus datos para continuar</p>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <label className="text-sm font-semibold block">Correo electrónico</label>
              <Input
                type="email"
                placeholder="tunombre@correo.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isLoading}
                className="h-12 rounded-xl px-4"
                autoComplete="email"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold block">Contraseña</label>
              <div className="relative">
                <Input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Tu contraseña"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={isLoading}
                  className="h-12 rounded-xl px-4 pr-12"
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <Button type="submit" className="w-full h-12 font-bold rounded-xl" disabled={isLoading}>
              {isLoading ? 'Ingresando...' : 'Ingresar'}
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            ¿No tenés cuenta?{' '}
            <Link href="/auth/signup" className="text-primary font-bold hover:underline">
              Registrarse
            </Link>
          </p>

          <div className="mt-6 p-4 rounded-xl bg-muted border border-border">
            <p className="text-sm font-bold text-foreground mb-3 flex items-center gap-2">
              <Heart className="w-4 h-4 text-primary" />
              Credenciales de prueba
            </p>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Paciente:</span>
                <button
                  onClick={() => { setEmail('paciente@demo.com'); setPassword('12345678') }}
                  className="font-mono text-primary hover:underline text-xs"
                >
                  paciente@demo.com
                </button>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Cuidador:</span>
                <button
                  onClick={() => { setEmail('cuidador@demo.com'); setPassword('12345678') }}
                  className="font-mono text-primary hover:underline text-xs"
                >
                  cuidador@demo.com
                </button>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Contraseña:</span>
                <span className="font-mono font-semibold text-xs">12345678</span>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}
