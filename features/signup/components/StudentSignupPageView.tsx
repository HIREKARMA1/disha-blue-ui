"use client"

import { useEffect, useMemo } from "react"
import { useSearchParams } from "next/navigation"
import { useAuth } from "@/hooks/useAuth"
import { SignupMarketingLayout } from "./SignupMarketingLayout"
import { StudentSignupForm } from "./StudentSignupForm"

export function StudentSignupPageView() {
  const searchParams = useSearchParams()
  const { redirectIfAuthenticated, isLoading } = useAuth()
  const redirect = searchParams.get("redirect")

  useEffect(() => {
    if (!isLoading) redirectIfAuthenticated()
  }, [isLoading, redirectIfAuthenticated])

  const loginHref = useMemo(() => {
    const base = "/auth/login?type=student"
    if (!redirect) return base
    return `${base}&redirect=${encodeURIComponent(redirect)}`
  }, [redirect])

  if (isLoading) {
    return (
      <div className="flex min-h-svh items-center justify-center bg-[#fdfaf3]">
        <div className="h-12 w-12 animate-pulse rounded-full bg-primary-200" />
      </div>
    )
  }

  return (
    <SignupMarketingLayout role="student">
      <StudentSignupForm loginHref={loginHref} embedded />
    </SignupMarketingLayout>
  )
}
