'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/lib/auth-context'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'
import { api } from '@/lib/api'
import { useToast } from '@/hooks/use-toast'
import { User, Bell, Lock, LogOut, Save, Heart, MapPin, Calendar, Loader2 } from 'lucide-react'
import type { UserProfile } from '@/lib/api'

const ALLERGIES = ['Penicilina', 'Ibuprofeno', 'Aspirina', 'Mariscos', 'Nueces', 'Látex', 'Polen', 'Gluten']

const LANGUAGES = [
  { value: 'es', label: 'Español' },
  { value: 'en', label: 'English' },
]

// ─── Section card ─────────────────────────────────────────────────────────────

function Section({ icon: Icon, title, desc, children }: {
  icon: React.ElementType
  title: string
  desc: string
  children: React.ReactNode
}) {
  return (
    <div className="card-elevated p-5">
      <div className="flex items-center gap-3 mb-5 pb-4 border-b border-border">
        <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
          <Icon className="w-4 h-4 text-primary" />
        </div>
        <div>
          <p className="font-bold text-sm">{title}</p>
          <p className="text-xs text-muted-foreground">{desc}</p>
        </div>
      </div>
      {children}
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function SettingsPage() {
  const { user, logout, refreshUser } = useAuth()
  const { toast } = useToast()

  const [loading, setLoading] = useState(true)
  const [savingProfile, setSavingProfile] = useState(false)
  const [savingAllergies, setSavingAllergies] = useState(false)

  // Profile fields
  const [name, setName] = useState('')
  const [dateOfBirth, setDateOfBirth] = useState('')
  const [location, setLocation] = useState('')
  const [language, setLanguage] = useState('es')

  // Medical
  const [allergies, setAllergies] = useState<string[]>([])
  const [conditions, setConditions] = useState<string[]>([])
  const [conditionInput, setConditionInput] = useState('')

  useEffect(() => {
    api.getMe().then(({ user: profile }: { user: UserProfile }) => {
      setName(profile.name ?? '')
      setDateOfBirth(profile.dateOfBirth ?? '')
      setLocation(profile.location ?? '')
      setLanguage(profile.language ?? 'es')
      setAllergies(profile.allergies ?? [])
      setConditions(profile.conditions ?? [])
    }).finally(() => setLoading(false))
  }, [])

  const handleSaveProfile = async () => {
    if (!name.trim()) return
    setSavingProfile(true)
    try {
      await api.updateMe({ name: name.trim(), dateOfBirth: dateOfBirth || undefined, location: location || undefined, language })
      await refreshUser()
      toast({ title: '¡Guardado!', description: 'Perfil actualizado correctamente' })
    } catch {
      toast({ title: 'Error', description: 'No se pudo guardar el perfil', variant: 'destructive' })
    } finally {
      setSavingProfile(false)
    }
  }

  const toggleAllergy = (item: string) => {
    setAllergies((prev) =>
      prev.includes(item) ? prev.filter((a) => a !== item) : [...prev, item]
    )
  }

  const handleSaveAllergies = async () => {
    setSavingAllergies(true)
    try {
      await api.updateAllergies(allergies)
      await api.updateConditions(conditions)
      toast({ title: '¡Guardado!', description: 'Información médica actualizada' })
    } catch {
      toast({ title: 'Error', description: 'No se pudo guardar', variant: 'destructive' })
    } finally {
      setSavingAllergies(false)
    }
  }

  const addCondition = () => {
    const val = conditionInput.trim()
    if (val && !conditions.includes(val)) {
      setConditions((prev) => [...prev, val])
      setConditionInput('')
    }
  }

  const removeCondition = (c: string) => setConditions((prev) => prev.filter((x) => x !== c))

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="px-4 py-6 md:px-8 md:py-8 max-w-2xl mx-auto space-y-4">
      <div className="mb-2">
        <h1 className="text-2xl md:text-3xl font-bold">Configuración</h1>
        <p className="text-muted-foreground text-sm mt-1">Gestioná tu cuenta y preferencias</p>
      </div>

      {/* ── Información personal ── */}
      <Section icon={User} title="Información personal" desc="Tu nombre, fecha de nacimiento y ubicación">
        <div className="space-y-4">
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-sm font-semibold">Nombre completo</label>
              <Input value={name} onChange={(e) => setName(e.target.value)} className="h-11 rounded-xl" placeholder="Tu nombre" />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-semibold">Correo electrónico</label>
              <Input value={user?.email ?? ''} className="h-11 rounded-xl" disabled />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-semibold flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-muted-foreground" />
                Fecha de nacimiento
              </label>
              <Input type="date" value={dateOfBirth} onChange={(e) => setDateOfBirth(e.target.value)} className="h-11 rounded-xl" />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-semibold">Idioma</label>
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="flex h-11 w-full rounded-xl border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              >
                {LANGUAGES.map((l) => (
                  <option key={l.value} value={l.value}>{l.label}</option>
                ))}
              </select>
            </div>
            <div className="space-y-1.5 sm:col-span-2">
              <label className="text-sm font-semibold flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-muted-foreground" />
                Ubicación / Dirección
              </label>
              <Input value={location} onChange={(e) => setLocation(e.target.value)} className="h-11 rounded-xl" placeholder="Ej: Lima, Perú" />
            </div>
          </div>
          <div className="flex justify-end pt-2">
            <Button onClick={handleSaveProfile} disabled={savingProfile || !name.trim()} className="h-10 rounded-xl gap-2 px-6">
              {savingProfile ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              Guardar
            </Button>
          </div>
        </div>
      </Section>

      {/* ── Información médica ── */}
      <Section icon={Heart} title="Información médica" desc="Alergias y condiciones conocidas">
        <div className="space-y-5">
          {/* Alergias */}
          <div>
            <p className="text-sm font-semibold mb-3">Alergias conocidas</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 p-4 rounded-xl border border-border bg-muted/30">
              {ALLERGIES.map((item) => (
                <label key={item} className="flex items-center gap-2.5 cursor-pointer select-none">
                  <Checkbox
                    checked={allergies.includes(item)}
                    onCheckedChange={() => toggleAllergy(item)}
                  />
                  <span className="text-sm">{item}</span>
                </label>
              ))}
            </div>
            {allergies.length > 0 && (
              <p className="text-xs text-muted-foreground mt-2">
                Seleccionadas: {allergies.join(', ')}
              </p>
            )}
          </div>

          {/* Condiciones */}
          <div>
            <p className="text-sm font-semibold mb-3">Condiciones médicas</p>
            <div className="flex gap-2">
              <Input
                value={conditionInput}
                onChange={(e) => setConditionInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addCondition())}
                placeholder="Ej: Diabetes tipo 2"
                className="h-10 rounded-xl flex-1"
              />
              <Button variant="outline" onClick={addCondition} className="h-10 rounded-xl px-4 flex-shrink-0">
                Agregar
              </Button>
            </div>
            {conditions.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-3">
                {conditions.map((c) => (
                  <span key={c} className="inline-flex items-center gap-1.5 text-xs font-medium bg-primary/10 text-primary px-3 py-1.5 rounded-full">
                    {c}
                    <button onClick={() => removeCondition(c)} className="hover:opacity-60 transition-opacity text-base leading-none">×</button>
                  </span>
                ))}
              </div>
            )}
          </div>

          <div className="flex justify-end pt-1">
            <Button onClick={handleSaveAllergies} disabled={savingAllergies} className="h-10 rounded-xl gap-2 px-6">
              {savingAllergies ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              Guardar
            </Button>
          </div>
        </div>
      </Section>

      {/* ── Notificaciones ── */}
      <Section icon={Bell} title="Notificaciones" desc="Controlá cómo recibís alertas">
        <div className="space-y-4">
          {[
            { label: 'Recordatorios de medicamentos', desc: 'Recibí alertas para dosis próximas' },
            { label: 'Alertas de adherencia', desc: 'Notificaciones por dosis perdidas' },
          ].map((item) => (
            <div key={item.label} className="flex items-center justify-between py-1">
              <div>
                <p className="text-sm font-semibold">{item.label}</p>
                <p className="text-xs text-muted-foreground">{item.desc}</p>
              </div>
              <div className="w-11 h-6 bg-primary rounded-full relative flex-shrink-0 cursor-pointer">
                <div className="w-5 h-5 bg-white rounded-full absolute right-0.5 top-0.5 shadow-sm" />
              </div>
            </div>
          ))}
        </div>
      </Section>

      {/* ── Seguridad ── */}
      <Section icon={Lock} title="Seguridad" desc="Contraseña y acceso a tu cuenta">
        <Button variant="outline" className="w-full h-11 rounded-xl text-sm font-semibold">
          Cambiar contraseña
        </Button>
      </Section>

      {/* ── Zona de peligro ── */}
      <div className="card-elevated p-5 border border-destructive/30">
        <p className="font-bold text-destructive text-sm mb-3">Zona de peligro</p>
        <div className="space-y-2">
          <Button variant="outline" className="w-full h-11 rounded-xl text-destructive border-destructive/30 hover:bg-destructive/5 text-sm font-semibold">
            Eliminar cuenta
          </Button>
          <Button variant="destructive" className="w-full h-11 rounded-xl gap-2 text-sm font-semibold" onClick={() => logout()}>
            <LogOut className="w-4 h-4" />
            Cerrar sesión
          </Button>
        </div>
      </div>
    </div>
  )
}
