"use client"

import { useEffect, useMemo, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { useAuth } from "@/hooks/useAuth"
import { SignupShell } from "./SignupShell"
import { SignupRoleToggle, type SignupRole } from "./SignupRoleToggle"
import { StudentSignupForm } from "./StudentSignupForm"
import { CorporateSignupForm } from "./CorporateSignupForm"

function roleFromSearchParam(v: string | null): SignupRole {
  return v === "corporate" ? "corporate" : "student"
}

export function SignupPageView() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { redirectIfAuthenticated, isLoading } = useAuth()
  const redirect = searchParams.get("redirect")

  const [role, setRole] = useState<SignupRole>(() => roleFromSearchParam(searchParams.get("type")))

  useEffect(() => {
    setRole(roleFromSearchParam(searchParams.get("type")))
  }, [searchParams])

  useEffect(() => {
    if (!isLoading) redirectIfAuthenticated()
  }, [isLoading, redirectIfAuthenticated])

  const syncRoleToUrl = (next: SignupRole) => {
    setRole(next)
    const p = new URLSearchParams()
    p.set("type", next)
    if (redirect) p.set("redirect", redirect)
    router.replace(`/signup?${p.toString()}`)
  }

  const loginHref = useMemo(() => {
    const base = role === "corporate" ? "/auth/login?type=corporate" : "/auth/login?type=student"
    if (!redirect) return base
    return `${base}&redirect=${encodeURIComponent(redirect)}`
  }, [role, redirect])

  if (isLoading) {
    return (
      <SignupShell>
        <div className="h-40 animate-pulse rounded-2xl bg-slate-200/80 dark:bg-blue-950/60" />
      </SignupShell>
    )
  }

  return (
    <SignupShell>
      <div className="mx-auto w-full max-w-md space-y-5 sm:max-w-lg">
        <SignupRoleToggle value={role} onChange={syncRoleToUrl} />
        {role === "student" ? <StudentSignupForm loginHref={loginHref} /> : <CorporateSignupForm loginHref={loginHref} />}
      </div>
    </SignupShell>
  )
}
