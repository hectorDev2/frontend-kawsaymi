'use client'

import { useAuth } from '@/lib/auth-context'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import { Bell, Lock, User, LogOut, Save } from 'lucide-react'

export default function SettingsPage() {
  const { user, logout } = useAuth()

  return (
    <div className="space-y-6 p-4 md:p-6 max-w-2xl">
      <div>
        <h1 className="text-3xl font-bold">Configuración</h1>
        <p className="text-muted-foreground mt-1">
          Gestioná tu cuenta y preferencias
        </p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <User className="w-5 h-5" />
            <div>
              <CardTitle>Perfil</CardTitle>
              <CardDescription>Actualizá tu información personal</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">Nombre</label>
              <Input defaultValue={user?.firstName} className="mt-1" />
            </div>
            <div>
              <label className="text-sm font-medium">Apellido</label>
              <Input defaultValue={user?.lastName} className="mt-1" />
            </div>
          </div>
          <div>
            <label className="text-sm font-medium">Correo electrónico</label>
            <Input defaultValue={user?.email} className="mt-1" disabled />
          </div>
          <Button>
            <Save className="w-4 h-4 mr-2" />
            Guardar cambios
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Bell className="w-5 h-5" />
            <div>
              <CardTitle>Notificaciones</CardTitle>
              <CardDescription>Controlá cómo recibís las actualizaciones</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Recordatorios de medicamentos</p>
              <p className="text-sm text-muted-foreground">Recibí alertas para dosis próximas</p>
            </div>
            <Switch defaultChecked />
          </div>
          <div className="border-t pt-4" />
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Alertas de adherencia</p>
              <p className="text-sm text-muted-foreground">Recibí alertas por dosis perdidas</p>
            </div>
            <Switch defaultChecked />
          </div>
          <div className="border-t pt-4" />
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Notificaciones por correo</p>
              <p className="text-sm text-muted-foreground">Recibí actualizaciones por correo electrónico</p>
            </div>
            <Switch defaultChecked />
          </div>
          <div className="border-t pt-4" />
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Notificaciones push</p>
              <p className="text-sm text-muted-foreground">Recibí notificaciones push</p>
            </div>
            <Switch defaultChecked />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Lock className="w-5 h-5" />
            <div>
              <CardTitle>Seguridad</CardTitle>
              <CardDescription>Gestioná tu contraseña y configuración de seguridad</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button variant="outline" className="w-full">Cambiar contraseña</Button>
          <Button variant="outline" className="w-full">Autenticación en dos pasos</Button>
          <Button variant="outline" className="w-full">Sesiones activas</Button>
        </CardContent>
      </Card>

      <Card className="border-red-200 bg-red-50">
        <CardHeader>
          <CardTitle className="text-red-900">Zona de peligro</CardTitle>
          <CardDescription className="text-red-800">Acciones irreversibles</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button variant="outline" className="w-full text-red-600 border-red-200 hover:bg-red-100">
            Eliminar cuenta
          </Button>
          <Button variant="destructive" className="w-full" onClick={() => logout()}>
            <LogOut className="w-4 h-4 mr-2" />
            Cerrar sesión
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
