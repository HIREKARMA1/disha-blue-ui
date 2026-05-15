import { Suspense } from "react"
import { SignupPageView } from "@/features/signup"

export default function SignupPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-svh bg-slate-100 dark:bg-slate-950">
          <div className="mx-auto max-w-lg px-4 pt-28">
            <div className="h-40 animate-pulse rounded-2xl bg-slate-200/80 dark:bg-blue-950/60" />
          </div>
        </div>
      }
    >
      <SignupPageView />
    </Suspense>
  )
}
