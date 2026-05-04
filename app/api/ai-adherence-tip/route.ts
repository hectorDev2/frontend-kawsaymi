import { NextRequest, NextResponse } from 'next/server'
import { buildTrustedHealthSourcesInstruction } from '@/lib/trusted-health-sources'
import { searchKnowledge, extractContextFromMatches } from '@/lib/ai-knowledge'

const GROQ_API_KEY = process.env.GROQ_API_KEY
const GROQ_URL = 'https://api.groq.com/openai/v1/chat/completions'
const MODEL = 'llama-3.1-8b-instant'

type Scope = 'week' | 'today'

export async function POST(req: NextRequest) {
  if (!GROQ_API_KEY) {
    return NextResponse.json({ error: 'AI no configurada' }, { status: 503 })
  }

  const body = await req.json().catch(() => ({}))
  const scope = body?.scope as Scope
  const taken = Number(body?.taken)
  const total = Number(body?.total)
  const missed = Number(body?.missed)
  const pending = Number(body?.pending)
  const adherenceRate = body?.adherenceRate !== undefined ? Number(body?.adherenceRate) : undefined
  const userContext = (body?.userContext ?? '').toString().trim()

  if (scope !== 'week' && scope !== 'today') {
    return NextResponse.json({ error: 'Scope inválido' }, { status: 400 })
  }
  if (![taken, total, missed, pending].every((n) => Number.isFinite(n) && n >= 0)) {
    return NextResponse.json({ error: 'Valores inválidos' }, { status: 400 })
  }

  const label = scope === 'week' ? 'esta semana' : 'hoy'

  const knowledgeResult = await searchKnowledge('adherencia medicamentos adultos mayores adultos mayores', 3)
  const docsContext = extractContextFromMatches(knowledgeResult.matches)

  let userMessage = ''
  if (docsContext) {
    userMessage = `[Información de documentos médicos]\n${docsContext}\n\n`
  }
  if (userContext) {
    userMessage += `[Datos del paciente]\n${userContext}\n\n`
  }
  userMessage += `Tip muy breve para mejorar adherencia ${label}. ` +
    `Datos: ${taken}/${total} tomadas, ${pending} pendientes, ${missed} olvidadas.`

  try {
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
              'Sé práctico y útil. NUNCA des indicaciones médicas. ' +
              'Ejemplo: "Para no olvidar tus medicamentos, poné una alarma a la misma hora todos los días. Así se vuelve un hábito."' +
              buildTrustedHealthSourcesInstruction(),
          },
          { role: 'user', content: userMessage },
        ],
        max_tokens: 80,
        temperature: 0.3,
      }),
    })

    if (!res.ok) {
      const err = await res.text()
      console.error('Groq error:', res.status, err)
      return NextResponse.json({ error: 'Error de IA' }, { status: 502 })
    }

    const data = await res.json()
    const text = data?.choices?.[0]?.message?.content?.trim() ?? ''
    return NextResponse.json({ tip: text })
  } catch (e) {
    console.error('AI fetch failed:', e)
    return NextResponse.json({ error: 'Error de conexión' }, { status: 500 })
  }
}
