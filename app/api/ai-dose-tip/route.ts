import { NextRequest, NextResponse } from 'next/server'
import { buildTrustedHealthSourcesInstruction } from '@/lib/trusted-health-sources'
import { searchKnowledge, extractContextFromMatches } from '@/lib/ai-knowledge'

const GROQ_API_KEY = process.env.GROQ_API_KEY
const GROQ_URL = 'https://api.groq.com/openai/v1/chat/completions'
const MODEL = 'llama-3.1-8b-instant'

export async function POST(req: NextRequest) {
  if (!GROQ_API_KEY) {
    return NextResponse.json({ error: 'AI no configurada' }, { status: 503 })
  }

  const body = await req.json().catch(() => ({}))
  const medicationName = (body?.medicationName ?? '').toString().trim()
  const dose = (body?.dose ?? '').toString().trim()
  const scheduledTime = (body?.scheduledTime ?? '').toString().trim()
  const eventStatus = (body?.eventStatus ?? 'PENDING').toString().trim().toUpperCase()
  const instructions = (body?.instructions ?? '').toString().trim()
  const contextLabel = (body?.contextLabel ?? 'toma de hoy').toString().trim()
  const userContext = (body?.userContext ?? '').toString().trim()

  if (!medicationName) {
    return NextResponse.json({ error: 'Falta nombre del medicamento' }, { status: 400 })
  }

  const timePart = scheduledTime ? `Hora programada: ${scheduledTime}.` : ''
  const dosePart = dose ? `Dosis: ${dose}.` : ''
  const instructionsPart = instructions ? `Indicaciones registradas: ${instructions}.` : ''
  const statusPart =
    eventStatus === 'MISSED'
      ? 'Estado: el usuario no pudo tomar esta dosis.'
      : eventStatus === 'TAKEN'
      ? 'Estado: esta dosis ya fue tomada.'
      : 'Estado: esta dosis sigue pendiente.'

  const knowledgeResult = await searchKnowledge(`medicamento ${medicationName} indicaciones efectos`, 3)
  const docsContext = extractContextFromMatches(knowledgeResult.matches)

  let userMessage = ''
  if (docsContext) {
    userMessage = `[Información del medicamento]\n${docsContext}\n\n`
  }
  if (userContext) {
    userMessage += `[Datos del paciente]\n${userContext}\n\n`
  }
  userMessage += `Dame un tip breve y útil para la ${contextLabel}, sin cambiar el tratamiento. ` +
    `Medicamento: "${medicationName}". ${dosePart} ${timePart} ${instructionsPart} ${statusPart}`.trim()

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
              'Responde en MAXIMO 2 FRASES MUY CORTAS (máximo 6 palabras cada una). ' +
              'Sé práctico y concreto. NUNCA des indicaciones médicas ni cambies dosis. ' +
              'Ejemplos: "Tomalo con el desayuno" o "No lo tomes con leche"' +
              buildTrustedHealthSourcesInstruction(),
          },
          { role: 'user', content: userMessage },
        ],
        max_tokens: 120,
        temperature: 0.5,
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
