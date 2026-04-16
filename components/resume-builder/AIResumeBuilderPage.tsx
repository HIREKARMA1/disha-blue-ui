"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { motion } from "framer-motion"
import { useDropzone } from "react-dropzone"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"
import * as AlertDialog from "@radix-ui/react-alert-dialog"
import { useReactToPrint } from "react-to-print"
import confetti from "canvas-confetti"
import {
  Clipboard,
  CheckCircle2,
  FileText,
  Loader2,
  Mic,
  Paperclip,
  Send,
  Sparkles,
  Wand2,
  X,
} from "lucide-react"
import type { FullResumeSchema } from "@/hooks/useResumeAI"
import { useResumeAI } from "@/hooks/useResumeAI"
import { useLocale } from "@/contexts/LocaleContext"
import { t } from "@/lib/i18n"
import { useProfile } from "@/hooks/useProfile"
import { ExecutiveResumePreview } from "./ResumePreview"
import { PostResumePreferences } from "./PostResumePreferences"

const mkId = () => `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
const VOICE_SILENCE_MS = 2000
const MIN_RESUME_INPUT_LEN = 10
const AUDIO_CHUNK_MS = 1000
const AUDIO_FLUSH_MS = 4000

interface LocalChatMessage {
  id: string
  role: "user" | "assistant"
  content: string
}
type VoicePhase = "idle" | "listening" | "processing" | "completed"
interface ExtractedInputPreview {
  name: string
  skills: string[]
  education: string[]
  experience: string[]
}
interface PendingConfirmation {
  originalContent: string
  translatedContent: string
  preview: ExtractedInputPreview
}
interface ParsedTextResumeSection {
  title: string
  lines: string[]
}

interface ChunkDebugItem {
  id: string
  bytes: number
  latencyMs: number
  rawTranscript: string
  translatedText: string
  status: "ok" | "error" | "empty"
  backendDebug?: Record<string, unknown>
}
const normalizeChunkStatus = (status: string | undefined): ChunkDebugItem["status"] => {
  if (status === "error" || status === "empty") return status
  return "ok"
}

const formatResumeAsAssistantMessage = (resume: FullResumeSchema) => JSON.stringify(resume, null, 2)
const PLACEHOLDER_ROTATION_MS = 4500
const guidedPlaceholders = [
  "Say or type: My name is Rahul, I studied B.Tech in CSE and know React, Python...",
  "Try: Add your education, skills, and experience...",
  "Example: I interned at ABC as frontend developer and built 2 React projects...",
]
const suggestionChipTemplates: Record<string, string> = {
  education: "I studied B.Tech in Computer Science from ___ University and graduated in ___.",
  skills: "My skills include React, Python, SQL, and problem solving.",
  experience: "I worked as an intern at ___ where I built ___ and improved ___.",
  name: "My name is ___.",
}
const TECH_KEYWORDS = [
  "React", "Node.js", "Python", "Java", "JavaScript",
  "TypeScript", "HTML", "CSS", "SQL", "MongoDB",
  "Express", "Next.js", "FastAPI", "REST API", "API",
  "Docker", "Kubernetes", "AWS", "Git", "Linux",
  "C", "C++", "C#", "Spring Boot",
]
const TECH_KEYWORD_MAP: Record<string, string> = {
  "react js": "React",
  "node js": "Node.js",
  "rest api": "REST API",
  "fast api": "FastAPI",
  "next js": "Next.js",
}
type LanguageType = "hindi" | "odia" | "mixed" | "english"
const ATS_SCORE_BAR_COLOR = (score: number) => {
  if (score < 40) return "bg-red-500"
  if (score < 70) return "bg-amber-500"
  return "bg-emerald-500"
}
const isValidResumeInput = (text: string): boolean => {
  const cleaned = text.trim()
  const hasMeaningfulLength = cleaned.length >= 10
  const hasAnyScript =
    /[\u0900-\u097F]/.test(cleaned) || // Devanagari (Hindi and related)
    /[\u0B00-\u0B7F]/.test(cleaned) || // Odia
    /[a-zA-Z]/.test(cleaned) ||
    /[0-9]/.test(cleaned)

  return hasMeaningfulLength && hasAnyScript
}

export function AIResumeBuilderPage() {
  const { locale } = useLocale()
  const { profile } = useProfile()
  const { resumeState, resumeData, setResumeData, generateResume, generationMetadata, textResume, isGenerating, isSaving, statusMessage, error, errorSuggestions, saveToProfile, transcribeAudioChunk } = useResumeAI()
  const [messages, setMessages] = useState<LocalChatMessage[]>([])
  const [attachments, setAttachments] = useState<Array<{ id: string; file: File; name: string }>>([])
  const [inputValue, setInputValue] = useState("")
  const [transcript, setTranscript] = useState("")
  const [isRecording, setIsRecording] = useState(false)
  const [voiceStatus, setVoiceStatus] = useState("")
  const [voiceErrorHint, setVoiceErrorHint] = useState("")
  const [voicePhase, setVoicePhase] = useState<VoicePhase>("idle")
  const [liveTranscript, setLiveTranscript] = useState("")
  const [placeholderIndex, setPlaceholderIndex] = useState(0)
  const [pendingConfirmation, setPendingConfirmation] = useState<PendingConfirmation | null>(null)
  const [resumeVersions, setResumeVersions] = useState<FullResumeSchema[]>([])
  const [showVersionCompare, setShowVersionCompare] = useState(false)
  const [lastFailedPayload, setLastFailedPayload] = useState<{ content: string; translatedContent: string } | null>(null)
  const [printStatus, setPrintStatus] = useState("")
  const [previewMode, setPreviewMode] = useState<"chat" | "preview">("preview")
  const [mobileTab, setMobileTab] = useState<"chat" | "preview">("chat")
  const [saveDialogOpen, setSaveDialogOpen] = useState(false)
  const [showSavedBadge, setShowSavedBadge] = useState(false)
  const [quickEditOpen, setQuickEditOpen] = useState(false)
  const [quickEditDraft, setQuickEditDraft] = useState<FullResumeSchema | null>(null)
  const [debugMode, setDebugMode] = useState(false)
  const [chunkDebugLog, setChunkDebugLog] = useState<ChunkDebugItem[]>([])
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const mediaStreamRef = useRef<MediaStream | null>(null)
  const audioChunkBufferRef = useRef<Blob[]>([])
  const flushIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const printRef = useRef<HTMLDivElement>(null)
  const voiceTranscriptRef = useRef("")
  const translatedVoiceTranscriptRef = useRef("")
  const silenceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const manualStopRef = useRef(false)
  const chunkCounterRef = useRef(0)
  const parsedTextResume = useMemo(() => {
    const raw = (textResume || "").trim()
    if (!raw) return [] as ParsedTextResumeSection[]
    const sectionHeaders = ["Summary", "Skills", "Experience", "Education", "Projects"]
    const lines = raw.split(/\r?\n/).map((line) => line.trim())
    const sections: ParsedTextResumeSection[] = []
    let currentTitle = "Overview"
    let bucket: string[] = []

    const flush = () => {
      const cleaned = bucket.filter(Boolean)
      if (cleaned.length) sections.push({ title: currentTitle, lines: cleaned })
      bucket = []
    }

    for (const line of lines) {
      if (!line) continue
      const normalized = line.replace(/[:\-]+$/, "").trim().toLowerCase()
      const match = sectionHeaders.find((header) => normalized === header.toLowerCase())
      if (match) {
        flush()
        currentTitle = match
        continue
      }
      bucket.push(line.replace(/^[•\-]\s*/, "").trim())
    }
    flush()
    return sections
  }, [textResume])

  const hasResume = resumeState.type === "structured" || resumeState.type === "text"
  const currentPlaceholder = guidedPlaceholders[placeholderIndex % guidedPlaceholders.length]
  const previousResume = resumeVersions.length > 1 ? resumeVersions[resumeVersions.length - 2] : null
  const currentResume = resumeVersions.length > 0 ? resumeVersions[resumeVersions.length - 1] : null
  const skillDiff = useMemo(() => {
    if (!previousResume || !currentResume) return { added: [], removed: [] }
    const prev = new Set(previousResume.skills.map((s) => s.toLowerCase()))
    const curr = new Set(currentResume.skills.map((s) => s.toLowerCase()))
    return {
      added: currentResume.skills.filter((s) => !prev.has(s.toLowerCase())),
      removed: previousResume.skills.filter((s) => !curr.has(s.toLowerCase())),
    }
  }, [previousResume, currentResume])

  useEffect(() => {
    const id = window.setInterval(() => {
      setPlaceholderIndex((prev) => (prev + 1) % guidedPlaceholders.length)
    }, PLACEHOLDER_ROTATION_MS)
    return () => window.clearInterval(id)
  }, [])

  const extractInputPreview = (text: string): ExtractedInputPreview => {
    const trimmed = text.trim()
    const nameMatch = trimmed.match(/(?:my name is|name\s*:|i am)\s+([A-Za-z][A-Za-z\s.'-]{1,50})/i)
    const skillsMatch = trimmed.match(/skills?\s*(?:include|:)?\s*([^.]+)/i)
    const educationMatch = trimmed.match(/(?:studied|education|degree|b\.?tech|m\.?tech|bsc|msc|mba)\s*([^.]+)/i)
    const experienceMatch = trimmed.match(/(?:worked|internship|experience|intern)\s*([^.]+)/i)
    const skills = skillsMatch?.[1]
      ? skillsMatch[1].split(",").map((item) => item.trim()).filter(Boolean).slice(0, 6)
      : []
    return {
      name: nameMatch?.[1]?.trim() || "",
      skills,
      education: educationMatch?.[0] ? [educationMatch[0].trim()] : [],
      experience: experienceMatch?.[0] ? [experienceMatch[0].trim()] : [],
    }
  }

  const suggestionChips = useMemo(() => {
    const chips: Array<{ key: string; label: string; template: string }> = []
    const loweredSuggestions = errorSuggestions.map((item) => item.toLowerCase())
    if (loweredSuggestions.some((item) => item.includes("education"))) {
      chips.push({ key: "education", label: "Add Education", template: suggestionChipTemplates.education })
    }
    if (loweredSuggestions.some((item) => item.includes("skills"))) {
      chips.push({ key: "skills", label: "Add Skills", template: suggestionChipTemplates.skills })
    }
    if (loweredSuggestions.some((item) => item.includes("experience") || item.includes("internship") || item.includes("work"))) {
      chips.push({ key: "experience", label: "Add Experience", template: suggestionChipTemplates.experience })
    }
    if (loweredSuggestions.some((item) => item.includes("name"))) {
      chips.push({ key: "name", label: "Add Name", template: suggestionChipTemplates.name })
    }
    return chips
  }, [errorSuggestions])
  const atsFeedback = generationMetadata?.ats_feedback
  const atsScore = Number(atsFeedback?.match_score ?? 0)
  const insightMessage = useMemo(() => {
    if (!atsFeedback) return ""
    const missing = atsFeedback.missing_keywords || []
    if (atsScore >= 75) {
      return missing.length
        ? `Your resume is a strong match for this role. Adding ${missing.slice(0, 2).join(" and ")} with measurable achievements could improve your score further.`
        : "Your resume is a strong match for this role. Keep refining with quantified impact to stay recruiter-ready."
    }
    if (atsScore >= 50) {
      return missing.length
        ? `You have a solid base for this role. Add ${missing.slice(0, 3).join(", ")} and stronger outcome-focused bullets to boost alignment.`
        : "Your resume has a fair match. Strengthen role-specific achievements and tools to increase relevance."
    }
    return missing.length
      ? `Your resume needs stronger alignment for this role. Prioritize ${missing.slice(0, 3).join(", ")} and include quantified project impact.`
      : "Your resume needs more role alignment. Add targeted skills, measurable achievements, and role-specific project details."
  }, [atsFeedback, atsScore])
  const resumeAnalysis = useMemo(() => {
    const strengths: string[] = []
    const weaknesses: string[] = []
    if (resumeData.skills.length >= 4) strengths.push("Good skill coverage across core technologies")
    if (resumeData.projects.length >= 2) strengths.push("Strong project exposure for practical experience")
    if (resumeData.experience.length > 0) strengths.push("Relevant experience section is present")
    if (resumeData.personal_info.summary?.trim()) strengths.push("Professional summary is included")
    const missing = atsFeedback?.missing_keywords || []
    if (missing.length > 0) weaknesses.push(`Missing key role terms: ${missing.slice(0, 4).join(", ")}`)
    const hasQuantifiedBullets = resumeData.experience.some((item) =>
      item.bullets.some((bullet) => /\d/.test(bullet))
    )
    if (!hasQuantifiedBullets) weaknesses.push("No quantified achievements found in experience bullets")
    if (resumeData.skills.length < 3) weaknesses.push("Limited skill depth for ATS keyword matching")
    if (!resumeData.experience.length) weaknesses.push("No experience section details for role fit")
    return { strengths: strengths.slice(0, 3), weaknesses: weaknesses.slice(0, 3) }
  }, [resumeData, atsFeedback])

  const handlePrint = useReactToPrint({
  contentRef: printRef,
  documentTitle: `${(resumeData.personal_info.name || "student").replace(/\s+/g, "_")}_Resume`,
  onBeforePrint: async () => {
  setPrintStatus(t(locale, "resumeAI.printingStatus"))
  },
  onAfterPrint: () => setPrintStatus(""),
  })

  const onDrop = (acceptedFiles: File[]) => {
  const mapped = acceptedFiles.map((file) => ({ id: mkId(), file, name: file.name }))
  setAttachments([...attachments, ...mapped])
  }

  const { getRootProps, getInputProps, open: openFilePicker } = useDropzone({
  noClick: true,
  noKeyboard: true,
  multiple: true,
  onDrop,
  accept: {
  "application/pdf": [".pdf"],
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document": [".docx"],
  "application/msword": [".doc"],
  "text/plain": [".txt"],
  },
  })

  const clearSilenceTimer = () => {
    if (silenceTimerRef.current) {
      clearTimeout(silenceTimerRef.current)
      silenceTimerRef.current = null
    }
  }

  const scheduleSilenceStop = () => {
    clearSilenceTimer()
    silenceTimerRef.current = setTimeout(() => {
      mediaRecorderRef.current?.stop()
      setVoicePhase("processing")
      setVoiceStatus("Processing voice input...")
    }, VOICE_SILENCE_MS)
  }

  const detectLanguageType = (text: string): LanguageType => {
    const input = text || ""
    const hasDevanagari = /[\u0900-\u097F]/.test(input)
    const hasOdia = /[\u0B00-\u0B7F]/.test(input)
    const hasLatin = /[A-Za-z]/.test(input)
    if ((hasDevanagari || hasOdia) && hasLatin) return "mixed"
    if (hasDevanagari) return "hindi"
    if (hasOdia) return "odia"
    return "english"
  }

  const protectTechKeywords = (text: string) => {
    let protectedText = text
    const mapping: Record<string, string> = {}
    Object.entries(TECH_KEYWORD_MAP).forEach(([variant, canonical]) => {
      const escaped = variant.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
      const regex = new RegExp(`\\b${escaped}\\b`, "gi")
      protectedText = protectedText.replace(regex, canonical)
    })
    const sortedKeywords = [...TECH_KEYWORDS].sort((a, b) => b.length - a.length)
    sortedKeywords.forEach((keyword, index) => {
      const placeholder = `__TECH_${index + 1}__`
      const escaped = keyword.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
      const regex = new RegExp(`\\b${escaped}\\b`, "gi")
      if (regex.test(protectedText)) {
        mapping[placeholder] = keyword
        protectedText = protectedText.replace(regex, placeholder)
      }
    })
    return { protectedText, mapping }
  }

  const restoreTechKeywords = (text: string, mapping: Record<string, string>) => {
    let restored = text
    Object.entries(mapping).forEach(([placeholder, keyword]) => {
      restored = restored.split(placeholder).join(keyword)
    })
    return restored
  }

  const safeTranslateToEnglish = async (text: string): Promise<string> => {
    const languageType = detectLanguageType(text)
    if (locale === "en" && languageType === "english") return text
    const { protectedText, mapping } = protectTechKeywords(text)
    try {
      // Use Google Translate endpoint with a safe fallback for multilingual voice input.
      const response = await fetch(
        `https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=en&dt=t&q=${encodeURIComponent(protectedText)}`
      )
      if (!response.ok) return text
      const data = await response.json()
      const translated = Array.isArray(data?.[0]) ? data[0].map((chunk: any) => chunk?.[0] || "").join("") : ""
      if (!translated?.trim()) return text
      return restoreTechKeywords(translated.trim(), mapping)
    } catch {
      setVoiceStatus("Translation unavailable, using original input.")
      return text
    }
  }

  const processAudioChunk = async (audioChunk: Blob) => {
    console.info("[voice-upload] outgoing blob size(bytes):", audioChunk.size)
    if (!audioChunk.size) {
      console.warn("[voice-upload] blocked empty blob before transport")
      setVoiceErrorHint("Captured audio blob is empty. Please retry recording.")
      return
    }
    const chunkId = `chunk-${++chunkCounterRef.current}`
    const startedAt = performance.now()
    try {
      const response = await transcribeAudioChunk(audioChunk, {
        language: locale,
        priorTranscript: voiceTranscriptRef.current,
        debugMode,
        chunkId,
      })
      const latencyMs = Math.round(performance.now() - startedAt)
      if (debugMode) {
        const debugItem: ChunkDebugItem = {
          id: chunkId,
          bytes: audioChunk.size,
          latencyMs,
          rawTranscript: response?.transcript_text || "",
          translatedText: response?.translated_text || "",
          status: normalizeChunkStatus(response?.status),
          backendDebug: response?.debug,
        }
        setChunkDebugLog((prev) => [debugItem, ...prev].slice(0, 40))
      }
      if (response?.status === "error") return
      const chunkTranscript = (response?.transcript_text || "").trim()
      const chunkEnglish = (response?.translated_text || "").trim()
      if (!chunkTranscript && !chunkEnglish) return
      if (chunkTranscript) {
        const mergedTranscript = `${voiceTranscriptRef.current} ${chunkTranscript}`.trim()
        voiceTranscriptRef.current = mergedTranscript
        setLiveTranscript(mergedTranscript)
        setTranscript(mergedTranscript)
      }
      if (chunkEnglish) {
        translatedVoiceTranscriptRef.current = `${translatedVoiceTranscriptRef.current} ${chunkEnglish}`.trim()
      }
      scheduleSilenceStop()
    } catch {
      if (debugMode) {
        const latencyMs = Math.round(performance.now() - startedAt)
        const debugItem: ChunkDebugItem = {
          id: chunkId,
          bytes: audioChunk.size,
          latencyMs,
          rawTranscript: "",
          translatedText: "",
          status: "error",
        }
        setChunkDebugLog((prev) => [debugItem, ...prev].slice(0, 40))
      }
      setVoiceErrorHint("Live transcription failed for a chunk. Continuing...")
    }
  }

  const stopMediaTracks = () => {
    mediaStreamRef.current?.getTracks().forEach((track) => track.stop())
    mediaStreamRef.current = null
  }

  const clearFlushInterval = () => {
    if (flushIntervalRef.current) {
      clearInterval(flushIntervalRef.current)
      flushIntervalRef.current = null
    }
  }

  const flushBufferedAudioForTranscription = async () => {
    const chunks = audioChunkBufferRef.current
    if (!chunks.length) return
    const combinedBlob = new Blob(chunks, { type: "audio/webm;codecs=opus" })
    audioChunkBufferRef.current = []
    await processAudioChunk(combinedBlob)
  }

  const toggleRecording = async () => {
    if (isRecording) {
      manualStopRef.current = true
      clearSilenceTimer()
      clearFlushInterval()
      mediaRecorderRef.current?.stop()
      setIsRecording(false)
      setVoicePhase("processing")
      setVoiceStatus("Processing voice input...")
      return
    }

    if (!navigator?.mediaDevices?.getUserMedia || typeof MediaRecorder === "undefined") {
      setVoiceErrorHint("Live microphone capture is not supported in this browser.")
      return
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      mediaStreamRef.current = stream
      const preferredMimeType =
        typeof MediaRecorder !== "undefined" && MediaRecorder.isTypeSupported("audio/webm;codecs=opus")
          ? "audio/webm;codecs=opus"
          : "audio/webm"
      const recorder = new MediaRecorder(stream, { mimeType: preferredMimeType })
      mediaRecorderRef.current = recorder
      voiceTranscriptRef.current = ""
      translatedVoiceTranscriptRef.current = ""
      chunkCounterRef.current = 0
      setChunkDebugLog([])
      audioChunkBufferRef.current = []
      setLiveTranscript("")
      setTranscript("")
      manualStopRef.current = false
      setVoiceErrorHint("")
      setVoicePhase("listening")
      setVoiceStatus("Listening... live Odia transcription is active.")

      recorder.ondataavailable = (event: BlobEvent) => {
        if (!event.data || event.data.size === 0) return
        audioChunkBufferRef.current.push(event.data)
      }

      recorder.onstop = async () => {
        clearSilenceTimer()
        clearFlushInterval()
        await flushBufferedAudioForTranscription()
        stopMediaTracks()
        setIsRecording(false)
        const englishForResume = translatedVoiceTranscriptRef.current.trim()
        const rawTranscript = voiceTranscriptRef.current.trim()
        if (!rawTranscript) {
          setVoiceErrorHint("Voice input not detected. Please try again.")
          setVoicePhase("idle")
          manualStopRef.current = false
          return
        }
        const payloadForResume = englishForResume || rawTranscript
        if (payloadForResume.length < MIN_RESUME_INPUT_LEN) {
          setVoiceErrorHint("Please provide more details like your skills or education.")
          setVoicePhase("idle")
          manualStopRef.current = false
          return
        }
        setVoicePhase("completed")
        setVoiceStatus("Generating your resume from translated transcript...")
        void handleSend({ contentOverride: payloadForResume, bypassConfirmation: true })
        manualStopRef.current = false
      }

      recorder.start(AUDIO_CHUNK_MS)
      flushIntervalRef.current = setInterval(() => {
        void flushBufferedAudioForTranscription()
      }, AUDIO_FLUSH_MS)
      setIsRecording(true)
      scheduleSilenceStop()
    } catch {
      clearFlushInterval()
      stopMediaTracks()
      setVoiceErrorHint("Microphone permission denied or unavailable.")
      setVoicePhase("idle")
    }
  }

  const runGeneration = async (content: string, finalInput: string) => {
  setMessages((prev) => [...prev, { id: mkId(), role: "user", content }])
  setPendingConfirmation(null)
  try {
  const generated = await generateResume({
      text: finalInput,
  language: locale,
      jobDescription: "",
  files: attachments.map((a) => a.file),
  profileData: (profile || {}) as unknown as Record<string, unknown>,
  })
  const hasStructuredContent = Boolean(
  generated.personal_info.name?.trim() ||
  generated.personal_info.summary?.trim() ||
  generated.skills.length ||
  generated.education.length ||
  generated.experience.length ||
  generated.projects.length
  )
  if (hasStructuredContent) {
  setMessages((prev) => [
  ...prev,
  { id: mkId(), role: "assistant", content: formatResumeAsAssistantMessage(generated) },
  ])
  }
  setResumeVersions((prev) => [...prev.slice(-1), generated])
  setAttachments([])
  setInputValue("")
  setTranscript("")
  setMobileTab("preview")
  setVoicePhase("completed")
  setLastFailedPayload(null)
  } catch {
  setLastFailedPayload({ content, translatedContent: finalInput })
  }
  }

  const handleSend = async (options?: { contentOverride?: string; bypassConfirmation?: boolean }) => {
  const finalInput = (
  (options?.contentOverride && options.contentOverride.trim()) ||
  (inputValue && inputValue.trim()) ||
  (transcript && transcript.trim()) ||
  ""
  ).trim()

  if (isGenerating) return
  console.log("inputValue:", inputValue)
  console.log("transcript:", transcript)
  console.log("finalInput:", finalInput)
  if (!finalInput || finalInput.length < 5) {
  setVoiceErrorHint("Please enter or speak your details.")
  return
  }
  if (!isValidResumeInput(finalInput)) {
  setVoiceErrorHint("Please provide more meaningful details about your skills, education, or experience.")
  return
  }
  const rawText = finalInput
  console.log("Sending input:", rawText)
  const translatedText = await safeTranslateToEnglish(rawText)
  const finalPayloadInput = translatedText && translatedText.trim().length > 5 ? translatedText.trim() : rawText
  console.log("Raw Transcript:", rawText)
  console.log("Translated Text:", translatedText)
  console.log("Final Payload:", {
  input_text: finalPayloadInput,
  job_description: "",
  })
  const preview = extractInputPreview(finalPayloadInput)
  if (!options?.bypassConfirmation) {
  // Keep preview data available, but do not block API call for typed input.
  setPendingConfirmation({
  originalContent: rawText,
  translatedContent: finalPayloadInput,
  preview,
  })
  }
  await runGeneration(rawText, finalPayloadInput)
  }

  const handleSyncSuccess = () => {
  setShowSavedBadge(true)
  window.setTimeout(() => setShowSavedBadge(false), 3000)
  void confetti({
  particleCount: 70,
  spread: 65,
  startVelocity: 24,
  scalar: 0.8,
  origin: { y: 0.68 },
  })
  }

  const handleCopyResume = async () => {
  try {
  const formattedResumeText = [
  resumeData.personal_info.name || "Name",
  "",
  "SUMMARY",
  resumeData.personal_info.summary || "N/A",
  "",
  "SKILLS",
  resumeData.skills.length ? resumeData.skills.join(", ") : "N/A",
  "",
  "EXPERIENCE",
  ...(resumeData.experience.length
  ? resumeData.experience.flatMap((item) => [
    `${item.role || "Role"} - ${item.company || "Company"} (${item.start_date || ""} ${item.end_date ? `to ${item.end_date}` : ""})`.trim(),
    ...item.bullets.map((bullet) => `- ${bullet}`),
    "",
  ])
  : ["N/A", ""]),
  "EDUCATION",
  ...(resumeData.education.length
  ? resumeData.education.map(
    (item) =>
    `${item.degree || ""} ${item.field_of_study ? `in ${item.field_of_study}` : ""} - ${item.institution || ""} (${item.start_date || ""} ${item.end_date ? `to ${item.end_date}` : ""})`.replace(/\s+/g, " ").trim()
  )
  : ["N/A"]),
  "",
  "PROJECTS",
  ...(resumeData.projects.length
  ? resumeData.projects.flatMap((project) => [project.name || "Project", project.description ? `- ${project.description}` : "", ""])
  : ["N/A"]),
  ].join("\n")
  await navigator.clipboard.writeText(formattedResumeText)
  setVoiceStatus("Resume copied to clipboard.")
  } catch {
  setVoiceErrorHint("Could not copy resume. Please try again.")
  }
  }

  const handleOpenQuickEdit = () => {
    setQuickEditDraft(JSON.parse(JSON.stringify(resumeData)) as FullResumeSchema)
    setQuickEditOpen(true)
    setMobileTab("preview")
  }

  const handleApplyQuickEdit = () => {
    if (!quickEditDraft) {
      setVoiceErrorHint("No resume draft found. Please open Quick Resume Editor again.")
      return
    }
    setResumeData(quickEditDraft)
    setQuickEditOpen(false)
    setVoiceStatus("Resume updated. Review preview and click Save to update your profile.")
  }

  const updateQuickPersonal = (field: keyof FullResumeSchema["personal_info"], value: string) => {
    setQuickEditDraft((prev) => (prev ? { ...prev, personal_info: { ...prev.personal_info, [field]: value } } : prev))
  }
  const updateQuickTop = (field: "location_preferences" | "preferred_role", value: string) => {
    setQuickEditDraft((prev) => (prev ? { ...prev, [field]: value } : prev))
  }
  const updateQuickEducation = (index: number, field: keyof FullResumeSchema["education"][number], value: string) => {
    setQuickEditDraft((prev) => {
      if (!prev) return prev
      const education = [...prev.education]
      education[index] = { ...education[index], [field]: value }
      return { ...prev, education }
    })
  }
  const updateQuickExperience = (index: number, field: keyof FullResumeSchema["experience"][number], value: string) => {
    setQuickEditDraft((prev) => {
      if (!prev) return prev
      const experience = [...prev.experience]
      if (field === "bullets") {
        experience[index] = { ...experience[index], bullets: value.split(/\r?\n/).map((v) => v.trim()).filter(Boolean) }
      } else {
        experience[index] = { ...experience[index], [field]: value }
      }
      return { ...prev, experience }
    })
  }
  const updateQuickProject = (index: number, field: keyof FullResumeSchema["projects"][number], value: string) => {
    setQuickEditDraft((prev) => {
      if (!prev) return prev
      const projects = [...prev.projects]
      if (field === "bullets") {
        projects[index] = { ...projects[index], bullets: value.split(/\r?\n/).map((v) => v.trim()).filter(Boolean) }
      } else if (field === "tech_stack") {
        projects[index] = { ...projects[index], tech_stack: value.split(",").map((v) => v.trim()).filter(Boolean) }
      } else {
        projects[index] = { ...projects[index], [field]: value }
      }
      return { ...prev, projects }
    })
  }
  const addQuickEducation = () =>
    setQuickEditDraft((prev) =>
      prev
        ? {
          ...prev,
          education: [...prev.education, { institution: "", degree: "", field_of_study: "", start_date: "", end_date: "", score: "", highlights: [] }],
        }
        : prev
    )
  const addQuickExperience = () =>
    setQuickEditDraft((prev) =>
      prev
        ? {
          ...prev,
          experience: [...prev.experience, { company: "", role: "", start_date: "", end_date: "", location: "", bullets: [] }],
        }
        : prev
    )
  const addQuickProject = () =>
    setQuickEditDraft((prev) =>
      prev
        ? {
          ...prev,
          projects: [...prev.projects, { name: "", role: "", tech_stack: [], description: "", bullets: [], link: "" }],
        }
        : prev
    )
  const removeQuickEducation = (index: number) =>
    setQuickEditDraft((prev) => (prev ? { ...prev, education: prev.education.filter((_, i) => i !== index) } : prev))
  const removeQuickExperience = (index: number) =>
    setQuickEditDraft((prev) => (prev ? { ...prev, experience: prev.experience.filter((_, i) => i !== index) } : prev))
  const removeQuickProject = (index: number) =>
    setQuickEditDraft((prev) => (prev ? { ...prev, projects: prev.projects.filter((_, i) => i !== index) } : prev))

  return (
  <div className="space-y-6">
  <div className="rounded-2xl border border-border bg-gradient-to-br from-primary/[0.1] via-card to-secondary/[0.08] p-6 shadow-soft">
  <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
  <div>
  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">AI Resume</p>
  <h1 className="mt-1 font-display text-2xl font-semibold tracking-tight text-foreground md:text-3xl">
  Build Resume with AI
  </h1>
  <p className="mt-2 max-w-3xl text-sm text-muted-foreground md:text-base">
  Use voice, text, or existing resume files. The assistant can translate regional input and structure a recruiter-ready resume draft.
  </p>
  </div>
  <div className="inline-flex items-center gap-2 rounded-full border border-primary/25 bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
  <Sparkles className="h-3.5 w-3.5" />
  New
  </div>
  </div>
  </div>

  <div className="grid grid-cols-1 gap-6 xl:grid-cols-12">
  <div className="inline-flex w-fit items-center rounded-xl border border-border bg-card p-1 xl:hidden">
  <button
  onClick={() => setMobileTab("chat")}
  className={`rounded-lg px-3 py-1.5 text-xs font-medium ${mobileTab === "chat" ? "bg-primary/15 text-primary" : "text-muted-foreground"}`}
  >
  {t(locale, "resumeAI.mobileTabs.chat")}
  </button>
  <button
  onClick={() => setMobileTab("preview")}
  className={`rounded-lg px-3 py-1.5 text-xs font-medium ${mobileTab === "preview" ? "bg-primary/15 text-primary" : "text-muted-foreground"}`}
  >
  {t(locale, "resumeAI.mobileTabs.preview")}
  </button>
  </div>
  <motion.section
  initial={{ opacity: 0, x: -8 }}
  animate={{ opacity: 1, x: 0 }}
  className={`rounded-2xl border border-border bg-card shadow-soft xl:col-span-7 ${
  mobileTab === "preview" ? "hidden xl:block" : "block"
  }`}
  >
  <div className="border-b border-border/70 px-4 py-3">
  <p className="text-xs font-semibold uppercase tracking-[0.14em] text-primary">{t(locale, "chat.assistant")}</p>
  <h2 className="text-base font-semibold text-foreground">Resume Architect Chat</h2>
  </div>

  <div className="h-[52vh] space-y-3 overflow-y-auto p-4">
  {messages.length === 0 && (
  <div className="rounded-xl border border-dashed border-border bg-muted/30 p-4 text-sm text-muted-foreground">
  Try: "I know Java and React, create a one-page fresher resume for product companies."
  </div>
  )}
  {!isGenerating && !hasResume && (
  <div className="rounded-xl border border-dashed border-border bg-muted/20 p-3 text-xs text-muted-foreground">
  No resume generated yet
  </div>
  )}
  {messages.map((message) => (
  <div
  key={message.id}
  className={`rounded-2xl border px-3 py-2 text-sm ${
  message.role === "user" ? "ml-10 border-primary/30 bg-primary/10" : "mr-10 border-border bg-background/80"
  }`}
  >
  <ReactMarkdown remarkPlugins={[remarkGfm]}>{message.content}</ReactMarkdown>
  </div>
  ))}
  {isGenerating && (
  <p className="text-xs text-muted-foreground">Generating your resume...</p>
  )}
  {voicePhase === "listening" && <p className="text-xs text-primary">Listening 🎤</p>}
  {voicePhase === "processing" && <p className="text-xs text-muted-foreground">Processing ⏳</p>}
  {voicePhase === "completed" && <p className="text-xs text-emerald-600">Completed ✅</p>}
  {locale === "or" && (
  <p className="rounded-lg border border-amber-200 bg-amber-50 px-2 py-1 text-xs text-amber-800 dark:border-amber-700 dark:bg-amber-950/30 dark:text-amber-200">
    Odia voice input may not be fully supported. You can type or use Hindi/English voice.
  </p>
  )}
  {voiceStatus && <p className="text-xs text-secondary-700 dark:text-secondary-300">{voiceStatus}</p>}
  <label className="inline-flex w-fit items-center gap-2 rounded-md border border-border bg-background px-2 py-1 text-[11px] text-muted-foreground">
    <input
      type="checkbox"
      checked={debugMode}
      onChange={(e) => setDebugMode(e.target.checked)}
      className="h-3.5 w-3.5 rounded border-border"
    />
    DEBUG MODE
  </label>
  {liveTranscript && (
  <p className="rounded-lg border border-border bg-muted/30 px-2 py-1 text-xs text-foreground">
    Live transcript: {liveTranscript}
  </p>
  )}
  {debugMode && chunkDebugLog.length > 0 && (
    <div className="space-y-2 rounded-lg border border-border bg-background p-2 text-[11px]">
      <p className="font-semibold text-foreground">Live Chunk Diagnostics</p>
      {chunkDebugLog.map((item) => (
        <div key={item.id} className="space-y-1 rounded border border-border/80 bg-muted/20 p-2">
          <p className="font-medium text-foreground">
            {item.id} | {item.status.toUpperCase()} | {item.bytes} bytes | {item.latencyMs} ms
          </p>
          <p className="text-muted-foreground">Raw: {item.rawTranscript || "(empty)"}</p>
          <p className="text-muted-foreground">Translated: {item.translatedText || "(empty)"}</p>
          {item.backendDebug ? (
            <p className="text-muted-foreground">
              Backend timing: STT {String(item.backendDebug.transcription_time_ms ?? "-")} ms, Translation {String(item.backendDebug.translation_time_ms ?? "-")} ms
            </p>
          ) : null}
        </div>
      ))}
    </div>
  )}
  {voiceErrorHint && <p className="text-xs text-amber-700 dark:text-amber-300">{voiceErrorHint}</p>}
  {printStatus && <p className="text-xs text-muted-foreground">{printStatus}</p>}
  {error && <p className="text-xs text-destructive">{error}</p>}
  {errorSuggestions.length > 0 && (
    <ul className="list-inside list-disc space-y-1 text-xs text-destructive">
      {errorSuggestions.map((suggestion) => (
        <li key={suggestion}>{suggestion}</li>
      ))}
    </ul>
  )}
  {suggestionChips.length > 0 && (
    <div className="flex flex-wrap gap-2">
      {suggestionChips.map((chip) => (
        <button
          key={chip.key}
          type="button"
          className="rounded-full border border-primary/25 bg-primary/10 px-3 py-1 text-xs font-medium text-primary hover:bg-primary/20"
          onClick={() => setInputValue((prev) => [prev.trim(), chip.template].filter(Boolean).join(" ").trim())}
        >
          {chip.label}
        </button>
      ))}
    </div>
  )}
  {pendingConfirmation && (
    <div className="rounded-xl border border-border bg-muted/30 p-3 text-xs text-foreground">
      <p className="font-semibold">Here&apos;s what I understood:</p>
      <ul className="mt-2 list-inside list-disc space-y-1">
        <li>Name: {pendingConfirmation.preview.name || "Not detected"}</li>
        <li>Skills: {pendingConfirmation.preview.skills.length ? pendingConfirmation.preview.skills.join(", ") : "Not detected"}</li>
        <li>Education: {pendingConfirmation.preview.education.length ? pendingConfirmation.preview.education.join(", ") : "Not detected"}</li>
        <li>Experience: {pendingConfirmation.preview.experience.length ? pendingConfirmation.preview.experience.join(", ") : "Not detected"}</li>
      </ul>
      <div className="mt-3 flex gap-2">
        <button
          type="button"
          className="rounded-lg border border-border bg-background px-3 py-1.5 text-xs font-medium hover:bg-muted"
          onClick={() => {
            setInputValue(pendingConfirmation.originalContent)
            setPendingConfirmation(null)
          }}
        >
          Edit Input
        </button>
        <button
          type="button"
          className="rounded-lg bg-gradient-to-r from-primary to-secondary px-3 py-1.5 text-xs font-semibold text-primary-foreground"
          onClick={() => void runGeneration(pendingConfirmation.originalContent, pendingConfirmation.translatedContent)}
        >
          Generate Resume
        </button>
      </div>
    </div>
  )}
  {error && lastFailedPayload && (
    <button
      type="button"
      className="rounded-lg border border-border bg-background px-3 py-1.5 text-xs font-medium hover:bg-muted"
      onClick={() => void runGeneration(lastFailedPayload.content, lastFailedPayload.translatedContent)}
    >
      Retry generation
    </button>
  )}
  {parsedTextResume.length > 0 && (
    <div className="space-y-3 rounded-xl border border-border bg-background/80 p-3 text-xs text-foreground">
      {parsedTextResume.map((section) => (
        <div key={section.title} className="space-y-1.5">
          <h4 className="text-[11px] font-semibold uppercase tracking-[0.14em] text-primary">{section.title}</h4>
          <ul className="space-y-1 pl-4 text-sm text-foreground">
            {section.lines.map((line, idx) => (
              <li key={`${section.title}-${idx}`} className="list-disc">{line}</li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  )}
  </div>

  <div {...getRootProps()} className="border-t border-border/70 bg-background/60 p-3">
  <input {...getInputProps()} />
  {attachments.length > 0 && (
  <div className="mb-2 flex flex-wrap gap-2">
  {attachments.map((item) => (
  <span key={item.id} className="inline-flex items-center gap-1 rounded-full border border-border bg-card px-2.5 py-1 text-xs">
  <Paperclip className="h-3 w-3" />
  {item.name}
  <button
  onClick={() => setAttachments(attachments.filter((entry) => entry.id !== item.id))}
  className="rounded-full p-0.5 hover:bg-muted"
  >
  <X className="h-3 w-3" />
  </button>
  </span>
  ))}
  </div>
  )}

  <div className="flex items-end gap-2">
  <textarea
  value={inputValue}
  rows={1}
  onChange={(e) => setInputValue(e.target.value)}
  onKeyDown={(e) => {
  if (e.key === "Enter" && !e.shiftKey) {
  e.preventDefault()
  void handleSend()
  }
  }}
  placeholder={currentPlaceholder}
  className="max-h-36 min-h-[44px] flex-1 resize-y rounded-xl border border-border bg-card px-3 py-2 text-sm outline-none ring-primary/25 focus:ring-2"
  />
  <button className="rounded-xl border border-border p-2.5 hover:bg-muted/60" onClick={openFilePicker}>
  <Paperclip className="h-4 w-4" />
  </button>
  <button
  className={`relative rounded-xl border border-border p-2.5 ${isRecording ? "bg-red-500/15 text-red-600" : "hover:bg-muted/60"}`}
  onClick={toggleRecording}
  >
  {isRecording && <span className="absolute inset-0 animate-ping rounded-xl bg-red-400/25" />}
  <Mic className="relative h-4 w-4" />
  </button>
  <button
  disabled={isGenerating}
  className={`z-10 rounded-md border border-emerald-300 bg-emerald-100 px-4 py-2 text-emerald-800 shadow-sm transition-colors hover:bg-emerald-600 hover:text-white disabled:cursor-not-allowed disabled:border-slate-200 disabled:bg-slate-100 disabled:text-slate-400 ${
  isGenerating ? "animate-pulse" : ""
  }`}
  onClick={() => void handleSend()}
  >
  {isGenerating ? <Loader2 className="h-4 w-4 animate-spin" /> : <span className="inline-flex items-center gap-1"><Send className="h-4 w-4" />Generate Resume</span>}
  </button>
  </div>
  </div>
  </motion.section>

  <motion.aside
  initial={{ opacity: 0, x: 8 }}
  animate={{ opacity: 1, x: 0 }}
  className={`rounded-2xl border border-border bg-card shadow-soft xl:col-span-5 ${
  mobileTab === "chat" ? "hidden xl:block" : "block"
  }`}
  >
  <div className="flex items-center justify-between border-b border-border/70 px-4 py-3">
  <div>
  <p className="text-xs font-semibold uppercase tracking-[0.14em] text-secondary">{t(locale, "resumeAI.livePreview")}</p>
  <h3 className="text-base font-semibold text-foreground">{t(locale, "resumeAI.generatedResume")}</h3>
  </div>
  <button
  onClick={() => setPreviewMode((prev) => (prev === "preview" ? "chat" : "preview"))}
  className="rounded-full border border-border px-3 py-1 text-xs font-medium text-muted-foreground hover:bg-muted"
  data-hide-on-print
  >
  {previewMode === "preview" ? t(locale, "resumeAI.focusChat") : t(locale, "resumeAI.showPreview")}
  </button>
  </div>

  <div className="h-[52vh] overflow-y-auto p-4">
  {isGenerating ? (
  <div className="space-y-3">
    <div className="h-8 animate-pulse rounded bg-muted/50" />
    <div className="h-4 animate-pulse rounded bg-muted/40" />
    <div className="h-16 animate-pulse rounded bg-muted/40" />
    <div className="h-4 animate-pulse rounded bg-muted/40" />
    <div className="h-24 animate-pulse rounded bg-muted/40" />
  </div>
  ) : resumeState.type === "structured" ? (
  <div className="space-y-3">
  <div ref={printRef}>
  <ExecutiveResumePreview
  resume={resumeData}
  sectionLabels={{
  summary: t(locale, "resumeAI.sections.summary"),
  experience: t(locale, "resumeAI.sections.experience"),
  education: t(locale, "resumeAI.sections.education"),
  skills: t(locale, "resumeAI.sections.skills"),
  projects: t(locale, "resumeAI.sections.projects"),
  certifications: t(locale, "resumeAI.sections.certifications"),
  }}
  emptyHint={t(locale, "resumeAI.previewEmpty")}
  />
  </div>
  <div className="grid grid-cols-2 gap-2 lg:grid-cols-4">
  <AlertDialog.Root open={saveDialogOpen} onOpenChange={setSaveDialogOpen}>
  <AlertDialog.Trigger asChild>
  <button
  className="inline-flex items-center justify-center gap-2 rounded-xl border border-border bg-background px-3 py-2 text-sm font-medium text-foreground hover:bg-muted"
  data-hide-on-print
  disabled={resumeState.type !== "structured" || isSaving}
  >
  <Wand2 className="h-4 w-4" />
  {isSaving ? t(locale, "resumeAI.syncingStatus") : t(locale, "resumeAI.saveToProfile")}
  {showSavedBadge && (
  <motion.span
  initial={{ scale: 0.7, opacity: 0 }}
  animate={{ scale: 1, opacity: 1 }}
  exit={{ scale: 0.7, opacity: 0 }}
  className="inline-flex items-center text-emerald-600"
  >
  <CheckCircle2 className="h-4 w-4" />
  </motion.span>
  )}
  </button>
  </AlertDialog.Trigger>
  <AlertDialog.Portal>
  <AlertDialog.Overlay className="fixed inset-0 z-[120] bg-background/70 backdrop-blur-sm" />
  <AlertDialog.Content className="fixed left-1/2 top-1/2 z-[130] w-[min(92vw,520px)] -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-border bg-card p-5 shadow-large">
  <AlertDialog.Title className="text-lg font-semibold text-foreground">
  {t(locale, "resumeAI.syncConfirmTitle")}
  </AlertDialog.Title>
  <AlertDialog.Description className="mt-2 text-sm text-muted-foreground">
  {t(locale, "resumeAI.syncConfirmDescription")}
  </AlertDialog.Description>
  <div className="mt-5 flex justify-end gap-2">
  <AlertDialog.Cancel asChild>
  <button className="rounded-xl border border-border bg-background px-4 py-2 text-sm font-medium text-foreground hover:bg-muted">
  {t(locale, "common.cancel")}
  </button>
  </AlertDialog.Cancel>
  <AlertDialog.Action asChild>
  <button
  className="rounded-xl bg-gradient-to-r from-primary to-secondary px-4 py-2 text-sm font-semibold text-primary-foreground disabled:opacity-60"
  onClick={() => {
  void saveToProfile(locale)
  .then(() => {
  setSaveDialogOpen(false)
  handleSyncSuccess()
  })
  .catch(() => {
  // keep dialog open on failure so user can retry
  })
  }}
  disabled={isSaving || resumeState.type !== "structured"}
  >
  {isSaving ? t(locale, "resumeAI.syncingStatus") : t(locale, "resumeAI.confirmSync")}
  </button>
  </AlertDialog.Action>
  </div>
  </AlertDialog.Content>
  </AlertDialog.Portal>
  </AlertDialog.Root>
  <button
  className="inline-flex items-center justify-center gap-2 rounded-xl border border-border bg-background px-3 py-2 text-sm font-medium text-foreground hover:bg-muted"
  data-hide-on-print
  onClick={() => handlePrint()}
  disabled={resumeState.type !== "structured"}
  >
  <FileText className="h-4 w-4" />
  {t(locale, "resumeAI.downloadPdf")}
  </button>
  <button
  className="inline-flex items-center justify-center gap-2 rounded-xl border border-border bg-background px-3 py-2 text-sm font-medium text-foreground hover:bg-muted"
  data-hide-on-print
  onClick={() => void handleCopyResume()}
  disabled={resumeState.type !== "structured"}
  >
  <Clipboard className="h-4 w-4" />
  Copy Resume
  </button>
  <button
  className="inline-flex items-center justify-center gap-2 rounded-xl border border-border bg-background px-3 py-2 text-sm font-medium text-foreground hover:bg-muted"
  data-hide-on-print
  onClick={handleOpenQuickEdit}
  disabled={resumeState.type !== "structured"}
  >
  <Wand2 className="h-4 w-4" />
  Quick Resume Editor
  </button>
  </div>
  {quickEditOpen && (
  <div className="mt-3 space-y-3 rounded-xl border border-border bg-background p-3" data-hide-on-print>
  <p className="text-xs font-semibold uppercase tracking-[0.12em] text-primary">Quick Resume Editor (Edit everything)</p>
  <p className="text-xs text-muted-foreground">
  Edit every section directly. Add/remove Education, Experience, and Projects as needed.
  </p>
  {quickEditDraft && (
  <div className="space-y-3">
  <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
  <input value={quickEditDraft.personal_info.name} onChange={(e) => updateQuickPersonal("name", e.target.value)} placeholder="Name" className="w-full rounded-lg border border-border bg-card px-3 py-2 text-sm outline-none ring-primary/25 focus:ring-2" />
  <input value={quickEditDraft.personal_info.email} onChange={(e) => updateQuickPersonal("email", e.target.value)} placeholder="Email" className="w-full rounded-lg border border-border bg-card px-3 py-2 text-sm outline-none ring-primary/25 focus:ring-2" />
  <input value={quickEditDraft.personal_info.phone} onChange={(e) => updateQuickPersonal("phone", e.target.value)} placeholder="Phone" className="w-full rounded-lg border border-border bg-card px-3 py-2 text-sm outline-none ring-primary/25 focus:ring-2" />
  <input value={quickEditDraft.personal_info.location} onChange={(e) => updateQuickPersonal("location", e.target.value)} placeholder="Location" className="w-full rounded-lg border border-border bg-card px-3 py-2 text-sm outline-none ring-primary/25 focus:ring-2" />
  <input value={quickEditDraft.personal_info.linkedin || ""} onChange={(e) => updateQuickPersonal("linkedin", e.target.value)} placeholder="LinkedIn (e.g. linkedin.com/in/anubhavsahu)" className="w-full rounded-lg border border-border bg-card px-3 py-2 text-sm outline-none ring-primary/25 focus:ring-2" />
  <input value={quickEditDraft.personal_info.github || ""} onChange={(e) => updateQuickPersonal("github", e.target.value)} placeholder="GitHub (e.g. github.com/anubhavsahu)" className="w-full rounded-lg border border-border bg-card px-3 py-2 text-sm outline-none ring-primary/25 focus:ring-2" />
  <input value={quickEditDraft.personal_info.portfolio || ""} onChange={(e) => updateQuickPersonal("portfolio", e.target.value)} placeholder="Portfolio / Website" className="w-full rounded-lg border border-border bg-card px-3 py-2 text-sm outline-none ring-primary/25 focus:ring-2 md:col-span-2" />
  </div>
  <textarea value={quickEditDraft.personal_info.summary} onChange={(e) => updateQuickPersonal("summary", e.target.value)} placeholder="Professional Summary" rows={3} className="w-full resize-y rounded-lg border border-border bg-card px-3 py-2 text-sm outline-none ring-primary/25 focus:ring-2" />
  <textarea value={quickEditDraft.skills.join(", ")} onChange={(e) => setQuickEditDraft((prev) => (prev ? { ...prev, skills: e.target.value.split(",").map((v) => v.trim()).filter(Boolean) } : prev))} placeholder="Skills (comma separated)" rows={2} className="w-full resize-y rounded-lg border border-border bg-card px-3 py-2 text-sm outline-none ring-primary/25 focus:ring-2" />
  <textarea value={(quickEditDraft.certifications || []).join(", ")} onChange={(e) => setQuickEditDraft((prev) => (prev ? { ...prev, certifications: e.target.value.split(",").map((v) => v.trim()).filter(Boolean) } : prev))} placeholder="Certifications (comma separated)" rows={2} className="w-full resize-y rounded-lg border border-border bg-card px-3 py-2 text-sm outline-none ring-primary/25 focus:ring-2" />
  <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
  <input value={quickEditDraft.location_preferences || ""} onChange={(e) => updateQuickTop("location_preferences", e.target.value)} placeholder="Location Preferences" className="w-full rounded-lg border border-border bg-card px-3 py-2 text-sm outline-none ring-primary/25 focus:ring-2" />
  <input value={quickEditDraft.preferred_role || ""} onChange={(e) => updateQuickTop("preferred_role", e.target.value)} placeholder="Preferred Role" className="w-full rounded-lg border border-border bg-card px-3 py-2 text-sm outline-none ring-primary/25 focus:ring-2" />
  </div>

  <div className="space-y-2 rounded-lg border border-border p-3">
  <div className="flex items-center justify-between">
  <p className="text-xs font-semibold uppercase tracking-[0.12em] text-primary">Education</p>
  <button type="button" className="rounded-md border border-border px-2 py-1 text-xs hover:bg-muted" onClick={addQuickEducation}>+ Add</button>
  </div>
  {quickEditDraft.education.map((edu, idx) => (
  <div key={`edu-${idx}`} className="space-y-2 rounded-md border border-border p-2">
  <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
  <input value={edu.degree} onChange={(e) => updateQuickEducation(idx, "degree", e.target.value)} placeholder="Degree" className="rounded-lg border border-border bg-card px-2 py-1.5 text-xs" />
  <input value={edu.field_of_study} onChange={(e) => updateQuickEducation(idx, "field_of_study", e.target.value)} placeholder="Field of Study" className="rounded-lg border border-border bg-card px-2 py-1.5 text-xs" />
  <input value={edu.institution} onChange={(e) => updateQuickEducation(idx, "institution", e.target.value)} placeholder="Institution" className="rounded-lg border border-border bg-card px-2 py-1.5 text-xs" />
  <input value={edu.end_date} onChange={(e) => updateQuickEducation(idx, "end_date", e.target.value)} placeholder="End Date" className="rounded-lg border border-border bg-card px-2 py-1.5 text-xs" />
  </div>
  <button type="button" className="rounded-md border border-border px-2 py-1 text-xs hover:bg-muted" onClick={() => removeQuickEducation(idx)}>Remove</button>
  </div>
  ))}
  </div>

  <div className="space-y-2 rounded-lg border border-border p-3">
  <div className="flex items-center justify-between">
  <p className="text-xs font-semibold uppercase tracking-[0.12em] text-primary">Experience</p>
  <button type="button" className="rounded-md border border-border px-2 py-1 text-xs hover:bg-muted" onClick={addQuickExperience}>+ Add</button>
  </div>
  {quickEditDraft.experience.map((exp, idx) => (
  <div key={`exp-${idx}`} className="space-y-2 rounded-md border border-border p-2">
  <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
  <input value={exp.role} onChange={(e) => updateQuickExperience(idx, "role", e.target.value)} placeholder="Role" className="rounded-lg border border-border bg-card px-2 py-1.5 text-xs" />
  <input value={exp.company} onChange={(e) => updateQuickExperience(idx, "company", e.target.value)} placeholder="Company" className="rounded-lg border border-border bg-card px-2 py-1.5 text-xs" />
  <input value={exp.location} onChange={(e) => updateQuickExperience(idx, "location", e.target.value)} placeholder="Location" className="rounded-lg border border-border bg-card px-2 py-1.5 text-xs" />
  <input value={exp.end_date} onChange={(e) => updateQuickExperience(idx, "end_date", e.target.value)} placeholder="End Date" className="rounded-lg border border-border bg-card px-2 py-1.5 text-xs" />
  </div>
  <textarea value={exp.bullets.join("\n")} onChange={(e) => updateQuickExperience(idx, "bullets", e.target.value)} rows={3} placeholder="Bullets (one per line)" className="w-full resize-y rounded-lg border border-border bg-card px-2 py-1.5 text-xs" />
  <button type="button" className="rounded-md border border-border px-2 py-1 text-xs hover:bg-muted" onClick={() => removeQuickExperience(idx)}>Remove</button>
  </div>
  ))}
  </div>

  <div className="space-y-2 rounded-lg border border-border p-3">
  <div className="flex items-center justify-between">
  <p className="text-xs font-semibold uppercase tracking-[0.12em] text-primary">Projects</p>
  <button type="button" className="rounded-md border border-border px-2 py-1 text-xs hover:bg-muted" onClick={addQuickProject}>+ Add</button>
  </div>
  {quickEditDraft.projects.map((project, idx) => (
  <div key={`project-${idx}`} className="space-y-2 rounded-md border border-border p-2">
  <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
  <input value={project.name} onChange={(e) => updateQuickProject(idx, "name", e.target.value)} placeholder="Project Name" className="rounded-lg border border-border bg-card px-2 py-1.5 text-xs" />
  <input value={project.role} onChange={(e) => updateQuickProject(idx, "role", e.target.value)} placeholder="Role" className="rounded-lg border border-border bg-card px-2 py-1.5 text-xs" />
  <input value={project.link} onChange={(e) => updateQuickProject(idx, "link", e.target.value)} placeholder="Project Link" className="rounded-lg border border-border bg-card px-2 py-1.5 text-xs md:col-span-2" />
  </div>
  <textarea value={project.description} onChange={(e) => updateQuickProject(idx, "description", e.target.value)} rows={2} placeholder="Description" className="w-full resize-y rounded-lg border border-border bg-card px-2 py-1.5 text-xs" />
  <textarea value={project.tech_stack.join(", ")} onChange={(e) => updateQuickProject(idx, "tech_stack", e.target.value)} rows={2} placeholder="Tech stack (comma separated)" className="w-full resize-y rounded-lg border border-border bg-card px-2 py-1.5 text-xs" />
  <textarea value={project.bullets.join("\n")} onChange={(e) => updateQuickProject(idx, "bullets", e.target.value)} rows={3} placeholder="Bullets (one per line)" className="w-full resize-y rounded-lg border border-border bg-card px-2 py-1.5 text-xs" />
  <button type="button" className="rounded-md border border-border px-2 py-1 text-xs hover:bg-muted" onClick={() => removeQuickProject(idx)}>Remove</button>
  </div>
  ))}
  </div>
  </div>
  )}
  <div className="flex gap-2">
  <button
  type="button"
  className="rounded-lg border border-border bg-background px-3 py-1.5 text-xs font-medium hover:bg-muted"
  onClick={() => setQuickEditOpen(false)}
  >
  Cancel
  </button>
  <button
  type="button"
  className="rounded-lg bg-gradient-to-r from-primary to-secondary px-3 py-1.5 text-xs font-semibold text-primary-foreground disabled:opacity-60"
  onClick={handleApplyQuickEdit}
  disabled={isGenerating || isSaving}
  >
  Update Preview
  </button>
  <button
  type="button"
  className="rounded-lg border border-border bg-background px-3 py-1.5 text-xs font-medium hover:bg-muted disabled:opacity-60"
  onClick={() => {
  handleApplyQuickEdit()
  setSaveDialogOpen(true)
  }}
  disabled={isSaving || resumeState.type !== "structured"}
  >
  Save / Update
  </button>
  </div>
  </div>
  )}
  <div data-hide-on-print className="mt-4">
  {generationMetadata?.ats_feedback && (
  <div className="mb-3 space-y-2 rounded-xl border border-border bg-background p-3 text-xs">
    <p className="font-semibold text-foreground">ATS Match Score</p>
    <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
      <div
        className={`h-full ${ATS_SCORE_BAR_COLOR(atsScore)} transition-all duration-500`}
        style={{ width: `${Math.max(0, Math.min(100, atsScore))}%` }}
      />
    </div>
    <p className="font-medium text-foreground">{atsScore}% match for this job</p>
    {insightMessage && (
      <div className="rounded-lg border border-primary/20 bg-primary/10 p-2 text-foreground">
        {insightMessage}
      </div>
    )}
    {generationMetadata.ats_feedback.missing_keywords?.length ? (
      <div className="space-y-1">
        <p className="font-medium text-foreground">Missing keywords</p>
        <div className="flex flex-wrap gap-1">
          {generationMetadata.ats_feedback.missing_keywords.map((keyword) => (
            <span key={keyword} className="rounded-full border border-amber-300 bg-amber-50 px-2 py-0.5 text-[11px] text-amber-800">
              {keyword}
            </span>
          ))}
        </div>
        <p className="text-muted-foreground">Consider adding these in skills, project tools, or experience bullets where relevant.</p>
      </div>
    ) : null}
    <div>
      <p className="font-medium text-foreground">Resume Analysis</p>
      <div className="mt-1 grid gap-2 sm:grid-cols-2">
        <div className="rounded-md border border-emerald-200 bg-emerald-50 p-2">
          <p className="font-medium text-emerald-800">Strengths</p>
          <ul className="mt-1 list-inside list-disc text-[11px] text-emerald-900">
            {(resumeAnalysis.strengths.length ? resumeAnalysis.strengths : ["Good base structure with key resume sections"]).map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
        <div className="rounded-md border border-amber-200 bg-amber-50 p-2">
          <p className="font-medium text-amber-800">Weaknesses</p>
          <ul className="mt-1 list-inside list-disc text-[11px] text-amber-900">
            {(resumeAnalysis.weaknesses.length ? resumeAnalysis.weaknesses : ["No major weaknesses detected for this role"]).map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
      </div>
    </div>
    {generationMetadata.ats_feedback.suggestions?.length ? (
      <div>
        <p className="font-medium text-foreground">How to improve your resume for this job:</p>
        <ul className="mt-1 list-inside list-disc text-muted-foreground">
          {generationMetadata.ats_feedback.suggestions.map((suggestion) => (
            <li key={suggestion}>{suggestion}</li>
          ))}
        </ul>
      </div>
    ) : null}
  </div>
  )}
  {resumeVersions.length > 1 && (
  <div className="mb-3 rounded-xl border border-border bg-background p-3 text-xs">
    <div className="flex items-center justify-between">
      <p className="font-medium text-foreground">Resume versions: current vs previous</p>
      <button
        type="button"
        className="rounded-md border border-border px-2 py-1 text-xs hover:bg-muted"
        onClick={() => setShowVersionCompare((prev) => !prev)}
      >
        {showVersionCompare ? "Hide Compare" : "Compare"}
      </button>
    </div>
    {showVersionCompare && (
      <div className="mt-2 space-y-1 text-muted-foreground">
        <p>Skills added: {skillDiff.added.length ? skillDiff.added.join(", ") : "None"}</p>
        <p>Skills removed: {skillDiff.removed.length ? skillDiff.removed.join(", ") : "None"}</p>
      </div>
    )}
  </div>
  )}
  <PostResumePreferences resume={resumeData} />
  </div>
  </div>
  ) : parsedTextResume.length > 0 ? (
  <div className="rounded-xl border border-border bg-background p-4 text-sm text-foreground">
  <p className="mb-3 text-xs font-semibold uppercase tracking-[0.12em] text-primary">Text Resume</p>
  <div className="space-y-4">
  {parsedTextResume.map((section) => (
  <section key={`preview-${section.title}`} className="space-y-1.5">
  <h4 className="text-xs font-semibold uppercase tracking-[0.14em] text-primary">{section.title}</h4>
  <ul className="space-y-1 pl-4 text-sm leading-relaxed text-foreground">
  {section.lines.map((line, idx) => (
  <li key={`preview-${section.title}-${idx}`} className="list-disc">{line}</li>
  ))}
  </ul>
  </section>
  ))}
  </div>
  </div>
  ) : (
  <div className="rounded-xl border border-dashed border-border bg-muted/30 p-4 text-sm text-muted-foreground">
  {t(locale, "resumeAI.previewEmpty")}
  </div>
  )}
  </div>
  </motion.aside>
  </div>
  </div>
  )
}
