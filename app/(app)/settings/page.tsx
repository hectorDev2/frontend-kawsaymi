'use client'

import { useState } from 'react'
import { useAuth } from '@/lib/auth-context'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Bell, Lock, User, LogOut, Save } from 'lucide-react'
import { api } from '@/lib/api'
import { useToast } from '@/hooks/use-toast'

export default function SettingsPage() {
  const { user, logout, refreshUser } = useAuth()
  const { toast } = useToast()
  const [name, setName] = useState(user?.name ?? '')
  const [saving, setSaving] = useState(false)

  const handleSaveProfile = async () => {
    if (!name.trim()) return
    setSaving(true)
    try {
      await api.updateMe({ name: name.trim() })
      await refreshUser()
      toast({ title: '¡Guardado!', description: 'Tu perfil fue actualizado' })
    } catch {
      toast({ title: 'Error', description: 'No se pudo guardar el perfil', variant: 'destructive' })
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="px-4 py-6 md:px-8 md:py-8 max-w-2xl mx-auto md:mx-0">
      <div className="mb-6">
        <h1 className="text-2xl md:text-3xl font-bold">Configuración</h1>
        <p className="text-muted-foreground text-sm mt-1">Gestioná tu cuenta y preferencias</p>
      </div>

      {/* Profile */}
      <div className="card-elevated p-5 mb-4">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
            <User className="w-4 h-4 text-primary" />
          </div>
          <div>
            <p className="font-bold">Perfil</p>
            <p className="text-xs text-muted-foreground">Actualizá tu información personal</p>
          </div>
        </div>
        <div className="space-y-3">
          <div>
            <label className="text-sm font-semibold block mb-1">Nombre completo</label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="h-12 text-base rounded-xl"
            />
          </div>
          <div>
            <label className="text-sm font-semibold block mb-1">Correo electrónico</label>
            <Input defaultValue={user?.email} className="h-12 text-base rounded-xl" disabled />
          </div>
          <div>
            <label className="text-sm font-semibold block mb-1">Rol</label>
            <Input
              value={user?.role === 'CAREGIVER' ? 'Cuidador / Familiar' : 'Paciente'}
              className="h-12 text-base rounded-xl"
              disabled
            />
          </div>
          <Button
            onClick={handleSaveProfile}
            disabled={saving || !name.trim()}
            className="w-full h-12 text-base rounded-xl gap-2"
          >
            <Save className="w-5 h-5" />
            {saving ? 'Guardando...' : 'Guardar cambios'}
          </Button>
        </div>
      </div>

      {/* Notifications */}
      <div className="card-elevated p-5 mb-4">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
            <Bell className="w-4 h-4 text-primary" />
          </div>
          <div>
            <p className="font-bold">Notificaciones</p>
            <p className="text-xs text-muted-foreground">Controlá cómo recibís alertas</p>
          </div>
        </div>
        <div className="space-y-4">
          {[
            { label: 'Recordatorios de medicamentos', desc: 'Recibí alertas para dosis próximas' },
            { label: 'Alertas de adherencia', desc: 'Notificaciones por dosis perdidas' },
          ].map((item) => (
            <div key={item.label} className="flex items-center justify-between py-1">
              <div className="flex-1">
                <p className="font-semibold text-sm">{item.label}</p>
                <p className="text-xs text-muted-foreground">{item.desc}</p>
              </div>
              <div className="w-12 h-6 bg-primary rounded-full relative flex-shrink-0 cursor-pointer">
                <div className="w-5 h-5 bg-white rounded-full absolute right-0.5 top-0.5 shadow-sm" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Security */}
      <div className="card-elevated p-5 mb-4">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
            <Lock className="w-4 h-4 text-primary" />
          </div>
          <div>
            <p className="font-bold">Seguridad</p>
            <p className="text-xs text-muted-foreground">Contraseña y acceso</p>
          </div>
        </div>
        <div className="space-y-2">
          <Button variant="outline" className="w-full h-12 rounded-xl text-sm font-semibold">Cambiar contraseña</Button>
        </div>
      </div>

      {/* Danger zone */}
      <div className="card-elevated p-5 border border-destructive/30">
        <p className="font-bold text-destructive mb-3">Zona de peligro</p>
        <div className="space-y-2">
          <Button variant="outline" className="w-full h-12 rounded-xl text-destructive border-destructive/30 hover:bg-destructive/5 text-sm font-semibold">
            Eliminar cuenta
          </Button>
          <Button
            variant="destructive"
            className="w-full h-12 rounded-xl gap-2 text-sm font-semibold"
            onClick={() => logout()}
          >
            <LogOut className="w-5 h-5" />
            Cerrar sesión
          </Button>
        </div>
      </div>
    </div>
  )
}
