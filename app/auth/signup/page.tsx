'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useAuth } from '@/lib/auth-context'
import { useToast } from '@/hooks/use-toast'
import { Eye, EyeOff, Heart } from 'lucide-react'

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
      router.push('/dashboard')
    } catch (err) {
      toast({ title: 'Error', description: err instanceof Error ? err.message : 'Intentá de nuevo', variant: 'destructive' })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <div className="gradient-brand px-6 pt-12 pb-16 text-white text-center">
        <div className="w-16 h-16 rounded-2xl bg-white/20 flex items-center justify-center mx-auto mb-4 text-xl font-bold">KC</div>
        <h1 className="text-2xl font-bold">Kawsaymi Care</h1>
        <p className="text-white/80 mt-1">Cuidando tu salud, paso a paso</p>
      </div>

      <div className="flex-1 -mt-6 bg-background rounded-t-3xl px-6 pt-8 pb-8">
        <h2 className="text-2xl font-bold mb-1">Crear cuenta</h2>
        <p className="text-muted-foreground mb-7">Registrate para comenzar</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label className="text-base font-semibold block">Nombre completo</label>
            <Input placeholder="Tu nombre" value={form.name} onChange={(e) => update('name', e.target.value)} required disabled={isLoading} className="h-14 text-base rounded-xl" />
          </div>
          <div className="space-y-2">
            <label className="text-base font-semibold block">Correo electrónico</label>
            <Input type="email" placeholder="tunombre@correo.com" value={form.email} onChange={(e) => update('email', e.target.value)} required disabled={isLoading} className="h-14 text-base rounded-xl" />
          </div>
          <div className="space-y-2">
            <label className="text-base font-semibold block">Soy</label>
            <Select value={role} onValueChange={(v) => setRole(v as any)}>
              <SelectTrigger className="h-14 text-base rounded-xl"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="PATIENT">Paciente</SelectItem>
                <SelectItem value="CAREGIVER">Cuidador / Familiar</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <label className="text-base font-semibold block">Contraseña</label>
            <div className="relative">
              <Input type={showPassword ? 'text' : 'password'} placeholder="Mínimo 6 caracteres" value={form.password} onChange={(e) => update('password', e.target.value)} required disabled={isLoading} className="h-14 text-base rounded-xl pr-14" />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground">
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-base font-semibold block">Confirmar contraseña</label>
            <Input type="password" placeholder="Repetí tu contraseña" value={form.confirmPassword} onChange={(e) => update('confirmPassword', e.target.value)} required disabled={isLoading} className="h-14 text-base rounded-xl" />
          </div>
          <Button type="submit" className="w-full h-14 text-base font-bold rounded-xl shadow-sm mt-2" disabled={isLoading}>
            {isLoading ? 'Creando cuenta...' : 'Crear cuenta'}
          </Button>
        </form>

        <p className="mt-6 text-center text-base text-muted-foreground">
          ¿Ya tenés cuenta?{' '}
          <Link href="/auth/login" className="text-primary font-bold hover:underline">Iniciar sesión</Link>
        </p>
      </div>
    </div>
  )
}
