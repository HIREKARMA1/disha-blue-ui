import axios from "axios"
import { apiClient } from "@/lib/api"
import type { ResumeAiEnhancePayload, ResumeAiEnhanceResult } from "../types/ai-enhance"

function normalizeResult(data: Record<string, unknown>): ResumeAiEnhanceResult {
  const enhancedText =
    typeof data.enhancedText === "string"
      ? data.enhancedText
      : typeof data.enhanced_text === "string"
        ? data.enhanced_text
        : ""
  const success = Boolean(data.success)
  const errorCode =
    typeof data.errorCode === "string"
      ? data.errorCode
      : typeof data.error_code === "string"
        ? data.error_code
        : null
  const message = typeof data.message === "string" ? data.message : null
  return { success, enhancedText, errorCode, message }
}

export async function postResumeAiEnhance(
  body: ResumeAiEnhancePayload,
  signal?: AbortSignal
): Promise<ResumeAiEnhanceResult> {
  try {
    const { data } = await apiClient.client.post<Record<string, unknown>>("/resume/ai-enhance", body, { signal })
    return normalizeResult(data ?? {})
  } catch (e: unknown) {
    if (axios.isCancel(e)) {
      return { success: false, enhancedText: "", errorCode: "CANCELED", message: "Request canceled." }
    }
    if (axios.isAxiosError(e)) {
      const detail = e.response?.data as { detail?: unknown } | undefined
      const d = detail?.detail
      const msg =
        typeof d === "string"
          ? d
          : Array.isArray(d) && d[0] && typeof (d[0] as { msg?: string }).msg === "string"
            ? (d[0] as { msg: string }).msg
            : e.response?.status === 429
              ? "Too many requests. Wait a moment and try again."
              : "Request failed. Try again."
      return {
        success: false,
        enhancedText: "",
        errorCode: e.response?.status === 429 ? "RATE_LIMIT" : "HTTP_ERROR",
        message: msg,
      }
    }
    return {
      success: false,
      enhancedText: "",
      errorCode: "UNKNOWN",
      message: "Network error. Try again.",
    }
  }
}
