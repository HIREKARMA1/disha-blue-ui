"use client"

import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { getVapiAssistantId, getVapiPublicKey, isVapiConfiguredForFeature, type VapiFeature } from "@/lib/vapi"

type TranscriptRole = "user" | "assistant"

interface VapiTranscriptEvent {
  role: TranscriptRole
  text: string
}

interface UseVapiCallOptions {
  feature: VapiFeature
  onTranscript?: (event: VapiTranscriptEvent) => void
  onError?: (message: string) => void
}

const readText = (payload: any): string => {
  if (!payload) return ""
  if (typeof payload === "string") return payload
  if (typeof payload.transcript === "string") return payload.transcript
  if (typeof payload.text === "string") return payload.text
  if (typeof payload.message === "string") return payload.message
  return ""
}

const buildVapiErrorMessage = (err: any): string => {
  const status = err?.statusCode || err?.status || err?.response?.status
  const rawMessage =
    err?.response?.data?.message ||
    err?.response?.data?.error ||
    err?.message ||
    "Failed to start Vapi call."
  const base = String(rawMessage).trim()
  if (Number(status) === 400) {
    return `${base} (400). Check Vapi public key, assistant id, and assistant web-call configuration.`
  }
  return status ? `${base} (${status})` : base
}

export function useVapiCall({ feature, onTranscript, onError }: UseVapiCallOptions) {
  const [isConnected, setIsConnected] = useState(false)
  const [isAiSpeaking, setIsAiSpeaking] = useState(false)
  const [isStarting, setIsStarting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const vapiRef = useRef<any>(null)

  const isConfigured = useMemo(() => isVapiConfiguredForFeature(feature), [feature])

  const stop = useCallback(async () => {
    try {
      await vapiRef.current?.stop?.()
    } catch {
      // no-op
    } finally {
      setIsConnected(false)
      setIsAiSpeaking(false)
      setIsStarting(false)
    }
  }, [])

  const start = useCallback(async () => {
    const publicKey = getVapiPublicKey()
    const assistantId = getVapiAssistantId(feature)
    if (!publicKey || !assistantId) {
      const message = "Vapi is not configured. Set NEXT_PUBLIC_VAPI_PUBLIC_KEY and assistant id env vars."
      setError(message)
      onError?.(message)
      return false
    }
    if (isStarting || isConnected) return true

    setError(null)
    setIsStarting(true)
    try {
      if (!vapiRef.current) {
        const mod = await import("@vapi-ai/web")
        const VapiCtor = (mod as any).default
        vapiRef.current = new VapiCtor(publicKey)
      }
      await vapiRef.current.start(assistantId)
      return true
    } catch (err: any) {
      console.error("Vapi start error payload:", err)
      const message = buildVapiErrorMessage(err)
      setError(message)
      onError?.(message)
      setIsConnected(false)
      return false
    } finally {
      setIsStarting(false)
    }
  }, [feature, isConnected, isStarting, onError])

  useEffect(() => {
    if (!vapiRef.current) return
    return
  }, [])

  useEffect(() => {
    if (!isConfigured) return

    let disposed = false
    let cleanup: (() => void) | null = null
    ;(async () => {
      if (disposed) return
      const publicKey = getVapiPublicKey()
      if (!publicKey) return
      if (!vapiRef.current) {
        const mod = await import("@vapi-ai/web")
        const VapiCtor = (mod as any).default
        vapiRef.current = new VapiCtor(publicKey)
      }
      const vapi = vapiRef.current

      const onCallStart = () => setIsConnected(true)
      const onCallEnd = () => {
        setIsConnected(false)
        setIsAiSpeaking(false)
      }
      const onSpeechStart = () => setIsAiSpeaking(true)
      const onSpeechEnd = () => setIsAiSpeaking(false)
      const onMessage = (payload: any) => {
        const kind = String(payload?.type || "").toLowerCase()
        if (kind !== "transcript") return
        const roleRaw = String(payload?.role || payload?.speaker || "").toLowerCase()
        const role: TranscriptRole = roleRaw === "assistant" || roleRaw === "bot" ? "assistant" : "user"
        const text = readText(payload).trim()
        if (!text) return
        onTranscript?.({ role, text })
      }
      const onErrorEvent = (payload: any) => {
        console.error("Vapi runtime error payload:", payload)
        const message = readText(payload).trim() || "Vapi call error. Verify key + assistant settings in Vapi dashboard."
        setError(message)
        onError?.(message)
      }

      vapi.on("call-start", onCallStart)
      vapi.on("call-end", onCallEnd)
      vapi.on("speech-start", onSpeechStart)
      vapi.on("speech-end", onSpeechEnd)
      vapi.on("message", onMessage)
      vapi.on("error", onErrorEvent)

      cleanup = () => {
        vapi.off("call-start", onCallStart)
        vapi.off("call-end", onCallEnd)
        vapi.off("speech-start", onSpeechStart)
        vapi.off("speech-end", onSpeechEnd)
        vapi.off("message", onMessage)
        vapi.off("error", onErrorEvent)
      }
    })()

    return () => {
      disposed = true
      cleanup?.()
    }
  }, [isConfigured, onError, onTranscript])

  useEffect(() => {
    return () => {
      void stop()
    }
  }, [stop])

  return {
    isConfigured,
    isConnected,
    isAiSpeaking,
    isStarting,
    error,
    start,
    stop,
  }
}
