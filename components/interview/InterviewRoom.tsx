"use client"

import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { Clock3, Mic, MicOff, Play, Square } from "lucide-react"
import { AIAvatar } from "./AIAvatar"
import { VideoFeed } from "./VideoFeed"
import { aiInterviewService, InterviewFeedback, InterviewLanguage, InterviewPersonality } from "@/services/aiInterviewService"

type ConversationState = "idle" | "ai-speaking" | "user-listening" | "processing"

interface Props {
  stream: MediaStream | null
  currentQuestion: string
  spokenPrompt?: string
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
  onStartInterview: () => Promise<{ next_question?: string } | string | null | void>
  onEndInterview: () => void
  onSubmitTranscript: (transcript: string) => Promise<{ next_question?: string; is_end?: boolean } | null>
  onFinalSummaryEnd?: () => void
  onError?: (message: string) => void
}

export function InterviewRoom({
  stream,
  currentQuestion,
  spokenPrompt,
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
  const runLoopRef = useRef(false)
  const stopRecognitionRef = useRef<(() => void) | null>(null)
  const isMountedRef = useRef(true)
  const finalSummarySpokenRef = useRef(false)
  const responseCountRef = useRef(0)
  const totalWordsRef = useRef(0)
  const noInputStreakRef = useRef(0)
  const currentQuestionRef = useRef("")

  const [isListening, setIsListening] = useState(false)
  const [isMicEnabled, setIsMicEnabled] = useState(true)
  const [isMicBlocked, setIsMicBlocked] = useState(false)
  const [isUserSpeaking, setIsUserSpeaking] = useState(false)
  const [isAISpeaking, setIsAISpeaking] = useState(false)
  const [liveTranscript, setLiveTranscript] = useState("")
  const [finalTranscript, setFinalTranscript] = useState("")
  const [isSpeechSupported, setIsSpeechSupported] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [manualResponse, setManualResponse] = useState("")
  const [aiSubtitle, setAiSubtitle] = useState("")
  const [awaitingMicResume, setAwaitingMicResume] = useState(false)
  const [liveMetrics, setLiveMetrics] = useState({
    fillerWordCount: 0,
    pauseCount: 0,
    avgResponseLength: 0,
    confidenceLevel: 50,
    communicationClarity: 50,
    engagementScore: 50,
    responseLength: 0,
  })
  const [conversationState, setConversationState] = useState<ConversationState>("idle")

  const recognitionLang = useMemo(() => (language === "hi" ? "hi-IN" : "en-US"), [language])
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
  const delay = useCallback((ms: number) => new Promise<void>((resolve) => window.setTimeout(resolve, ms)), [])

  const playApiTTS = useCallback(
    async (text: string) => {
      const blob = await aiInterviewService.synthesizeSpeech({
        text,
        language,
        personality,
      })
      const audioUrl = URL.createObjectURL(blob)
      try {
        const audio = new Audio(audioUrl)
        await audio.play()
        await new Promise<void>((resolve) => {
          audio.onended = () => resolve()
          audio.onerror = () => resolve()
        })
      } finally {
        URL.revokeObjectURL(audioUrl)
      }
    },
    [language, personality],
  )

  const speakAndWait = useCallback(
    (text: string) =>
      new Promise<void>((resolve) => {
        if (!text?.trim() || typeof window === "undefined") return resolve()
        void (async () => {
          try {
            await playApiTTS(text)
          } catch (err) {
            console.error("Sarvam TTS failed", err)
            onError?.("Sarvam voice is unavailable. Please try again.")
          } finally {
            resolve()
          }
        })()
      }),
    [onError, playApiTTS],
  )

  const listenOnce = useCallback(
    () =>
      new Promise<string | null>((resolve) => {
        if (typeof window === "undefined") {
          resolve(null)
          return
        }
        const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
        if (!SpeechRecognition) {
          console.error("SpeechRecognition not supported")
          resolve(null)
          return
        }
        if (!isMicEnabled) {
          resolve(null)
          return
        }
        void (async () => {
          try {
            await navigator.mediaDevices.getUserMedia({ audio: true })
          } catch {
            setIsMicBlocked(true)
            console.error("❌ Mic permission denied")
            resolve(null)
            return
          }
          const recognition = new SpeechRecognition()
          let resolved = false
          recognition.lang = recognitionLang
          recognition.continuous = true
          recognition.interimResults = true
          recognition.onstart = () => {
            console.log("🎤 Listening started")
          }
          let finalBuffer = ""
          recognition.onresult = (event: any) => {
            let interim = ""
            for (let i = event.resultIndex; i < event.results.length; i += 1) {
              const result = event.results[i]
              const chunk = String(result?.[0]?.transcript || "")
              if (result.isFinal) finalBuffer += `${chunk} `
              else interim += chunk
            }
            const preview = (finalBuffer + interim).trim()
            if (preview) setLiveTranscript(preview)
            if (finalBuffer.trim()) {
              if (resolved) return
              resolved = true
              const recognizedText = finalBuffer.trim()
              console.log("🎤 User said:", recognizedText)
              setFinalTranscript(recognizedText)
              resolve(recognizedText)
            }
          }
          recognition.onerror = (event: any) => {
            if (String(event?.error || "").includes("not-allowed")) setIsMicBlocked(true)
            console.error("STT ERROR:", event)
            if (resolved) return
            resolved = true
            resolve(null)
          }
          recognition.onend = () => {
            console.log("🎤 Listening ended")
            if (resolved) return
            resolved = true
            resolve(null)
          }
          stopRecognitionRef.current = () => {
            try {
              recognition.stop()
            } catch {
              // no-op
            }
          }
          recognition.start()
          window.setTimeout(() => {
            if (resolved) return
            try {
              recognition.stop()
            } catch {
              // no-op
            }
            resolved = true
            resolve(null)
          }, 10000)
        })()
      }),
    [isMicEnabled, recognitionLang],
  )

  const runVoiceLoop = useCallback(async (initialQuestion: string) => {
    if (runLoopRef.current) return
    runLoopRef.current = true
    console.log("Initial question received:", initialQuestion)
    console.log("Voice loop started")
    let currentQ = String(initialQuestion || "").trim()
    currentQuestionRef.current = currentQ
    try {
      while (true) {
        console.log("Loop iteration")
        const textToSpeak = currentQ || "Please introduce yourself"
        currentQuestionRef.current = textToSpeak
        console.log("About to speak:", currentQ)
        console.log("Speaking text:", textToSpeak)
        console.log("AI speaking:", textToSpeak)
        setConversationState("ai-speaking")
        setIsAISpeaking(true)
        setAiSubtitle(textToSpeak)
        console.log("AI SPEAK START")
        await speakAndWait(textToSpeak)
        console.log("AI SPEAK END")
        setIsAISpeaking(false)
        await delay(800)
        console.log("Listening...")
        console.log("MIC START")
        setConversationState("user-listening")
        setIsListening(true)
        setIsUserSpeaking(true)
        const userText = await listenOnce()
        console.log("MIC END")
        setIsListening(false)
        setIsUserSpeaking(false)
        console.log("MIC RESULT:", userText)
        console.log("User said:", userText)
        if (!userText) {
          noInputStreakRef.current += 1
          if (noInputStreakRef.current >= 2) {
            setAwaitingMicResume(true)
            setConversationState("idle")
            await speakAndWait(
              language === "hi"
                ? "माइक से आवाज़ नहीं मिल रही। कृपया Resume Mic दबाएं, फिर Listening दिखने पर बोलें।"
                : "I am not getting your mic clearly. Press Resume Mic, then speak when Listening appears.",
            )
            break
          }
          await speakAndWait(
            language === "hi"
              ? noInputStreakRef.current >= 2
                ? "मुझे आपकी आवाज़ स्पष्ट नहीं मिल रही है। कृपया छोटा उत्तर बोलें या नीचे टाइप करके Send करें।"
                : "मैं आपकी आवाज़ साफ़ नहीं सुन पाया। कृपया थोड़ा धीमे और स्पष्ट बोलें।"
              : noInputStreakRef.current >= 2
                ? "I still could not catch that clearly. Please give a short answer, or type your response and press Send."
                : "I could not hear you clearly. Please repeat a bit slower and clearly.",
          )
          continue
        }
        noInputStreakRef.current = 0
        setAwaitingMicResume(false)
        const words = userText.split(/\s+/).filter(Boolean).length
        responseCountRef.current += 1
        totalWordsRef.current += words
        setLiveMetrics((prev) => ({
          ...prev,
          avgResponseLength: Math.round(totalWordsRef.current / Math.max(1, responseCountRef.current)),
          responseLength: words,
          confidenceLevel: Math.max(40, Math.min(100, prev.confidenceLevel + 2)),
          communicationClarity: Math.max(40, Math.min(100, prev.communicationClarity + 1)),
        }))
        setIsProcessing(true)
        setConversationState("processing")
        const response = await onSubmitTranscript(userText)
        setIsProcessing(false)
        if (!response || response.is_end) {
          console.log("Interview ended")
          break
        }
        const nextFromApi = String(response.next_question || "").trim()
        if (nextFromApi) {
          currentQ = nextFromApi
          currentQuestionRef.current = nextFromApi
        } else {
          // Guard against empty backend payloads to avoid repeating intro forever.
          currentQ =
            language === "hi"
              ? "अच्छा। अब अपने अनुभव से एक वास्तविक उदाहरण साझा कीजिए।"
              : "Good. Now share one real example from your experience with clear outcome."
          currentQuestionRef.current = currentQ
        }
      }
    } catch (err) {
      console.error("VOICE LOOP ERROR:", err)
    }
    setConversationState("idle")
    setIsListening(false)
    setIsAISpeaking(false)
    setIsUserSpeaking(false)
    setIsProcessing(false)
    runLoopRef.current = false
  }, [delay, listenOnce, onSubmitTranscript, speakAndWait])

  const handleStart = useCallback(async () => {
    playCue(720)
    console.log("Starting voice interview...")
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      const synth = window.speechSynthesis
      const unlock = new SpeechSynthesisUtterance(" ")
      unlock.volume = 0
      synth.speak(unlock)
      await new Promise<void>((res) => {
        const voices = synth.getVoices()
        if (voices.length) {
          res()
          return
        }
        synth.onvoiceschanged = () => {
          synth.onvoiceschanged = null
          res()
        }
      })
    }
    const response = await onStartInterview()
    let firstQuestion = "Please introduce yourself"
    if (response && typeof response === "object" && response.next_question) {
      firstQuestion = response.next_question
    } else if (typeof response === "string") {
      firstQuestion = response
    }
    console.log("First question resolved:", firstQuestion)
    if (!firstQuestion || typeof firstQuestion !== "string") {
      console.error("Invalid first question, aborting loop")
      return
    }
    await runVoiceLoop(firstQuestion)
  }, [onStartInterview, runVoiceLoop])

  useEffect(() => {
    const SpeechCtor = typeof window !== "undefined" ? (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition : null
    setIsSpeechSupported(Boolean(SpeechCtor))
    if (typeof window !== "undefined" && window.location.protocol !== "https:" && window.location.hostname !== "localhost") {
      console.warn("⚠️ Voice features require HTTPS")
    }
  }, [])

  const fallbackManualSend = async () => {
    const text = (manualResponse || finalTranscript).trim()
    if (!text || isBusy) return
    const response = await onSubmitTranscript(text)
    setFinalTranscript("")
    setManualResponse("")
    setAwaitingMicResume(false)
    noInputStreakRef.current = 0
    const nextQuestion = String(response?.next_question || "").trim()
    if (nextQuestion && !response?.is_end) {
      await runVoiceLoop(nextQuestion)
    }
  }

  const handleResumeMic = async () => {
    if (isBusy) return
    setAwaitingMicResume(false)
    noInputStreakRef.current = 0
    const question = currentQuestionRef.current || currentQuestion || "Please introduce yourself"
    await runVoiceLoop(question)
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
    runLoopRef.current = false
    stopRecognitionRef.current?.()
    setConversationState("ai-speaking")
    const topStrength = finalFeedback.strengths?.[0] || "clear communication"
    const topSuggestion = finalFeedback.suggestions?.[0] || "give more structured answers"
    const scoreText = typeof finalScore === "number" ? finalScore : finalFeedback.score
    const summaryText =
      language === "hi"
        ? `आपके समय के लिए धन्यवाद। आपका कुल स्कोर ${scoreText} है। आपकी एक मुख्य ताकत ${topStrength} रही। सुधार के लिए ${topSuggestion} पर काम करें।`
        : `Thank you for your time. Your overall score is ${scoreText}. One key strength was ${topStrength}. One improvement area is to ${topSuggestion}.`
    void (async () => {
      await speakAndWait(summaryText)
      onFinalSummaryEnd?.()
    })()
  }, [finalFeedback, finalScore, language, onFinalSummaryEnd, speakAndWait])

  useEffect(() => {
    if (!isStarted) {
      runLoopRef.current = false
      stopRecognitionRef.current?.()
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        window.speechSynthesis.cancel()
      }
      setConversationState("idle")
      setIsListening(false)
      setIsAISpeaking(false)
      setIsUserSpeaking(false)
    }
  }, [isStarted])

  useEffect(() => {
    return () => {
      isMountedRef.current = false
      runLoopRef.current = false
      stopRecognitionRef.current?.()
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        window.speechSynthesis.cancel()
      }
    }
  }, [])

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
        <p className="mt-2 text-xs text-slate-500 dark:text-emerald-400">
          How to use mic: Wait for <strong>Listening...</strong> status, then speak clearly for 2-10 seconds near your mic.
        </p>
        <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
          <span className={`rounded-full px-3 py-1 ${isAISpeaking ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300" : "bg-slate-200 text-slate-600 dark:bg-emerald-950/40 dark:text-emerald-300"}`}>
            {isAISpeaking ? "AI is speaking..." : "AI idle"}
          </span>
          <span className={`rounded-full px-3 py-1 ${isBusy || isProcessing ? "bg-violet-100 text-violet-700 dark:bg-violet-900/40 dark:text-violet-300" : "bg-slate-200 text-slate-600 dark:bg-emerald-950/40 dark:text-emerald-300"}`}>
            {isBusy || isProcessing ? "AI is thinking..." : "AI ready"}
          </span>
          <span className={`rounded-full px-3 py-1 ${isListening ? "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300" : "bg-slate-200 text-slate-600 dark:bg-emerald-950/40 dark:text-emerald-300"}`}>
            {isListening ? "Listening..." : "Not listening"}
          </span>
          <span className={`rounded-full px-3 py-1 ${isUserSpeaking ? "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300" : "bg-slate-200 text-slate-600 dark:bg-emerald-950/40 dark:text-emerald-300"}`}>
            {isUserSpeaking ? "User speaking..." : "Silence"}
          </span>
          <span className="rounded-full bg-slate-200 px-3 py-1 text-slate-600 dark:bg-emerald-950/40 dark:text-emerald-300">
            Turn: {conversationState}
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
        {awaitingMicResume && (
          <div className="mt-2 rounded-xl border border-sky-200 bg-sky-50 px-3 py-2 text-xs text-sky-700 dark:border-sky-900/50 dark:bg-sky-950/20 dark:text-sky-300">
            We paused auto-listening after multiple missed captures. Press <strong>Resume Mic</strong> and answer when Listening starts.
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
          onClick={() => void handleStart()}
          disabled={isStarted || isBusy}
          className="flex h-12 min-w-[140px] items-center justify-center gap-2 rounded-2xl bg-emerald-600 px-4 text-sm font-semibold text-white hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Play className="h-4 w-4" />
          Start Interview
        </button>
        <button
          type="button"
          onClick={() => {
            if (!isStarted) return
            setIsMicEnabled((prev) => {
              const next = !prev
              if (!next) {
                stopRecognitionRef.current?.()
                setIsListening(false)
              }
              return next
            })
          }}
          disabled={!isStarted || isBusy}
          className="flex h-12 min-w-[120px] items-center justify-center gap-2 rounded-2xl border border-slate-300 bg-white px-4 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-200"
        >
          {isMicEnabled ? <Mic className="h-4 w-4" /> : <MicOff className="h-4 w-4" />}
          {isMicEnabled ? "Mic On" : "Mic Off"}
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
        {awaitingMicResume && (
          <button
            type="button"
            onClick={() => void handleResumeMic()}
            disabled={isBusy}
            className="flex h-12 min-w-[140px] items-center justify-center gap-2 rounded-2xl bg-sky-600 px-4 text-sm font-semibold text-white hover:bg-sky-500 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Mic className="h-4 w-4" />
            Resume Mic
          </button>
        )}
        {isStarted && currentQuestion?.trim() && (
          <button
            type="button"
            onClick={() => void speakAndWait(currentQuestion)}
            className="h-12 rounded-2xl border border-emerald-300 bg-emerald-50 px-4 text-sm font-semibold text-emerald-700 hover:bg-emerald-100 dark:border-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-200 dark:hover:bg-emerald-900/50"
          >
            Repeat AI Question
          </button>
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
