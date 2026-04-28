"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { Mic, MicOff, Languages, Volume2, Clock3, Download, Square } from "lucide-react"
import { toast } from "react-hot-toast"
import { apiClient } from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

type Mode = "hr_interview" | "casual_conversation" | "group_discussion"
type Lang = "en" | "hi" | "or" | "bn" | "ta" | "te"
type Turn = { role: "user" | "ai"; text: string; language: string }

type Evaluation = {
  fluency: number
  confidence: number
  grammar: number
  suggestions: string[]
  summary: string
}

const languageOptions: { label: string; value: Lang }[] = [
  { label: "English", value: "en" },
  { label: "Hindi", value: "hi" },
  { label: "Odia", value: "or" },
  { label: "Bengali", value: "bn" },
  { label: "Tamil", value: "ta" },
  { label: "Telugu", value: "te" },
]

const modeOptions: { label: string; value: Mode }[] = [
  { label: "HR Interview", value: "hr_interview" },
  { label: "Casual Conversation", value: "casual_conversation" },
  { label: "Group Discussion", value: "group_discussion" },
]

export function AICommunicationRoom() {
  const [sessionId, setSessionId] = useState<string | null>(null)
  const [language, setLanguage] = useState<Lang>("en")
  const [mode, setMode] = useState<Mode>("hr_interview")
  const [transcript, setTranscript] = useState<Turn[]>([])
  const [isListening, setIsListening] = useState(false)
  const [isAiSpeaking, setIsAiSpeaking] = useState(false)
  const [interimText, setInterimText] = useState("")
  const [seconds, setSeconds] = useState(0)
  const [evaluation, setEvaluation] = useState<Evaluation | null>(null)
  const [isBusy, setIsBusy] = useState(false)
  const [isEndingSession, setIsEndingSession] = useState(false)
  const [lastAudioUrl, setLastAudioUrl] = useState<string | null>(null)

  const recognitionRef = useRef<any>(null)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  const buildLocalEvaluation = (): Evaluation => ({
    fluency: Math.min(100, Math.max(45, 50 + Math.min(30, transcript.length * 5))),
    confidence: Math.min(100, Math.max(40, 48 + Math.min(30, transcript.length * 4))),
    grammar: Math.min(100, Math.max(50, 55 + Math.min(25, transcript.length * 3))),
    suggestions: [
      "Keep responses in 2-3 concise, structured sentences.",
      "Add one concrete example when answering follow-up questions.",
      "Pause briefly between ideas to improve clarity and confidence.",
    ],
    summary: "Session ended with local fallback evaluation due provider/network delay.",
  })

  const formattedTime = useMemo(() => {
    const mm = String(Math.floor(seconds / 60)).padStart(2, "0")
    const ss = String(seconds % 60).padStart(2, "0")
    return `${mm}:${ss}`
  }, [seconds])

  useEffect(() => {
    if (!sessionId || evaluation) return
    const timer = setInterval(() => setSeconds((prev) => prev + 1), 1000)
    return () => clearInterval(timer)
  }, [sessionId, evaluation])

  useEffect(() => {
    return () => {
      if (lastAudioUrl) URL.revokeObjectURL(lastAudioUrl)
    }
  }, [lastAudioUrl])

  const startSession = async () => {
    try {
      const response = await apiClient.startAICommunicationSession({ language, mode })
      setSessionId(response.sessionId)
      setTranscript([])
      setSeconds(0)
      setEvaluation(null)
      toast.success("Communication assessment started")
    } catch (error: any) {
      toast.error(error?.response?.data?.detail || "Failed to start session")
    }
  }

  const speakAIResponse = async (text: string) => {
    try {
      setIsAiSpeaking(true)
      const audioBlob = await apiClient.getAICommunicationTTS(text, language)
      const url = URL.createObjectURL(audioBlob)
      if (lastAudioUrl) URL.revokeObjectURL(lastAudioUrl)
      setLastAudioUrl(url)
      const audio = new Audio(url)
      audioRef.current = audio
      await audio.play()
      await new Promise<void>((resolve) => {
        audio.onended = () => resolve()
        audio.onerror = () => resolve()
      })
    } catch {
      toast.error("Sarvam voice playback failed")
    } finally {
      setIsAiSpeaking(false)
    }
  }

  const sendUserText = async (userText: string) => {
    if (!sessionId || !userText.trim()) return
    try {
      setIsBusy(true)
      const userTurn: Turn = { role: "user", text: userText.trim(), language }
      setTranscript((prev) => [...prev, userTurn])
      const response = await apiClient.sendAICommunicationMessage({
        sessionId,
        userText: userText.trim(),
        language,
      })
      const aiTurn: Turn = { role: "ai", text: response.aiText, language: response.detectedLanguage || language }
      setTranscript((prev) => [...prev, aiTurn])
      await speakAIResponse(response.aiText)
      if ((response as any).fallbackUsed) {
        toast("AI quota exhausted, using local fallback coach mode.")
      }
    } catch (error: any) {
      toast.error(error?.response?.data?.detail || "AI message request failed")
    } finally {
      setInterimText("")
      setIsBusy(false)
    }
  }

  const startListening = async () => {
    const Recognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    if (!Recognition) {
      toast.error("Speech recognition is not supported in this browser")
      return
    }
    try {
      const speech = new Recognition()
      recognitionRef.current = speech
      speech.continuous = true
      speech.interimResults = true
      speech.lang = language
      speech.onresult = async (event: any) => {
        let finalText = ""
        let draft = ""
        for (let i = event.resultIndex; i < event.results.length; i += 1) {
          const result = event.results[i]
          const current = result[0]?.transcript || ""
          if (result.isFinal) finalText += `${current} `
          else draft += current
        }
        setInterimText(draft)
        if (finalText.trim()) {
          speech.stop()
          setIsListening(false)
          await sendUserText(finalText.trim())
        }
      }
      speech.onerror = () => {
        setIsListening(false)
        toast.error("Microphone input failed")
      }
      speech.start()
      setIsListening(true)
    } catch {
      setIsListening(false)
      toast.error("Could not start microphone")
    }
  }

  const stopListening = () => {
    recognitionRef.current?.stop()
    setIsListening(false)
  }

  const endSession = async () => {
    if (!sessionId || isEndingSession) return
    setIsEndingSession(true)
    stopListening()
    setIsBusy(false)
    setIsAiSpeaking(false)
    audioRef.current?.pause()
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel()
    }
    try {
      const feedback = await Promise.race([
        apiClient.evaluateAICommunication({
          sessionId,
          transcript: transcript.map((t) => ({ role: t.role, text: t.text, language: t.language })),
          language,
        }),
        new Promise<Evaluation>((_, reject) =>
          setTimeout(() => reject(new Error("Evaluation timeout")), 8000)
        ),
      ])
      setEvaluation(feedback)
      setSessionId(null)
    } catch (error: any) {
      toast.error(error?.response?.data?.detail || "Evaluation unavailable. Showing local result.")
      setEvaluation(buildLocalEvaluation())
      setSessionId(null)
    } finally {
      setIsEndingSession(false)
    }
  }

  const downloadTranscript = () => {
    const content = transcript.map((t) => `${t.role.toUpperCase()}: ${t.text}`).join("\n")
    const blob = new Blob([content], { type: "text/plain;charset=utf-8" })
    const url = URL.createObjectURL(blob)
    const anchor = document.createElement("a")
    anchor.href = url
    anchor.download = `ai-communication-transcript-${Date.now()}.txt`
    anchor.click()
    URL.revokeObjectURL(url)
  }

  if (evaluation) {
    return (
      <div className="mx-auto w-full max-w-4xl space-y-4">
        <Card className="space-y-3 p-5">
          <h3 className="text-lg font-semibold">Assessment Feedback</h3>
          <div className="grid grid-cols-1 gap-3 text-sm md:grid-cols-3">
            <div className="rounded-lg border p-3">Fluency: <strong>{evaluation.fluency}</strong>/100</div>
            <div className="rounded-lg border p-3">Confidence: <strong>{evaluation.confidence}</strong>/100</div>
            <div className="rounded-lg border p-3">Grammar: <strong>{evaluation.grammar}</strong>/100</div>
          </div>
          <p className="text-sm text-muted-foreground">{evaluation.summary}</p>
          <ul className="list-disc space-y-1 pl-5 text-sm">
            {evaluation.suggestions.map((s, i) => (
              <li key={`${s}-${i}`}>{s}</li>
            ))}
          </ul>
          <div className="pt-2">
            <Button
              onClick={() => {
                setEvaluation(null)
                setTranscript([])
                setInterimText("")
                setSeconds(0)
                setIsBusy(false)
                setIsAiSpeaking(false)
                setIsEndingSession(false)
              }}
            >
              Start New Session
            </Button>
          </div>
        </Card>
      </div>
    )
  }

  return (
    <div className="mx-auto w-full max-w-4xl space-y-4">
      <Card className="p-5">
        <div className="flex flex-wrap items-center gap-3">
          <Select value={mode} onValueChange={(v) => setMode(v as Mode)}>
            <SelectTrigger className="w-[220px]">
              <SelectValue placeholder="Mode" />
            </SelectTrigger>
            <SelectContent>
              {modeOptions.map((item) => (
                <SelectItem key={item.value} value={item.value}>
                  {item.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={language} onValueChange={(v) => setLanguage(v as Lang)}>
            <SelectTrigger className="w-[180px]">
              <Languages className="mr-2 h-4 w-4" />
              <SelectValue placeholder="Language" />
            </SelectTrigger>
            <SelectContent>
              {languageOptions.map((item) => (
                <SelectItem key={item.value} value={item.value}>
                  {item.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {!sessionId ? (
            <Button onClick={startSession}>Start Session</Button>
          ) : (
            <Button variant="destructive" onClick={endSession} disabled={isEndingSession}>
              <Square className="mr-2 h-4 w-4" /> {isEndingSession ? "Ending..." : "End Session"}
            </Button>
          )}

          <div className="ml-auto inline-flex items-center gap-2 text-sm text-muted-foreground">
            <Clock3 className="h-4 w-4" />
            {formattedTime}
          </div>
        </div>
      </Card>

      <Card className="space-y-4 p-5">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Live Conversation</h2>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={downloadTranscript} disabled={!transcript.length}>
              <Download className="mr-2 h-4 w-4" /> Transcript
            </Button>
            {lastAudioUrl ? (
              <Button variant="outline" onClick={() => audioRef.current?.play()}>
                <Volume2 className="mr-2 h-4 w-4" /> Replay AI
              </Button>
            ) : null}
          </div>
        </div>

        <div className="h-[360px] overflow-y-auto rounded-xl border bg-muted/30 p-4">
          {transcript.length === 0 ? (
            <p className="text-sm text-muted-foreground">Start speaking to begin the assessment.</p>
          ) : (
            <div className="space-y-3">
              {transcript.map((turn, index) => (
                <div
                  key={`${turn.role}-${index}`}
                  className={`max-w-[85%] rounded-xl px-3 py-2 text-sm ${
                    turn.role === "user" ? "ml-auto bg-primary text-primary-foreground" : "bg-background border"
                  }`}
                >
                  {turn.text}
                </div>
              ))}
              {interimText ? <div className="text-sm italic text-muted-foreground">{interimText}</div> : null}
            </div>
          )}
        </div>

        <div className="flex items-center gap-3">
          {!isListening ? (
            <Button onClick={startListening} disabled={!sessionId || isBusy || isAiSpeaking}>
              <Mic className="mr-2 h-4 w-4" /> Speak
            </Button>
          ) : (
            <Button variant="secondary" onClick={stopListening}>
              <MicOff className="mr-2 h-4 w-4" /> Stop
            </Button>
          )}
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span
              className={`inline-block h-2 w-2 rounded-full ${
                isAiSpeaking ? "animate-pulse bg-emerald-500" : "bg-muted-foreground/40"
              }`}
            />
            {isAiSpeaking ? "AI is speaking..." : "AI waiting"}
          </div>
        </div>
      </Card>

    </div>
  )
}
