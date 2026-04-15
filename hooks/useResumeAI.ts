"use client"

import { createElement, useCallback, useRef, useState } from "react"
import { apiClient } from "@/lib/api"
import toast from "react-hot-toast"

export interface ResumePersonalInfo {
  name: string
  email: string
  phone: string
  location: string
  linkedin: string
  github: string
  portfolio: string
  summary: string
}

export interface ResumeEducationItem {
  institution: string
  degree: string
  field_of_study: string
  start_date: string
  end_date: string
  score: string
  highlights: string[]
}

export interface ResumeExperienceItem {
  company: string
  role: string
  start_date: string
  end_date: string
  location: string
  bullets: string[]
}

export interface ResumeProjectItem {
  name: string
  role: string
  tech_stack: string[]
  description: string
  bullets: string[]
  link: string
}

export interface FullResumeSchema {
  personal_info: ResumePersonalInfo
  education: ResumeEducationItem[]
  experience: ResumeExperienceItem[]
  skills: string[]
  projects: ResumeProjectItem[]
  certifications: string[]
  location_preferences?: string
  /** Target role from AI or user; optional */
  preferred_role?: string | null
}

const emptyResume: FullResumeSchema = {
  personal_info: {
  name: "",
  email: "",
  phone: "",
  location: "",
  linkedin: "",
  github: "",
  portfolio: "",
  summary: "",
  },
  education: [],
  experience: [],
  skills: [],
  projects: [],
  certifications: [],
  preferred_role: null,
}

type SupportedLocale = "en" | "hi" | "or"

interface GenerateResumeParams {
  text: string
  voiceTranscript?: string
  files?: File[]
  jobDescription?: string
  language: SupportedLocale
  profileData?: Record<string, unknown>
}

export interface AtsFeedback {
  match_score?: number | null
  missing_keywords?: string[]
  suggestions?: string[]
}

interface GenerateResumeResult {
  success?: boolean
  error?: boolean
  mode?: "json_resume" | "text_resume" | "structured"
  resume_text?: string
  resume?: FullResumeSchema
  structured_data?: FullResumeSchema
  data?: {
    resume?: string
    structured?: FullResumeSchema
  }
  locale_used?: string
  metadata?: Record<string, unknown> & { ats_feedback?: AtsFeedback }
}
interface ResumeState {
  type: "structured" | "text" | null
  structured: FullResumeSchema | null
  text: string | null
}

const statusStepsByLocale: Record<SupportedLocale, string[]> = {
  en: ["Reading your files...", "Translating skills...", "Architecting layout..."],
  hi: ["फ़ाइलें पढ़ी जा रही हैं...", "स्किल्स का अनुवाद हो रहा है...", "रिज्यूमे संरचना बनाई जा रही है..."],
  or: ["ଫାଇଲ୍‌ଗୁଡ଼ିକ ପଢ଼ାଯାଉଛି...", "ଦକ୍ଷତା ଅନୁବାଦ ହେଉଛି...", "ରେଜ୍ୟୁମେ ଗଠନ ତିଆରି ହେଉଛି..."],
}

const syncSuccessByLocale: Record<SupportedLocale, string> = {
  en: "Success! Your platform profile has been updated with your new AI-generated resume.",
  hi: "सफलता! आपका प्रोफ़ाइल नए AI-जनरेटेड रिज्यूमे से अपडेट हो गया है।",
  or: "ସଫଳତା! ଆପଣଙ୍କ ପ୍ଲାଟଫର୍ମ ପ୍ରୋଫାଇଲ୍ AI-ଜନିତ ରେଜ୍ୟୁମେ ସହିତ ଅପଡେଟ୍ ହୋଇଛି।",
}

const viewProfileByLocale: Record<SupportedLocale, string> = {
  en: "View Profile",
  hi: "प्रोफ़ाइल देखें",
  or: "ପ୍ରୋଫାଇଲ୍ ଦେଖନ୍ତୁ",
}

const syncMissingNameByLocale: Record<SupportedLocale, string> = {
  en: "Cannot sync profile: resume name is missing.",
  hi: "प्रोफ़ाइल सिंक नहीं हो सका: रिज्यूमे में नाम नहीं है।",
  or: "ପ୍ରୋଫାଇଲ୍ ସିଙ୍କ ହେବ ନାହିଁ: ରେଜ୍ୟୁମେରେ ନାମ ନାହିଁ।",
}

const invalidJsonRetryHintByLocale: Record<SupportedLocale, string> = {
  en: "Please re-format your previous response as valid JSON matching the required schema only.",
  hi: "कृपया अपनी पिछली प्रतिक्रिया को केवल आवश्यक स्कीमा के अनुसार वैध JSON में दोबारा फॉर्मेट करें।",
  or: "ଦୟାକରି ଆପଣଙ୍କ ପୂର୍ବ ଉତ୍ତରକୁ କେବଳ ଆବଶ୍ୟକ ସ୍କିମା ଅନୁଯାୟୀ ବ valid JSON ଭାବେ ପୁନଃ ଫର୍ମାଟ୍ କରନ୍ତୁ।",
}

const parseTextIntoStructuredResume = (resumeText: string): FullResumeSchema => {
  const source = (resumeText || "").trim()
  if (!source) return emptyResume
  const lines = source.split(/\r?\n/)
  const out: FullResumeSchema = JSON.parse(JSON.stringify(emptyResume))
  let current = ""
  const push = (line: string) => {
    const cleaned = line.replace(/^[-•]\s*/, "").trim()
    if (!cleaned) return
    if (current === "skills") {
      out.skills.push(...cleaned.split(",").map((s) => s.trim()).filter(Boolean))
      return
    }
    if (current === "education") {
      out.education.push({
        institution: cleaned,
        degree: "",
        field_of_study: "",
        start_date: "",
        end_date: "",
        score: "",
        highlights: [],
      })
      return
    }
    if (current === "experience") {
      out.experience.push({
        company: "",
        role: cleaned,
        start_date: "",
        end_date: "",
        location: "",
        bullets: [],
      })
      return
    }
    if (current === "projects") {
      out.projects.push({
        name: cleaned,
        role: "",
        tech_stack: [],
        description: "",
        bullets: [],
        link: "",
      })
      return
    }
    if (current === "certifications") {
      out.certifications.push(cleaned)
      return
    }
    if (current === "summary") {
      out.personal_info.summary = `${out.personal_info.summary} ${cleaned}`.trim()
      return
    }
    if (current === "personal_information") {
      const lower = cleaned.toLowerCase()
      if (lower.includes("@")) out.personal_info.email = cleaned
      else if (/\d{8,}/.test(cleaned)) out.personal_info.phone = cleaned
      else if (!out.personal_info.name) out.personal_info.name = cleaned
      else out.personal_info.location = cleaned
    }
  }
  for (const line of lines) {
    const raw = line.trim()
    if (!raw) continue
    const normalized = raw.replace(/[:\-]+$/, "").toLowerCase()
    if (normalized.includes("personal information")) current = "personal_information"
    else if (normalized.includes("summary")) current = "summary"
    else if (normalized.includes("skills")) current = "skills"
    else if (normalized.includes("education")) current = "education"
    else if (normalized.includes("experience")) current = "experience"
    else if (normalized.includes("projects")) current = "projects"
    else if (normalized.includes("certifications")) current = "certifications"
    else push(raw)
  }
  out.skills = Array.from(new Set(out.skills))
  return out
}

export function useResumeAI() {
  const [resumeState, setResumeState] = useState<ResumeState>({
  type: null,
  structured: null,
  text: null,
  })
  const [isGenerating, setIsGenerating] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [statusMessage, setStatusMessage] = useState<string>("")
  const [error, setError] = useState<string | null>(null)
  const [errorSuggestions, setErrorSuggestions] = useState<string[]>([])
  const [generationMetadata, setGenerationMetadata] = useState<GenerateResumeResult["metadata"] | null>(null)
  const [saveError, setSaveError] = useState<string | null>(null)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const resumeData = resumeState.structured || emptyResume
  const textResume = resumeState.text || ""

  const stopStatusLoop = () => {
  if (intervalRef.current) {
  clearInterval(intervalRef.current)
  intervalRef.current = null
  }
  }

  const startStatusLoop = (language: SupportedLocale) => {
  let index = 0
  const steps = statusStepsByLocale[language] || statusStepsByLocale.en
  setStatusMessage(steps[index])
  intervalRef.current = setInterval(() => {
  index = (index + 1) % steps.length
  setStatusMessage(steps[index])
  }, 1300)
  }

  const normalizeErrorMessage = (err: any, fallback: string) => {
  const detail = err?.response?.data?.detail
  if (typeof detail === "string" && detail.trim()) return detail
  if (Array.isArray(detail) && detail.length > 0) {
  const first = detail[0]
  if (typeof first === "string") return first
  if (first && typeof first === "object") {
  const loc = Array.isArray(first.loc) ? first.loc.join(".") : ""
  const msg = typeof first.msg === "string" ? first.msg : ""
  const formatted = [loc, msg].filter(Boolean).join(": ")
  if (formatted) return formatted
  }
  }
  if (detail && typeof detail === "object") {
  const msg = (detail as Record<string, unknown>).msg
  if (typeof msg === "string" && msg.trim()) return msg
  try {
  return JSON.stringify(detail)
  } catch {
  // no-op
  }
  }
  if (typeof err?.message === "string" && err.message.trim()) return err.message
  return fallback
  }

  const normalizeErrorSuggestions = (err: any) => {
  const detail = err?.response?.data?.detail
  if (detail && typeof detail === "object") {
  const suggestions = (detail as Record<string, unknown>).suggestions
  if (Array.isArray(suggestions)) {
  return suggestions.filter((item): item is string => typeof item === "string" && item.trim().length > 0)
  }
  }
  return []
  }

  const applyResumeResponse = (payload: GenerateResumeResult) => {
  const resumeText = payload?.resume_text || ""
  const structured =
  payload?.structured_data ||
  parseTextIntoStructuredResume(resumeText)
  const hasStructured = Boolean(
  structured?.personal_info?.name?.trim() ||
  structured?.personal_info?.summary?.trim() ||
  structured?.skills?.length ||
  structured?.education?.length ||
  structured?.experience?.length ||
  structured?.projects?.length
  )
  console.log("[resume] structured_data present:", hasStructured)
  console.log("[resume] resume_text length:", resumeText.length)
  if (payload?.mode === "text_resume" && !hasStructured) {
  setResumeState({
  type: "text",
  structured: null,
  text: resumeText,
  })
  return emptyResume
  }
  if (!structured?.personal_info?.name?.trim() || structured.personal_info.name === "Not specified") {
  structured.personal_info.name = "Candidate Name"
  }
  setResumeState({ type: null, structured: null, text: null })
  setResumeState({
  type: "structured",
  structured,
  text: resumeText || null,
  })
  return structured
  }

  const generateResume = useCallback(async (params: GenerateResumeParams) => {
  const { text, voiceTranscript = "", files = [], jobDescription = "", language, profileData = {} } = params
  setError(null)
  setErrorSuggestions([])
  setIsGenerating(true)
  startStatusLoop(language)

  const buildFormData = (payloadText: string, payloadVoiceTranscript: string) => {
  const formData = new FormData()
  const safeInputText = payloadText?.trim() || ""
  const safeVoiceTranscript = payloadVoiceTranscript?.trim() || ""
  const safeJobDescription = jobDescription?.trim() || ""
  const payload = {
  // Send a single canonical input field to avoid conflicts.
  input_text: safeInputText,
  voice_transcript: safeVoiceTranscript,
  job_description: safeJobDescription,
  language,
  profile_data: profileData,
  }
  console.log("API PAYLOAD:", payload)
  formData.append("payload", JSON.stringify(payload))
  files.forEach((file) => formData.append("files", file))
  return formData
  }

  try {
  const response = await apiClient.client.post<GenerateResumeResult>("/resume/generate-ai", buildFormData(text, voiceTranscript))
  const apiResponse = response.data || {}
  console.log("FINAL RESPONSE:", apiResponse)
  console.log("API RESPONSE:", apiResponse)
  const nextResume = applyResumeResponse(apiResponse)
  setGenerationMetadata(apiResponse?.metadata || null)
  return nextResume
  } catch (err: any) {
  const rawMessage = normalizeErrorMessage(err, "").toLowerCase()
  const shouldRetryForJson =
  rawMessage.includes("schema") || rawMessage.includes("json") || rawMessage.includes("did not match")

  if (shouldRetryForJson) {
  try {
  const retryPrompt = `${text}\n\n${invalidJsonRetryHintByLocale[language] || invalidJsonRetryHintByLocale.en}`
  const retryResponse = await apiClient.client.post<GenerateResumeResult>("/resume/generate-ai", buildFormData(retryPrompt, voiceTranscript))
  const retryPayload = retryResponse.data || {}
  console.log("API RESPONSE:", retryPayload)
  const retryResume = applyResumeResponse(retryPayload)
  setGenerationMetadata(retryPayload?.metadata || null)
  setError(null)
  return retryResume
  } catch (retryErr: any) {
  const retryMessage = normalizeErrorMessage(retryErr, "Failed to generate AI resume. Please try again.")
  const retrySuggestions = normalizeErrorSuggestions(retryErr)
  setError(retryMessage)
  setErrorSuggestions(retrySuggestions)
  throw retryErr
  }
  }

  const message = normalizeErrorMessage(err, "Failed to generate AI resume. Please try again.")
  const suggestions = normalizeErrorSuggestions(err)
  setError(message)
  setErrorSuggestions(suggestions)
  throw err
  } finally {
  stopStatusLoop()
  setStatusMessage("")
  setIsGenerating(false)
  }
  }, [])

  const saveToProfile = useCallback(
  async (language: SupportedLocale = "en") => {
  setSaveError(null)
  setIsSaving(true)
  try {
  if (!resumeData.personal_info.name?.trim()) {
  throw new Error(syncMissingNameByLocale[language] || syncMissingNameByLocale.en)
  }

  const firstEducation = resumeData.education[0]
  const profilePayload = {
  name: resumeData.personal_info.name || undefined,
  phone: resumeData.personal_info.phone || undefined,
  city: resumeData.personal_info.location || undefined,
  bio: resumeData.personal_info.summary || undefined,
  linkedin_profile: resumeData.personal_info.linkedin || undefined,
  github_profile: resumeData.personal_info.github || undefined,
  personal_website: resumeData.personal_info.portfolio || undefined,
  institution: firstEducation?.institution || undefined,
  degree: firstEducation?.degree || undefined,
  branch: firstEducation?.field_of_study || undefined,
  graduation_year: firstEducation?.end_date ? Number.parseInt(firstEducation.end_date, 10) || undefined : undefined,
  technical_skills: resumeData.skills.length ? resumeData.skills.join(", ") : undefined,
  internship_experience: resumeData.experience.length
  ? resumeData.experience
  .map((item) => `${item.role} at ${item.company}${item.bullets.length ? `: ${item.bullets.join(" | ")}` : ""}`)
  .join("\n")
  : undefined,
  project_details: resumeData.projects.length
  ? resumeData.projects
  .map((item) => `${item.name}${item.description ? ` - ${item.description}` : ""}`)
  .join("\n")
  : undefined,
  certifications: resumeData.certifications.length ? resumeData.certifications.join(", ") : undefined,
  location_preferences: resumeData.location_preferences || resumeData.personal_info.location || undefined,
  }

  const sanitizedPayload = Object.fromEntries(
  Object.entries(profilePayload).filter(([, value]) => value !== undefined && value !== "")
  )

  await apiClient.client.put("/students/profile", sanitizedPayload)
  toast(
  createElement(
  "span",
  { className: "inline-flex items-center gap-2" },
  createElement("span", null, syncSuccessByLocale[language] || syncSuccessByLocale.en),
  createElement(
  "a",
  {
  href: "/dashboard/student/profile",
  className: "font-semibold underline",
  },
  viewProfileByLocale[language] || viewProfileByLocale.en
  )
  )
  )
  } catch (err: any) {
  const message = normalizeErrorMessage(err, "Failed to sync resume to profile.")
  setSaveError(message)
  toast.error(message)
  throw err
  } finally {
  setIsSaving(false)
  }
  },
  [resumeData]
  )

  return {
  resumeState,
  resumeData,
  setResumeData: (next: FullResumeSchema) =>
  setResumeState({
  type: "structured",
  structured: next,
  text: null,
  }),
  isGenerating,
  isSaving,
  statusMessage,
  error,
  errorSuggestions,
  generationMetadata,
  textResume,
  saveError,
  generateResume,
  saveToProfile,
  }
}

