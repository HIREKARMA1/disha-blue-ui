"use client"

export function Loader() {
  return (
    <div className="dashboard-overview-card p-6 text-center">
      <div className="mx-auto mb-3 h-8 w-8 animate-spin rounded-full border-2 border-sage-deep border-t-transparent dark:border-emerald-300" />
      <p className="text-sm text-slate-600 dark:text-emerald-200/80">Finding practical courses for you...</p>
    </div>
  )
}
