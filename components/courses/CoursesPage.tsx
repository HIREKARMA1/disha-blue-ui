"use client"

import { useMemo, useRef, useState } from "react"
import { GraduationCap } from "lucide-react"
import { StudentDashboardLayout } from "@/components/dashboard/StudentDashboardLayout"
import { CourseList } from "@/components/courses/CourseList"
import { EmptyState } from "@/components/courses/EmptyState"
import { Loader } from "@/components/courses/Loader"
import { SearchInput } from "@/components/courses/SearchInput"
import { UserProfileCard } from "@/components/courses/UserProfileCard"
import { VoiceInput } from "@/components/courses/VoiceInput"
import { parseUserInput } from "@/components/courses/parser"
import { CourseItem, ParsedUserProfile } from "@/components/courses/types"

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

const LOCAL_STORAGE_KEY = "courses.previousSearches"

export function CoursesPage() {
  const [userInput, setUserInput] = useState("")
  const [parsedData, setParsedData] = useState<ParsedUserProfile | null>(null)
  const [courses, setCourses] = useState<CourseItem[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isListening, setIsListening] = useState(false)
  const recognitionRef = useRef<SpeechRecognitionLike | null>(null)

  const previousSearches = useMemo(() => {
    if (typeof window === "undefined") return []
    try {
      const raw = window.localStorage.getItem(LOCAL_STORAGE_KEY)
      const parsed = raw ? (JSON.parse(raw) as string[]) : []
      return parsed.slice(0, 5)
    } catch {
      return []
    }
  }, [userInput])

  const persistSearch = (text: string) => {
    if (typeof window === "undefined" || !text.trim()) return
    try {
      const existingRaw = window.localStorage.getItem(LOCAL_STORAGE_KEY)
      const existing = existingRaw ? (JSON.parse(existingRaw) as string[]) : []
      const deduped = [text, ...existing.filter((item) => item !== text)].slice(0, 8)
      window.localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(deduped))
    } catch {
      // Ignore localStorage failures on low-storage devices.
    }
  }

  const requestRecommendations = async (rawText: string) => {
    const clean = rawText.trim()
    if (!clean) {
      setError("Please speak or type what kind of job skill you want.")
      return
    }

    const parsed = parseUserInput(clean)
    setUserInput(clean)
    setParsedData(parsed)
    setError(null)
    setLoading(true)
    persistSearch(clean)

    try {
      const response = await fetch("/api/recommend-courses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userInput: clean, parsedData: parsed }),
      })
      const data = (await response.json()) as { courses?: CourseItem[]; error?: string }
      if (!response.ok) throw new Error(data.error || "Failed to fetch courses")
      setCourses(Array.isArray(data.courses) ? data.courses : [])
    } catch (err: any) {
      setCourses([])
      setError(String(err?.message || "Could not fetch courses right now."))
    } finally {
      setLoading(false)
    }
  }

  const stopVoice = () => {
    try {
      recognitionRef.current?.stop()
    } catch {
      // no-op
    }
    setIsListening(false)
  }

  const startVoice = () => {
    const RecognitionCtor = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition
    if (!RecognitionCtor) {
      setError("Your browser does not support voice input. Please type instead.")
      return
    }

    const recognition = new RecognitionCtor() as SpeechRecognitionLike
    recognitionRef.current = recognition
    recognition.lang = "en-IN"
    recognition.interimResults = false
    recognition.continuous = false
    setError(null)
    setIsListening(true)

    recognition.onresult = (event) => {
      const transcript = String(event?.results?.[0]?.[0]?.transcript || "").trim()
      if (!transcript) {
        setError("No speech detected. Please try again.")
        setIsListening(false)
        return
      }
      stopVoice()
      void requestRecommendations(transcript)
    }

    recognition.onerror = (event) => {
      const code = String(event?.error || "unknown")
      if (code === "not-allowed" || code === "service-not-allowed") {
        setError("Microphone permission denied. Please enable mic or type your goal.")
      } else if (code === "no-speech") {
        setError("No speech detected. Please speak clearly and retry.")
      } else {
        setError("Voice input failed. Please type your request.")
      }
      setIsListening(false)
    }

    recognition.onend = () => setIsListening(false)

    try {
      recognition.start()
    } catch {
      setIsListening(false)
      setError("Could not start microphone. Please try again.")
    }
  }

  return (
    <StudentDashboardLayout>
      <div className="space-y-4">
        <div className="dashboard-overview-card !bg-sage/10 p-5 dark:!bg-emerald-900/30">
          <div className="flex items-start gap-3">
            <div className="rounded-xl bg-white p-2 dark:bg-emerald-900">
              <GraduationCap className="h-5 w-5 text-sage-deep dark:text-emerald-300" />
            </div>
            <div>
              <h1 className="text-2xl font-semibold text-slate-900 dark:text-emerald-50">Courses</h1>
              <p className="mt-1 text-sm text-slate-600 dark:text-emerald-200/85">
                Speak or type your education and job goal. We suggest short, practical, low-cost courses.
              </p>
            </div>
          </div>
        </div>

        <div className="dashboard-overview-card space-y-3 p-4">
          <div className="flex flex-wrap items-center gap-2">
            <VoiceInput isListening={isListening} onStart={startVoice} onStop={stopVoice} disabled={loading} />
            <span className="text-xs text-slate-500 dark:text-emerald-300/80">Hindi + English supported</span>
          </div>
          <SearchInput onSearch={requestRecommendations} disabled={loading} />
          {previousSearches.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {previousSearches.map((item) => (
                <button
                  key={item}
                  type="button"
                  className="rounded-full border border-slate-200 px-3 py-1 text-xs text-slate-700 hover:bg-sage/10 dark:border-emerald-800 dark:text-emerald-200"
                  onClick={() => requestRecommendations(item)}
                >
                  {item}
                </button>
              ))}
            </div>
          )}
          {error && <p className="text-sm font-medium text-rose-600 dark:text-rose-300">{error}</p>}
        </div>

        <UserProfileCard profile={parsedData} />

        {loading ? (
          <Loader />
        ) : courses.length > 0 ? (
          <CourseList courses={courses} />
        ) : (
          <EmptyState message={userInput ? "Try changing the job role or speaking in short sentences." : undefined} />
        )}
      </div>
    </StudentDashboardLayout>
  )
}
