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

let inMemorySignupData: SignupData = defaultSignupData
let inMemoryStatus: "in_progress" | "completed" | null = null
let inMemoryStep: "step-1" | "step-2" | "step-3" | "step-4" | "review" | null = null
let hydratedFromStorage = false

function isClient() {
  return typeof window !== "undefined"
}

function hydrateFromStorage() {
  if (!isClient() || hydratedFromStorage) return
  hydratedFromStorage = true
  try {
    const savedData = localStorage.getItem(KEY)
    if (savedData) {
      const parsed = JSON.parse(savedData) as Partial<SignupData>
      inMemorySignupData = {
        ...defaultSignupData,
        ...parsed,
        basicInfo: { ...defaultSignupData.basicInfo, ...(parsed.basicInfo || {}) },
        education: {
          tenth: { ...defaultSignupData.education.tenth, ...(parsed.education?.tenth || {}) },
          twelfth: { ...defaultSignupData.education.twelfth, ...(parsed.education?.twelfth || {}) },
          graduation: { ...defaultSignupData.education.graduation, ...(parsed.education?.graduation || {}) },
        },
      }
    }
    const savedStatus = localStorage.getItem(STATUS_KEY)
    if (savedStatus === "in_progress" || savedStatus === "completed") {
      inMemoryStatus = savedStatus
    }
    const savedStep = localStorage.getItem(STEP_KEY)
    if (savedStep === "step-1" || savedStep === "step-2" || savedStep === "step-3" || savedStep === "step-4" || savedStep === "review") {
      inMemoryStep = savedStep
    }
  } catch {
    // Ignore malformed persisted data and keep defaults.
  }
}

function persistData() {
  if (!isClient()) return
  localStorage.setItem(KEY, JSON.stringify(inMemorySignupData))
}

function persistStatus() {
  if (!isClient()) return
  if (!inMemoryStatus) {
    localStorage.removeItem(STATUS_KEY)
    return
  }
  localStorage.setItem(STATUS_KEY, inMemoryStatus)
}

function persistStep() {
  if (!isClient()) return
  if (!inMemoryStep) {
    localStorage.removeItem(STEP_KEY)
    return
  }
  localStorage.setItem(STEP_KEY, inMemoryStep)
}

function clearLegacyBrowserStorage() {
  if (!isClient()) return
  localStorage.removeItem("onboarding_step")
  localStorage.removeItem("onboarding_data")
  localStorage.removeItem("onboarding_session")
}

export const resetOnboarding = () => {
  inMemorySignupData = defaultSignupData
  inMemoryStatus = null
  inMemoryStep = null
  clearLegacyBrowserStorage()
  if (!isClient()) return
  localStorage.removeItem(KEY)
  localStorage.removeItem(STATUS_KEY)
  localStorage.removeItem(STEP_KEY)
}

export function getOnboardingEntryRoute() {
  hydrateFromStorage()
  return "/signup/step-1"
}

export function getSignupData(): SignupData {
  hydrateFromStorage()
  return inMemorySignupData
}

export function saveSignupData(data: SignupData) {
  hydrateFromStorage()
  inMemorySignupData = data
  persistData()
}

export function startOnboardingSession(seed?: Partial<SignupData>) {
  hydrateFromStorage()
  clearLegacyBrowserStorage()
  const existing = inMemorySignupData
  const next = { ...existing, ...seed }
  inMemorySignupData = next
  inMemoryStatus = "in_progress"
  persistData()
  persistStatus()
  return next
}

export function completeOnboardingSession() {
  hydrateFromStorage()
  inMemoryStatus = "completed"
  inMemoryStep = "review"
  persistStatus()
  persistStep()
}

export function isOnboardingInProgress() {
  hydrateFromStorage()
  return inMemoryStatus === "in_progress"
}

export function isOnboardingCompleted() {
  hydrateFromStorage()
  return inMemoryStatus === "completed"
}

export function setOnboardingStep(step: "step-1" | "step-2" | "step-3" | "step-4" | "review") {
  hydrateFromStorage()
  inMemoryStep = step
  persistStep()
}

export function getOnboardingStep() {
  hydrateFromStorage()
  return inMemoryStep
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
