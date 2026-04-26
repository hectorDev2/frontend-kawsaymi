import { NextRequest, NextResponse } from 'next/server'
import { buildTrustedHealthSourcesInstruction } from '@/lib/trusted-health-sources'

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
  const scheduledTime = (body?.scheduledTime ?? '').toString().trim() // ISO preferred
  const eventStatus = (body?.eventStatus ?? 'PENDING').toString().trim().toUpperCase()
  const instructions = (body?.instructions ?? '').toString().trim()
  const contextLabel = (body?.contextLabel ?? 'toma de hoy').toString().trim()

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

  const userMessage =
    `Dame un tip breve y útil para la ${contextLabel}, sin cambiar el tratamiento. ` +
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
              'Eres un acompañante de salud que ayuda a adultos mayores a resolver la toma actual de sus medicamentos. ' +
              'Responde SOLO con 1-2 oraciones cortas en español neutro, sin tecnicismos ni markdown. ' +
              'No des indicaciones médicas específicas ni cambies dosis; enfócate en la toma actual, hábitos y recordatorios simples. ' +
              'La respuesta debe servir para la dosis de hoy y mencionar, si ayuda, la hora o la rutina inmediata. ' +
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
