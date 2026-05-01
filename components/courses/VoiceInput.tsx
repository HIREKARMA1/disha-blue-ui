"use client"

import { Mic, Square } from "lucide-react"
import { Button } from "@/components/ui/button"

interface VoiceInputProps {
  isListening: boolean
  onStart: () => void
  onStop: () => void
  disabled?: boolean
}

export function VoiceInput({ isListening, onStart, onStop, disabled = false }: VoiceInputProps) {
  return (
    <Button
      type="button"
      disabled={disabled}
      onClick={isListening ? onStop : onStart}
      className="rounded-xl bg-sage-deep text-white hover:bg-sage-deep/90 dark:bg-emerald-600 dark:hover:bg-emerald-500"
      aria-label={isListening ? "Stop voice input" : "Start voice input"}
    >
      {isListening ? <Square className="mr-2 h-4 w-4" /> : <Mic className="mr-2 h-4 w-4" />}
      {isListening ? "Listening..." : "Speak"}
    </Button>
  )
}
