'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { ScrollArea } from '@/components/ui/scroll-area'

const CONSENT_TEXT = `Tengo conocimiento y autorizo el tratamiento de mis datos personales y datos sensibles relacionados con mi salud (incluyendo antecedentes médicos, alergias, medicamentos, vacunas y hábitos de vida), los cuales serán utilizados únicamente con fines informativos, educativos y de apoyo al autocuidado.

Entiendo que las sugerencias generadas por la inteligencia artificial no constituyen diagnóstico médico ni reemplazan la consulta con un profesional de la salud.

Reconozco que:
- Las recomendaciones son solo sugerencias.
- Puedo decidir qué información registrar y cuál no.
- Siempre debo seguir las indicaciones de mi médico tratante.
- Puedo retirar mi consentimiento en cualquier momento.

Declaro haber sido informado(a) sobre mis derechos conforme a la Ley N.º 29733 (Ley de Protección de Datos Personales) y el Reglamento de IA aprobado por el Decreto Supremo N.º 115-2025-PCM.`

export default function ConsentPage() {
  const router = useRouter()
  const [accepted, setAccepted] = useState(false)

  return (
    <div className="min-h-screen bg-muted/30 flex flex-col md:items-center md:justify-center md:py-8 md:px-4">
      <div className="flex flex-col w-full md:max-w-md md:rounded-2xl md:overflow-hidden md:shadow-lg md:border md:border-border">

        {/* Brand header */}
        <div className="gradient-brand px-6 pt-14 pb-16 md:pt-10 md:pb-14 text-center text-white">
          <div className="w-20 h-20 bg-white rounded-2xl shadow-sm flex items-center justify-center mx-auto mb-4">
            <Image src="/logo.png" alt="Kawsaymi Care" width={65} height={65} className="object-contain" />
          </div>
          <h1 className="text-2xl font-bold">Kawsaymi Care</h1>
          <p className="text-white/80 mt-1">Cuidando tu salud, paso a paso</p>
        </div>

        {/* Content */}
        <div className="-mt-5 bg-background rounded-t-3xl md:rounded-none md:mt-0 px-6 pt-8 pb-10 md:px-8 flex flex-col gap-6">
          <div>
            <h2 className="text-2xl font-bold mb-1">Consentimiento Informado</h2>
            <p className="text-muted-foreground text-sm">Leé el siguiente documento antes de continuar</p>
          </div>

          <ScrollArea className="h-64 md:h-72 rounded-xl border bg-muted/30 p-4">
            <p className="text-sm leading-relaxed whitespace-pre-line">{CONSENT_TEXT}</p>
          </ScrollArea>

          <div className="flex items-start gap-3">
            <Checkbox
              id="consent"
              checked={accepted}
              onCheckedChange={(v) => setAccepted(v === true)}
              className="mt-0.5"
            />
            <label htmlFor="consent" className="text-sm leading-relaxed cursor-pointer">
              Acepto el consentimiento informado
            </label>
          </div>

          <Button
            onClick={() => router.push('/dashboard')}
            disabled={!accepted}
            className="w-full h-12 font-semibold rounded-xl"
          >
            Continuar
          </Button>
        </div>

      </div>
    </div>
  )
}
