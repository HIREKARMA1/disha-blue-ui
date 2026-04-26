"use client"

import { SearchX } from "lucide-react"

interface EmptyStateProps {
  message?: string
}

export function EmptyState({ message }: EmptyStateProps) {
  return (
    <div className="dashboard-overview-card p-8 text-center">
      <SearchX className="mx-auto mb-3 h-10 w-10 text-slate-400 dark:text-emerald-400/70" />
      <h3 className="text-lg font-semibold text-slate-900 dark:text-emerald-50">No courses found</h3>
      <p className="mt-1 text-sm text-slate-600 dark:text-emerald-200/80">
        {message || "Try a different skill or use the mic to speak your career goal."}
      </p>
    </div>
  )
}
