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

type LanguageCode = "en-IN" | "hi-IN"

interface UseSpeechToTextOptions {
  language?: LanguageCode
  onResult?: (text: string) => void
  onError?: (message: string) => void
}

export function useSpeechToText(optionsOrLanguage: UseSpeechToTextOptions | LanguageCode = "hi-IN") {
  const options: UseSpeechToTextOptions =
    typeof optionsOrLanguage === "string" ? { language: optionsOrLanguage } : optionsOrLanguage
  const language = options.language ?? "hi-IN"
  const recognitionRef = useRef<SpeechRecognitionLike | null>(null)
  const [isListening, setIsListening] = useState(false)
  const [interimText, setInterimText] = useState("")
  const [transcript, setTranscript] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [isFallbackToTyping, setIsFallbackToTyping] = useState(false)
  const finalTextRef = useRef("")

  const startListening = async () => {
    if (isListening) return
    setError(null)
    setIsFallbackToTyping(false)
    setInterimText("")
    setTranscript("")
    finalTextRef.current = ""
    const win = window as any
    const Speech = win.SpeechRecognition || win.webkitSpeechRecognition
    if (!Speech) {
      const message = "Speech recognition not supported. Please type manually."
      setError(message)
      setIsFallbackToTyping(true)
      options.onError?.(message)
      return
    }
    // Best-effort mic warmup. Do not hard-fail here because SpeechRecognition may still work.
    try {
      if (navigator?.mediaDevices?.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
        stream.getTracks().forEach((track) => track.stop())
      }
    } catch {
      // no-op: continue and let SpeechRecognition provide actionable error
    }
    const recognition = new Speech()
    recognition.lang = language
    recognition.interimResults = true
    recognition.continuous = true
    recognition.onresult = (event: any) => {
      let interim = ""
      for (let i = event.resultIndex; i < event.results.length; i += 1) {
        const segment = String(event.results[i]?.[0]?.transcript || "").trim()
        if (!segment) continue
        if (event.results[i].isFinal) {
          finalTextRef.current = `${finalTextRef.current} ${segment}`.trim()
        } else {
          interim = `${interim} ${segment}`.trim()
        }
      }
      setInterimText(interim)
      const merged = `${finalTextRef.current} ${interim}`.trim()
      setTranscript(merged)
      if (merged) options.onResult?.(merged)
    }
    recognition.onerror = (event: any) => {
      const err = String(event?.error || "").toLowerCase()
      let message = "Voice capture failed"
      if (err === "no-speech") {
        message = "No speech detected. Please try again."
      } else if (err === "network") {
        message = "Network issue while capturing voice. Please retry."
      } else if (err === "not-allowed" || err === "service-not-allowed") {
        message = "Microphone permission blocked. Please allow mic access in browser settings."
      } else if (err) {
        message = err
      }
      setError(message)
      setIsListening(false)
      setIsFallbackToTyping(err === "not-allowed" || err === "service-not-allowed")
      options.onError?.(message)
    }
    recognition.onend = () => {
      setIsListening(false)
      recognitionRef.current = null
    }
    try {
      recognition.start()
      recognitionRef.current = recognition
      setIsListening(true)
    } catch {
      const message = "Voice capture could not start. Please retry."
      setError(message)
      setIsFallbackToTyping(false)
      setIsListening(false)
      options.onError?.(message)
    }
  }

  const stopListening = () => {
    recognitionRef.current?.stop()
    setIsListening(false)
  }

  const resetTranscript = () => {
    setInterimText("")
    setTranscript("")
    finalTextRef.current = ""
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
    transcript,
    error,
    isFallbackToTyping,
    isSupported: typeof window !== "undefined" && Boolean((window as any).SpeechRecognition || (window as any).webkitSpeechRecognition),
    startListening,
    stopListening,
    resetTranscript,
    transcribeAudioFile,
  }
}
