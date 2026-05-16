"use client"

import { Suspense, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { CORPORATE_SIGNUP_ROUTE, STUDENT_SIGNUP_ROUTE } from "@/features/landing/constants"

function SignupRedirectInner() {
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    const type = searchParams.get("type")
    const redirect = searchParams.get("redirect")
    const base = type === "corporate" ? CORPORATE_SIGNUP_ROUTE : STUDENT_SIGNUP_ROUTE
    const url = redirect ? `${base}?redirect=${encodeURIComponent(redirect)}` : base
    router.replace(url)
  }, [router, searchParams])

  return (
    <div className="flex min-h-svh items-center justify-center bg-[#fdfaf3]">
      <div className="h-12 w-12 animate-pulse rounded-full bg-primary-200" />
    </div>
  )
}

/** Legacy `/signup` — redirects to role-specific pages. */
export default function SignupRedirectPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-svh items-center justify-center bg-[#fdfaf3]">
          <div className="h-12 w-12 animate-pulse rounded-full bg-primary-200" />
        </div>
      }
    >
      <SignupRedirectInner />
    </Suspense>
  )
}
