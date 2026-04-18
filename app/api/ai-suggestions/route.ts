import { NextRequest, NextResponse } from 'next/server'

const GROQ_API_KEY = process.env.GROQ_API_KEY
const GROQ_URL = 'https://api.groq.com/openai/v1/chat/completions'
const MODEL = 'llama-3.1-8b-instant'

export async function POST(req: NextRequest) {
  if (!GROQ_API_KEY) {
    return NextResponse.json({ error: 'AI no configurada' }, { status: 503 })
  }

  const { medicationName, dose, conditions } = await req.json()

  if (!medicationName) {
    return NextResponse.json({ error: 'Falta nombre del medicamento' }, { status: 400 })
  }

  const contextParts = [
    dose && `Dosis: ${dose}`,
    conditions?.length && `Condiciones del paciente: ${conditions.join(', ')}`,
  ].filter(Boolean).join('. ')

  const userMessage = `Dame instrucciones simples para tomar "${medicationName}"${contextParts ? `. ${contextParts}` : ''}.`

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
              'Sos un farmacéutico clínico que explica medicamentos a adultos mayores en Argentina. ' +
              'Respondé SOLO con 1-2 oraciones cortas en español rioplatense, sin tecnicismos ni markdown. ' +
              'Ejemplo: "Tomalo con el desayuno para evitar molestias. Si olvidás una dosis, tomalá en cuanto te acordés."',
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
