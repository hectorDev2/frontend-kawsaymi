'use client'

import { useState, useCallback } from 'react'

interface UseTextToSpeechReturn {
  isSpeaking: boolean
  speak: (text: string) => void
  stop: () => void
  supported: boolean
}

export function useTextToSpeech(): UseTextToSpeechReturn {
  const [isSpeaking, setIsSpeaking] = useState(false)

  const supported = typeof window !== 'undefined' && 'speechSynthesis' in window

  const speak = useCallback((text: string) => {
    if (!supported) return
    window.speechSynthesis.cancel()

    const utterance = new SpeechSynthesisUtterance(text)
    utterance.lang = 'es-PE'
    utterance.rate = 0.9
    utterance.pitch = 1

    utterance.onstart = () => setIsSpeaking(true)
    utterance.onend = () => setIsSpeaking(false)
    utterance.onerror = () => setIsSpeaking(false)

    const voices = window.speechSynthesis.getVoices()
    const spanishVoice = voices.find((v) => v.lang.startsWith('es'))
    if (spanishVoice) utterance.voice = spanishVoice

    window.speechSynthesis.speak(utterance)
  }, [supported])

  const stop = useCallback(() => {
    window.speechSynthesis.cancel()
    setIsSpeaking(false)
  }, [])

  return { isSpeaking, speak, stop, supported }
}
