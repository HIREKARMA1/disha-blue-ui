import minimalClassicEn from "@/data/resume-templates/minimal-classic.en.json"

export type MinimalClassicCopy = typeof minimalClassicEn

export type MinimalClassicTimelineItem = {
  id: string
  dateRange: string
  organization: string
  title: string
  body: string
}

export type MinimalClassicReference = {
  id: string
  name: string
  subtitle: string
  phone: string
  social: string
}

export type MinimalClassicModel = {
  personalInfo: {
    fullName: string
    jobTitle: string
    phone: string
    location: string
    email: string
  }
  aboutMe: string
  education: MinimalClassicTimelineItem[]
  experience: MinimalClassicTimelineItem[]
  skills: string[]
  references: MinimalClassicReference[]
}

export const MINIMAL_CLASSIC_BUILDER_VARIANT = "minimal-classic-v1" as const

export type MinimalClassicResumeContent = {
  builderVariant: typeof MINIMAL_CLASSIC_BUILDER_VARIANT
  minimalClassic: MinimalClassicModel
}

export function isMinimalClassicResumeContent(
  value: unknown
): value is MinimalClassicResumeContent {
  if (!value || typeof value !== "object") return false
  const v = value as Record<string, unknown>
  return (
    v.builderVariant === MINIMAL_CLASSIC_BUILDER_VARIANT &&
    v.minimalClassic !== null &&
    typeof v.minimalClassic === "object"
  )
}

export function newId(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`
}
