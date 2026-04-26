export interface UserHealthData {
  name?: string
  weight?: number | null
  height?: number | null
  imc?: number | null
  conditions?: string[]
  allergies?: string[]
  activeMedications?: number
  polypharmacy?: boolean
  weekAdherenceRate?: number
  clinicalHistory?: {
    antecedentes?: string
    enfermedades?: string[]
    cirugias?: string
    hospitalizaciones?: string
    transfusiones?: boolean | null
    vacunas?: string
  }
  vaccines?: Array<{ name: string; lastDose?: string; doses?: string }>
  wellness?: {
    nutrition?: { breakfast?: string; lunch?: string; dinner?: string; snack?: string }
    habits?: {
      hydration?: string
      sleepHours?: string
      activity?: string
      alcohol?: string
      smoking?: boolean
      mood?: string
    }
  }
}

function imcLabel(imc: number): string {
  if (imc < 18.5) return 'desnutrición'
  if (imc < 25) return 'normal'
  if (imc < 30) return 'sobrepeso'
  return 'obesidad'
}

export function buildHealthContext(data: UserHealthData): string {
  const lines: string[] = []

  // Physical
  const physical: string[] = []
  if (data.weight) physical.push(`peso ${data.weight}kg`)
  if (data.height) physical.push(`altura ${data.height}cm`)
  if (data.imc) physical.push(`IMC ${data.imc.toFixed(1)} (${imcLabel(data.imc)})`)
  if (physical.length) lines.push(`Datos físicos: ${physical.join(', ')}.`)

  // Medications
  if (data.activeMedications !== undefined) {
    lines.push(
      `Medicamentos activos: ${data.activeMedications}${data.polypharmacy ? ' — presenta polifarmacia' : ''}.`,
    )
  }

  // Adherence
  if (data.weekAdherenceRate !== undefined) {
    lines.push(`Adherencia semanal: ${Math.round(data.weekAdherenceRate * 100)}%.`)
  }

  // Conditions (merge API + clinical history to deduplicate)
  const allConditions = [
    ...(data.conditions ?? []),
    ...(data.clinicalHistory?.enfermedades ?? []),
  ]
  const uniqueConditions = [...new Set(allConditions.filter(Boolean))]
  if (uniqueConditions.length) lines.push(`Condiciones médicas: ${uniqueConditions.join(', ')}.`)

  // Allergies
  if (data.allergies?.length) lines.push(`Alergias conocidas: ${data.allergies.join(', ')}.`)

  // Clinical history extras
  if (data.clinicalHistory?.antecedentes) {
    lines.push(`Antecedentes patológicos: ${data.clinicalHistory.antecedentes}.`)
  }
  if (data.clinicalHistory?.cirugias) {
    lines.push(`Cirugías previas: ${data.clinicalHistory.cirugias}.`)
  }
  if (data.clinicalHistory?.transfusiones != null) {
    lines.push(`Transfusiones: ${data.clinicalHistory.transfusiones ? 'sí' : 'no'}.`)
  }

  // Vaccines
  const vaxParts: string[] = []
  if (data.clinicalHistory?.vacunas) vaxParts.push(data.clinicalHistory.vacunas)
  if (data.vaccines?.length) {
    vaxParts.push(
      data.vaccines
        .map((v) => `${v.name}${v.lastDose ? ` (última dosis: ${v.lastDose})` : ''}`)
        .join(', '),
    )
  }
  if (vaxParts.length) lines.push(`Vacunación registrada: ${vaxParts.join('; ')}.`)

  // Nutrition
  const n = data.wellness?.nutrition
  if (n) {
    const meals = [
      n.breakfast && `desayuno: ${n.breakfast}`,
      n.lunch && `almuerzo: ${n.lunch}`,
      n.dinner && `cena: ${n.dinner}`,
      n.snack && `snack: ${n.snack}`,
    ].filter(Boolean)
    if (meals.length) lines.push(`Plan nutricional — ${meals.join('; ')}.`)
  }

  // Habits
  const h = data.wellness?.habits
  if (h) {
    const hydrationMap: Record<string, string> = { low: 'baja', medium: 'adecuada', high: 'alta' }
    const activityMap: Record<string, string> = { low: 'baja', moderate: 'moderada', high: 'alta' }
    const alcoholMap: Record<string, string> = { none: 'no consume', occasional: 'ocasional', frequent: 'frecuente' }
    const moodMap: Record<string, string> = { low: 'bajo', stable: 'estable', good: 'bueno' }

    const habits: string[] = []
    if (h.hydration) habits.push(`hidratación ${hydrationMap[h.hydration] ?? h.hydration}`)
    if (h.sleepHours) habits.push(`sueño ${h.sleepHours}h/noche`)
    if (h.activity) habits.push(`actividad física ${activityMap[h.activity] ?? h.activity}`)
    if (h.alcohol) habits.push(`alcohol ${alcoholMap[h.alcohol] ?? h.alcohol}`)
    if (h.smoking !== undefined) habits.push(h.smoking ? 'fumador activo' : 'no fuma')
    if (h.mood) habits.push(`ánimo ${moodMap[h.mood] ?? h.mood}`)
    if (habits.length) lines.push(`Hábitos: ${habits.join(', ')}.`)
  }

  if (!lines.length) return ''
  return `[Perfil de salud del paciente]\n${lines.join('\n')}`
}
