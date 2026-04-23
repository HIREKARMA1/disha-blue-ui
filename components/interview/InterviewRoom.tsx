"use client"

import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { Clock3, Play, Square } from "lucide-react"
import { AIAvatar } from "./AIAvatar"
import { VideoFeed } from "./VideoFeed"
import { aiInterviewService, InterviewFeedback, InterviewLanguage, InterviewPersonality } from "@/services/aiInterviewService"

type SpeechRecognitionLike = {
  lang: string
  continuous: boolean
  interimResults: boolean
  onresult: ((event: any) => void) | null
  onerror: ((event: any) => void) | null
  onend: (() => void) | null
  start: () => void
  stop: () => void
}

interface Props {
  stream: MediaStream | null
  currentQuestion: string
  currentQuestionPreview: string
  language: InterviewLanguage
  personality: InterviewPersonality
  lastAIQuestion: string
  lastUserAnswer: string
  coachingHint: string | null
  contextHint: string | null
  responseQualityHint: string | null
  phase: "introduction" | "background_skills" | "technical_scenario" | "behavioral" | "wrap_up"
  questionType: "intro" | "technical" | "behavioral" | "scenario" | "follow_up" | "wrap_up"
  finalScore: number | null
  finalFeedback: InterviewFeedback | null
  isBusy: boolean
  isStarted: boolean
  questionIndex: number
  maxQuestions: number
  elapsedTimeLabel: string
  onStartInterview: () => void
  onEndInterview: () => void
  onSubmitTranscript: (transcript: string) => Promise<void>
  onFinalSummaryEnd?: () => void
  onError?: (message: string) => void
}

export function InterviewRoom({
  stream,
  currentQuestion,
  currentQuestionPreview,
  language,
  personality,
  lastAIQuestion,
  lastUserAnswer,
  coachingHint,
  contextHint,
  responseQualityHint,
  phase,
  questionType,
  finalScore,
  finalFeedback,
  isBusy,
  isStarted,
  questionIndex,
  maxQuestions,
  elapsedTimeLabel,
  onStartInterview,
  onEndInterview,
  onSubmitTranscript,
  onFinalSummaryEnd,
  onError,
}: Props) {
  const recognitionRef = useRef<SpeechRecognitionLike | null>(null)
  const silenceTimerRef = useRef<number | null>(null)
  const committedTranscriptRef = useRef("")
  const interimTranscriptRef = useRef("")
  const isProcessingRef = useRef(false)
  const shouldListenRef = useRef(false)
  const [isListening, setIsListening] = useState(false)
  const [isMicBlocked, setIsMicBlocked] = useState(false)
  const [isUserSpeaking, setIsUserSpeaking] = useState(false)
  const [isAISpeaking, setIsAISpeaking] = useState(false)
  const [liveTranscript, setLiveTranscript] = useState("")
  const [finalTranscript, setFinalTranscript] = useState("")
  const [isSpeechSupported, setIsSpeechSupported] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [usePremiumVoice, setUsePremiumVoice] = useState(true)
  const [availableVoices, setAvailableVoices] = useState<SpeechSynthesisVoice[]>([])
  const [aiSubtitle, setAiSubtitle] = useState("")
  const [liveMetrics, setLiveMetrics] = useState({
    fillerWordCount: 0,
    pauseCount: 0,
    avgResponseLength: 0,
    confidenceLevel: 50,
    communicationClarity: 50,
    engagementScore: 50,
    responseLength: 0,
  })
  const responseCountRef = useRef(0)
  const totalWordsRef = useRef(0)
  const responseStartAtRef = useRef<number | null>(null)
  const lastSpeechAtRef = useRef<number | null>(null)
  const lastSpokenQuestionRef = useRef("")
  const lastSpokenSentenceRef = useRef("")
  const restartListenTimerRef = useRef<number | null>(null)
  const recognitionMaxDurationTimerRef = useRef<number | null>(null)
  const premiumAudioRef = useRef<HTMLAudioElement | null>(null)
  const finalSummarySpokenRef = useRef(false)
  const isSessionActiveRef = useRef(true)
  const micPermissionWarnedRef = useRef(false)
  const premiumVoiceAllowedRef = useRef(true)

  const recognitionLang = useMemo(() => (language === "hi" ? "hi-IN" : "en-IN"), [language])
  const phaseLabelMap = useMemo(
    () => ({
      introduction: "Introduction",
      background_skills: "Background & Skills",
      technical_scenario: "Technical / Scenario",
      behavioral: "Behavioral",
      wrap_up: "Wrap-up",
    }),
    [],
  )
  const questionTypeLabelMap = useMemo(
    () => ({
      intro: "Introduction Question",
      technical: "Technical Question",
      behavioral: "Behavioral Question",
      scenario: "Scenario-Based Question",
      follow_up: "Follow-up Question",
      wrap_up: "Wrap-up Question",
    }),
    [],
  )
  const progressPercent = Math.round((Math.max(0, Math.min(questionIndex, maxQuestions)) / Math.max(1, maxQuestions)) * 100)
  useEffect(() => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return
    const loadVoices = () => {
      const voices = window.speechSynthesis.getVoices()
      setAvailableVoices(voices)
    }
    loadVoices()
    window.speechSynthesis.onvoiceschanged = () => {
      loadVoices()
    }
    return () => {
      window.speechSynthesis.onvoiceschanged = null
    }
  }, [])

  const SILENCE_MS = 2200
  const AI_START_DELAY_MS = 420
  const AI_SENTENCE_PAUSE_MS = 180
  const fillerRegex = useMemo(() => /\b(um+|uh+|like|you know|actually|basically)\b/gi, [])

  const stopListening = useCallback(() => {
    shouldListenRef.current = false
    recognitionRef.current?.stop()
    setIsListening(false)
    setIsUserSpeaking(false)
  }, [])

  const clearSilenceTimer = useCallback(() => {
    if (silenceTimerRef.current) {
      window.clearTimeout(silenceTimerRef.current)
      silenceTimerRef.current = null
    }
  }, [])

  const clearRestartListenTimer = useCallback(() => {
    if (restartListenTimerRef.current) {
      window.clearTimeout(restartListenTimerRef.current)
      restartListenTimerRef.current = null
    }
  }, [])

  const clearRecognitionMaxDurationTimer = useCallback(() => {
    if (recognitionMaxDurationTimerRef.current) {
      window.clearTimeout(recognitionMaxDurationTimerRef.current)
      recognitionMaxDurationTimerRef.current = null
    }
  }, [])

  const normalizeSpeechText = useCallback((text: string) => text.replace(/\s+/g, " ").replace(/\s+([,.!?;:])/g, "$1").trim(), [])

  const cancelAISpeech = useCallback(() => {
    if (typeof window === "undefined") return
    premiumAudioRef.current?.pause()
    if (premiumAudioRef.current) {
      premiumAudioRef.current.currentTime = 0
      premiumAudioRef.current = null
    }
    if ("speechSynthesis" in window && window.speechSynthesis.speaking) {
      window.speechSynthesis.cancel()
    }
    setIsAISpeaking(false)
  }, [])

  const submitTranscriptWithRetry = useCallback(
    async (transcript: string) => {
      if (!isSessionActiveRef.current) return false
      try {
        await onSubmitTranscript(transcript)
        return true
      } catch {
        try {
          await onSubmitTranscript(transcript)
          return true
        } catch (error: any) {
          onError?.(error?.message || "Failed to submit transcript after retry.")
          return false
        }
      }
    },
    [onSubmitTranscript, onError],
  )

  const finalizeTranscript = useCallback(async () => {
    if (!isSessionActiveRef.current) return
    clearSilenceTimer()
    const transcript = `${committedTranscriptRef.current} ${interimTranscriptRef.current}`.trim()
    if (!transcript || isProcessingRef.current) {
      if (!transcript) onError?.("No speech detected. Please speak again.")
      return
    }
    isProcessingRef.current = true
    setIsProcessing(true)
    setFinalTranscript(transcript)
    setLiveTranscript("")
    committedTranscriptRef.current = ""
    interimTranscriptRef.current = ""
    setIsUserSpeaking(false)
    shouldListenRef.current = false
    recognitionRef.current?.stop()
    const responseDurationMs = responseStartAtRef.current ? Date.now() - responseStartAtRef.current : 0
    const words = transcript.split(/\s+/).filter(Boolean)
    const responseLength = words.length
    const fillers = transcript.match(fillerRegex)?.length ?? 0
    responseCountRef.current += 1
    totalWordsRef.current += responseLength
    const avgResponseLength = Math.round(totalWordsRef.current / responseCountRef.current)
    const confidenceRaw = Math.max(0, Math.min(100, 45 + responseLength * 1.2 - fillers * 4 - liveMetrics.pauseCount * 1.2 + (responseDurationMs > 1800 ? 8 : 0)))
    const communicationRaw = Math.max(0, Math.min(100, 55 + responseLength - fillers * 5))
    const engagementRaw = Math.max(0, Math.min(100, 50 + (responseLength > 12 ? 20 : 5) - (responseLength < 5 ? 15 : 0)))
    setLiveMetrics((prev) => ({
      ...prev,
      fillerWordCount: prev.fillerWordCount + fillers,
      avgResponseLength,
      confidenceLevel: Math.round((prev.confidenceLevel + confidenceRaw) / 2),
      communicationClarity: Math.round((prev.communicationClarity + communicationRaw) / 2),
      engagementScore: Math.round((prev.engagementScore + engagementRaw) / 2),
      responseLength,
    }))
    responseStartAtRef.current = null
    lastSpeechAtRef.current = null
    const ok = await submitTranscriptWithRetry(transcript)
    isProcessingRef.current = false
    setIsProcessing(false)
    if (!ok) {
      shouldListenRef.current = isStarted && !isAISpeaking
      if (shouldListenRef.current) {
        try {
          recognitionRef.current?.start()
          setIsListening(true)
        } catch {
          // no-op
        }
      }
    }
  }, [clearSilenceTimer, fillerRegex, isAISpeaking, isStarted, liveMetrics.pauseCount, onError, submitTranscriptWithRetry])

  const startListening = useCallback(() => {
    if (!recognitionRef.current || isProcessingRef.current || !isStarted || isMicBlocked) return
    try {
      clearRestartListenTimer()
      clearRecognitionMaxDurationTimer()
      shouldListenRef.current = true
      recognitionRef.current.lang = recognitionLang
      recognitionRef.current.start()
      setIsListening(true)
      recognitionMaxDurationTimerRef.current = window.setTimeout(() => {
        if (!recognitionRef.current || !shouldListenRef.current || isAISpeaking) return
        try {
          recognitionRef.current.stop()
        } catch {
          // no-op
        }
      }, 55000)
    } catch {
      // Ignore duplicate start attempts from browser speech engine.
    }
  }, [clearRecognitionMaxDurationTimer, clearRestartListenTimer, isAISpeaking, isMicBlocked, isStarted, onError, recognitionLang])

  const speakText = useCallback(
    async (text: string, options?: { finalChunk?: boolean; skipStartDelay?: boolean; onEnd?: () => void }) => {
      if (!text?.trim() || typeof window === "undefined" || !("speechSynthesis" in window)) return
      const finalChunk = options?.finalChunk ?? true
      const skipStartDelay = options?.skipStartDelay ?? false
      const onEnd = options?.onEnd
      let didStart = false
      let didEnd = false
      const completeOnce = () => {
        if (didEnd) return
        didEnd = true
        onEnd?.()
      }
      if (!skipStartDelay) {
        await new Promise((resolve) => window.setTimeout(resolve, AI_START_DELAY_MS))
      }
      setIsAISpeaking(true)
      if (skipStartDelay) {
        // Keep existing subtitle while continuing streaming chunks.
      } else {
        setAiSubtitle("")
      }
      shouldListenRef.current = false
      recognitionRef.current?.stop()
      setIsListening(false)
      const sentenceChunks = normalizeSpeechText(text)
        .split(/(?<=[.!?])\s+/)
        .map((chunk) => chunk.trim())
        .filter(Boolean)
      const startTimeout = window.setTimeout(() => {
        if (!didStart) completeOnce()
      }, 1500)
      if (usePremiumVoice && premiumVoiceAllowedRef.current) {
        try {
          const ttsText = sentenceChunks.join(" ... ")
          const audioBlob = await aiInterviewService.synthesizeSpeech({
            text: ttsText,
            language,
            personality,
          })
          const url = URL.createObjectURL(audioBlob)
          const audio = new Audio(url)
          premiumAudioRef.current = audio
          setAiSubtitle(ttsText)
          audio.onplaying = () => {
            didStart = true
          }
          audio.onended = () => {
            setIsAISpeaking(false)
            premiumAudioRef.current = null
            URL.revokeObjectURL(url)
            if (isStarted && finalChunk) startListening()
            window.clearTimeout(startTimeout)
            completeOnce()
          }
          audio.onerror = () => {
            setUsePremiumVoice(false)
            setIsAISpeaking(false)
            premiumAudioRef.current = null
            URL.revokeObjectURL(url)
            if (isStarted && finalChunk) startListening()
            window.clearTimeout(startTimeout)
            completeOnce()
          }
          await audio.play()
          return
        } catch {
          premiumVoiceAllowedRef.current = false
          setUsePremiumVoice(false)
        }
      }
      window.speechSynthesis.cancel()
      const voices = availableVoices.length ? availableVoices : window.speechSynthesis.getVoices()
      const voice =
        voices.find((item) => item.lang.includes(recognitionLang)) ??
        voices.find((item) => item.lang.toLowerCase().includes(language)) ??
        voices.find((item) => item.lang.toLowerCase().startsWith(recognitionLang.toLowerCase())) ??
        null
      console.log("Speaking AI question:", text)
      for (let i = 0; i < sentenceChunks.length; i += 1) {
        const chunk = sentenceChunks[i]
        const normalizedChunk = normalizeSpeechText(chunk).toLowerCase()
        if (!normalizedChunk || normalizedChunk === lastSpokenSentenceRef.current) continue
        if (chunk.trim().endsWith("?")) {
          await new Promise((resolve) => window.setTimeout(resolve, 90))
        }
        setAiSubtitle((prev) => (prev ? `${prev} ${chunk}` : chunk))
        const utterance = new SpeechSynthesisUtterance(chunk)
        utterance.lang = recognitionLang
        const baseRate = 0.98 + Math.random() * 0.05
        utterance.rate = i === sentenceChunks.length - 1 && chunk.includes("?") ? Math.max(0.92, baseRate - 0.04) : baseRate
        if (voice) utterance.voice = voice
        await new Promise<void>((resolve) => {
          utterance.onstart = () => {
            didStart = true
            setIsAISpeaking(true)
          }
          utterance.onend = () => {
            lastSpokenSentenceRef.current = normalizedChunk
            resolve()
          }
          utterance.onerror = () => resolve()
          window.speechSynthesis.speak(utterance)
        })
        if (i < sentenceChunks.length - 1) {
          await new Promise((resolve) => window.setTimeout(resolve, AI_SENTENCE_PAUSE_MS))
        }
      }
      setIsAISpeaking(false)
      if (isStarted && finalChunk) startListening()
      window.clearTimeout(startTimeout)
      completeOnce()
    },
    [AI_SENTENCE_PAUSE_MS, AI_START_DELAY_MS, availableVoices, isStarted, language, normalizeSpeechText, personality, recognitionLang, startListening, usePremiumVoice],
  )

  useEffect(() => {
    if (typeof window === "undefined") return
    const SpeechCtor = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    if (!SpeechCtor) {
      setIsSpeechSupported(false)
      return
    }
    setIsSpeechSupported(true)
    const recognition = new SpeechCtor() as SpeechRecognitionLike
    recognition.continuous = true
    recognition.interimResults = true
    recognition.lang = recognitionLang
    recognition.onresult = (event: any) => {
      if (!isSessionActiveRef.current) return
      // Only treat as user barge-in while actively listening.
      if (isListening && shouldListenRef.current) {
        cancelAISpeech()
      }
      let interimChunk = ""
      for (let i = event.resultIndex; i < event.results.length; i += 1) {
        const value = event.results[i][0]?.transcript ?? ""
        if (!value) continue
        if (event.results[i].isFinal) {
          committedTranscriptRef.current = `${committedTranscriptRef.current} ${value}`.trim()
        } else {
          interimChunk = `${interimChunk} ${value}`.trim()
        }
      }
      interimTranscriptRef.current = interimChunk
      const combined = `${committedTranscriptRef.current} ${interimTranscriptRef.current}`.trim()
      if (!combined) return
      if (!responseStartAtRef.current) responseStartAtRef.current = Date.now()
      const now = Date.now()
      if (lastSpeechAtRef.current && now - lastSpeechAtRef.current > 1200) {
        setLiveMetrics((prev) => ({ ...prev, pauseCount: prev.pauseCount + 1 }))
      }
      lastSpeechAtRef.current = now
      const liveFillers = combined.match(fillerRegex)?.length ?? 0
      setLiveTranscript(combined)
      setIsUserSpeaking(true)
      setLiveMetrics((prev) => ({
        ...prev,
        fillerWordCount: Math.max(prev.fillerWordCount, liveFillers),
        responseLength: combined.split(/\s+/).filter(Boolean).length,
      }))
      clearSilenceTimer()
      silenceTimerRef.current = window.setTimeout(() => {
        void finalizeTranscript()
      }, SILENCE_MS)
    }
    recognition.onerror = (event: any) => {
      if (event?.error === "network") {
        onError?.("Network issue detected. Retrying speech recognition...")
        shouldListenRef.current = isStarted && !isAISpeaking
      } else if (event?.error === "no-speech") {
        onError?.("No speech detected. Please speak clearly and try again.")
      } else if (event?.error === "not-allowed" || event?.error === "service-not-allowed") {
        shouldListenRef.current = false
        setIsMicBlocked(true)
        if (!micPermissionWarnedRef.current) {
          micPermissionWarnedRef.current = true
          onError?.("Microphone permission is blocked. AI voice will continue; you can type responses manually.")
        }
      } else {
        onError?.(event?.error || "Speech recognition error.")
      }
      setIsListening(false)
      setIsUserSpeaking(false)
    }
    recognition.onend = () => {
      setIsListening(false)
      clearRecognitionMaxDurationTimer()
      if (isSessionActiveRef.current && shouldListenRef.current && isStarted && !isAISpeaking) {
        clearRestartListenTimer()
        restartListenTimerRef.current = window.setTimeout(() => {
          try {
            recognition.start()
            setIsListening(true)
          } catch {
            // ignore browser start race
          }
        }, 150)
      }
    }
    recognitionRef.current = recognition

    return () => {
      clearSilenceTimer()
      clearRestartListenTimer()
      clearRecognitionMaxDurationTimer()
      recognition.stop()
      recognitionRef.current = null
      cancelAISpeech()
    }
  }, [SILENCE_MS, cancelAISpeech, clearRecognitionMaxDurationTimer, clearRestartListenTimer, clearSilenceTimer, fillerRegex, finalizeTranscript, isAISpeaking, isStarted, onError, recognitionLang])

  useEffect(() => {
    if (isStarted && !finalFeedback) {
      isSessionActiveRef.current = true
    }
  }, [finalFeedback, isStarted])

  useEffect(() => {
    if (!currentQuestion?.trim()) return
    if (lastSpokenQuestionRef.current === currentQuestion) return
    console.log("Trigger TTS:", currentQuestion)
    lastSpokenQuestionRef.current = currentQuestion
    const preview = currentQuestionPreview?.trim() || ""
    const full = normalizeSpeechText(currentQuestion)
    const normalizedPreview = normalizeSpeechText(preview)
    const canSplitWithPreview = Boolean(normalizedPreview) && full.startsWith(normalizedPreview)
    let remaining = canSplitWithPreview ? full.slice(normalizedPreview.length).trim() : ""
    remaining = normalizeSpeechText(remaining)
    if (/^[,.;:!?-]/.test(remaining) || remaining.length < 10) {
      remaining = ""
    }
    console.log("Preview:", preview || "(none)")
    console.log("Remaining:", remaining || "(none)")
    const speakTimer = window.setTimeout(() => {
      void (async () => {
        if (canSplitWithPreview && normalizedPreview) {
          await speakText(normalizedPreview, { finalChunk: !remaining, skipStartDelay: true })
          if (remaining) {
            await new Promise((resolve) => window.setTimeout(resolve, 100))
            await speakText(remaining, { finalChunk: true, skipStartDelay: true })
          }
          return
        }
        await speakText(full, { finalChunk: true })
      })()
    }, 140)
    return () => window.clearTimeout(speakTimer)
  }, [currentQuestion, currentQuestionPreview, normalizeSpeechText, speakText])

  const fallbackManualSend = async () => {
    if (!finalTranscript.trim() || isBusy) return
    await onSubmitTranscript(finalTranscript.trim())
    setFinalTranscript("")
  }

  const playCue = (frequency: number, duration = 0.08) => {
    if (typeof window === "undefined") return
    const Ctx = (window as any).AudioContext || (window as any).webkitAudioContext
    if (!Ctx) return
    const ctx = new Ctx()
    const oscillator = ctx.createOscillator()
    const gain = ctx.createGain()
    oscillator.type = "sine"
    oscillator.frequency.value = frequency
    gain.gain.value = 0.04
    oscillator.connect(gain)
    gain.connect(ctx.destination)
    oscillator.start()
    oscillator.stop(ctx.currentTime + duration)
  }

  useEffect(() => {
    if (!finalFeedback || finalSummarySpokenRef.current) return
    finalSummarySpokenRef.current = true
    isSessionActiveRef.current = false
    clearSilenceTimer()
    clearRestartListenTimer()
    clearRecognitionMaxDurationTimer()
    stopListening()
    shouldListenRef.current = false
    const topStrength = finalFeedback.strengths?.[0] || "clear communication"
    const topSuggestion = finalFeedback.suggestions?.[0] || "give more structured answers"
    const scoreText = typeof finalScore === "number" ? finalScore : finalFeedback.score
    const summaryText =
      language === "hi"
        ? `आपके समय के लिए धन्यवाद। आपका कुल स्कोर ${scoreText} है। आपकी एक मुख्य ताकत ${topStrength} रही। सुधार के लिए ${topSuggestion} पर काम करें।`
        : `Thank you for your time. Your overall score is ${scoreText}. One key strength was ${topStrength}. One improvement area is to ${topSuggestion}.`
    void speakText(summaryText, {
      finalChunk: false,
      skipStartDelay: false,
      onEnd: () => onFinalSummaryEnd?.(),
    })
  }, [finalFeedback, finalScore, language, onFinalSummaryEnd, speakText])

  return (
    <div className="dashboard-overview-card bg-gradient-to-b from-white to-sage/5 p-5 transition-opacity duration-300 dark:from-emerald-950/40 dark:to-emerald-900/20">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h2 className="font-display text-xl font-semibold text-slate-900 dark:text-emerald-50">AI Interview Room</h2>
        <div className="flex items-center gap-3 text-xs text-slate-600 dark:text-emerald-300">
          <span className="rounded-full bg-sage/20 px-3 py-1 dark:bg-emerald-900/40">Question {questionIndex} of {maxQuestions}</span>
          <span className="flex items-center gap-1"><Clock3 className="h-3.5 w-3.5" />{elapsedTimeLabel}</span>
        </div>
      </div>
      <div className="mb-4 rounded-xl border border-slate-200/90 bg-white/80 p-3 dark:border-emerald-800 dark:bg-emerald-950/30">
        <div className="mb-2 flex flex-wrap items-center justify-between gap-2 text-xs">
          <span className="rounded-full bg-violet-100 px-2.5 py-1 font-medium text-violet-700 dark:bg-violet-900/40 dark:text-violet-300">
            Phase: {phaseLabelMap[phase]}
          </span>
          <span className="rounded-full bg-amber-100 px-2.5 py-1 font-medium text-amber-700 dark:bg-amber-900/40 dark:text-amber-300">
            {questionTypeLabelMap[questionType]}
          </span>
          <span className="text-slate-600 dark:text-emerald-300">{progressPercent}% complete</span>
        </div>
        <div className="h-2 rounded-full bg-slate-200 dark:bg-emerald-950/50">
          <div className="h-full rounded-full bg-sage-deep transition-all duration-500 dark:bg-emerald-500" style={{ width: `${progressPercent}%` }} />
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className={`rounded-2xl transition ${isAISpeaking ? "ring-2 ring-emerald-400/70" : "ring-1 ring-transparent"}`}>
          <AIAvatar isSpeaking={isAISpeaking} latestPrompt={currentQuestion} personality={personality} />
        </div>
        <div className={`rounded-2xl transition ${isUserSpeaking ? "ring-2 ring-blue-400/70" : "ring-1 ring-transparent"}`}>
          <VideoFeed stream={stream} />
        </div>
      </div>

      <div className="mt-4 rounded-2xl border border-slate-200/90 bg-slate-50/60 p-4 transition-all duration-300 dark:border-emerald-800 dark:bg-emerald-950/30">
        <p className="text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-emerald-400">Live transcript</p>
        <p className="mt-1 text-sm text-slate-700 dark:text-emerald-100">{liveTranscript || finalTranscript || "Your speech transcript appears here automatically."}</p>
        <p className="mt-2 text-xs text-slate-500 dark:text-emerald-400">AI subtitle: {aiSubtitle || currentQuestion || "Waiting for first question..."}</p>
        <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
          <span className={`rounded-full px-3 py-1 ${isAISpeaking ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300" : "bg-slate-200 text-slate-600 dark:bg-emerald-950/40 dark:text-emerald-300"}`}>
            {isAISpeaking ? "AI is speaking..." : "AI idle"}
          </span>
          <span className={`rounded-full px-3 py-1 ${isBusy || isProcessing ? "bg-violet-100 text-violet-700 dark:bg-violet-900/40 dark:text-violet-300" : "bg-slate-200 text-slate-600 dark:bg-emerald-950/40 dark:text-emerald-300"}`}>
            {isBusy || isProcessing ? "Analyzing your answer..." : "AI ready"}
          </span>
          <span className={`rounded-full px-3 py-1 ${isListening ? "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300" : "bg-slate-200 text-slate-600 dark:bg-emerald-950/40 dark:text-emerald-300"}`}>
            {isListening ? "Listening..." : "Not listening"}
          </span>
          <span className={`rounded-full px-3 py-1 ${isUserSpeaking ? "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300" : "bg-slate-200 text-slate-600 dark:bg-emerald-950/40 dark:text-emerald-300"}`}>
            {isUserSpeaking ? "User speaking..." : "Silence"}
          </span>
          {isAISpeaking && <span className="h-2 w-8 animate-pulse rounded-full bg-emerald-400/80" />}
          {isAISpeaking && (
            <span className="flex items-end gap-0.5">
              <span className="h-2 w-1 animate-pulse rounded bg-emerald-500 [animation-delay:0ms]" />
              <span className="h-3 w-1 animate-pulse rounded bg-emerald-500 [animation-delay:120ms]" />
              <span className="h-2.5 w-1 animate-pulse rounded bg-emerald-500 [animation-delay:240ms]" />
              <span className="h-3.5 w-1 animate-pulse rounded bg-emerald-500 [animation-delay:360ms]" />
            </span>
          )}
          {isUserSpeaking && (
            <span className="flex items-end gap-0.5">
              <span className="h-2 w-1 animate-pulse rounded bg-blue-500 [animation-delay:0ms]" />
              <span className="h-3 w-1 animate-pulse rounded bg-blue-500 [animation-delay:90ms]" />
              <span className="h-2.5 w-1 animate-pulse rounded bg-blue-500 [animation-delay:180ms]" />
              <span className="h-3.5 w-1 animate-pulse rounded bg-blue-500 [animation-delay:270ms]" />
            </span>
          )}
        </div>
        {isMicBlocked && (
          <div className="mt-2 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-700 dark:border-amber-900/50 dark:bg-amber-950/20 dark:text-amber-300">
            Voice input disabled, you can type your response. AI voice output is still active.
          </div>
        )}
        {contextHint && (
          <div className="mt-3 rounded-xl border border-indigo-200 bg-indigo-50 px-3 py-2 text-xs text-indigo-700 transition-opacity duration-300 dark:border-indigo-900/50 dark:bg-indigo-950/20 dark:text-indigo-300">
            {contextHint}
          </div>
        )}
        {responseQualityHint && (
          <div className="mt-2 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs text-emerald-700 transition-opacity duration-300 dark:border-emerald-900/50 dark:bg-emerald-950/20 dark:text-emerald-300">
            {responseQualityHint}
          </div>
        )}
        <div className="mt-4 grid gap-2 rounded-xl border border-slate-200/80 bg-white p-3 text-sm dark:border-emerald-800 dark:bg-emerald-950/30">
          <p><span className="font-semibold text-slate-900 dark:text-emerald-50">Last AI question:</span> <span className="text-slate-700 dark:text-emerald-100">{lastAIQuestion || "Waiting..."}</span></p>
          <p><span className="font-semibold text-slate-900 dark:text-emerald-50">Your answer:</span> <span className="text-slate-700 dark:text-emerald-100">{lastUserAnswer || "Start speaking after AI prompt."}</span></p>
          <p><span className="font-semibold text-slate-900 dark:text-emerald-50">Next question:</span> <span className="text-slate-700 dark:text-emerald-100">{currentQuestion || "Generating..."}</span></p>
        </div>
        <div className="mt-4 grid gap-3 rounded-xl border border-slate-200/80 bg-white p-3 text-sm dark:border-emerald-800 dark:bg-emerald-950/30">
          <p className="font-semibold text-slate-900 dark:text-emerald-50">Live Performance Panel</p>
          <p className="text-xs text-slate-600 dark:text-emerald-300">Filler words: {liveMetrics.fillerWordCount} • Pauses: {liveMetrics.pauseCount} • Avg length: {liveMetrics.avgResponseLength} words</p>
          <MetricBar label="Confidence level" value={liveMetrics.confidenceLevel} />
          <MetricBar label="Communication clarity" value={liveMetrics.communicationClarity} />
          <MetricBar label="Response length" value={Math.min(100, liveMetrics.responseLength * 3)} />
          <MetricBar label="Engagement score" value={liveMetrics.engagementScore} />
        </div>
        {coachingHint && (
          <div className="mt-3 rounded-xl border border-sky-200 bg-sky-50 px-3 py-2 text-xs text-sky-700 dark:border-sky-900/50 dark:bg-sky-950/20 dark:text-sky-300">
            Coach Tip: {coachingHint}
          </div>
        )}
      </div>

      <div className="mt-5 flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={() => {
            playCue(720)
            console.log("Start interview triggered")
            onStartInterview()
          }}
          disabled={isStarted || isBusy}
          className="flex h-12 min-w-[140px] items-center justify-center gap-2 rounded-2xl bg-emerald-600 px-4 text-sm font-semibold text-white hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Play className="h-4 w-4" />
          Start Interview
        </button>
        <button
          type="button"
          onClick={() => {
            playCue(420)
            onEndInterview()
          }}
          disabled={!isStarted || isBusy}
          className="flex h-12 min-w-[120px] items-center justify-center gap-2 rounded-2xl bg-red-600 px-4 text-sm font-semibold text-white hover:bg-red-500 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Square className="h-4 w-4" />
          End Interview
        </button>
        {!isSpeechSupported && (
          <div className="flex items-center gap-2">
            <input
              value={finalTranscript}
              onChange={(event) => setFinalTranscript(event.target.value)}
              placeholder="Speech API not supported. Enter response."
              className="h-12 min-w-[280px] rounded-2xl border border-slate-200 bg-white px-3 text-sm dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-100"
            />
            <button
              type="button"
              onClick={() => void fallbackManualSend()}
              className="h-12 rounded-2xl bg-slate-900 px-4 text-sm font-semibold text-white hover:bg-slate-800 dark:bg-emerald-700 dark:hover:bg-emerald-600"
            >
              Send
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

function MetricBar({ label, value }: { label: string; value: number }) {
  return (
    <div>
      <div className="mb-1 flex items-center justify-between text-xs text-slate-700 dark:text-emerald-100">
        <span>{label}</span>
        <span>{Math.round(value)}%</span>
      </div>
      <div className="h-2 rounded-full bg-slate-200 dark:bg-emerald-950/40">
        <div className="h-full rounded-full bg-sage-deep dark:bg-emerald-500" style={{ width: `${Math.max(0, Math.min(100, value))}%` }} />
      </div>
    </div>
  )
}
