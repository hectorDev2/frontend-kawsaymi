'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { ArrowLeft, Save, Upload } from 'lucide-react'
import { api } from '@/lib/api'
import { useToast } from '@/hooks/use-toast'

const CLINICAL_STORAGE_KEY = 'kw_clinical_history:v1'

const CHRONIC_DISEASES = [
  'Hipertensión',
  'Diabetes',
  'Asma',
  'EPOC',
  'Artritis',
  'Enfermedad renal',
  'Cardiopatía',
  'Otra',
]

interface FormState {
  antecedentes: string
  enfermedades: string[]
  cirugias: string
  hospitalizaciones: string
  transfusiones: boolean | null
  vacunas: string
  certificadoVacunas: File | null
}

export default function ClinicalHistoryPage() {
  const router = useRouter()
  const { toast } = useToast()
  const fileRef = useRef<HTMLInputElement>(null)
  const [saving, setSaving] = useState(false)
  const storageSyncedRef = useRef(false)
  const [form, setForm] = useState<FormState>({
    antecedentes: '',
    enfermedades: [],
    cirugias: '',
    hospitalizaciones: '',
    transfusiones: null,
    vacunas: '',
    certificadoVacunas: null,
  })

  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = window.localStorage.getItem(CLINICAL_STORAGE_KEY)
        if (saved) {
          const parsed = JSON.parse(saved) as Partial<FormState>
          setForm((f) => ({
            ...f,
            antecedentes: parsed.antecedentes ?? f.antecedentes,
            enfermedades: parsed.enfermedades ?? f.enfermedades,
            cirugias: parsed.cirugias ?? f.cirugias,
            hospitalizaciones: parsed.hospitalizaciones ?? f.hospitalizaciones,
            transfusiones: parsed.transfusiones ?? f.transfusiones,
            vacunas: parsed.vacunas ?? f.vacunas,
          }))
        }
      } catch {
        window.localStorage.removeItem(CLINICAL_STORAGE_KEY)
      }
    }
    storageSyncedRef.current = true

    api.getMe().then(({ user }) => {
      if (user.conditions?.length) {
        setForm((f) => ({ ...f, enfermedades: user.conditions ?? [] }))
      }
    })
  }, [])

  useEffect(() => {
    if (typeof window === 'undefined' || !storageSyncedRef.current) return
    const { certificadoVacunas: _file, ...serializable } = form
    window.localStorage.setItem(CLINICAL_STORAGE_KEY, JSON.stringify(serializable))
  }, [form])

  const toggleDisease = (disease: string) => {
    setForm((f) => ({
      ...f,
      enfermedades: f.enfermedades.includes(disease)
        ? f.enfermedades.filter((d) => d !== disease)
        : [...f.enfermedades, disease],
    }))
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      await api.updateConditions(form.enfermedades)
      toast({ title: '¡Guardado!', description: 'Historial clínico actualizado correctamente' })
    } catch {
      toast({ title: 'Error', description: 'No se pudo guardar el historial', variant: 'destructive' })
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="px-4 py-6 md:px-8 md:py-8 max-w-3xl mx-auto">
      <div className="mb-6">
        <Button
          variant="ghost"
          className="gap-2 mb-4 -ml-2"
          onClick={() => router.push('/dashboard')}
        >
          <ArrowLeft className="h-5 w-5" />
          Volver al Dashboard
        </Button>
        <h1 className="text-2xl md:text-3xl font-bold text-primary">Historial Clínico</h1>
        <p className="text-muted-foreground mt-1">Mantén actualizada tu información médica</p>
      </div>

      <div className="card-elevated p-6 space-y-6">
        <h2 className="text-xl font-semibold">Información Médica</h2>

        {/* Antecedentes */}
        <div className="space-y-2">
          <Label htmlFor="antecedentes" className="text-base font-semibold">
            Antecedentes Patológicos
          </Label>
          <Textarea
            id="antecedentes"
            rows={4}
            placeholder="Describe cualquier condición médica previa o antecedente familiar relevante"
            value={form.antecedentes}
            onChange={(e) => setForm((f) => ({ ...f, antecedentes: e.target.value }))}
            className="text-base resize-none"
          />
        </div>

        {/* Enfermedades crónicas */}
        <div className="space-y-3">
          <Label className="text-base font-semibold">Enfermedades Crónicas</Label>
          <div className="p-4 border rounded-xl bg-muted/30 grid grid-cols-2 gap-3">
            {CHRONIC_DISEASES.map((disease) => (
              <div key={disease} className="flex items-center gap-2">
                <Checkbox
                  id={`disease-${disease}`}
                  checked={form.enfermedades.includes(disease)}
                  onCheckedChange={() => toggleDisease(disease)}
                />
                <label
                  htmlFor={`disease-${disease}`}
                  className="text-sm font-medium cursor-pointer"
                >
                  {disease}
                </label>
              </div>
            ))}
          </div>
        </div>

        {/* Cirugías */}
        <div className="space-y-2">
          <Label htmlFor="cirugias" className="text-base font-semibold">
            Cirugías Previas
          </Label>
          <Textarea
            id="cirugias"
            rows={3}
            placeholder="Lista las cirugías que hayas tenido (separadas por comas)"
            value={form.cirugias}
            onChange={(e) => setForm((f) => ({ ...f, cirugias: e.target.value }))}
            className="text-base resize-none"
          />
        </div>

        {/* Hospitalizaciones */}
        <div className="space-y-2">
          <Label htmlFor="hospitalizaciones" className="text-base font-semibold">
            Hospitalizaciones Previas
          </Label>
          <Textarea
            id="hospitalizaciones"
            rows={3}
            placeholder="Describí hospitalizaciones importantes (separadas por comas)"
            value={form.hospitalizaciones}
            onChange={(e) => setForm((f) => ({ ...f, hospitalizaciones: e.target.value }))}
            className="text-base resize-none"
          />
        </div>

        {/* Transfusiones */}
        <div className="space-y-2">
          <Label className="text-base font-semibold">¿Recibiste transfusiones?</Label>
          <div className="flex gap-3">
            <Button
              type="button"
              variant={form.transfusiones === true ? 'default' : 'outline'}
              className="flex-1 h-12 text-base"
              onClick={() => setForm((f) => ({ ...f, transfusiones: true }))}
            >
              Sí
            </Button>
            <Button
              type="button"
              variant={form.transfusiones === false ? 'default' : 'outline'}
              className="flex-1 h-12 text-base"
              onClick={() => setForm((f) => ({ ...f, transfusiones: false }))}
            >
              No
            </Button>
          </div>
        </div>

        {/* Vacunas */}
        <div className="space-y-2">
          <Label htmlFor="vacunas" className="text-base font-semibold">
            Vacunas Recibidas
          </Label>
          <Input
            id="vacunas"
            placeholder="Ej: COVID-19, Influenza, Hepatitis B (separadas por comas)"
            value={form.vacunas}
            onChange={(e) => setForm((f) => ({ ...f, vacunas: e.target.value }))}
            className="h-12 text-base"
          />
        </div>

        {/* Certificado de vacunas */}
        <div className="space-y-2">
          <Label className="text-base font-semibold">Certificado de Vacunas (opcional)</Label>
          <input
            ref={fileRef}
            type="file"
            accept=".pdf,.jpg,.jpeg,.png"
            className="hidden"
            onChange={(e) =>
              setForm((f) => ({ ...f, certificadoVacunas: e.target.files?.[0] ?? null }))
            }
          />
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            className="w-full h-12 flex items-center justify-center gap-2 border-2 border-dashed rounded-xl text-sm text-muted-foreground hover:bg-muted/40 transition-colors"
          >
            <Upload className="h-5 w-5" />
            {form.certificadoVacunas ? form.certificadoVacunas.name : 'Seleccionar archivo'}
          </button>
          <p className="text-xs text-muted-foreground">Formatos aceptados: PDF, JPG, PNG (máx. 5MB)</p>
        </div>

        {/* Actions */}
        <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-3 pt-2">
          <Button
            variant="outline"
            className="w-full sm:w-auto h-12 px-8 text-base"
            onClick={() => router.push('/dashboard')}
          >
            Cancelar
          </Button>
          <Button
            className="w-full sm:w-auto h-12 px-8 text-base gap-2"
            onClick={handleSave}
            disabled={saving}
          >
            <Save className="h-5 w-5" />
            {saving ? 'Guardando...' : 'Guardar Cambios'}
          </Button>
        </div>
      </div>
    </div>
  )
}
