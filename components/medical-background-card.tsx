'use client'

import { useEffect, useState } from 'react'
import { api } from '@/lib/api'
import type { MedicalBackground } from '@/lib/api'
import { Activity, AlertTriangle, Droplets, Syringe, HeartPulse, Stethoscope } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

const BLOOD_TYPES = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']

const CONDITIONS_LIST = [
  'Hipertensión',
  'Diabetes',
  'Asma',
  'EPOC',
  'Artritis',
  'Enfermedad renal',
  'Cardiopatía',
  'Osteoporosis',
  'Artrosis',
  'Demencia',
  'Depresión',
  'Ansiedad',
  'Hipotiroidismo',
  'Otro',
]

const ALLERGIES_LIST = [
  'Penicilina',
  'Aspirina',
  'AINES',
  'Latex',
  'Polen',
  'Ácaros',
  'Alimentos',
  'Picaduras',
  'Otro',
]

interface MedicalBackgroundCardProps {
  editable?: boolean
  onUpdate?: (data: MedicalBackground) => Promise<void>
}

export function MedicalBackgroundCard({ editable = false, onUpdate }: MedicalBackgroundCardProps) {
  const [background, setBackground] = useState<MedicalBackground | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [editMode, setEditMode] = useState(false)

  const [form, setForm] = useState<MedicalBackground>({
    bloodType: null,
    conditions: [],
    allergies: [],
    surgeries: '',
    hospitalizations: '',
    transfusions: null,
    vaccines: '',
    otherBackground: '',
  })

  useEffect(() => {
    loadBackground()
  }, [])

  const loadBackground = async () => {
    try {
      const { user } = await api.getMe()
      setBackground({
        bloodType: user.bloodType ?? null,
        conditions: user.conditions ?? [],
        allergies: user.allergies ?? [],
        surgeries: '',
        hospitalizations: '',
        transfusions: null,
        vaccines: '',
        otherBackground: '',
      })
      setForm({
        bloodType: user.bloodType ?? null,
        conditions: user.conditions ?? [],
        allergies: user.allergies ?? [],
        surgeries: '',
        hospitalizations: '',
        transfusions: null,
        vaccines: '',
        otherBackground: '',
      })
    } catch (e) {
      console.error('Error loading background:', e)
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    if (!onUpdate) return
    setSaving(true)
    try {
      await onUpdate(form)
      setBackground(form)
      setEditMode(false)
    } catch (e) {
      console.error('Error saving:', e)
    } finally {
      setSaving(false)
    }
  }

  const toggleCondition = (condition: string) => {
    setForm((f) => ({
      ...f,
      conditions: f.conditions?.includes(condition)
        ? f.conditions.filter((c) => c !== condition)
        : [...(f.conditions ?? []), condition],
    }))
  }

  const toggleAllergy = (allergy: string) => {
    setForm((f) => ({
      ...f,
      allergies: f.allergies?.includes(allergy)
        ? f.allergies.filter((a) => a !== allergy)
        : [...(f.allergies ?? []), allergy],
    }))
  }

  if (loading) {
    return (
      <Card className="card-elevated">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="w-5 h-5" />
            Antecedentes Médicos
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-3">
            <div className="h-4 bg-muted rounded w-3/4" />
            <div className="h-4 bg-muted rounded w-1/2" />
            <div className="h-4 bg-muted rounded w-2/3" />
          </div>
        </CardContent>
      </Card>
    )
  }

  const displayData = editMode ? form : background

  return (
    <Card className="card-elevated">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Activity className="w-5 h-5 text-primary" />
          Antecedentes Médicos
        </CardTitle>
        {editable && !editMode && (
          <button
            onClick={() => setEditMode(true)}
            className="text-sm text-primary font-medium hover:underline"
          >
            Editar
          </button>
        )}
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Tipo de sangre */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
            <Droplets className="w-4 h-4" />
            Tipo de sangre
          </div>
          {editMode ? (
            <div className="flex flex-wrap gap-2">
              {BLOOD_TYPES.map((bt) => (
                <button
                  key={bt}
                  type="button"
                  onClick={() => setForm((f) => ({ ...f, bloodType: bt }))}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                    form.bloodType === bt
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted hover:bg-muted/80'
                  }`}
                >
                  {bt}
                </button>
              ))}
              <button
                type="button"
                onClick={() => setForm((f) => ({ ...f, bloodType: null }))}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                  form.bloodType === null
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted hover:bg-muted/80'
                }`}
              >
                No sabe
              </button>
            </div>
          ) : displayData?.bloodType ? (
            <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
              {displayData.bloodType}
            </Badge>
          ) : (
            <p className="text-sm text-muted-foreground">No registrado</p>
          )}
        </div>

        {/* Condiciones / Enfermedades */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
            <HeartPulse className="w-4 h-4" />
            Condiciones médicas
          </div>
          {editMode ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {CONDITIONS_LIST.map((cond) => (
                <button
                  key={cond}
                  type="button"
                  onClick={() => toggleCondition(cond)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all text-left ${
                    form.conditions?.includes(cond)
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted hover:bg-muted/80'
                  }`}
                >
                  {cond}
                </button>
              ))}
            </div>
          ) : displayData?.conditions && displayData.conditions.length > 0 ? (
            <div className="flex flex-wrap gap-1.5">
              {displayData.conditions.map((cond) => (
                <Badge key={cond} variant="secondary">
                  {cond}
                </Badge>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Sin condiciones registradas</p>
          )}
        </div>

        {/* Alergias */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
            <AlertTriangle className="w-4 h-4" />
            Alergias
          </div>
          {editMode ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {ALLERGIES_LIST.map((allergy) => (
                <button
                  key={allergy}
                  type="button"
                  onClick={() => toggleAllergy(allergy)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all text-left ${
                    form.allergies?.includes(allergy)
                      ? 'bg-destructive text-destructive-foreground'
                      : 'bg-muted hover:bg-muted/80'
                  }`}
                >
                  {allergy}
                </button>
              ))}
            </div>
          ) : displayData?.allergies && displayData.allergies.length > 0 ? (
            <div className="flex flex-wrap gap-1.5">
              {displayData.allergies.map((allergy) => (
                <Badge key={allergy} variant="destructive">
                  {allergy}
                </Badge>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Sin alergias registradas</p>
          )}
        </div>

        {/* Vacunas */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
            <Syringe className="w-4 h-4" />
            Vacunas
          </div>
          {editMode ? (
            <input
              type="text"
              value={form.vaccines ?? ''}
              onChange={(e) => setForm((f) => ({ ...f, vaccines: e.target.value }))}
              placeholder="Ej: COVID-19, Influenza, Hepatitis B"
              className="w-full px-3 py-2 rounded-lg border bg-background text-sm"
            />
          ) : displayData?.vaccines ? (
            <p className="text-sm">{displayData.vaccines}</p>
          ) : (
            <p className="text-sm text-muted-foreground">No registradas</p>
          )}
        </div>

        {/* Otros antecedentes */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
            <Stethoscope className="w-4 h-4" />
            Otros antecedentes
          </div>
          {editMode ? (
            <textarea
              value={form.otherBackground ?? ''}
              onChange={(e) => setForm((f) => ({ ...f, otherBackground: e.target.value }))}
              placeholder="Cirugías, hospitalizaciones, transfusiones, etc."
              rows={3}
              className="w-full px-3 py-2 rounded-lg border bg-background text-sm resize-none"
            />
          ) : displayData?.otherBackground ? (
            <p className="text-sm">{displayData.otherBackground}</p>
          ) : (
            <p className="text-sm text-muted-foreground">Sin otros antecedentes registrados</p>
          )}
        </div>

        {/* Transfusiones */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
            <Droplets className="w-4 h-4" />
            Transfusiones
          </div>
          {editMode ? (
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setForm((f) => ({ ...f, transfusions: true }))}
                className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${
                  form.transfusions === true
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted hover:bg-muted/80'
                }`}
              >
                Sí
              </button>
              <button
                type="button"
                onClick={() => setForm((f) => ({ ...f, transfusions: false }))}
                className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${
                  form.transfusions === false
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted hover:bg-muted/80'
                }`}
              >
                No
              </button>
            </div>
          ) : displayData?.transfusions !== undefined && displayData.transfusions !== null ? (
            <Badge variant={displayData.transfusions ? 'default' : 'outline'}>
              {displayData.transfusions ? 'Sí' : 'No'}
            </Badge>
          ) : (
            <p className="text-sm text-muted-foreground">No registrado</p>
          )}
        </div>

        {/* Actions */}
        {editMode && (
          <div className="flex gap-2 pt-4 border-t">
            <button
              onClick={() => setEditMode(false)}
              className="flex-1 px-4 py-2 rounded-lg border text-sm font-medium hover:bg-muted transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex-1 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-50"
            >
              {saving ? 'Guardando...' : 'Guardar'}
            </button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}