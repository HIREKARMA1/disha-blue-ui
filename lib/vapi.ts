export type VapiFeature = "interview" | "communication"

const normalizeValue = (value: string | undefined): string | null => {
  const trimmed = String(value || "").trim()
  return trimmed.length ? trimmed : null
}

const publicKey = normalizeValue(process.env.NEXT_PUBLIC_VAPI_PUBLIC_KEY)
const sharedAssistantId = normalizeValue(process.env.NEXT_PUBLIC_VAPI_ASSISTANT_ID)
const interviewAssistantId = normalizeValue(process.env.NEXT_PUBLIC_VAPI_INTERVIEW_ASSISTANT_ID)
const communicationAssistantId = normalizeValue(process.env.NEXT_PUBLIC_VAPI_COMMUNICATION_ASSISTANT_ID)
const enabledFlag = String(process.env.NEXT_PUBLIC_VAPI_ENABLED || "").trim().toLowerCase()

export const isVapiGloballyEnabled = (): boolean => {
  if (enabledFlag === "false" || enabledFlag === "0" || enabledFlag === "no") return false
  return Boolean(publicKey)
}

export const getVapiPublicKey = (): string | null => publicKey

export const getVapiAssistantId = (feature: VapiFeature): string | null => {
  if (feature === "interview") return interviewAssistantId || sharedAssistantId
  return communicationAssistantId || sharedAssistantId
}

export const isVapiConfiguredForFeature = (feature: VapiFeature): boolean => {
  return isVapiGloballyEnabled() && Boolean(getVapiAssistantId(feature))
}
