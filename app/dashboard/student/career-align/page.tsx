"use client"

import { useEffect, useMemo, useState } from "react"
import { motion } from "framer-motion"
import { AlertCircle, MessageSquareText } from "lucide-react"
import { StudentDashboardLayout } from "@/components/dashboard/StudentDashboardLayout"
import { ErrorBoundary } from "@/components/ErrorBoundary"
import { LanguageSelector } from "@/components/interview/LanguageSelector"
import { PermissionGate } from "@/components/interview/PermissionGate"
import { InterviewLoader } from "@/components/interview/InterviewLoader"
import { InterviewRoom } from "@/components/interview/InterviewRoom"
import { ScoreCard } from "@/components/interview/ScoreCard"
import { useInterviewSession } from "@/hooks/useInterviewSession"
import { aiInterviewService, ExperienceLevel, InterviewHistoryItem, InterviewLanguage, InterviewMode, InterviewPersonality } from "@/services/aiInterviewService"

type InterviewStep = "language" | "permissions" | "loading" | "room" | "result"

function CareerAlignPageContent() {
  const [step, setStep] = useState<InterviewStep>("language")
  const [language, setLanguage] = useState<InterviewLanguage | null>(null)
  const [selectedRole, setSelectedRole] = useState("")
  const [experienceLevel, setExperienceLevel] = useState<ExperienceLevel | null>(null)
  const [interviewMode, setInterviewMode] = useState<InterviewMode | null>(null)
  const [personality, setPersonality] = useState<InterviewPersonality | null>(null)
  const [permissionError, setPermissionError] = useState<string | null>(null)
  const [mediaStream, setMediaStream] = useState<MediaStream | null>(null)
  const [timerSeconds, setTimerSeconds] = useState(0)
  const [pastInterviews, setPastInterviews] = useState<InterviewHistoryItem[]>([])

  const resolvedRole = selectedRole.trim()
  const session = useInterviewSession({
    language: language || "en",
    role: resolvedRole || "General Professional",
    experienceLevel: experienceLevel || "fresher",
    interviewMode: interviewMode || "technical",
    personality: personality || "friendly_mentor",
  })

  useEffect(() => {
    const savedLanguage = sessionStorage.getItem("interview_language") as InterviewLanguage | null
    if (savedLanguage && ["en", "hi", "or", "bn", "ta", "te"].includes(savedLanguage)) {
      setLanguage(savedLanguage)
    }
  }, [])

  useEffect(() => {
    if (!language) return
    sessionStorage.setItem("interview_language", language)
  }, [language])

  useEffect(() => {
    const loadHistory = async () => {
      try {
        const items = await aiInterviewService.getHistory(8)
        setPastInterviews(items)
      } catch {
        setPastInterviews([])
      }
    }
    void loadHistory()
  }, [step, session.status])

  useEffect(() => {
    if (!(step === "room" && session.status === "active")) return
    const interval = window.setInterval(() => setTimerSeconds((prev) => prev + 1), 1000)
    return () => window.clearInterval(interval)
  }, [step, session.status])

  useEffect(() => {
    return () => {
      mediaStream?.getTracks().forEach((track) => track.stop())
    }
  }, [mediaStream])

  useEffect(() => {
    if (step === "room" && session.status === "ended") {
      const timeout = window.setTimeout(() => setStep("result"), 10000)
      return () => window.clearTimeout(timeout)
    }
  }, [session.status, step])

  const formattedTime = useMemo(() => {
    const mins = Math.floor(timerSeconds / 60)
    const secs = timerSeconds % 60
    return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`
  }, [timerSeconds])
  const trendDelta = useMemo(() => {
    if (pastInterviews.length < 2) return 0
    return pastInterviews[0].score - pastInterviews[pastInterviews.length - 1].score
  }, [pastInterviews])
  const gamification = useMemo(() => {
    const latest = pastInterviews[0]?.score ?? 0
    const badges: string[] = []
    if (latest >= 85) badges.push("Confident Speaker")
    if (latest >= 78) badges.push("Technical Thinker")
    if (pastInterviews.length >= 5) badges.push("Consistency Champ")
    const streak = Math.min(7, pastInterviews.length)
    const milestone = latest >= 90 ? "Elite Level" : latest >= 80 ? "Advanced Level" : latest >= 70 ? "Growth Level" : "Starter Level"
    return { badges, streak, milestone }
  }, [pastInterviews])

  const handleContinueLanguage = () => {
    if (!language || !resolvedRole || !experienceLevel || !interviewMode || !personality) return
    setStep("permissions")
  }

  const requestPermissions = async () => {
    const proceedToRoom = () => {
      setStep("loading")
      window.setTimeout(() => setStep("room"), 1400)
    }
    try {
      setPermissionError(null)
      if (!navigator.mediaDevices?.getUserMedia) {
        setPermissionError("Media devices are not supported in this browser. Continuing in limited mode.")
        setMediaStream(null)
        proceedToRoom()
        return
      }

      // Prefer full AV. If camera/mic is missing, degrade gracefully instead of blocking.
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: true })
        setMediaStream(stream)
        proceedToRoom()
        return
      } catch {
        // fallback chain below
      }

      try {
        const audioOnlyStream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false })
        setMediaStream(audioOnlyStream)
        setPermissionError("Camera not detected. Continuing with microphone only.")
        proceedToRoom()
        return
      } catch {
        // try video only
      }

      try {
        const videoOnlyStream = await navigator.mediaDevices.getUserMedia({ audio: false, video: true })
        setMediaStream(videoOnlyStream)
        setPermissionError("Microphone not detected. You can continue and type responses manually.")
        proceedToRoom()
        return
      } catch {
        // final fallback below
      }

      setMediaStream(null)
      setPermissionError("No usable microphone/camera found. Continuing in limited mode.")
      proceedToRoom()
    } catch (error: any) {
      const message = String(error?.message || "").toLowerCase()
      if (message.includes("requested device not found") || message.includes("device not found")) {
        setPermissionError("No microphone/camera detected on this device. Continuing in limited mode.")
        setMediaStream(null)
        proceedToRoom()
        return
      }
      setPermissionError("Permission denied or unavailable. Continuing in limited mode.")
      setMediaStream(null)
      proceedToRoom()
    }
  }

  const handleStart = async () => {
    if (typeof window !== "undefined") {
      try {
        const dummy = new Audio()
        dummy.src = "data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEA"
        void dummy.play().catch(() => {})
      } catch {
        // no-op
      }
    }
    setTimerSeconds(0)
    return await session.startInterview()
  }

  const handleEnd = async () => {
    await session.endInterview()
  }

  const handleRetry = () => {
    session.resetInterview()
    setTimerSeconds(0)
    setStep("room")
  }

  return (
    <StudentDashboardLayout>
      <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }} className="space-y-6">
        <div className="dashboard-overview-card !bg-blue-50/10 p-6 dark:!bg-blue-900/30">
          <div className="flex items-center gap-3">
            <div className="rounded-2xl border border-slate-200/90 bg-white p-2 dark:border-blue-700 dark:bg-blue-900/40">
              <MessageSquareText className="h-5 w-5 text-blue-600 dark:text-blue-300" />
            </div>
            <div>
              <h1 className="font-display text-2xl font-semibold text-slate-900 dark:text-blue-50">AI Interview Session</h1>
              <p className="text-sm text-slate-600 dark:text-blue-200/85">Personalized voice + video interview with role-aware questioning and advanced scoring.</p>
              {resolvedRole && (
                <p className="mt-1 text-xs text-slate-500 dark:text-blue-300">
                  Role: {resolvedRole} • Experience: {experienceLevel || "fresher"} • Mode: {interviewMode || "technical"}
                </p>
              )}
            </div>
          </div>
        </div>

        {step === "language" && (
          <LanguageSelector
            selectedLanguage={language}
            selectedRole={selectedRole}
            selectedExperience={experienceLevel}
            selectedMode={interviewMode}
            onSelect={setLanguage}
            onRoleSelect={setSelectedRole}
            onExperienceSelect={setExperienceLevel}
            onModeSelect={setInterviewMode}
            onContinue={handleContinueLanguage}
          />
        )}
        {step === "permissions" && <PermissionGate hasPermission={Boolean(mediaStream)} error={permissionError} onRequestPermissions={requestPermissions} />}
        {step === "loading" && <InterviewLoader />}
        {step === "room" && (
          <InterviewRoom
            stream={mediaStream}
            currentQuestion={session.currentQuestion}
            spokenPrompt={session.spokenPrompt || session.currentQuestion}
            currentQuestionPreview={session.currentQuestionPreview}
            language={language || "en"}
            personality={personality || "friendly_mentor"}
            lastAIQuestion={session.conversationHistory.filter((item) => item.role === "assistant").slice(-2, -1)[0]?.content || ""}
            lastUserAnswer={session.conversationHistory.filter((item) => item.role === "user").slice(-1)[0]?.content || ""}
            coachingHint={session.coachingHint}
            contextHint={session.contextHint}
            responseQualityHint={session.responseQualityHint}
            phase={session.phase}
            questionType={session.questionType}
            finalScore={session.score}
            finalFeedback={session.feedback}
            isBusy={session.status === "loading"}
            isStarted={session.status === "active" || session.status === "loading"}
            questionIndex={session.questionIndex || 0}
            maxQuestions={session.maxQuestions}
            elapsedTimeLabel={formattedTime}
            onStartInterview={handleStart}
            onEndInterview={handleEnd}
            onFinalSummaryEnd={() => setStep("result")}
            onSubmitTranscript={async (transcript) => {
              setPermissionError(null)
              if (!transcript.trim()) return null
              const result = await session.submitAnswer(transcript)
              return {
                next_question: result.nextQuestion || "",
                is_end: result.isEnd,
              }
            }}
            onError={(message) => setPermissionError(message)}
          />
        )}
        {step === "result" && session.score !== null && session.feedback && <ScoreCard score={session.score} feedback={session.feedback} onRetry={handleRetry} />}

        {pastInterviews.length > 0 && (
          <div className="dashboard-overview-card p-6">
            <h3 className="mb-1 font-display text-lg font-semibold text-slate-900 dark:text-blue-50">Past Interviews</h3>
            <p className="mb-3 text-xs text-slate-600 dark:text-blue-300">
              Score progression: {trendDelta >= 0 ? `+${trendDelta}` : trendDelta} points vs oldest session.
            </p>
            <div className="space-y-2">
              {pastInterviews.map((item, index) => (
                <div key={`${item.created_at}-${index}`} className="rounded-xl border border-slate-200/90 bg-white p-3 text-sm dark:border-blue-800 dark:bg-blue-950/30">
                  <p className="font-medium text-slate-900 dark:text-blue-50">{item.role}</p>
                  <p className="text-slate-600 dark:text-blue-300">Score: {item.score}/100</p>
                  <p className="mt-1 line-clamp-2 text-xs text-slate-500 dark:text-blue-400">Replay transcript: {item.transcript}</p>
                  <p className="text-xs text-slate-500 dark:text-blue-400">{new Date(item.created_at).toLocaleString()}</p>
                </div>
              ))}
            </div>
            <div className="mt-4 rounded-xl border border-slate-200/90 bg-blue-50/10 p-3 dark:border-blue-800 dark:bg-blue-900/30">
              <p className="text-sm font-semibold text-slate-900 dark:text-blue-50">Progress Milestones</p>
              <p className="text-xs text-slate-600 dark:text-blue-300">Current tier: {gamification.milestone} • Practice streak: {gamification.streak} sessions</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {gamification.badges.length ? (
                  gamification.badges.map((badge) => (
                    <span key={badge} className="rounded-full border border-blue-600/30 bg-white px-3 py-1 text-xs font-medium text-blue-600 dark:border-blue-500/40 dark:bg-blue-950/40 dark:text-blue-300">
                      {badge}
                    </span>
                  ))
                ) : (
                  <span className="text-xs text-slate-500 dark:text-blue-400">Complete more rounds to unlock badges.</span>
                )}
              </div>
            </div>
          </div>
        )}

        {(permissionError || session.error) && (
          <div className="dashboard-overview-card flex items-center gap-2 border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-950/20 dark:text-red-200">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{permissionError || session.error}</span>
          </div>
        )}
      </motion.div>
    </StudentDashboardLayout>
  )
}

export default function CareerAlignPage() {
  return (
    <ErrorBoundary>
      <CareerAlignPageContent />
    </ErrorBoundary>
  )
}
