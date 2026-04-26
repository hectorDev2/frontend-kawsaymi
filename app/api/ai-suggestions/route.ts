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
  const conditions = Array.isArray(body?.conditions)
    ? body.conditions.map((value: unknown) => String(value).trim()).filter(Boolean)
    : []
  const intent = (body?.intent ?? 'instructions').toString().trim()
  const userContext = (body?.userContext ?? '').toString().trim()

  if (!medicationName) {
    return NextResponse.json({ error: 'Falta nombre del medicamento' }, { status: 400 })
  }

  const contextParts = [
    dose && `Dosis: ${dose}`,
    conditions.length && `Condiciones del paciente: ${conditions.join(', ')}`,
  ].filter(Boolean).join('. ')

  const contextPrefix = userContext ? `${userContext}\n\n` : ''
  const userMessage =
    intent === 'card-tip'
      ? `${contextPrefix}Dame una sugerencia breve y útil para tomar "${medicationName}"${contextParts ? `. ${contextParts}` : ''}. ` +
        'Formato estricto: 1) Cómo tomarlo: ... 2) Con qué tomarlo: ... 3) Precaución: ...'
      : `${contextPrefix}Dame instrucciones simples para tomar "${medicationName}"${contextParts ? `. ${contextParts}` : ''}.`

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
              'Eres un farmacéutico clínico que explica medicamentos a adultos mayores. ' +
              'Responde SOLO con 1-2 oraciones cortas en español neutro, sin tecnicismos ni markdown. ' +
              'Explicá cómo tomar el medicamento y una precaución básica, sin cambiar dosis ni tratamiento. ' +
              'Si el dato no es seguro o depende del caso clínico, aclaralo con prudencia. ' +
              'Ejemplo: "Tómalo con el desayuno para evitar molestias. Si olvidas una dosis, tómala en cuanto lo recuerdes." ' +
              buildTrustedHealthSourcesInstruction(),
          },
          { role: 'user', content: userMessage },
        ],
        max_tokens: 150,
        temperature: 0.4,
      }),
    })

    if (!res.ok) {
      const err = await res.text()
      console.error('Groq error:', res.status, err)
      return NextResponse.json({ error: 'Error de IA' }, { status: 502 })
    }

    const data = await res.json()
    const text = data?.choices?.[0]?.message?.content?.trim() ?? ''

    return NextResponse.json({ suggestion: text })
  } catch (e) {
    console.error('AI fetch failed:', e)
    return NextResponse.json({ error: 'Error de conexión' }, { status: 500 })
  }
}
