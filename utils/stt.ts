"use client"

type SpeechRecognitionLike = {
  lang: string
  interimResults: boolean
  continuous: boolean
  onresult: ((event: any) => void) | null
  onerror: ((event: any) => void) | null
  onend: (() => void) | null
  start: () => void
  stop: () => void
}

export interface StartListeningOptions {
  lang?: "en-US" | "hi-IN"
  onError?: (message: string) => void
  onEnd?: () => void
}

export function startListening(onResult: (transcript: string) => void, options?: StartListeningOptions) {
  if (typeof window === "undefined") {
    options?.onError?.("Speech recognition is not available on the server.")
    return () => {}
  }

  const SpeechRecognitionCtor = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
  if (!SpeechRecognitionCtor) {
    options?.onError?.("This browser does not support speech recognition.")
    return () => {}
  }

  const recognition = new SpeechRecognitionCtor() as SpeechRecognitionLike
  recognition.lang = options?.lang || "en-US"
  recognition.interimResults = false
  recognition.continuous = false

  let hasFinalResult = false

  recognition.onresult = (event: any) => {
    const transcript = String(event?.results?.[0]?.[0]?.transcript || "").trim()
    if (!transcript) {
      options?.onError?.("Empty transcript. Please repeat your answer.")
      return
    }
    hasFinalResult = true
    onResult(transcript)
  }

  recognition.onerror = (event: any) => {
    const code = String(event?.error || "unknown")
    if (code === "no-speech") options?.onError?.("No speech detected. Please repeat.")
    else if (code === "not-allowed" || code === "service-not-allowed") options?.onError?.("Microphone permission denied.")
    else options?.onError?.(`Speech recognition error: ${code}`)
  }

  recognition.onend = () => {
    if (!hasFinalResult) options?.onError?.("I did not catch that, please repeat.")
    options?.onEnd?.()
  }

  try {
    recognition.start()
  } catch {
    options?.onError?.("Unable to start microphone. Please try again.")
  }

  return () => {
    try {
      recognition.stop()
    } catch {
      // Browser may throw if recognition is already stopped.
    }
  }
}
