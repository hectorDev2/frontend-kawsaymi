import { NextRequest, NextResponse } from 'next/server'
import { buildTrustedHealthSourcesInstruction } from '@/lib/trusted-health-sources'
import { FIELD_HELP_LABELS, getFieldFallbackSuggestion, type WellnessFormState } from '@/lib/wellness-plan'
import { searchKnowledge, extractContextFromMatches } from '@/lib/ai-knowledge'

const GROQ_API_KEY = process.env.GROQ_API_KEY
const GROQ_URL = 'https://api.groq.com/openai/v1/chat/completions'
const MODEL = 'llama-3.1-8b-instant'

const FIELD_HEALTH_SEARCH: Record<string, string> = {
  nutrition: 'nutrición saludable adultos mayores',
  breakfast: 'desayuno saludable adultos mayores',
  lunch: 'almuerzo saludable adultos mayores',
  dinner: 'cena saludable adultos mayores',
  snack: 'snacks saludables adultos mayores',
  habits: 'hábitos saludables adultos mayores',
  hydration: 'hidratación adultos mayores',
  sleepHours: 'sueño adultos mayores',
  activity: 'ejercicio físico adultos mayores',
  alcohol: 'consumo alcohol adultos mayores',
  mood: 'salud mental adultos mayores',
}

function safeData(body: any): WellnessFormState {
  return {
    nutrition: {
      breakfast: (body?.data?.nutrition?.breakfast ?? '').toString(),
      lunch: (body?.data?.nutrition?.lunch ?? '').toString(),
      dinner: (body?.data?.nutrition?.dinner ?? '').toString(),
      snack: (body?.data?.nutrition?.snack ?? '').toString(),
    },
    habits: {
      hydration: (body?.data?.habits?.hydration ?? '').toString() as WellnessFormState['habits']['hydration'],
      sleepHours: (body?.data?.habits?.sleepHours ?? '').toString(),
      activity: (body?.data?.habits?.activity ?? '').toString() as WellnessFormState['habits']['activity'],
      alcohol: (body?.data?.habits?.alcohol ?? '').toString() as WellnessFormState['habits']['alcohol'],
      smoking: Boolean(body?.data?.habits?.smoking),
      mood: (body?.data?.habits?.mood ?? '').toString() as WellnessFormState['habits']['mood'],
    },
    progress: {
      week1: Boolean(body?.data?.progress?.week1),
      week2: Boolean(body?.data?.progress?.week2),
      week3: Boolean(body?.data?.progress?.week3),
      week4: Boolean(body?.data?.progress?.week4),
    },
  }
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}))
  const field = (body?.field ?? '').toString().trim()
  const data = safeData(body)
  const userContext = (body?.userContext ?? '').toString().trim()

  if (!field) {
    return NextResponse.json({ error: 'Falta campo a evaluar' }, { status: 400 })
  }

  const fallback = getFieldFallbackSuggestion(field, data)

  const searchQuery = FIELD_HEALTH_SEARCH[field] || field
  const knowledgeResult = await searchKnowledge(searchQuery, 3)
  const docsContext = extractContextFromMatches(knowledgeResult.matches)

  if (!GROQ_API_KEY) {
    return NextResponse.json({ tip: fallback, fallback: true })
  }

  try {
    const label = FIELD_HELP_LABELS[field] ?? field
    
    let userMessage = ''
    if (docsContext) {
      userMessage = `[Información de documentos médicos]\n${docsContext}\n\n`
    }
    if (userContext) {
      userMessage += `[Datos del paciente]\n${userContext}\n\n`
    }
    userMessage += `Dame una sugerencia breve para el campo "${label}" usando este contexto: ${JSON.stringify(data)}.`

    const res = await fetch(GROQ_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model: MODEL,
        messages: [
          {
            role: 'system',
            content:
              'Eres un acompañante de salud para adultos mayores. ' +
              'Responde en 2-3 oraciones cortas y prácticas en español simple. ' +
              'Sé concreto y útil. NUNCA des indicaciones médicas. ' +
              'Ejemplo: "Para el desayuno, elegí frutas frescas y cereal integral. Isso ayuda a mantener energía durante la mañana."' +
              buildTrustedHealthSourcesInstruction(),
          },
          {
            role: 'user',
            content: userMessage,
          },
        ],
        max_tokens: 100,
        temperature: 0.4,
      }),
    })

    if (!res.ok) {
      const err = await res.text()
      console.error('Groq ai-health-tip error:', res.status, err)
      return NextResponse.json({ tip: fallback, fallback: true })
    }

    const json = await res.json()
    const tip = json?.choices?.[0]?.message?.content?.trim() || fallback
    return NextResponse.json({ tip })
  } catch (error) {
    console.error('ai-health-tip failed', error)
    return NextResponse.json({ tip: fallback, fallback: true })
  }
}
