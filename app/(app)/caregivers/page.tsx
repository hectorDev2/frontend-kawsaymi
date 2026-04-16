'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Plus, Mail, Phone, Trash2, Shield } from 'lucide-react'

interface Caregiver {
  id: string
  name: string
  email: string
  phone?: string
  role: string
  status: 'active' | 'pending' | 'invited'
  initials: string
}

const MOCK_CAREGIVERS: Caregiver[] = [
  {
    id: '1',
    name: 'Sarah Johnson',
    email: 'sarah@example.com',
    phone: '+1 555-0123',
    role: 'Familiar',
    status: 'active',
    initials: 'SJ',
  },
  {
    id: '2',
    name: 'Dr. Michael Brown',
    email: 'doctor@clinic.com',
    phone: '+1 555-0456',
    role: 'Médico',
    status: 'active',
    initials: 'MB',
  },
  {
    id: '3',
    name: 'nurse@hospital.com',
    email: 'nurse@hospital.com',
    role: 'Enfermero/a',
    status: 'invited',
    initials: 'NH',
  },
]

const statusColor = {
  active: 'bg-green-100 text-green-800',
  pending: 'bg-amber-100 text-amber-800',
  invited: 'bg-blue-100 text-blue-800',
}

const statusLabel = {
  active: 'Activo',
  pending: 'Pendiente',
  invited: 'Invitado',
}

export default function CaregiversPage() {
  const [caregivers] = useState(MOCK_CAREGIVERS)
  const [showInvite, setShowInvite] = useState(false)
  const [inviteEmail, setInviteEmail] = useState('')

  return (
    <div className="space-y-6 p-4 md:p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Mis cuidadores</h1>
          <p className="text-muted-foreground mt-1">
            Gestioná quién puede acceder a tu información de salud
          </p>
        </div>
        <Button onClick={() => setShowInvite(!showInvite)}>
          <Plus className="w-4 h-4 mr-2" />
          Agregar un cuidador
        </Button>
      </div>

      {showInvite && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Agregar un cuidador</CardTitle>
            <CardDescription>Enviá una invitación a un cuidador</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Correo electrónico</label>
                <Input
                  type="email"
                  placeholder="cuidador@ejemplo.com"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  className="mt-2"
                />
              </div>
              <div className="flex gap-2">
                <Button onClick={() => { console.log('Invitando:', inviteEmail); setInviteEmail(''); setShowInvite(false) }} disabled={!inviteEmail}>
                  Enviar invitación
                </Button>
                <Button variant="outline" onClick={() => setShowInvite(false)}>
                  Cancelar
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="space-y-3">
        {caregivers.length > 0 ? (
          caregivers.map((caregiver) => (
            <Card key={caregiver.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4 flex-1">
                    <Avatar className="w-12 h-12">
                      <AvatarFallback className="bg-primary/20 text-primary font-semibold">
                        {caregiver.initials}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <h3 className="font-semibold">{caregiver.name}</h3>
                      <div className="flex gap-3 mt-1">
                        {caregiver.email && (
                          <a href={`mailto:${caregiver.email}`} className="flex items-center gap-1 text-xs text-muted-foreground hover:text-primary transition">
                            <Mail className="w-3 h-3" />
                            {caregiver.email}
                          </a>
                        )}
                        {caregiver.phone && (
                          <a href={`tel:${caregiver.phone}`} className="flex items-center gap-1 text-xs text-muted-foreground hover:text-primary transition">
                            <Phone className="w-3 h-3" />
                            {caregiver.phone}
                          </a>
                        )}
                      </div>
                      <div className="flex gap-2 mt-2">
                        <Badge variant="secondary" className="text-xs">{caregiver.role}</Badge>
                        <Badge className={statusColor[caregiver.status]}>{statusLabel[caregiver.status]}</Badge>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2 flex-shrink-0">
                    {caregiver.status === 'active' && (
                      <Button variant="ghost" size="sm"><Shield className="w-4 h-4" /></Button>
                    )}
                    <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700">
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <Card>
            <CardContent className="pt-6 text-center py-12">
              <p className="text-muted-foreground">Aún no tenés cuidadores</p>
              <Button className="mt-4" onClick={() => setShowInvite(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Agregar tu primer cuidador
              </Button>
            </CardContent>
          </Card>
        )}
      </div>

      <Card className="bg-blue-50 border-blue-200">
        <CardHeader>
          <CardTitle className="text-lg text-blue-900">Tu privacidad está protegida</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-blue-900 space-y-2">
          <p>• Tus cuidadores solo pueden acceder a la información de salud que vos permitís</p>
          <p>• Podés eliminar cuidadores en cualquier momento y perderán el acceso</p>
          <p>• Todos los datos están encriptados y almacenados de forma segura</p>
        </CardContent>
      </Card>
    </div>
  )
}
