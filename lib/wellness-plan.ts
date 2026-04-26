export type MealKey = 'breakfast' | 'lunch' | 'dinner' | 'snack'
export type HydrationLevel = '' | 'low' | 'medium' | 'high'
export type ActivityLevel = '' | 'low' | 'moderate' | 'high'
export type AlcoholFrequency = '' | 'none' | 'occasional' | 'frequent'
export type MoodLevel = '' | 'low' | 'stable' | 'good'
export type WeekKey = 'week1' | 'week2' | 'week3' | 'week4'

export interface WellnessFormState {
  nutrition: Record<MealKey, string>
  habits: {
    hydration: HydrationLevel
    sleepHours: string
    activity: ActivityLevel
    alcohol: AlcoholFrequency
    smoking: boolean
    mood: MoodLevel
  }
  progress: Record<WeekKey, boolean>
}

export interface WellnessPlanWeek {
  key: WeekKey
  title: string
  tasks: string[]
}

export interface WellnessPlanResult {
  summary: string
  priorities: string[]
  weeks: WellnessPlanWeek[]
  followUp: {
    parameters: string[]
    frequency: string
  }
  completion: number
  completedWeeks: number
}

export interface HealthContext {
  weight?: number | null
  height?: number | null
  imc?: number | null
}

export const DEFAULT_WELLNESS_FORM: WellnessFormState = {
  nutrition: {
    breakfast: '',
    lunch: '',
    dinner: '',
    snack: '',
  },
  habits: {
    hydration: '',
    sleepHours: '',
    activity: '',
    alcohol: '',
    smoking: false,
    mood: '',
  },
  progress: {
    week1: false,
    week2: false,
    week3: false,
    week4: false,
  },
}

export const MEAL_CONFIG: Array<{ key: MealKey; label: string; placeholder: string }> = [
  { key: 'breakfast', label: 'Desayuno', placeholder: 'Ej: Café con leche, pan integral con palta' },
  { key: 'lunch', label: 'Almuerzo', placeholder: 'Ej: Arroz, pollo a la plancha, ensalada' },
  { key: 'dinner', label: 'Cena', placeholder: 'Ej: Sopa de verduras, pescado al horno' },
  { key: 'snack', label: 'Snack', placeholder: 'Ej: Fruta, yogurt, frutos secos' },
]

export const FIELD_HELP_LABELS: Record<string, string> = {
  breakfast: 'Desayuno',
  lunch: 'Almuerzo',
  dinner: 'Cena',
  snack: 'Snack',
  hydration: 'hidratación',
  sleepHours: 'sueño',
  activity: 'actividad física',
  alcohol: 'consumo de alcohol',
  smoking: 'tabaco',
  mood: 'estado de ánimo',
}

function toNumber(value: string) {
  const parsed = Number.parseFloat(value)
  return Number.isFinite(parsed) ? parsed : null
}

function normalizedMealCount(nutrition: WellnessFormState['nutrition']) {
  return Object.values(nutrition).filter((value) => value.trim().length > 0).length
}

function baseParameters(data: WellnessFormState, health?: HealthContext) {
  const parameters = ['Hábitos']

  if (health?.imc) parameters.unshift('IMC')
  if (health?.weight) parameters.push('Peso')
  if (data.habits.sleepHours) parameters.push('Sueño')
  if (data.habits.hydration) parameters.push('Hidratación')
  if (data.habits.activity) parameters.push('Actividad')

  return [...new Set(parameters)]
}

function buildSummary(data: WellnessFormState, health?: HealthContext) {
  const sleep = toNumber(data.habits.sleepHours)
  const meals = normalizedMealCount(data.nutrition)
  const signals: string[] = []

  if (meals >= 3) signals.push('ya registraste una estructura básica de comidas')
  else signals.push('todavía falta completar tu patrón de comidas del día')

  if (data.habits.hydration === 'low') signals.push('tu hidratación necesita prioridad')
  if (sleep !== null && sleep < 7) signals.push('el descanso está por debajo de lo recomendado')
  if (data.habits.activity === 'low') signals.push('conviene subir gradualmente la actividad física')
  if (data.habits.smoking) signals.push('hay un factor de riesgo importante asociado al tabaco')
  if (data.habits.alcohol === 'frequent') signals.push('el alcohol frecuente merece seguimiento cercano')
  if (data.habits.mood === 'low') signals.push('tu ánimo sugiere cuidar también el bienestar emocional')
  if (health?.imc && health.imc >= 25) signals.push('el IMC sugiere trabajar hábitos sostenibles, no soluciones rápidas')

  return `Tu plan se enfoca en pasos concretos de 30 días porque ${signals.join(', ')}.`
}

function buildPriorities(data: WellnessFormState, health?: HealthContext) {
  const sleep = toNumber(data.habits.sleepHours)
  const meals = normalizedMealCount(data.nutrition)
  const priorities: string[] = []

  if (meals < 3) priorities.push('Completá al menos desayuno, almuerzo y cena con opciones simples y repetibles.')
  if (!data.habits.hydration || data.habits.hydration === 'low') priorities.push('Subí tu hidratación diaria con una meta visible y medible.')
  if (sleep === null || sleep < 7) priorities.push('Protegé una rutina de sueño más estable para llegar a 7–8 horas.')
  if (!data.habits.activity || data.habits.activity === 'low') priorities.push('Sumá movimiento diario de baja barrera antes de pensar en entrenamientos complejos.')
  if (data.habits.smoking) priorities.push('Definí una estrategia concreta para reducir o suspender el tabaco con apoyo profesional.')
  if (data.habits.alcohol === 'frequent') priorities.push('Reducí la frecuencia de alcohol y registrá disparadores o contextos de consumo.')
  if (data.habits.mood === 'low') priorities.push('Agendá espacios de recuperación emocional y pedí ayuda si el ánimo no mejora.')
  if (health?.imc && health.imc >= 30) priorities.push('Monitoreá peso e IMC semanalmente con foco en consistencia, no en cambios extremos.')

  if (priorities.length === 0) {
    priorities.push('Mantené la consistencia de tus hábitos actuales y revisá tu progreso cada semana.')
    priorities.push('Ajustá tu plan según energía, sueño y adherencia real, no según expectativas perfectas.')
  }

  return priorities.slice(0, 4)
}

function buildWeeks(data: WellnessFormState, health?: HealthContext): WellnessPlanWeek[] {
  const mealsMissing = normalizedMealCount(data.nutrition) < 3
  const sleep = toNumber(data.habits.sleepHours)

  return [
    {
      key: 'week1',
      title: 'Semana 1',
      tasks: [
        mealsMissing ? 'Definí una base de desayuno, almuerzo y cena para evitar improvisar.' : 'Repetí tu estructura actual de comidas y detectá qué horarios te cuestan más.',
        'Tomá nota de agua, energía y apetito al final del día.',
      ],
    },
    {
      key: 'week2',
      title: 'Semana 2',
      tasks: [
        !data.habits.hydration || data.habits.hydration === 'low' ? 'Usá recordatorios o una botella visible para mejorar la hidratación.' : 'Sostené tu nivel de hidratación y revisá si podés distribuirlo mejor durante el día.',
        sleep === null || sleep < 7 ? 'Ajustá una hora fija para acostarte y protegé tu rutina nocturna.' : 'Conservá tu rutina de sueño y evitá romperla en días de semana.',
      ],
    },
    {
      key: 'week3',
      title: 'Semana 3',
      tasks: [
        !data.habits.activity || data.habits.activity === 'low' ? 'Agregá caminatas o movilidad 15–20 minutos por día.' : 'Escalá la actividad física sin saltos bruscos, priorizando continuidad.',
        data.habits.mood === 'low' ? 'Chequeá tu ánimo y buscá actividades de descarga mental o apoyo cercano.' : 'Relacioná tu energía y tu ánimo con las comidas y el descanso.',
      ],
    },
    {
      key: 'week4',
      title: 'Semana 4',
      tasks: [
        health?.weight ? 'Compará peso, energía y adherencia para decidir el siguiente ajuste.' : 'Hacé una revisión final de hábitos y definí qué métrica vas a seguir el próximo mes.',
        data.habits.smoking || data.habits.alcohol === 'frequent' ? 'Revisá los factores de riesgo y considerá apoyo profesional para sostener cambios.' : 'Consolidá lo que funcionó y eliminá lo que te genera fricción innecesaria.',
      ],
    },
  ]
}

export function generateWellnessPlan(data: WellnessFormState, health?: HealthContext): WellnessPlanResult {
  const completedWeeks = Object.values(data.progress).filter(Boolean).length
  const completion = Math.round((completedWeeks / 4) * 100)

  return {
    summary: buildSummary(data, health),
    priorities: buildPriorities(data, health),
    weeks: buildWeeks(data, health),
    followUp: {
      parameters: baseParameters(data, health),
      frequency: completedWeeks >= 2 ? 'Semanal' : '2 veces por semana',
    },
    completion,
    completedWeeks,
  }
}

export function getFieldFallbackSuggestion(field: string, data: WellnessFormState) {
  switch (field) {
    case 'breakfast':
      return 'Buscá un desayuno con proteína + fibra, por ejemplo yogurt natural con fruta o pan integral con huevo. La idea es arrancar con saciedad real, no con azúcar rápida.'
    case 'lunch':
      return 'En el almuerzo usá una estructura simple: 1 fuente de proteína, 1 porción de vegetales y 1 carbohidrato medido. Si podés repetir esa base, ganás adherencia.'
    case 'dinner':
      return 'Para la cena conviene algo liviano pero suficiente: verduras + proteína y poca carga ultraprocesada. Si cenás muy tarde, evitá porciones pesadas.'
    case 'snack':
      return 'Un snack útil no es “picar por ansiedad”; es una colación estratégica. Fruta, yogurt o frutos secos suelen funcionar mejor que productos con azúcar añadida.'
    case 'hydration':
      return data.habits.hydration === 'low'
        ? 'Si hoy tu hidratación es baja, no intentes compensar todo junto. Repartí agua durante el día y dejala visible para bajar la fricción.'
        : 'Mantené una hidratación distribuida durante el día. El color de la orina y la sed frecuente te pueden dar señales prácticas.'
    case 'sleepHours':
      return 'Dormir bien no es un lujo, es infraestructura biológica. Si estás por debajo de 7 horas, priorizá una rutina nocturna consistente antes de buscar hacks.'
    case 'activity':
      return data.habits.activity === 'low'
        ? 'Empezá por movimiento sostenible: caminar, movilidad o ejercicios suaves todos los días. La constancia le gana a la intensidad improvisada.'
        : 'Si ya tenés actividad, medila por consistencia semanal. Subir carga sin recuperar bien suele romper el hábito.'
    case 'alcohol':
      return 'Registrar frecuencia y contexto del alcohol sirve más que minimizarlo mentalmente. El objetivo es entender el patrón para después corregirlo.'
    case 'smoking':
      return 'Si fumás, cualquier reducción ya cuenta. Pero OJO: lo más efectivo suele ser combinar una meta concreta con apoyo médico o conductual.'
    case 'mood':
      return 'Tu estado de ánimo influye en sueño, comida y adherencia. Si notás bajón sostenido, no lo trates como un detalle menor.'
    default:
      return 'Construí hábitos simples, medibles y repetibles. La mejora real viene de la consistencia, no de la motivación del primer día.'
  }
}

export function buildWellnessExport(plan: WellnessPlanResult) {
  const lines = [
    'Plan para Mejorar',
    '',
    `Resumen: ${plan.summary}`,
    '',
    'Recomendaciones prioritarias:',
    ...plan.priorities.map((item, index) => `${index + 1}. ${item}`),
    '',
    `Progreso actual: ${plan.completion}% (${plan.completedWeeks} de 4 semanas)`,
    '',
    'Plan de 30 días:',
    ...plan.weeks.flatMap((week) => [week.title, ...week.tasks.map((task) => `- ${task}`), '']),
    'Seguimiento:',
    `- Parámetros: ${plan.followUp.parameters.join(', ')}`,
    `- Frecuencia: ${plan.followUp.frequency}`,
  ]

  return lines.join('\n')
}
