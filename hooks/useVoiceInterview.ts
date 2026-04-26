"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { speakText } from "@/lib/speech"
import { startListening } from "@/utils/stt"

type VoiceRole = "assistant" | "user"

export interface VoiceMessage {
  role: VoiceRole
  content: string
}

export function useVoiceInterview(defaultLanguage: "en-US" | "hi-IN" = "en-US") {
  const [isListening, setIsListening] = useState(false)
  const [isAISpeaking, setIsAISpeaking] = useState(false)
  const [isInterviewActive, setIsInterviewActive] = useState(false)
  const [currentQuestion, setCurrentQuestion] = useState("")
  const [conversationHistory, setConversationHistory] = useState<VoiceMessage[]>([])
  const [error, setError] = useState<string | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const stopListeningRef = useRef<(() => void) | null>(null)
  const isLoopRunningRef = useRef(false)
  const historyRef = useRef<VoiceMessage[]>([])
  const MAX_HISTORY = 10

  const pushHistory = useCallback((updater: (prev: VoiceMessage[]) => VoiceMessage[]) => {
    setConversationHistory((prev) => updater(prev).slice(-MAX_HISTORY))
  }, [])

  useEffect(() => {
    historyRef.current = conversationHistory
  }, [conversationHistory])

  const speakAndWait = useCallback(
    async (text: string) => {
      await new Promise<void>((resolve) => {
        setIsAISpeaking(true)
        setIsListening(false)
        stopListeningRef.current?.()
        stopListeningRef.current = null
        void speakText(text, {
          lang: defaultLanguage === "hi-IN" ? "hi" : "en",
          onEnd: () => {
            setIsAISpeaking(false)
            resolve()
          },
          onError: () => {
            setIsAISpeaking(false)
            resolve()
          },
        })
      })
    },
    [defaultLanguage],
  )

  const fetchAIResponse = useCallback(async (answer: string, history: VoiceMessage[]) => {
    const response = await fetch("/api/ai-interview", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        answer,
        history,
        language: defaultLanguage,
      }),
    })
    if (!response.ok) throw new Error("Failed to get AI response.")
    const data = (await response.json()) as { reply?: string }
    return String(data.reply || "").trim()
  }, [defaultLanguage])

  const stopInterview = useCallback(() => {
    setIsInterviewActive(false)
    setIsListening(false)
    setIsAISpeaking(false)
    setIsProcessing(false)
    isLoopRunningRef.current = false
    stopListeningRef.current?.()
    stopListeningRef.current = null
  }, [])

  const startUserListening = useCallback(() => {
    if (isLoopRunningRef.current || isAISpeaking || !isInterviewActive) return
    isLoopRunningRef.current = true
    setIsListening(true)
    setError(null)
    stopListeningRef.current = startListening(
      async (userText) => {
        const clean = userText.trim()
        setIsListening(false)
        if (!clean) {
          setError("I did not catch that, please repeat.")
          isLoopRunningRef.current = false
          if (isInterviewActive) startUserListening()
          return
        }
        setIsProcessing(true)
        pushHistory((prev) => [...prev, { role: "user", content: clean }])
        try {
          const historySnapshot = [...historyRef.current, { role: "user" as const, content: clean }]
          const aiReply = await fetchAIResponse(clean, historySnapshot)
          const finalReply = aiReply || "Can you please elaborate on that answer?"
          setCurrentQuestion(finalReply)
          pushHistory((prev) => [...prev, { role: "assistant", content: finalReply }])
          await speakAndWait(finalReply)
        } catch (err: any) {
          setError(String(err?.message || "Could not process your answer."))
          await speakAndWait("I did not catch that, please repeat.")
        } finally {
          setIsProcessing(false)
          isLoopRunningRef.current = false
          if (isInterviewActive) startUserListening()
        }
      },
      {
        lang: defaultLanguage,
        onError: async (message) => {
          setIsListening(false)
          setError(message)
          isLoopRunningRef.current = false
          if (!isInterviewActive) return
          if (message.toLowerCase().includes("permission denied")) return
          await speakAndWait("I did not catch that, please repeat.")
          if (isInterviewActive) startUserListening()
        },
      },
    )
  }, [defaultLanguage, fetchAIResponse, isAISpeaking, isInterviewActive, speakAndWait])

  const startInterview = useCallback(async () => {
    if (isInterviewActive) return
    setIsInterviewActive(true)
    setError(null)
    const firstQuestion = defaultLanguage === "hi-IN" ? "कृपया अपने बारे में बताइए।" : "Tell me about yourself."
    setCurrentQuestion(firstQuestion)
    setConversationHistory([{ role: "assistant" as const, content: firstQuestion }].slice(-MAX_HISTORY))
    await speakAndWait(firstQuestion)
    if (!isLoopRunningRef.current) startUserListening()
  }, [MAX_HISTORY, defaultLanguage, isInterviewActive, speakAndWait, startUserListening])

  const toggleListening = useCallback(() => {
    if (isAISpeaking || !isInterviewActive) return
    if (isListening) {
      stopListeningRef.current?.()
      stopListeningRef.current = null
      isLoopRunningRef.current = false
      setIsListening(false)
      return
    }
    startUserListening()
  }, [isAISpeaking, isInterviewActive, isListening, startUserListening])

  return {
    isListening,
    isAISpeaking,
    isInterviewActive,
    isProcessing,
    currentQuestion,
    conversationHistory,
    error,
    startInterview,
    stopInterview,
    toggleListening,
    startUserListening,
    speakAndWait,
  }
}
