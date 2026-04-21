"use client"

import { useRef, useState } from "react"
import { apiClient } from "@/lib/api"

type SpeechRecognitionLike = {
  lang: string
  interimResults: boolean
  continuous?: boolean
  onresult: ((event: any) => void) | null
  onerror: ((event: any) => void) | null
  onend: (() => void) | null
  start: () => void
  stop: () => void
}

export function useSpeechToText(language: "en-IN" | "hi-IN" = "hi-IN") {
  const recognitionRef = useRef<SpeechRecognitionLike | null>(null)
  const [isListening, setIsListening] = useState(false)
  const [interimText, setInterimText] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [isFallbackToTyping, setIsFallbackToTyping] = useState(false)

  const startListening = () => {
    setError(null)
    const win = window as any
    const Speech = win.SpeechRecognition || win.webkitSpeechRecognition
    if (!Speech) {
      setError("Speech recognition not supported. Please type manually.")
      setIsFallbackToTyping(true)
      return
    }
    const recognition = new Speech()
    recognition.lang = language
    recognition.interimResults = true
    recognition.continuous = true
    recognition.onresult = (event: any) => {
      const text = Array.from(event.results)
        .map((result: any) => result[0]?.transcript || "")
        .join(" ")
      setInterimText(text)
    }
    recognition.onerror = (event: any) => {
      setError(event?.error || "Voice capture failed")
      setIsListening(false)
      setIsFallbackToTyping(true)
    }
    recognition.onend = () => setIsListening(false)
    recognition.start()
    recognitionRef.current = recognition
    setIsListening(true)
  }

  const stopListening = () => {
    recognitionRef.current?.stop()
    setIsListening(false)
  }

  const transcribeAudioFile = async (file: File): Promise<string> => {
    const formData = new FormData()
    formData.append("file", file)
    formData.append("language", language === "hi-IN" ? "hi" : "en")
    const response = await apiClient.client.post("/onboarding/speech-to-text", formData)
    return response.data?.translated_text || response.data?.original_text || ""
  }

  return {
    isListening,
    interimText,
    error,
    isFallbackToTyping,
    startListening,
    stopListening,
    transcribeAudioFile,
  }
}
