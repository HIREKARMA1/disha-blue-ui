"use client"

import { useMemo, useRef, useState } from "react"
import { motion } from "framer-motion"
import { useDropzone } from "react-dropzone"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"
import * as AlertDialog from "@radix-ui/react-alert-dialog"
import { useReactToPrint } from "react-to-print"
import confetti from "canvas-confetti"
import {
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

interface SpeechRecognitionResultItem {
  transcript: string
}

interface SpeechRecognitionResultLike {
  [index: number]: SpeechRecognitionResultItem
}

interface SpeechRecognitionEventLike {
  results: ArrayLike<SpeechRecognitionResultLike>
}

interface SpeechRecognitionLike {
  lang: string
  interimResults: boolean
  onresult: ((event: SpeechRecognitionEventLike) => void) | null
  onend: (() => void) | null
  start: () => void
  stop: () => void
}

type SpeechRecognitionType = {
  new (): SpeechRecognitionLike
}

declare global {
  interface Window {
  SpeechRecognition?: SpeechRecognitionType
  webkitSpeechRecognition?: SpeechRecognitionType
  }
}

const mkId = () => `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`

interface LocalChatMessage {
  id: string
  role: "user" | "assistant"
  content: string
}

const formatResumeAsAssistantMessage = (resume: FullResumeSchema) => JSON.stringify(resume, null, 2)

export function AIResumeBuilderPage() {
  const { locale } = useLocale()
  const { profile } = useProfile()
  const { resumeData, generateResume, isGenerating, isSaving, statusMessage, error, saveToProfile } = useResumeAI()
  const [messages, setMessages] = useState<LocalChatMessage[]>([])
  const [attachments, setAttachments] = useState<Array<{ id: string; file: File; name: string }>>([])
  const [input, setInput] = useState("")
  const [isRecording, setIsRecording] = useState(false)
  const [voiceStatus, setVoiceStatus] = useState("")
  const [voiceErrorHint, setVoiceErrorHint] = useState("")
  const [printStatus, setPrintStatus] = useState("")
  const [previewMode, setPreviewMode] = useState<"chat" | "preview">("preview")
  const [mobileTab, setMobileTab] = useState<"chat" | "preview">("chat")
  const [saveDialogOpen, setSaveDialogOpen] = useState(false)
  const [showSavedBadge, setShowSavedBadge] = useState(false)
  const recognitionRef = useRef<SpeechRecognitionLike | null>(null)
  const printRef = useRef<HTMLDivElement>(null)
  const voiceTranscriptRef = useRef("")

  const hasGeneratedResume = useMemo(() => {
  return Boolean(
  resumeData.personal_info.name?.trim() ||
  resumeData.personal_info.summary?.trim() ||
  resumeData.personal_info.email?.trim() ||
  resumeData.personal_info.phone?.trim() ||
  resumeData.skills.length ||
  resumeData.education.length ||
  resumeData.experience.length ||
  resumeData.projects.length ||
  resumeData.certifications.length
  )
  }, [resumeData])

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

  const toggleRecording = () => {
  if (isRecording) {
  recognitionRef.current?.stop()
  setIsRecording(false)
  return
  }
  const Speech = window.SpeechRecognition || window.webkitSpeechRecognition
  if (!Speech) return
  const recognition = new Speech()
  recognition.lang = locale === "hi" ? "hi-IN" : locale === "or" ? "or-IN" : "en-IN"
  recognition.interimResults = true
  voiceTranscriptRef.current = ""
  setVoiceErrorHint("")
  setVoiceStatus(
  locale === "or"
  ? "Odia speech detected... translating to professional English."
  : locale === "hi"
  ? "Hindi speech detected... translating to professional English."
  : "Listening..."
  )
  recognition.onresult = (event) => {
  const nextText = Array.from(event.results)
  .map((res) => res[0]?.transcript || "")
  .join(" ")
  voiceTranscriptRef.current = nextText
  setInput(nextText)
  }
  recognition.onend = () => {
  setIsRecording(false)
  setVoiceStatus("")
  if (!voiceTranscriptRef.current.trim()) {
  setVoiceErrorHint(t(locale, "resumeAI.noAudioDetected"))
  }
  }
  recognition.start()
  recognitionRef.current = recognition
  setIsRecording(true)
  }

  const handleSend = async () => {
  const content = input.trim()
  if (!content || isGenerating) return
  setInput("")
  setMessages((prev) => [...prev, { id: mkId(), role: "user", content }])
  try {
  const generated = await generateResume({
  text: content,
  language: locale,
  voiceTranscript: isRecording ? content : "",
  files: attachments.map((a) => a.file),
  profileData: (profile || {}) as unknown as Record<string, unknown>,
  })
  setMessages((prev) => [
  ...prev,
  { id: mkId(), role: "assistant", content: formatResumeAsAssistantMessage(generated) },
  ])
  setAttachments([])
  setMobileTab("preview")
  } catch {
  // error state from hook is already shown in UI
  }
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
  <p className="text-xs text-muted-foreground">{statusMessage || t(locale, "resumeAI.generatingStatus")}</p>
  )}
  {voiceStatus && <p className="text-xs text-secondary-700 dark:text-secondary-300">{voiceStatus}</p>}
  {voiceErrorHint && <p className="text-xs text-amber-700 dark:text-amber-300">{voiceErrorHint}</p>}
  {printStatus && <p className="text-xs text-muted-foreground">{printStatus}</p>}
  {error && <p className="text-xs text-destructive">{error}</p>}
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
  value={input}
  rows={1}
  onChange={(e) => setInput(e.target.value)}
  onKeyDown={(e) => {
  if (e.key === "Enter" && !e.shiftKey) {
  e.preventDefault()
  void handleSend()
  }
  }}
  placeholder="Describe your experience, skills, and role goals..."
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
  disabled={!input.trim() || isGenerating}
  className={`rounded-xl bg-gradient-to-r from-primary to-secondary p-2.5 text-primary-foreground disabled:opacity-50 ${
  isGenerating ? "animate-pulse" : ""
  }`}
  onClick={() => void handleSend()}
  >
  {isGenerating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
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
  {hasGeneratedResume ? (
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
  <div className="grid grid-cols-2 gap-2">
  <AlertDialog.Root open={saveDialogOpen} onOpenChange={setSaveDialogOpen}>
  <AlertDialog.Trigger asChild>
  <button
  className="inline-flex items-center justify-center gap-2 rounded-xl border border-border bg-background px-3 py-2 text-sm font-medium text-foreground hover:bg-muted"
  data-hide-on-print
  disabled={!hasGeneratedResume || isSaving}
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
  disabled={isSaving || !hasGeneratedResume}
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
  disabled={!hasGeneratedResume}
  >
  <FileText className="h-4 w-4" />
  {t(locale, "resumeAI.downloadPdf")}
  </button>
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
