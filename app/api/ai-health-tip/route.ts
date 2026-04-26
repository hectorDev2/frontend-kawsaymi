import { NextRequest, NextResponse } from 'next/server'
import { buildTrustedHealthSourcesInstruction } from '@/lib/trusted-health-sources'
import { FIELD_HELP_LABELS, getFieldFallbackSuggestion, type WellnessFormState } from '@/lib/wellness-plan'

const GROQ_API_KEY = process.env.GROQ_API_KEY
const GROQ_URL = 'https://api.groq.com/openai/v1/chat/completions'
const MODEL = 'llama-3.1-8b-instant'

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

  if (!field) {
    return NextResponse.json({ error: 'Falta campo a evaluar' }, { status: 400 })
  }

  const fallback = getFieldFallbackSuggestion(field, data)

  if (!GROQ_API_KEY) {
    return NextResponse.json({ tip: fallback, fallback: true })
  }

  try {
    const label = FIELD_HELP_LABELS[field] ?? field
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
              'Sos un educador en salud preventiva. Respondé en español rioplatense con 2 oraciones cortas, cálidas y accionables. ' +
              'No des diagnósticos ni cambies tratamientos. Enfocate en hábitos cotidianos y aclaraciones prudentes. ' +
              buildTrustedHealthSourcesInstruction(),
          },
          {
            role: 'user',
            content: `Dame una sugerencia breve para el campo "${label}" usando este contexto del paciente: ${JSON.stringify(data)}. Si falta información, decí qué conviene completar primero.`,
          },
        ],
        max_tokens: 140,
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
