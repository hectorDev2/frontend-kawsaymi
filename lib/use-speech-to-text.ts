'use client'

import { useState, useCallback, useRef } from 'react'

interface UseSpeechToTextReturn {
  isListening: boolean
  transcript: string
  error: string | null
  start: () => void
  stop: () => void
  supported: boolean
}

export function useSpeechToText(): UseSpeechToTextReturn {
  const [isListening, setIsListening] = useState(false)
  const [transcript, setTranscript] = useState('')
  const [error, setError] = useState<string | null>(null)

  const recognitionRef = useRef<SpeechRecognition | null>(null)

  const supported = typeof window !== 'undefined' && ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window)

  const start = useCallback(() => {
    if (!supported) {
      setError('Tu navegador no soporta reconocimiento de voz.')
      return
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    const recognition = new SpeechRecognition()
    recognition.lang = 'es-PE'
    recognition.continuous = false
    recognition.interimResults = false

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      const text = event.results[0][0].transcript
      setTranscript(text)
      setIsListening(false)
      setError(null)
    }

    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      setError(event.error === 'not-allowed' ? 'Permiso de micrófono denegado.' : `Error: ${event.error}`)
      setIsListening(false)
    }

    recognition.onend = () => {
      setIsListening(false)
    }

    recognitionRef.current = recognition
    setTranscript('')
    setError(null)
    setIsListening(true)
    recognition.start()
  }, [supported])

  const stop = useCallback(() => {
    recognitionRef.current?.stop()
    setIsListening(false)
  }, [])

  return { isListening, transcript, error, start, stop, supported }
}
