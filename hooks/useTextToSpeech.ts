"use client"

import { useEffect, useMemo, useState } from "react"

type SupportedLanguage = "en" | "hi"

const localeByLanguage: Record<SupportedLanguage, string> = {
  en: "en-IN",
  hi: "hi-IN",
}

export function useTextToSpeech(language: SupportedLanguage) {
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [isSupported, setIsSupported] = useState(false)

  const resolvedLocale = useMemo(() => localeByLanguage[language], [language])

  useEffect(() => {
    setIsSupported(typeof window !== "undefined" && "speechSynthesis" in window)
    return () => {
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        window.speechSynthesis.cancel()
      }
    }
  }, [])

  const pickVoice = () => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return null
    const voices = window.speechSynthesis.getVoices()
    if (!voices.length) return null
    return (
      voices.find((voice) => voice.lang.toLowerCase().startsWith(resolvedLocale.toLowerCase())) ??
      voices.find((voice) => voice.lang.toLowerCase().startsWith(language)) ??
      voices[0]
    )
  }

  const speak = (text: string) => {
    if (!text?.trim() || !isSupported) return
    window.speechSynthesis.cancel()
    const utterance = new SpeechSynthesisUtterance(text)
    utterance.lang = resolvedLocale
    const voice = pickVoice()
    if (voice) utterance.voice = voice
    utterance.rate = 1
    utterance.pitch = 1
    utterance.onstart = () => setIsSpeaking(true)
    utterance.onend = () => setIsSpeaking(false)
    utterance.onerror = () => setIsSpeaking(false)
    window.speechSynthesis.speak(utterance)
  }

  const stop = () => {
    if (!isSupported) return
    window.speechSynthesis.cancel()
    setIsSpeaking(false)
  }

  return {
    isSupported,
    isSpeaking,
    speak,
    stop,
  }
}
