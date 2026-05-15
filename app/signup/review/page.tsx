/**
 * Legacy onboarding review / OTP completion page has been retired.
 * Student signup is completed in one flow at `/signup`.
 * See git history for the prior implementation.
 */
"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"

export default function LegacySignupReviewRedirect() {
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
