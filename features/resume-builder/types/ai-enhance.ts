/** Lakshya manual resume — server-owned prompts; client sends section + text only. */

export type ResumeAiEnhanceSection = "summary" | "experience" | "project" | "achievement"

export type ResumeAiEnhanceContext = {
  fullName?: string
  jobTitle?: string
  templateId?: string
}

export type ResumeAiEnhancePayload = {
  section: ResumeAiEnhanceSection
  text: string
  hint?: string
  context?: ResumeAiEnhanceContext
  language?: string
}

export type ResumeAiEnhanceResult = {
  success: boolean
  enhancedText: string
  errorCode?: string | null
  message?: string | null
}
