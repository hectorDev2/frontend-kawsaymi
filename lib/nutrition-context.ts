import type { MealKey } from './wellness-plan'

export type NutritionGuidanceLevel = 'adecuado' | 'mejorable' | 'precaucion' | 'alerta' | 'consulta'

export interface NutritionProfile {
  conditions?: string[]
  allergies?: string[]
  medicalHistory?: string
}

export interface NutritionEvaluation {
  level: NutritionGuidanceLevel
  title: string
  message: string
  suggestions: string[]
  consultation: string
  triggeredRules: string[]
}

export interface DailyNutritionSummary extends NutritionEvaluation {
  mealsRegistered: number
}

const LEVEL_PRIORITY: Record<NutritionGuidanceLevel, number> = {
  adecuado: 0,
  mejorable: 1,
  precaucion: 2,
  consulta: 3,
  alerta: 4,
}

const LEVEL_COPY: Record<NutritionGuidanceLevel, string> = {
  adecuado: '🟢 ADECUADO',
  mejorable: '🟡 SE PUEDE MEJORAR',
  precaucion: '🟠 PRECAUCIÓN',
  alerta: '🔴 ALERTA',
  consulta: '🔴 REQUIERE CONSULTA',
}

const FOOD_GROUPS = {
  addedSugar: [
    'gaseosa', 'soda', 'refresco', 'bebida azucarada', 'jugo envasado', 'jugo industrial',
    'néctar', 'nectar', 'postre', 'dulce', 'caramelo', 'chocolate', 'galleta', 'torta',
    'pastel', 'helado', 'mermelada', 'cereal azucarado',
  ],
  refinedCarbs: [
    'pan blanco', 'arroz blanco', 'pasta blanca', 'fideos blancos', 'harina refinada',
    'pan francés', 'pan frances', 'cereal azucarado',
  ],
  highSodiumOrProcessed: [
    'salchicha', 'chorizo', 'jamón', 'jamon', 'embutido', 'tocino', 'hot dog', 'hamburguesa',
    'sopa instantánea', 'sopa instantanea', 'ramen instantáneo', 'ramen instantaneo',
    'cubito', 'caldo en cubo', 'salsa de soja', 'salsa soja', 'pizza procesada', 'papas fritas',
    'snack salado', 'comida enlatada', 'conserva', 'mucha sal', 'alto contenido de sal', 'muy salado',
  ],
  gastritisIrritants: [
    'café', 'cafe', 'jugo de naranja', 'jugo naranja', 'naranja', 'ají', 'aji', 'picante',
    'chile', 'alcohol', 'gaseosa', 'soda', 'frito', 'fritura', 'tomate',
  ],
}

const ALLERGEN_MATCHERS: Array<{ aliases: string[]; foods: string[]; rule: string; label: string }> = [
  {
    aliases: ['mani', 'cacahuate', 'peanut'],
    foods: ['mani', 'cacahuate', 'peanut', 'mantequilla de mani'],
    rule: 'allergy.peanut',
    label: 'maní',
  },
  {
    aliases: ['nuez', 'nueces', 'frutos secos', 'almendra', 'avellana', 'pistacho'],
    foods: ['nuez', 'nueces', 'frutos secos', 'almendra', 'avellana', 'pistacho'],
    rule: 'allergy.tree-nuts',
    label: 'frutos secos',
  },
  {
    aliases: ['marisco', 'mariscos', 'crustaceo', 'crustaceos'],
    foods: ['marisco', 'mariscos', 'camarón', 'camaron', 'langostino', 'cangrejo', 'pulpo'],
    rule: 'allergy.shellfish',
    label: 'mariscos',
  },
  {
    aliases: ['gluten', 'trigo'],
    foods: ['gluten', 'trigo', 'pan', 'pasta', 'fideos', 'galleta', 'cerveza'],
    rule: 'allergy.gluten',
    label: 'gluten',
  },
]

function normalize(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()
}

function hasAny(text: string, terms: string[]): boolean {
  return terms.some((term) => text.includes(normalize(term)))
}

function containsCondition(profile: NutritionProfile, condition: string | string[]): boolean {
  const profileText = normalize([
    ...(profile.conditions ?? []),
    profile.medicalHistory ?? '',
  ].join(' '))

  return (Array.isArray(condition) ? condition : [condition]).some((term) => profileText.includes(term))
}

function getAllergyMatches(text: string, allergies: string[] = []) {
  const normalizedAllergies = allergies.map(normalize)
  return ALLERGEN_MATCHERS.filter((allergen) =>
    normalizedAllergies.some((allergy) => allergen.aliases.some((alias) => allergy.includes(alias))) &&
    hasAny(text, allergen.foods),
  )
}

function strongestLevel(levels: NutritionGuidanceLevel[]): NutritionGuidanceLevel {
  return levels.reduce<NutritionGuidanceLevel>(
    (current, candidate) => LEVEL_PRIORITY[candidate] > LEVEL_PRIORITY[current] ? candidate : current,
    'adecuado',
  )
}

function mealLabel(meal: MealKey | 'daily') {
  return {
    breakfast: 'desayuno',
    lunch: 'almuerzo',
    dinner: 'cena',
    snack: 'snack',
    daily: 'día',
  }[meal]
}

/**
 * Deterministic educational screening. It does not diagnose, calculate portions,
 * or replace individual nutritional advice.
 */
export function evaluateMealSelection({
  meal,
  foods,
  profile,
}: {
  meal: MealKey | 'daily'
  foods: string
  profile: NutritionProfile
}): NutritionEvaluation {
  const selection = normalize(foods)
  const rules: string[] = []
  const levels: NutritionGuidanceLevel[] = []
  const suggestions: string[] = []
  const relevantConditions: string[] = []

  if (!selection) {
    return {
      level: 'adecuado',
      title: LEVEL_COPY.adecuado,
      message: `Registrá lo que querés consumir en ${mealLabel(meal)} para recibir una orientación contextualizada.`,
      suggestions: [],
      consultation: 'Esta orientación es educativa y no reemplaza una evaluación profesional.',
      triggeredRules: [],
    }
  }

  const allergyMatches = getAllergyMatches(selection, profile.allergies)
  if (allergyMatches.length) {
    const labels = allergyMatches.map(({ label }) => label).join(', ')
    return {
      level: 'alerta',
      title: LEVEL_COPY.alerta,
      message: `Tenés una alergia al ${labels} registrada. Lo seleccionado parece contener ese ingrediente; revisá la etiqueta y evitá consumirlo si lo confirma.`,
      suggestions: ['Elegí una alternativa sin el alérgeno y revisá también advertencias de posible contaminación cruzada.'],
      consultation: 'Evitá consumirlo hasta confirmar la etiqueta. Si hay dificultad para respirar, hinchazón o síntomas intensos, buscá atención de urgencia. Para dudas sobre alergias, consultá con tu profesional de salud.',
      triggeredRules: allergyMatches.map(({ rule }) => rule),
    }
  }

  const hasDiabetes = containsCondition(profile, 'diabet')
  const hasHypertension = containsCondition(profile, ['hipertens', 'hta', 'presion alta', 'presion arterial alta'])
  const hasGastritis = containsCondition(profile, 'gastritis')

  if (hasDiabetes) {
    const addedSugar = hasAny(selection, FOOD_GROUPS.addedSugar)
    const refinedCarbs = hasAny(selection, FOOD_GROUPS.refinedCarbs)
    if (addedSugar) rules.push('diabetes.added-sugars')
    if (refinedCarbs) rules.push('diabetes.refined-carbs')
    if (addedSugar || refinedCarbs) {
      levels.push(addedSugar && refinedCarbs ? 'precaucion' : 'mejorable')
      relevantConditions.push('diabetes')
      suggestions.push('Reducí los azúcares añadidos y combiná carbohidratos con proteína y fibra, según tu plan indicado.')
    }
  }

  if (hasHypertension && hasAny(selection, FOOD_GROUPS.highSodiumOrProcessed)) {
    rules.push('hypertension.sodium-processed')
    levels.push('precaucion')
    relevantConditions.push('hipertensión arterial')
    suggestions.push('Priorizá alimentos frescos y preparaciones con menos sal; limitá embutidos, sopas instantáneas y otros procesados.')
  }

  if (hasGastritis && hasAny(selection, FOOD_GROUPS.gastritisIrritants)) {
    rules.push('gastritis.irritants')
    levels.push('precaucion')
    relevantConditions.push('gastritis')
    suggestions.push('Según tu tolerancia, probá una bebida no irritante y opciones menos picantes, ácidas o fritas, como avena o pan integral.')
  }

  const level = strongestLevel(levels)
  if (level === 'adecuado') {
    return {
      level,
      title: LEVEL_COPY[level],
      message: 'Tu elección es compatible con la información relevante registrada en tu perfil y no activa una regla de precaución.',
      suggestions: ['Mantené variedad, porciones acordes a tus necesidades y agua como bebida habitual.'],
      consultation: 'Esta orientación es educativa y no reemplaza una evaluación profesional.',
      triggeredRules: [],
    }
  }

  const conditionText = [...new Set(relevantConditions)].join(' y ')
  const qualifier = level === 'mejorable' ? 'puede mejorarse' : 'requiere precaución'
  return {
    level,
    title: LEVEL_COPY[level],
    message: `Considerando ${conditionText} registrada en tu perfil, esta elección ${qualifier}. Evaluamos el conjunto de alimentos de este ${mealLabel(meal)}, no un alimento aislado.`,
    suggestions,
    consultation: 'La orientación es educativa y no reemplaza tu plan alimentario. Si tenés síntomas, cambios de glucosa o presión, o dudas sobre qué comer, consultá con tu profesional de salud.',
    triggeredRules: rules,
  }
}

export function summarizeDailyNutrition(
  meals: Record<MealKey, string>,
  profile: NutritionProfile,
): DailyNutritionSummary | null {
  const registeredMeals = Object.values(meals).filter((meal) => meal.trim()).length
  if (!registeredMeals) return null

  const evaluation = evaluateMealSelection({
    meal: 'daily',
    foods: Object.values(meals).filter(Boolean).join(', '),
    profile,
  })

  if (evaluation.level === 'adecuado') {
    return {
      ...evaluation,
      mealsRegistered: registeredMeals,
      message: `Durante el día registraste ${registeredMeals} comida${registeredMeals === 1 ? '' : 's'}. No se activó una regla de precaución con tu perfil actual.`,
    }
  }

  return {
    ...evaluation,
    mealsRegistered: registeredMeals,
    message: `Durante el día registraste ${registeredMeals} comida${registeredMeals === 1 ? '' : 's'}. ${evaluation.message}`,
  }
}
