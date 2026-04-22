"use client"

import { apiClient } from "@/lib/api"

const KEY = "hk_onboarding_progress"
const STATUS_KEY = "hk_onboarding_status"
const STEP_KEY = "onboarding_step"

export type SignupData = {
  userId?: string
  basicInfo: { name: string; phone: string; email: string; location: string; latitude?: number; longitude?: number }
  education: {
    tenth: {
      school_name: string
      percentage: string
      year_of_passing: string
      certificate_url: string
    }
    twelfth: {
      school_name: string
      percentage: string
      year_of_passing: string
      certificate_url: string
    }
    graduation: {
      college_name: string
      cgpa: string
      year_of_passing: string
      certificate_url: string
    }
  }
  skills: string[]
  skillsMeta?: Array<{ name: string; source: "auto-detected" | "verified" }>
  experience: Array<{ type: string; description: string }>
  resume?: any
  resumeHtml?: string
  /** Unix ms when resume was last saved from "Regenerate Resume" */
  resumeUpdatedAt?: number
  template?: "blue_collar_basic" | "compact_professional" | "simple-ats" | "modern-clean" | "compact"
}

export const defaultSignupData: SignupData = {
  basicInfo: { name: "", phone: "", email: "", location: "", latitude: undefined, longitude: undefined },
  education: {
    tenth: { school_name: "", percentage: "", year_of_passing: "", certificate_url: "" },
    twelfth: { school_name: "", percentage: "", year_of_passing: "", certificate_url: "" },
    graduation: { college_name: "", cgpa: "", year_of_passing: "", certificate_url: "" },
  },
  skills: [],
  experience: [],
  template: "blue_collar_basic",
}

export const resetOnboarding = () => {
  if (typeof window === "undefined") return
  localStorage.removeItem("onboarding_step")
  localStorage.removeItem("onboarding_data")
  localStorage.removeItem("onboarding_session")
  localStorage.removeItem(KEY)
  localStorage.removeItem(STATUS_KEY)
}

const stepToRoute: Record<string, string> = {
  "step-1": "/signup/step-1",
  "step-2": "/signup/step-2",
  "step-3": "/signup/step-3",
  "step-4": "/signup/step-4",
  review: "/signup/review",
}

export function getOnboardingEntryRoute() {
  if (typeof window === "undefined") return "/signup/step-1"
  const step = getOnboardingStep()
  if (step && step !== "review") {
    return stepToRoute[step] || "/signup/step-1"
  }
  localStorage.removeItem("onboarding_step")
  return "/signup/step-1"
}

export function getSignupData(): SignupData {
  if (typeof window === "undefined") return defaultSignupData
  const raw = localStorage.getItem(KEY)
  if (!raw) return defaultSignupData
  try {
    const parsed = JSON.parse(raw)
    const next = { ...defaultSignupData, ...parsed }
    const legacyEducation = parsed?.education
    if (Array.isArray(legacyEducation)) {
      const fromLevel = (level: string) =>
        legacyEducation.find((item: any) => String(item?.level || "").toLowerCase() === level.toLowerCase()) || {}
      const tenth = fromLevel("10th")
      const twelfth = fromLevel("12th")
      const graduation = fromLevel("graduation")
      next.education = {
        tenth: {
          school_name: tenth.details || "",
          percentage: "",
          year_of_passing: "",
          certificate_url: (tenth.documents || [])[0] || "",
        },
        twelfth: {
          school_name: twelfth.details || "",
          percentage: "",
          year_of_passing: "",
          certificate_url: (twelfth.documents || [])[0] || "",
        },
        graduation: {
          college_name: graduation.details || "",
          cgpa: "",
          year_of_passing: "",
          certificate_url: (graduation.documents || [])[0] || "",
        },
      }
    }
    return next
  } catch {
    return defaultSignupData
  }
}

export function saveSignupData(data: SignupData) {
  localStorage.setItem(KEY, JSON.stringify(data))
}

export function startOnboardingSession(seed?: Partial<SignupData>) {
  const existing = getSignupData()
  const next = { ...existing, ...seed }
  localStorage.setItem(KEY, JSON.stringify(next))
  localStorage.setItem(STATUS_KEY, "in_progress")
  return next
}

export function completeOnboardingSession() {
  localStorage.setItem(STATUS_KEY, "completed")
  localStorage.setItem(STEP_KEY, "review")
}

export function isOnboardingInProgress() {
  if (typeof window === "undefined") return false
  return localStorage.getItem(STATUS_KEY) === "in_progress"
}

export function isOnboardingCompleted() {
  if (typeof window === "undefined") return false
  return localStorage.getItem(STATUS_KEY) === "completed"
}

export function setOnboardingStep(step: "step-1" | "step-2" | "step-3" | "step-4" | "review") {
  if (typeof window === "undefined") return
  localStorage.setItem(STEP_KEY, step)
}

export function getOnboardingStep() {
  if (typeof window === "undefined") return null
  return localStorage.getItem(STEP_KEY)
}

export async function saveStep(step: string, payload: any, userId?: string) {
  const response = await apiClient.client.post("/onboarding/register-step", {
    user_id: userId,
    step,
    data: payload,
  })
  return response.data as { user_id: string; step: string; current_step: string }
}

export async function fetchOnboardingProgress(userId: string) {
  const response = await apiClient.client.get("/onboarding/progress", {
    params: { user_id: userId },
  })
  return response.data as { user_id: string; current_step: "step-1" | "step-2" | "step-3" | "step-4" | "review" }
}

export async function parseVoiceText(
  text: string,
  field?: "name" | "phone" | "location" | "skills" | "education" | "experience" | "general"
) {
  const response = await apiClient.client.post("/onboarding/parse-voice", { text, field, field_type: field })
  return response.data as {
    original_text: string
    translated_text: string
    parsed: Record<string, any>
  }
}

export async function uploadOnboardingDocument(file: File) {
  const formData = new FormData()
  formData.append("file", file)
  const response = await apiClient.client.post("/onboarding/upload-document", formData)
  return response.data as { file_url: string }
}

export async function generateResumeSpeech(text: string) {
  const response = await apiClient.client.post("/onboarding/tts-summary", { text })
  return response.data as { audio_base64: string; mime_type: string }
}
