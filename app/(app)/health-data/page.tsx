'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Weight, Activity, Pill, Save } from 'lucide-react'
import { api } from '@/lib/api'
import type { HealthProfile, PolypharmacyInfo } from '@/lib/api'
import { useToast } from '@/hooks/use-toast'

export default function HealthDataPage() {
  const { toast } = useToast()
  const [health, setHealth] = useState<HealthProfile | null>(null)
  const [poly, setPoly] = useState<PolypharmacyInfo | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [weight, setWeight] = useState('')
  const [height, setHeight] = useState('')

  const imcPreview = (() => {
    const w = parseFloat(weight)
    const h = parseFloat(height)
    if (w > 0 && h > 0) return w / Math.pow(h / 100, 2)
    return null
  })()

  useEffect(() => {
    Promise.all([api.getHealthProfile(), api.getPolypharmacy()])
      .then(([hRes, p]) => {
        setHealth(hRes.health)
        setPoly(p)
        if (hRes.health.weight) setWeight(String(hRes.health.weight))
        if (hRes.health.height) setHeight(String(hRes.health.height))
      })
      .finally(() => setLoading(false))
  }, [])

  const handleSaveWeight = async () => {
    const val = parseFloat(weight)
    if (isNaN(val) || val <= 0) {
      toast({ title: 'Error', description: 'Ingresá un peso válido', variant: 'destructive' })
      return
    }
    setSaving(true)
    try {
      const { health: updated } = await api.updateWeight(val)
      setHealth(updated)
      toast({ title: '¡Guardado!', description: 'Peso actualizado correctamente' })
    } catch {
      toast({ title: 'Error', description: 'No se pudo guardar el peso', variant: 'destructive' })
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="px-4 py-6 md:px-8 md:py-8 max-w-2xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl md:text-3xl font-bold">Datos de salud</h1>
        <p className="text-muted-foreground text-sm mt-1">Registrá y seguí tus mediciones</p>
      </div>

      {/* Key stats */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        <div className="card-elevated p-4 text-center">
          <Weight className="w-6 h-6 text-primary mx-auto mb-1" />
          <p className="text-2xl font-bold">
            {loading ? '–' : health?.weight ? `${health.weight}` : '–'}
          </p>
          <p className="text-xs text-muted-foreground font-medium">Peso (kg)</p>
        </div>
        <div className="card-elevated p-4 text-center">
          <Activity className="w-6 h-6 text-secondary mx-auto mb-1" />
          <p className="text-2xl font-bold">
            {imcPreview !== null
              ? imcPreview.toFixed(1)
              : loading ? '–' : health?.imc ? health.imc.toFixed(1) : '–'}
          </p>
          <p className="text-xs text-muted-foreground font-medium">IMC</p>
        </div>
        <div className="card-elevated p-4 text-center">
          <Pill className="w-6 h-6 text-amber-500 mx-auto mb-1" />
          <p className="text-2xl font-bold text-amber-600">
            {loading ? '–' : poly?.activeMedications ?? 0}
          </p>
          <p className="text-xs text-muted-foreground font-medium">Medicamentos</p>
        </div>
      </div>

      {/* Polypharmacy alert */}
      {!loading && poly?.polypharmacy && (
        <div className="card-elevated p-4 mb-6 border border-amber-200 bg-amber-50">
          <p className="font-semibold text-amber-900 text-sm">Polifarmacia detectada</p>
          <p className="text-sm text-amber-800 mt-1">
            Estás tomando {poly.activeMedications} medicamentos activos. Consultá con tu médico para una revisión.
          </p>
        </div>
      )}

      {/* Weight + Height update */}
      <div className="card-elevated p-5 mb-6">
        <h2 className="font-bold text-base mb-4 flex items-center gap-2">
          <Weight className="w-5 h-5 text-primary" />
          Actualizar medidas
        </h2>
        <div className="grid grid-cols-2 gap-3 mb-3">
          <div>
            <Input
              type="number"
              placeholder="Peso"
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
              className="h-14 text-base rounded-xl"
              step="0.1"
              min="0"
            />
            <p className="text-xs text-muted-foreground mt-1">kilogramos</p>
          </div>
          <div>
            <Input
              type="number"
              placeholder="Altura"
              value={height}
              onChange={(e) => setHeight(e.target.value)}
              className="h-14 text-base rounded-xl"
              step="1"
              min="0"
            />
            <p className="text-xs text-muted-foreground mt-1">centímetros</p>
          </div>
        </div>
        {imcPreview !== null && (
          <div className="mb-3 px-4 py-2.5 rounded-xl bg-primary/8 border border-primary/20 text-sm text-primary font-medium">
            IMC calculado: <span className="font-bold">{imcPreview.toFixed(1)}</span>
          </div>
        )}
        <Button
          onClick={handleSaveWeight}
          disabled={saving || !weight}
          className="w-full h-12 rounded-xl gap-2"
        >
          <Save className="w-5 h-5" />
          {saving ? 'Guardando...' : 'Guardar'}
        </Button>
      </div>

      {/* IMC info */}
      {!loading && health?.imc && (
        <div className="card-elevated p-5 mb-6">
          <h2 className="font-bold text-base mb-3">¿Qué significa tu IMC?</h2>
          {[
            { label: 'Bajo peso', range: '< 18.5', active: health.imc < 18.5 },
            { label: 'Normal', range: '18.5 – 24.9', active: health.imc >= 18.5 && health.imc < 25 },
            { label: 'Sobrepeso', range: '25 – 29.9', active: health.imc >= 25 && health.imc < 30 },
            { label: 'Obesidad', range: '≥ 30', active: health.imc >= 30 },
          ].map((row) => (
            <div key={row.label} className={`flex items-center justify-between py-2.5 px-3 rounded-lg mb-1 ${
              row.active ? 'bg-primary/10 font-semibold' : ''
            }`}>
              <span className={`text-sm ${row.active ? 'text-primary' : 'text-muted-foreground'}`}>{row.label}</span>
              <span className={`text-sm ${row.active ? 'text-primary' : 'text-muted-foreground'}`}>{row.range}</span>
            </div>
          ))}
        </div>
      )}

      {/* Tips */}
      <div className="card-elevated p-5 space-y-3">
        <h2 className="font-bold text-base">Consejos</h2>
        {[
          { title: 'Pesate siempre a la misma hora', desc: 'Lo ideal es a la mañana, en ayunas y con la misma ropa.' },
          { title: 'Compartí con tu médico', desc: 'Tus datos de salud ayudan a tu médico a darte mejor atención.' },
        ].map((tip) => (
          <div key={tip.title} className="flex gap-3">
            <div className="w-2 h-2 rounded-full bg-primary mt-2 flex-shrink-0" />
            <div>
              <p className="text-sm font-semibold">{tip.title}</p>
              <p className="text-xs text-muted-foreground">{tip.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
