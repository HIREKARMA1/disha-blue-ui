"use client"

import { useCallback, useRef, useState } from "react"
import { postResumeAiEnhance } from "../services/resumeAiEnhanceApi"
import type { ResumeAiEnhancePayload, ResumeAiEnhanceResult } from "../types/ai-enhance"

/**
 * Lakshya section AI enhance: aborts in-flight requests, exposes loading for UI.
 */
export function useResumeAiEnhance() {
  const [loading, setLoading] = useState(false)
  const abortRef = useRef<AbortController | null>(null)

  const enhance = useCallback(async (payload: ResumeAiEnhancePayload): Promise<ResumeAiEnhanceResult> => {
    abortRef.current?.abort()
    const ac = new AbortController()
    abortRef.current = ac
    setLoading(true)
    try {
      return await postResumeAiEnhance(payload, ac.signal)
    } finally {
      setLoading(false)
    }
  }, [])

  return { enhance, loading }
}
