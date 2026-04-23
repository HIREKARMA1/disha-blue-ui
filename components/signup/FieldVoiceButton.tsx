"use client"

import { Mic, Square } from "lucide-react"
import { useEffect, useState } from "react"
import { getSignupLanguage } from "@/components/signup/LanguageSwitcher"
import { useSpeechToText } from "@/hooks/useSpeechToText"
import { parseVoiceText } from "@/lib/onboarding"

type VoiceFieldType = "name" | "phone" | "location" | "skills" | "education" | "experience"

interface FieldVoiceButtonProps {
  fieldType: VoiceFieldType
  onParsed: (payload: { rawText: string; translatedText: string; parsed: Record<string, any> }) => void
  ariaLabel: string
}

export function FieldVoiceButton({ fieldType, onParsed, ariaLabel }: FieldVoiceButtonProps) {
  const [selectedLanguage, setSelectedLanguage] = useState<"en" | "hi">("en")
  const [localError, setLocalError] = useState<string | null>(null)
  const [isParsing, setIsParsing] = useState(false)
  const { isListening, transcript, error, startListening, stopListening, resetTranscript, isFallbackToTyping } = useSpeechToText(
    selectedLanguage === "hi" ? "hi-IN" : "en-IN"
  )

  useEffect(() => {
    setSelectedLanguage(getSignupLanguage())
    const onLanguageChange = () => setSelectedLanguage(getSignupLanguage())
    window.addEventListener("hk_language_changed", onLanguageChange as EventListener)
    window.addEventListener("storage", onLanguageChange)
    return () => {
      window.removeEventListener("hk_language_changed", onLanguageChange as EventListener)
      window.removeEventListener("storage", onLanguageChange)
    }
  }, [])

  const onClick = async () => {
    if (!isListening) {
      setLocalError(null)
      resetTranscript()
      await startListening()
      return
    }
    stopListening()
    await new Promise((resolve) => window.setTimeout(resolve, 220))
    const text = transcript.trim()
    if (!text) return
    setIsParsing(true)
    try {
      const response = await parseVoiceText(text, fieldType)
      onParsed({
        rawText: text,
        translatedText: String(response.translated_text || text),
        parsed: response.parsed || {},
      })
    } catch {
      setLocalError("Could not parse voice input. Please try again.")
    } finally {
      setIsParsing(false)
    }
  }

  return (
    <div className="space-y-1">
      <button
        type="button"
        onClick={() => void onClick()}
        className={`inline-flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-md transition-all duration-200 ease-in-out hover:bg-primary/90 ${isListening ? "animate-pulse ring-4 ring-primary/20" : ""}`}
        aria-label={ariaLabel}
        title={`Voice input (${selectedLanguage === "hi" ? "Hindi/English" : "English/Hindi"})`}
      >
        {isListening ? <Square className="h-3.5 w-3.5" /> : <Mic className="h-3.5 w-3.5" />}
      </button>
      {(isParsing || localError || error || isFallbackToTyping) && (
        <p className="text-[11px] text-muted-foreground">
          {isParsing ? "Parsing voice..." : localError || error || (isFallbackToTyping ? "Voice unavailable, please type." : "")}
        </p>
      )}
    </div>
  )
}
