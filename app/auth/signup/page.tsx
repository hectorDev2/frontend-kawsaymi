'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useAuth } from '@/lib/auth-context'
import { useToast } from '@/hooks/use-toast'
import { Eye, EyeOff } from 'lucide-react'

export default function SignupPage() {
  const router = useRouter()
  const { signup } = useAuth()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [role, setRole] = useState<'PATIENT' | 'CAREGIVER'>('PATIENT')
  const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '' })
  const update = (f: string, v: string) => setForm((p) => ({ ...p, [f]: v }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (form.password !== form.confirmPassword) {
      toast({ title: 'Error', description: 'Las contraseñas no coinciden', variant: 'destructive' })
      return
    }
    if (form.password.length < 6) {
      toast({ title: 'Error', description: 'La contraseña debe tener al menos 6 caracteres', variant: 'destructive' })
      return
    }
    setIsLoading(true)
    try {
      await signup({ name: form.name, email: form.email, password: form.password, role })
      router.push('/auth/consent')
    } catch (err) {
      toast({ title: 'Error', description: err instanceof Error ? err.message : 'Intentá de nuevo', variant: 'destructive' })
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
          <h2 className="text-2xl font-bold mb-1">Crear cuenta</h2>
          <p className="text-muted-foreground mb-6">Registrate para comenzar</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-semibold block">Nombre completo</label>
              <Input placeholder="Tu nombre" value={form.name} onChange={(e) => update('name', e.target.value)} required disabled={isLoading} className="h-12 rounded-xl" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold block">Correo electrónico</label>
              <Input type="email" placeholder="tunombre@correo.com" value={form.email} onChange={(e) => update('email', e.target.value)} required disabled={isLoading} className="h-12 rounded-xl" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold block">Soy</label>
              <Select value={role} onValueChange={(v) => setRole(v as 'PATIENT' | 'CAREGIVER')}>
                <SelectTrigger className="h-12 rounded-xl"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="PATIENT">Paciente</SelectItem>
                  <SelectItem value="CAREGIVER">Cuidador / Familiar</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold block">Contraseña</label>
              <div className="relative">
                <Input type={showPassword ? 'text' : 'password'} placeholder="Mínimo 6 caracteres" value={form.password} onChange={(e) => update('password', e.target.value)} required disabled={isLoading} className="h-12 rounded-xl pr-12" />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors">
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold block">Confirmar contraseña</label>
              <Input type="password" placeholder="Repetí tu contraseña" value={form.confirmPassword} onChange={(e) => update('confirmPassword', e.target.value)} required disabled={isLoading} className="h-12 rounded-xl" />
            </div>
            <Button type="submit" className="w-full h-12 font-bold rounded-xl mt-2" disabled={isLoading}>
              {isLoading ? 'Creando cuenta...' : 'Crear cuenta'}
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            ¿Ya tenés cuenta?{' '}
            <Link href="/auth/login" className="text-primary font-bold hover:underline">Iniciar sesión</Link>
          </p>
        </div>

      </div>
    </div>
  )
}
