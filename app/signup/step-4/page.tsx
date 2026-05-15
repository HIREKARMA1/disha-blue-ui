/**
 * Legacy multi-step student onboarding (step 4 of 4) has been retired.
 * Replaced by `/signup`. See git history for the prior implementation.
 */
"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"

export default function LegacySignupStep4Redirect() {
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
