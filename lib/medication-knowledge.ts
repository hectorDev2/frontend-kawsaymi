import type { Medication } from '@/lib/api'

export interface EducationalInfo {
  howToTake: string
  withWhat: string
  precaution: string
  source: string
}

const KNOWLEDGE: Record<string, EducationalInfo> = {
  'losartán 50 mg': {
    howToTake: 'Tomar con agua, una vez al día.',
    withWhat: 'Puede administrarse con o sin alimentos.',
    precaution: 'No suspender sin indicación médica. Controlar presión regularmente.',
    source: 'MINSA - Guía de Práctica Clínica Hipertensión Arterial',
  },
  'losartán 100 mg': {
    howToTake: 'Tomar con agua, una vez al día.',
    withWhat: 'Puede administrarse con o sin alimentos.',
    precaution: 'No suspender sin indicación médica. Controlar presión regularmente.',
    source: 'MINSA - Guía de Práctica Clínica Hipertensión Arterial',
  },
  'enalapril 10 mg': {
    howToTake: 'Tomar con agua, preferentemente a la misma hora.',
    withWhat: 'Puede tomarse con o sin alimentos.',
    precaution: 'Puede causar mareos. No combinar con diuréticos sin supervisión.',
    source: 'MINSA - Formulario Nacional de Medicamentos',
  },
  'metformina 500 mg': {
    howToTake: 'Tomar con las comidas para reducir molestias estomacales.',
    withWhat: 'Siempre con alimentos. Evitar alcohol.',
    precaution: 'Monitorear función renal periódicamente.',
    source: 'MINSA - Guía de Práctica Clínica Diabetes Mellitus Tipo 2',
  },
  'metformina 850 mg': {
    howToTake: 'Tomar con las comidas para reducir molestias estomacales.',
    withWhat: 'Siempre con alimentos. Evitar alcohol.',
    precaution: 'Monitorear función renal periódicamente.',
    source: 'MINSA - Guía de Práctica Clínica Diabetes Mellitus Tipo 2',
  },
  'atorvastatina 10 mg': {
    howToTake: 'Tomar una vez al día, a cualquier hora.',
    withWhat: 'Puede tomarse con o sin alimentos.',
    precaution: 'Evitar consumo excesivo de toronja (pomelo).',
    source: 'MedlinePlus - Biblioteca Nacional de Medicina de EE.UU.',
  },
  'atorvastatina 20 mg': {
    howToTake: 'Tomar una vez al día, a cualquier hora.',
    withWhat: 'Puede tomarse con o sin alimentos.',
    precaution: 'Evitar consumo excesivo de toronja (pomelo).',
    source: 'MedlinePlus - Biblioteca Nacional de Medicina de EE.UU.',
  },
  'ibuprofeno 400 mg': {
    howToTake: 'Tomar con alimentos o leche para proteger el estómago.',
    withWhat: 'Con alimentos. Evitar alcohol.',
    precaution: 'No usar por más de 10 días sin supervisión médica.',
    source: 'MedlinePlus - Biblioteca Nacional de Medicina de EE.UU.',
  },
  'ibuprofeno 600 mg': {
    howToTake: 'Tomar con alimentos o leche para proteger el estómago.',
    withWhat: 'Con alimentos. Evitar alcohol.',
    precaution: 'No usar por más de 10 días sin supervisión médica.',
    source: 'MedlinePlus - Biblioteca Nacional de Medicina de EE.UU.',
  },
  'paracetamol 500 mg': {
    howToTake: 'Tomar con agua, cada 6-8 horas según necesidad.',
    withWhat: 'Puede tomarse con o sin alimentos.',
    precaution: 'No exceder 4g al día. Evitar alcohol.',
    source: 'MINSA - Formulario Nacional de Medicamentos',
  },
  'paracetamol 1 g': {
    howToTake: 'Tomar con agua, cada 6-8 horas según necesidad.',
    withWhat: 'Puede tomarse con o sin alimentos.',
    precaution: 'No exceder 4g al día. Evitar alcohol.',
    source: 'MINSA - Formulario Nacional de Medicamentos',
  },
  'amoxicilina 500 mg': {
    howToTake: 'Tomar cada 8 horas, completar todo el tratamiento.',
    withWhat: 'Puede tomarse con o sin alimentos.',
    precaution: 'Completar el tratamiento aunque mejoren los síntomas.',
    source: 'MINSA - Formulario Nacional de Medicamentos',
  },
  'amoxicilina 875 mg': {
    howToTake: 'Tomar cada 12 horas, completar todo el tratamiento.',
    withWhat: 'Puede tomarse con o sin alimentos.',
    precaution: 'Completar el tratamiento aunque mejoren los síntomas.',
    source: 'MINSA - Formulario Nacional de Medicamentos',
  },
  'omeprazol 20 mg': {
    howToTake: 'Tomar en ayunas, 30-60 minutos antes del desayuno.',
    withWhat: 'En ayunas. No masticar la cápsula.',
    precaution: 'No usar por más de 14 días sin supervisión médica.',
    source: 'MedlinePlus - Biblioteca Nacional de Medicina de EE.UU.',
  },
  'omeprazol 40 mg': {
    howToTake: 'Tomar en ayunas, 30-60 minutos antes del desayuno.',
    withWhat: 'En ayunas. No masticar la cápsula.',
    precaution: 'No usar por más de 14 días sin supervisión médica.',
    source: 'MedlinePlus - Biblioteca Nacional de Medicina de EE.UU.',
  },
  'aspirina 100 mg': {
    howToTake: 'Tomar con agua, preferentemente después de comer.',
    withWhat: 'Con alimentos para proteger el estómago.',
    precaution: 'No tomar si tiene úlcera o sangrado activo.',
    source: 'Mayo Clinic - Patient Care & Health Information',
  },
  'prednisona 5 mg': {
    howToTake: 'Tomar con alimentos para reducir molestias estomacales.',
    withWhat: 'Con alimentos. No suspender bruscamente.',
    precaution: 'Puede elevar el azúcar en sangre. Monitorear si es diabético.',
    source: 'MedlinePlus - Biblioteca Nacional de Medicina de EE.UU.',
  },
  'prednisona 20 mg': {
    howToTake: 'Tomar con alimentos para reducir molestias estomacales.',
    withWhat: 'Con alimentos. No suspender bruscamente.',
    precaution: 'Puede elevar el azúcar en sangre. Monitorear si es diabético.',
    source: 'MedlinePlus - Biblioteca Nacional de Medicina de EE.UU.',
  },
  'warfarina 5 mg': {
    howToTake: 'Tomar a la misma hora todos los días.',
    withWhat: 'Puede tomarse con o sin alimentos. Evitar cambios bruscos en vitamina K.',
    precaution: 'Requiere monitoreo periódico (INR). Reportar sangrados inusuales.',
    source: 'Mayo Clinic - Patient Care & Health Information',
  },
  'lisinopril 10 mg': {
    howToTake: 'Tomar una vez al día, a la misma hora.',
    withWhat: 'Puede administrarse con o sin alimentos.',
    precaution: 'Puede causar mareos al inicio. Controlar presión y potasio.',
    source: 'MedlinePlus - Biblioteca Nacional de Medicina de EE.UU.',
  },
  'salbutamol inhalador': {
    howToTake: 'Agitar antes de usar. Inhalar profundamente y sostener 10 segundos.',
    withWhat: 'Usar según indicación médica. Enjuagar boca después de usar.',
    precaution: 'Si necesita usarlo más de 2 veces por semana, consulte a su médico.',
    source: 'MINSA - Guía de Práctica Clínica Asma',
  },
}

export function getMedicationKnowledge(name: string): EducationalInfo | null {
  const key = name.toLowerCase().trim()
  return KNOWLEDGE[key] ?? null
}

export interface InteractionInfo {
  medication: string
  condition: string
  description: string
  severity: 'HIGH' | 'MEDIUM' | 'LOW'
}

const CONDITION_INTERACTIONS: Array<{
  medications: string[]
  conditions: string[]
  description: string
  severity: 'HIGH' | 'MEDIUM' | 'LOW'
}> = [
  {
    medications: ['ibuprofeno', 'naproxeno', 'diclofenaco', 'aspirina', 'indometacina'],
    conditions: ['gastritis', 'úlcera', 'reflujo', 'enfermedad ácido péptica', 'ulcer', 'gerd', 'acid reflux'],
    description: 'Los AINE pueden irritar la mucosa gástrica y empeorar la condición.',
    severity: 'HIGH',
  },
  {
    medications: ['prednisona', 'dexametasona', 'hidrocortisona', 'betametasona'],
    conditions: ['diabetes', 'diabetes mellitus'],
    description: 'Los corticosteroides pueden elevar los niveles de glucosa en sangre.',
    severity: 'HIGH',
  },
  {
    medications: ['ibuprofeno', 'naproxeno', 'diclofenaco', 'indometacina'],
    conditions: ['hipertensión', 'insuficiencia renal', 'enfermedad renal crónica', 'hypertension', 'high blood pressure', 'renal disease', 'ckd'],
    description: 'Los AINE pueden elevar la presión arterial y afectar la función renal.',
    severity: 'HIGH',
  },
  {
    medications: ['metformina'],
    conditions: ['insuficiencia renal', 'enfermedad renal crónica', 'renal disease', 'ckd'],
    description: 'La metformina requiere ajuste de dosis en insuficiencia renal.',
    severity: 'HIGH',
  },
  {
    medications: ['warfarina', 'aspirina', 'clopidogrel'],
    conditions: ['gastritis', 'úlcera', 'enfermedad ácido péptica', 'ulcer', 'gerd'],
    description: 'Los anticoagulantes aumentan el riesgo de sangrado gastrointestinal.',
    severity: 'HIGH',
  },
  {
    medications: ['losartán', 'enalapril', 'lisinopril'],
    conditions: ['insuficiencia renal', 'enfermedad renal crónica', 'renal disease', 'ckd'],
    description: 'Monitorear función renal y potasio sérico durante el tratamiento.',
    severity: 'MEDIUM',
  },
  {
    medications: ['salbutamol'],
    conditions: ['hipertensión', 'cardiopatía', 'arritmia', 'hypertension', 'heart disease', 'arrhythmia'],
    description: 'Los beta-agonistas pueden aumentar la frecuencia cardiaca.',
    severity: 'MEDIUM',
  },
  {
    medications: ['omeprazol', 'pantoprazol', 'esomeprazol'],
    conditions: ['osteoporosis'],
    description: 'El uso prolongado de IBP puede aumentar el riesgo de fracturas.',
    severity: 'LOW',
  },
]

export function getInteractions(
  medicationName: string,
  conditions: string[]
): InteractionInfo[] {
  const name = medicationName.toLowerCase().trim()
  const results: InteractionInfo[] = []

  for (const interaction of CONDITION_INTERACTIONS) {
    const matchesMedication = interaction.medications.some((m) => name.includes(m))
    if (!matchesMedication) continue

    const matchesCondition = interaction.conditions.some((c) =>
      conditions.some((cond) => cond.toLowerCase().includes(c))
    )
    if (!matchesCondition) continue

    results.push({
      medication: medicationName,
      condition: interaction.conditions
        .find((c) => conditions.some((cond) => cond.toLowerCase().includes(c))) ?? '',
      description: interaction.description,
      severity: interaction.severity,
    })
  }

  return results
}

export function formatSources(source: string): { name: string; badge: string }[] {
  const sources = source.split(', ').map((s) => s.trim()).filter(Boolean)
  return sources.map((s) => {
    if (s.toLowerCase().includes('minsa')) return { name: s, badge: 'bg-blue-100 text-blue-700' }
    if (s.toLowerCase().includes('medlineplus')) return { name: s, badge: 'bg-green-100 text-green-700' }
    if (s.toLowerCase().includes('mayo clinic')) return { name: s, badge: 'bg-purple-100 text-purple-700' }
    return { name: s, badge: 'bg-gray-100 text-gray-700' }
  })
}
