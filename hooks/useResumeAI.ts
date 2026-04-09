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
}

type SupportedLocale = "en" | "hi" | "or"

interface GenerateResumeParams {
  text: string
  voiceTranscript?: string
  files?: File[]
  language: SupportedLocale
  profileData?: Record<string, unknown>
}

interface GenerateResumeResult {
  resume: FullResumeSchema
  locale_used?: string
  metadata?: Record<string, unknown>
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

export function useResumeAI() {
  const [resumeData, setResumeData] = useState<FullResumeSchema>(emptyResume)
  const [isGenerating, setIsGenerating] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [statusMessage, setStatusMessage] = useState<string>("")
  const [error, setError] = useState<string | null>(null)
  const [saveError, setSaveError] = useState<string | null>(null)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

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

  const generateResume = useCallback(async (params: GenerateResumeParams) => {
    const { text, voiceTranscript = "", files = [], language, profileData = {} } = params
    setError(null)
    setIsGenerating(true)
    startStatusLoop(language)

    const buildFormData = (payloadText: string) => {
      const formData = new FormData()
      const payload = {
        text: payloadText,
        voice_transcript: voiceTranscript,
        language,
        profile_data: profileData,
      }
      formData.append("payload", JSON.stringify(payload))
      files.forEach((file) => formData.append("files", file))
      return formData
    }

    try {
      const response = await apiClient.client.post<GenerateResumeResult>("/resume/generate-ai", buildFormData(text))

      const nextResume = response.data?.resume || emptyResume
      setResumeData(nextResume)
      return nextResume
    } catch (err: any) {
      const rawMessage = normalizeErrorMessage(err, "").toLowerCase()
      const shouldRetryForJson =
        rawMessage.includes("schema") || rawMessage.includes("json") || rawMessage.includes("did not match")

      if (shouldRetryForJson) {
        try {
          const retryPrompt = `${text}\n\n${invalidJsonRetryHintByLocale[language] || invalidJsonRetryHintByLocale.en}`
          const retryResponse = await apiClient.client.post<GenerateResumeResult>("/resume/generate-ai", buildFormData(retryPrompt))
          const retryResume = retryResponse.data?.resume || emptyResume
          setResumeData(retryResume)
          setError(null)
          return retryResume
        } catch (retryErr: any) {
          const retryMessage = normalizeErrorMessage(retryErr, "Failed to generate AI resume. Please try again.")
          setError(retryMessage)
          throw retryErr
        }
      }

      const message = normalizeErrorMessage(err, "Failed to generate AI resume. Please try again.")
      setError(message)
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
    resumeData,
    setResumeData,
    isGenerating,
    isSaving,
    statusMessage,
    error,
    saveError,
    generateResume,
    saveToProfile,
  }
}

