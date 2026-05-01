"use client"

import { Mic, Square } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useSpeechToText } from "@/hooks/useSpeechToText"
import { parseVoiceText } from "@/lib/onboarding"
import { useEffect, useState } from "react"
import { getSignupLanguage } from "@/components/signup/LanguageSwitcher"

interface VoiceInputProps {
  label: string
  onTranscript: (text: string) => void
  onParsedSuggestions?: (parsed: Record<string, any>) => void
  fieldType?: "name" | "skills" | "education" | "experience" | "general"
}

export function VoiceInput({ label, onTranscript, onParsedSuggestions, fieldType = "general" }: VoiceInputProps) {
  const [selectedLanguage, setSelectedLanguage] = useState<"en" | "hi">("en")
  const { isListening, transcript, error, isFallbackToTyping, startListening, stopListening, resetTranscript } = useSpeechToText(
    selectedLanguage === "hi" ? "hi-IN" : "en-IN"
  )
  const [chips, setChips] = useState<string[]>([])
  const [parsing, setParsing] = useState(false)
  const [detectedFromVoice, setDetectedFromVoice] = useState(false)
  const [displayText, setDisplayText] = useState("")
  const [suggestedText, setSuggestedText] = useState("")
  const [editableSuggestion, setEditableSuggestion] = useState("")
  const [isEditingSuggestion, setIsEditingSuggestion] = useState(false)

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

  const handleStop = async () => {
    stopListening()
    await new Promise((resolve) => window.setTimeout(resolve, 220))
    const finalText = transcript.trim()
    if (finalText) {
      setParsing(true)
      try {
        const response = await parseVoiceText(finalText, fieldType)
        const parsedName = String(response.parsed?.name || "").trim()
        const translatedText = (response.translated_text || finalText).trim()
        if (fieldType === "name") {
          console.log("FORCED NAME:", response.parsed?.name)
          const safeName = parsedName || String(response.translated_text || "").trim()
          if (safeName && safeName.trim() !== "") {
            setDisplayText(safeName)
            setDetectedFromVoice(true)
            setSuggestedText(safeName)
            setEditableSuggestion(safeName)
            onParsedSuggestions?.({ ...(response.parsed || {}), name: safeName })
            return
          }
          setDisplayText("")
          setSuggestedText("")
          setEditableSuggestion("")
          return
        }
        const primaryText = translatedText
        setDisplayText(primaryText)
        setDetectedFromVoice(true)
        setSuggestedText(primaryText)
        setEditableSuggestion(primaryText)
        const nextChips: string[] = []
        const skills = response.parsed?.skills
        if (Array.isArray(skills)) nextChips.push(...skills)
        if (response.parsed?.education?.level) nextChips.push(response.parsed.education.level)
        if (response.parsed?.experience_years) nextChips.push(`${response.parsed.experience_years} years`)
        setChips(nextChips.slice(0, 5))
        onParsedSuggestions?.(response.parsed || {})
      } catch {
        setChips([])
      } finally {
        setParsing(false)
      }
    }
  }

  return (
    <div className="space-y-2">
      <div className="flex flex-col items-center gap-2">
        <Button
          type="button"
          className={`h-16 w-16 rounded-full bg-primary p-0 text-primary-foreground shadow-md transition-all duration-200 ease-in-out hover:scale-105 hover:bg-primary/90 ${isListening ? "animate-pulse ring-4 ring-primary/20" : ""}`}
          onClick={isListening ? handleStop : () => {
            resetTranscript()
            void startListening()
          }}
          aria-label={label}
        >
          {isListening ? <Square className="h-6 w-6" /> : <Mic className="h-7 w-7" />}
        </Button>
        <p className="text-sm font-medium">{isListening ? "Listening..." : label}</p>
      </div>
      <p className="text-xs text-muted-foreground">
        {selectedLanguage === "hi" ? "You can speak in Hindi 🎤" : "You can speak in English 🎤"}
      </p>
      {displayText && <p className="text-sm text-muted-foreground">{displayText}</p>}
      {detectedFromVoice && <p className="text-xs text-muted-foreground">(Detected from voice)</p>}
      {suggestedText && (
        <div className="space-y-2 rounded-xl border border-border bg-muted/40 p-4 transition-all duration-200 ease-in-out">
          <p className={`${fieldType === "name" ? "text-base font-semibold text-foreground" : "text-sm font-medium text-foreground"}`}>
            Is this correct?
          </p>
          {!isEditingSuggestion && <p className="text-sm text-foreground"><span className="font-semibold text-primary">{suggestedText}</span></p>}
          {isEditingSuggestion && (
            <Input
              className="rounded-xl border border-border bg-background px-4 py-3 text-base transition-all duration-200 ease-in-out focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary"
              value={editableSuggestion}
              onChange={(e) => setEditableSuggestion(e.target.value)}
              placeholder="Edit suggested text"
            />
          )}
          <div className="flex gap-2">
            <Button
              type="button"
              className={`h-11 rounded-xl bg-primary px-6 font-medium text-primary-foreground shadow-sm transition-all duration-200 ease-in-out hover:bg-primary/90 ${fieldType === "name" ? "px-5" : ""}`}
              onClick={() => {
                const accepted = (isEditingSuggestion ? editableSuggestion : suggestedText).trim()
                if (!accepted) return
                onTranscript(accepted)
                setSuggestedText("")
                setIsEditingSuggestion(false)
              }}
            >
              Confirm
            </Button>
            <Button
              type="button"
              variant="outline"
              className={`h-11 rounded-xl border border-border bg-background px-6 text-foreground transition-all duration-200 ease-in-out hover:bg-muted ${fieldType === "name" ? "px-5" : ""}`}
              onClick={() => {
                setIsEditingSuggestion(true)
              }}
            >
              Edit
            </Button>
          </div>
        </div>
      )}
      {parsing && <p className="text-xs text-muted-foreground">Parsing voice...</p>}
      {chips.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {chips.map((chip) => (
            <button
              type="button"
              key={chip}
              className="rounded-full border border-border bg-muted/40 px-3 py-1 text-xs text-foreground transition-all duration-200 ease-in-out hover:bg-muted"
              onClick={() => onTranscript(chip)}
            >
              {chip}
            </button>
          ))}
        </div>
      )}
      {error && <p className="text-sm text-red-600">{error}</p>}
      {isFallbackToTyping && <p className="text-xs text-amber-600">Voice unavailable. Please type manually. Try switching language.</p>}
    </div>
  )
}
