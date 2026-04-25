"use client"

import { Loader2 } from "lucide-react"

export function InterviewLoader() {
  return (
    <div className="dashboard-overview-card flex min-h-[300px] flex-col items-center justify-center p-8 text-center">
      <Loader2 className="h-10 w-10 animate-spin text-sage-deep dark:text-emerald-400" />
      <h3 className="mt-4 font-display text-xl font-semibold text-slate-900 dark:text-emerald-50">Preparing your interview session...</h3>
      <p className="mt-2 text-sm text-slate-600 dark:text-emerald-300">Building question flow, language context, and evaluation metrics.</p>
      <div className="mt-5 h-2 w-full max-w-md overflow-hidden rounded-full bg-slate-200 dark:bg-emerald-950/40">
        <div className="h-full w-2/3 animate-pulse rounded-full bg-sage-deep dark:bg-emerald-500" />
      </div>
    </div>
  )
}
