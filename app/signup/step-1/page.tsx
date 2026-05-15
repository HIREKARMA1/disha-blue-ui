/**
 * Legacy multi-step student onboarding (step 1 of 4) has been retired.
 * The previous step-by-step flow is replaced by a single responsive signup at `/signup`.
 * Historical implementation: see git history for this path.
 */
"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"

export default function LegacySignupStep1Redirect() {
  const router = useRouter()
  useEffect(() => {
    router.replace("/signup")
  }, [router])
  return (
    <div className="flex min-h-[40vh] items-center justify-center text-sm text-muted-foreground" aria-live="polite">
      Redirecting to signup…
    </div>
  )
}
