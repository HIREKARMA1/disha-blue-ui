/**
 * `/auth/register` is an alias for the unified signup experience at `/signup`.
 * Query params (e.g. `type=corporate`, `redirect=`) are preserved on redirect.
 */
"use client"

import { Suspense, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"

function RegisterRedirectInner() {
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    const target = new URL("/signup", window.location.origin)
    searchParams.forEach((value, key) => {
      target.searchParams.set(key, value)
    })
    router.replace(`${target.pathname}${target.search}`)
  }, [router, searchParams])

  return (
    <div className="flex min-h-[40vh] items-center justify-center text-sm text-muted-foreground" aria-live="polite">
      Redirecting to signup…
    </div>
  )
}

export default function AuthRegisterAliasRedirect() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[40vh] items-center justify-center text-sm text-muted-foreground" aria-live="polite">
          Loading…
        </div>
      }
    >
      <RegisterRedirectInner />
    </Suspense>
  )
}
