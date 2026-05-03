'use client'

import { useRouter } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { MedicalBackgroundCard } from '@/components/medical-background-card'
import { api } from '@/lib/api'
import type { MedicalBackground } from '@/lib/api'

export default function MedicalBackgroundPage() {
  const router = useRouter()

  const handleUpdate = async (data: MedicalBackground) => {
    await api.updateMedicalBackground(data)
  }

  return (
    <div className="px-4 py-6 md:px-8 md:py-8 max-w-3xl mx-auto">
      <div className="mb-6">
        <Button
          variant="ghost"
          className="gap-2 mb-4 -ml-2"
          onClick={() => router.push('/dashboard')}
        >
          <ArrowLeft className="h-5 w-5" />
          Volver al Dashboard
        </Button>
        <h1 className="text-2xl md:text-3xl font-bold text-primary">Antecedentes Médicos</h1>
        <p className="text-muted-foreground mt-1">
          Información completa sobre tu historial de salud
        </p>
      </div>

      <MedicalBackgroundCard editable onUpdate={handleUpdate} />
    </div>
  )
}