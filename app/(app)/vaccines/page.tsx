'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { ArrowLeft, Syringe, Plus, Upload, CircleHelp, Trash2 } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

const VACCINES = [
  'COVID-19 (BNT162b2)',
  'COVID-19 (Moderna)',
  'COVID-19 (AstraZeneca)',
  'Influenza',
  'Hepatitis B',
  'Hepatitis A',
  'Fiebre amarilla',
  'Tétanos / dTpa',
  'Sarampión / MMR',
  'Varicela',
  'Neumococo',
  'Meningococo',
  'VPH',
  'Otra',
]

interface VaccineRecord {
  id: string
  name: string
  doses: string
  interval: string
  lastDose: string
  center: string
  file: File | null
}

interface VaccineForm {
  name: string
  doses: string
  interval: string
  lastDose: string
  center: string
  file: File | null
}

const EMPTY_FORM: VaccineForm = {
  name: '',
  doses: '',
  interval: '',
  lastDose: '',
  center: '',
  file: null,
}

const VACCINES_STORAGE_KEY = 'kw_vaccines:v1'

function serializeRecords(records: VaccineRecord[]) {
  return records.map(({ file: _file, ...rest }) => rest)
}

export default function VaccinesPage() {
  const router = useRouter()
  const { toast } = useToast()
  const fileRef = useRef<HTMLInputElement>(null)
  const [form, setForm] = useState<VaccineForm>(EMPTY_FORM)
  const [records, setRecords] = useState<VaccineRecord[]>(() => {
    if (typeof window === 'undefined') return []
    try {
      const saved = window.localStorage.getItem(VACCINES_STORAGE_KEY)
      if (saved) return (JSON.parse(saved) as Omit<VaccineRecord, 'file'>[]).map((r) => ({ ...r, file: null }))
    } catch {
      window.localStorage.removeItem(VACCINES_STORAGE_KEY)
    }
    return []
  })

  useEffect(() => {
    if (typeof window === 'undefined') return
    window.localStorage.setItem(VACCINES_STORAGE_KEY, JSON.stringify(serializeRecords(records)))
  }, [records])

  const set = (field: keyof VaccineForm, value: string | File | null) =>
    setForm((f) => ({ ...f, [field]: value }))

  const handleAdd = () => {
    if (!form.name) {
      toast({ title: 'Falta la vacuna', description: 'Seleccioná el nombre de la vacuna', variant: 'destructive' })
      return
    }
    setRecords((r) => [...r, { ...form, id: crypto.randomUUID() }])
    setForm(EMPTY_FORM)
    toast({ title: 'Vacuna agregada', description: `${form.name} registrada correctamente` })
  }

  const handleRemove = (id: string) =>
    setRecords((r) => r.filter((v) => v.id !== id))

  return (
    <div className="px-4 py-6 md:px-8 md:py-8 max-w-3xl mx-auto">
      <Button variant="ghost" className="gap-2 mb-6 -ml-2" onClick={() => router.push('/dashboard')}>
        <ArrowLeft className="h-4 w-4" />
        Volver al Dashboard
      </Button>

      {/* Form card */}
      <div className="card-elevated mb-8 overflow-hidden">
        <div className="p-6 bg-gradient-to-r from-primary/10 to-secondary/10 flex items-center gap-3">
          <Syringe className="h-8 w-8 text-primary flex-shrink-0" />
          <div>
            <h1 className="text-2xl md:text-3xl font-bold">Registro de Vacunas</h1>
            <p className="text-muted-foreground mt-0.5">Registrá y visualizá tu historial de vacunación</p>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Nombre de la vacuna */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Label className="text-base font-semibold">Nombre de la vacuna</Label>
              <button
                type="button"
                title="Las vacunas recomendadas dependen de tu edad y condición médica"
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                <CircleHelp className="h-5 w-5" />
              </button>
            </div>
            <Select value={form.name} onValueChange={(v) => set('name', v)}>
              <SelectTrigger className="h-12 text-base">
                <SelectValue placeholder="Seleccioná una vacuna" />
              </SelectTrigger>
              <SelectContent>
                {VACCINES.map((v) => (
                  <SelectItem key={v} value={v}>{v}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Grid de campos */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-base font-semibold">Número de dosis recibidas</Label>
              <Input
                type="number"
                placeholder="Ej. 3"
                value={form.doses}
                onChange={(e) => set('doses', e.target.value)}
                className="h-12 text-base"
                min="1"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-base font-semibold">Intervalo entre dosis</Label>
              <Input
                placeholder="Ej. cada 6 meses"
                value={form.interval}
                onChange={(e) => set('interval', e.target.value)}
                className="h-12 text-base"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-base font-semibold">Fecha de última dosis</Label>
              <Input
                type="date"
                value={form.lastDose}
                onChange={(e) => set('lastDose', e.target.value)}
                className="h-12 text-base"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-base font-semibold">Centro de vacunación</Label>
              <Input
                placeholder="Ej. Centro de salud MINSA"
                value={form.center}
                onChange={(e) => set('center', e.target.value)}
                className="h-12 text-base"
              />
            </div>
          </div>

          {/* File upload */}
          <div className="space-y-2">
            <Label className="text-base font-semibold">Comprobante o carnet de vacunación (opcional)</Label>
            <input
              ref={fileRef}
              type="file"
              accept=".pdf,.jpg,.jpeg,.png"
              className="hidden"
              onChange={(e) => set('file', e.target.files?.[0] ?? null)}
            />
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className="w-full h-12 flex items-center justify-center gap-2 border-2 border-dashed rounded-xl text-sm text-muted-foreground hover:bg-muted/40 transition-colors"
            >
              <Upload className="h-5 w-5" />
              {form.file ? form.file.name : 'Seleccionar archivo'}
            </button>
            <p className="text-xs text-muted-foreground">Formatos aceptados: PDF, JPG, PNG (máx. 5MB)</p>
          </div>

          <Button onClick={handleAdd} className="w-full h-11 text-base gap-2">
            <Plus className="h-5 w-5" />
            Agregar Vacuna
          </Button>
        </div>
      </div>

      {/* History card */}
      <div className="card-elevated overflow-hidden">
        <div className="p-6 bg-gradient-to-r from-secondary/10 to-primary/10">
          <h2 className="text-xl font-bold">Historial de Vacunas</h2>
        </div>
        <div className="p-6">
          {records.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">No hay vacunas registradas aún</p>
          ) : (
            <div className="space-y-3">
              {records.map((r) => (
                <div key={r.id} className="flex items-start justify-between gap-4 p-4 rounded-xl border bg-muted/20">
                  <div className="flex items-start gap-3 min-w-0">
                    <Syringe className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                    <div className="min-w-0">
                      <p className="font-semibold text-sm">{r.name}</p>
                      <div className="flex flex-wrap gap-x-4 gap-y-0.5 mt-1">
                        {r.doses && <p className="text-xs text-muted-foreground">{r.doses} dosis</p>}
                        {r.lastDose && <p className="text-xs text-muted-foreground">Última: {r.lastDose}</p>}
                        {r.center && <p className="text-xs text-muted-foreground">{r.center}</p>}
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => handleRemove(r.id)}
                    className="text-muted-foreground hover:text-destructive transition-colors flex-shrink-0"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
