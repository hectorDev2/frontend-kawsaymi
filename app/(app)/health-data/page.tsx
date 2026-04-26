'use client'

import { useEffect, useMemo, useState } from 'react'
import { Activity, Calendar, CircleHelp, Coffee, Cookie, Download, Droplets, FileText, Moon, Pill, RefreshCw, Save, Sun, Target, TrendingUp, Weight, HeartPulse, BedDouble } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Progress } from '@/components/ui/progress'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
import { useToast } from '@/hooks/use-toast'
import { api } from '@/lib/api'
import type { HealthProfile, PolypharmacyInfo } from '@/lib/api'
import { useHealthContext } from '@/lib/health-context'
import {
  DEFAULT_WELLNESS_FORM,
  MEAL_CONFIG,
  buildWellnessExport,
  generateWellnessPlan,
  type MealKey,
  type WellnessFormState,
} from '@/lib/wellness-plan'

const WELLNESS_STORAGE_KEY = 'kw_wellness_planner:v1'
const HEIGHT_STORAGE_KEY = 'kw_health_height:v1'

const MEAL_ICONS = {
  breakfast: Coffee,
  lunch: Sun,
  dinner: Moon,
  snack: Cookie,
} satisfies Record<MealKey, typeof Coffee>

function imcCategory(imc: number) {
  if (imc < 18.5) return { label: 'Desnutrición', tone: 'text-destructive' }
  if (imc < 25) return { label: 'Normal', tone: 'text-secondary' }
  if (imc < 30) return { label: 'Sobrepeso', tone: 'text-amber-700' }
  return { label: 'Obesidad', tone: 'text-destructive' }
}

function mergeWellnessData(raw: unknown): WellnessFormState {
  const candidate = (raw ?? {}) as Partial<WellnessFormState>
  return {
    nutrition: {
      ...DEFAULT_WELLNESS_FORM.nutrition,
      ...(candidate.nutrition ?? {}),
    },
    habits: {
      ...DEFAULT_WELLNESS_FORM.habits,
      ...(candidate.habits ?? {}),
    },
    progress: {
      ...DEFAULT_WELLNESS_FORM.progress,
      ...(candidate.progress ?? {}),
    },
  }
}

function FieldTipButton({ field, data }: { field: string; data: WellnessFormState }) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [tip, setTip] = useState('')
  const [error, setError] = useState('')
  const healthContext = useHealthContext()

  const loadTip = async (force?: boolean) => {
    if (!force && tip) return

    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/ai-health-tip', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ field, data, userContext: healthContext }),
      })
      const json = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(json?.error || 'No se pudo generar la sugerencia')
      setTip((json?.tip ?? '').toString().trim())
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error de conexión')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Popover
      open={open}
      onOpenChange={(next) => {
        setOpen(next)
        if (next && !tip && !loading && !error) loadTip()
      }}
    >
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          className="text-secondary hover:text-secondary"
          aria-label={`Ver sugerencia para ${field}`}
        >
          <CircleHelp className="h-5 w-5" />
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-80 space-y-3">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-sm font-semibold">Sugerencia personalizada</p>
            <p className="text-xs text-muted-foreground">Basada en hábitos saludables y fuentes oficiales.</p>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-7 px-2"
            disabled={loading}
            onClick={() => loadTip(true)}
          >
            {loading ? 'Cargando...' : 'Otra'}
          </Button>
        </div>

        {loading ? (
          <p className="text-sm text-muted-foreground">Generando sugerencia...</p>
        ) : error ? (
          <p className="text-sm text-destructive">{error}</p>
        ) : (
          <p className="text-sm leading-relaxed">{tip}</p>
        )}
      </PopoverContent>
    </Popover>
  )
}

export default function HealthDataPage() {
  const { toast } = useToast()
  const [health, setHealth] = useState<HealthProfile | null>(null)
  const [poly, setPoly] = useState<PolypharmacyInfo | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [weight, setWeight] = useState('')
  const [height, setHeight] = useState('')
  const [wellness, setWellness] = useState<WellnessFormState>(DEFAULT_WELLNESS_FORM)

  const imcPreview = useMemo(() => {
    const w = Number.parseFloat(weight)
    const h = Number.parseFloat(height)
    if (w > 0 && h > 0) return w / Math.pow(h / 100, 2)
    return null
  }, [height, weight])

  const imcValue = imcPreview !== null ? imcPreview : (health?.imc ?? null)
  const imcCat = imcValue !== null ? imcCategory(imcValue) : null

  const heightNum = Number.parseFloat(height) || health?.height || undefined

  const plan = useMemo(
    () => generateWellnessPlan(wellness, { weight: health?.weight, height: heightNum, imc: imcValue }),
    [health?.weight, heightNum, imcValue, wellness],
  )

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedHeight = window.localStorage.getItem(HEIGHT_STORAGE_KEY)
      if (savedHeight) setHeight(savedHeight)
    }

    Promise.all([api.getHealthProfile(), api.getPolypharmacy()])
      .then(([hRes, p]) => {
        setHealth(hRes.health)
        setPoly(p)
        if (hRes.health.weight) setWeight(String(hRes.health.weight))
        if (hRes.health.height) {
          const h = String(hRes.health.height)
          setHeight(h)
          if (typeof window !== 'undefined') window.localStorage.setItem(HEIGHT_STORAGE_KEY, h)
        }
      })
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    if (typeof window === 'undefined') return
    const saved = window.localStorage.getItem(WELLNESS_STORAGE_KEY)
    if (!saved) return

    try {
      setWellness(mergeWellnessData(JSON.parse(saved)))
    } catch {
      window.localStorage.removeItem(WELLNESS_STORAGE_KEY)
    }
  }, [])

  useEffect(() => {
    if (typeof window === 'undefined') return
    window.localStorage.setItem(WELLNESS_STORAGE_KEY, JSON.stringify(wellness))
  }, [wellness])

  const handleSaveMeasurements = async () => {
    const nextWeight = Number.parseFloat(weight)
    const nextHeight = Number.parseFloat(height)

    if (Number.isNaN(nextWeight) || nextWeight <= 0) {
      toast({ title: 'Error', description: 'Ingresá un peso válido', variant: 'destructive' })
      return
    }

    if (height && (Number.isNaN(nextHeight) || nextHeight <= 0)) {
      toast({ title: 'Error', description: 'Ingresá una altura válida', variant: 'destructive' })
      return
    }

    setSaving(true)
    try {
      const { health: updated } = await api.updateWeight(nextWeight)
      setHealth(updated)

      if (height && typeof window !== 'undefined') {
        window.localStorage.setItem(HEIGHT_STORAGE_KEY, height)
      }

      toast({ title: '¡Guardado!', description: 'Medidas actualizadas correctamente' })
    } catch {
      toast({ title: 'Error', description: 'No se pudo guardar las medidas', variant: 'destructive' })
    } finally {
      setSaving(false)
    }
  }

  const updateMeal = (meal: MealKey, value: string) => {
    setWellness((current) => ({
      ...current,
      nutrition: { ...current.nutrition, [meal]: value },
    }))
  }

  const updateHabit = <K extends keyof WellnessFormState['habits']>(key: K, value: WellnessFormState['habits'][K]) => {
    setWellness((current) => ({
      ...current,
      habits: { ...current.habits, [key]: value },
    }))
  }

  const toggleWeek = (week: keyof WellnessFormState['progress'], checked: boolean) => {
    setWellness((current) => ({
      ...current,
      progress: { ...current.progress, [week]: checked },
    }))
  }

  const handleExportPlan = () => {
    if (typeof window === 'undefined') return
    const text = buildWellnessExport(plan)
    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = 'plan-mejora-kawsaymi.txt'
    link.click()
    URL.revokeObjectURL(url)
    toast({ title: 'Plan exportado', description: 'Se descargó tu plan de mejora en formato texto.' })
  }

  const handleRefreshPlan = () => {
    toast({ title: 'Plan actualizado', description: 'Reevaluamos tus datos actuales para mantener el plan al día.' })
  }

  return (
    <div className="px-4 py-6 md:px-8 md:py-8 max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold">Datos de salud</h1>
        <p className="text-muted-foreground text-sm mt-1">Registrá medidas, hábitos y un plan de mejora accionable.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div className="card-elevated p-4 text-center">
          <Weight className="w-6 h-6 text-primary mx-auto mb-1" />
          <p className="text-2xl font-bold">{loading ? '–' : health?.weight ? `${health.weight}` : '–'}</p>
          <p className="text-xs text-muted-foreground font-medium">Peso (kg)</p>
        </div>
        <div className="card-elevated p-4 text-center">
          <Activity className="w-6 h-6 text-secondary mx-auto mb-1" />
          <p className="text-2xl font-bold">
            {imcPreview !== null ? imcPreview.toFixed(1) : loading ? '–' : health?.imc ? health.imc.toFixed(1) : '–'}
          </p>
          <p className="text-xs text-muted-foreground font-medium">IMC</p>
          {!loading && imcCat && <p className={`text-xs font-semibold mt-1 ${imcCat.tone}`}>{imcCat.label}</p>}
        </div>
        <div className="card-elevated p-4 text-center">
          <Pill className="w-6 h-6 text-amber-500 mx-auto mb-1" />
          <p className="text-2xl font-bold text-amber-600">{loading ? '–' : poly?.activeMedications ?? 0}</p>
          <p className="text-xs text-muted-foreground font-medium">Medicamentos</p>
        </div>
      </div>

      {!loading && poly?.polypharmacy && (
        <div className="card-elevated p-4 border border-amber-200 bg-amber-50">
          <p className="font-semibold text-amber-900 text-sm">Polifarmacia detectada</p>
          <p className="text-sm text-amber-800 mt-1">
            Estás tomando {poly.activeMedications} medicamentos activos. Consultá con tu médico para una revisión.
          </p>
        </div>
      )}

      <div className="card-elevated p-5">
        <h2 className="font-bold text-base mb-4 flex items-center gap-2">
          <Weight className="w-5 h-5 text-primary" />
          Actualizar medidas
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
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
            {imcCat && <span className={`ml-2 font-bold ${imcCat.tone}`}>({imcCat.label})</span>}
          </div>
        )}
        <Button onClick={handleSaveMeasurements} disabled={saving || !weight} className="w-full md:w-auto h-12 rounded-xl gap-2">
          <Save className="w-5 h-5" />
          {saving ? 'Guardando...' : 'Guardar medidas'}
        </Button>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
        <div className="space-y-6">
          <section className="rounded-2xl border bg-card text-card-foreground shadow-sm shadow-medium">
            <div className="flex flex-col space-y-1.5 p-6">
              <h2 className="font-semibold tracking-tight text-2xl">Planificador de Nutrición</h2>
              <p className="text-muted-foreground text-base">Armá una base de comidas simple y sostenible. Acá importa la consistencia, no la perfección.</p>
            </div>
            <div className="p-6 pt-0 space-y-4">
              {MEAL_CONFIG.map((meal) => {
                const Icon = MEAL_ICONS[meal.key]
                return (
                  <div key={meal.key} className="space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <Label htmlFor={meal.key} className="text-lg flex items-center gap-2 font-medium">
                        <Icon className="h-5 w-5 text-secondary" />
                        {meal.label}
                      </Label>
                      <FieldTipButton field={meal.key} data={wellness} />
                    </div>
                    <Textarea
                      id={meal.key}
                      rows={3}
                      placeholder={meal.placeholder}
                      value={wellness.nutrition[meal.key]}
                      onChange={(e) => updateMeal(meal.key, e.target.value)}
                      className="text-base min-h-[88px]"
                    />
                  </div>
                )
              })}

              <p className="text-sm text-muted-foreground mt-4">💡 Usá el ícono <span className="text-secondary">❓</span> para recibir sugerencias alineadas con hábitos saludables.</p>
            </div>
          </section>

          <section className="rounded-2xl border bg-card text-card-foreground shadow-sm shadow-medium">
            <div className="flex flex-col space-y-1.5 p-6">
              <h2 className="font-semibold tracking-tight text-2xl">Hábitos y Estilo de Vida</h2>
              <p className="text-muted-foreground text-base">Registrá lo que pasa en tu día real. SIN contexto, cualquier recomendación queda floja.</p>
            </div>
            <div className="p-6 pt-0 space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <Label className="text-lg">Nivel de hidratación diaria</Label>
                    <FieldTipButton field="hydration" data={wellness} />
                  </div>
                  <Select value={wellness.habits.hydration} onValueChange={(value) => updateHabit('hydration', value as WellnessFormState['habits']['hydration'])}>
                    <SelectTrigger className="w-full h-12 text-base">
                      <SelectValue placeholder="Seleccioná nivel" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Baja</SelectItem>
                      <SelectItem value="medium">Adecuada</SelectItem>
                      <SelectItem value="high">Alta</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <Label htmlFor="sleepHours" className="text-lg">Horas promedio de sueño</Label>
                    <FieldTipButton field="sleepHours" data={wellness} />
                  </div>
                  <Input
                    id="sleepHours"
                    type="number"
                    step="0.5"
                    min="0"
                    placeholder="8"
                    value={wellness.habits.sleepHours}
                    onChange={(e) => updateHabit('sleepHours', e.target.value)}
                    className="h-12 text-base"
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <Label className="text-lg">Nivel de actividad física</Label>
                    <FieldTipButton field="activity" data={wellness} />
                  </div>
                  <Select value={wellness.habits.activity} onValueChange={(value) => updateHabit('activity', value as WellnessFormState['habits']['activity'])}>
                    <SelectTrigger className="w-full h-12 text-base">
                      <SelectValue placeholder="Seleccioná nivel" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Baja</SelectItem>
                      <SelectItem value="moderate">Moderada</SelectItem>
                      <SelectItem value="high">Alta</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <Label className="text-lg">Consumo de alcohol</Label>
                    <FieldTipButton field="alcohol" data={wellness} />
                  </div>
                  <Select value={wellness.habits.alcohol} onValueChange={(value) => updateHabit('alcohol', value as WellnessFormState['habits']['alcohol'])}>
                    <SelectTrigger className="w-full h-12 text-base">
                      <SelectValue placeholder="Seleccioná frecuencia" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">No consumo</SelectItem>
                      <SelectItem value="occasional">Ocasional</SelectItem>
                      <SelectItem value="frequent">Frecuente</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <Label className="text-lg">¿Fuma actualmente?</Label>
                    <FieldTipButton field="smoking" data={wellness} />
                  </div>
                  <div className="flex items-center gap-4 h-12">
                    <Switch checked={wellness.habits.smoking} onCheckedChange={(checked) => updateHabit('smoking', checked)} />
                    <span className="text-base">{wellness.habits.smoking ? 'Sí' : 'No'}</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <Label className="text-lg">Estado de ánimo general</Label>
                    <FieldTipButton field="mood" data={wellness} />
                  </div>
                  <Select value={wellness.habits.mood} onValueChange={(value) => updateHabit('mood', value as WellnessFormState['habits']['mood'])}>
                    <SelectTrigger className="w-full h-12 text-base">
                      <SelectValue placeholder="Seleccioná estado" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Bajo</SelectItem>
                      <SelectItem value="stable">Estable</SelectItem>
                      <SelectItem value="good">Bueno</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="mt-2 p-4 bg-accent-soft rounded-lg border">
                <p className="text-sm text-muted-foreground">💡 Las ayudas contextualizadas toman como referencia lineamientos oficiales tipo MINSA / OMS, pero NO reemplazan evaluación médica.</p>
              </div>
            </div>
          </section>
        </div>

        <section className="rounded-2xl border bg-card text-card-foreground shadow-sm shadow-medium h-fit xl:sticky xl:top-6">
          <div className="flex flex-col space-y-1.5 p-6">
            <div className="flex items-center justify-between gap-3 flex-wrap">
              <div>
                <h2 className="font-semibold tracking-tight text-2xl flex items-center gap-2">
                  <Target className="h-6 w-6 text-secondary" />
                  Plan para Mejorar
                </h2>
                <p className="text-muted-foreground text-base">Plan personalizado de 30 días basado en tu información actual.</p>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" className="gap-2" onClick={handleExportPlan}>
                  <Download className="h-4 w-4" />
                  Exportar
                </Button>
                <Button className="gap-2" onClick={handleRefreshPlan}>
                  <RefreshCw className="h-4 w-4" />
                  Regenerar
                </Button>
              </div>
            </div>
          </div>

          <div className="p-6 pt-0 space-y-6">
            <div className="bg-gradient-to-r from-primary/10 to-secondary/10 rounded-lg p-6">
              <div className="flex items-center justify-between mb-2 gap-3">
                <span className="text-sm font-medium">Progreso del plan (30 días)</span>
                <span className="text-2xl font-bold text-primary">{plan.completion}%</span>
              </div>
              <Progress value={plan.completion} className="h-3" />
              <p className="text-xs text-muted-foreground mt-2">{plan.completedWeeks} de 4 semanas completadas</p>
            </div>

            <div className="bg-gradient-to-br from-primary/5 to-secondary/5 rounded-lg p-5 border border-primary/20">
              <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                <FileText className="h-5 w-5 text-primary" />
                Resumen General
              </h3>
              <p className="text-sm leading-relaxed">{plan.summary}</p>
            </div>

            <div className="bg-blue-50 dark:bg-blue-950/30 rounded-lg p-5 border border-blue-200 dark:border-blue-900">
              <h3 className="text-lg font-semibold mb-3 flex items-center gap-2 text-blue-900 dark:text-blue-100">
                <Target className="h-5 w-5" />
                Recomendaciones Prioritarias
              </h3>
              <ul className="space-y-2">
                {plan.priorities.map((item, index) => (
                  <li key={item} className="flex gap-2 text-sm items-start">
                    <div className="inline-flex h-6 min-w-6 items-center justify-center rounded-full bg-blue-600 px-2 text-xs font-semibold text-white shrink-0">{index + 1}</div>
                    <span className="text-blue-900 dark:text-blue-100">{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Calendar className="h-5 w-5 text-secondary" />
                Plan de 30 Días
              </h3>
              <div className="grid gap-4">
                {plan.weeks.map((week) => {
                  const checked = wellness.progress[week.key]
                  return (
                    <div key={week.key} className={`border-2 rounded-lg p-4 transition-all ${checked ? 'border-primary bg-primary/5' : 'bg-card border-border hover:border-primary/40'}`}>
                      <div className="flex items-start gap-3">
                        <Checkbox checked={checked} onCheckedChange={(value) => toggleWeek(week.key, value === true)} className="mt-1" />
                        <div className="flex-1">
                          <h4 className="font-semibold mb-2 flex items-center gap-2">{week.title}</h4>
                          <ul className="space-y-1.5">
                            {week.tasks.map((task) => (
                              <li key={task} className="flex gap-2 text-sm">
                                <span className="text-primary">•</span>
                                <span>{task}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            <div className="bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-950 dark:to-amber-900 rounded-lg p-5 border border-amber-200 dark:border-amber-800">
              <h3 className="text-lg font-semibold mb-3 text-amber-900 dark:text-amber-100 flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Plan de Seguimiento
              </h3>
              <div className="space-y-3">
                <div>
                  <p className="text-sm font-medium text-amber-900 dark:text-amber-100 mb-1">Parámetros a monitorear:</p>
                  <div className="flex flex-wrap gap-2">
                    {plan.followUp.parameters.map((parameter) => (
                      <div key={parameter} className="inline-flex items-center rounded-full bg-amber-200 dark:bg-amber-800 px-2.5 py-0.5 text-xs font-semibold text-amber-900 dark:text-amber-100">{parameter}</div>
                    ))}
                  </div>
                </div>
                <p className="text-sm text-amber-900 dark:text-amber-100"><strong>Frecuencia:</strong> {plan.followUp.frequency}</p>
              </div>
            </div>

            <div className="grid sm:grid-cols-3 gap-3 text-sm text-muted-foreground">
              <div className="rounded-xl border p-4 flex items-start gap-3">
                <Droplets className="h-5 w-5 text-secondary shrink-0 mt-0.5" />
                <span>La hidratación y el sueño son tus bases fisiológicas. Si eso falla, TODO cuesta más.</span>
              </div>
              <div className="rounded-xl border p-4 flex items-start gap-3">
                <BedDouble className="h-5 w-5 text-secondary shrink-0 mt-0.5" />
                <span>Las tareas están pensadas para bajar fricción y hacer que el hábito sobreviva al día real.</span>
              </div>
              <div className="rounded-xl border p-4 flex items-start gap-3">
                <HeartPulse className="h-5 w-5 text-secondary shrink-0 mt-0.5" />
                <span>Si fumás, tenés alcohol frecuente o el ánimo viene bajo, tomalo en serio y buscá apoyo clínico.</span>
              </div>
            </div>
          </div>
        </section>
      </div>

      {!loading && imcValue !== null && (
        <div className="card-elevated p-5">
          <h2 className="font-bold text-base mb-3">¿Qué significa tu IMC?</h2>
          {imcCat && (
            <p className="text-sm text-muted-foreground mb-3">
              Según tu IMC, estás en: <span className={`font-bold ${imcCat.tone}`}>{imcCat.label}</span>
            </p>
          )}
          {[
            { label: 'Desnutrición', range: '< 18.5', active: imcValue < 18.5 },
            { label: 'Normal', range: '18.5 – 24.9', active: imcValue >= 18.5 && imcValue < 25 },
            { label: 'Sobrepeso', range: '25 – 29.9', active: imcValue >= 25 && imcValue < 30 },
            { label: 'Obesidad', range: '≥ 30', active: imcValue >= 30 },
          ].map((row) => (
            <div key={row.label} className={`flex items-center justify-between py-2.5 px-3 rounded-lg mb-1 ${row.active ? 'bg-primary/10 font-semibold' : ''}`}>
              <span className={`text-sm ${row.active ? 'text-primary' : 'text-muted-foreground'}`}>{row.label}</span>
              <span className={`text-sm ${row.active ? 'text-primary' : 'text-muted-foreground'}`}>{row.range}</span>
            </div>
          ))}
        </div>
      )}

      <div className="card-elevated p-5 space-y-3">
        <h2 className="font-bold text-base">Consejos</h2>
        {[
          { title: 'Guardá lo importante en pasos simples', desc: 'Tu plan queda persistido en este dispositivo para que puedas retomarlo sin empezar de cero.' },
          { title: 'Primero estructura, después optimización', desc: 'Antes de pensar en dietas complejas, asegurá sueño, agua, comidas base y seguimiento.' },
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
