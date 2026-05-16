import { cn } from "@/lib/utils"

/** Page shell — matches Lakshya sage canvas */
export const jobsPageBg = "min-h-screen bg-sage-canvas dark:bg-slate-950"

export const jobsSidebarClass = cn(
  "rounded-2xl border border-[#dde3f5] bg-white p-5 shadow-[0_8px_30px_-18px_rgba(0,82,204,0.12)] dark:border-blue-900/60 dark:bg-slate-900/95",
)

export const jobsCardClass = cn(
  "rounded-2xl border border-[#dde3f5] bg-white shadow-[0_4px_24px_-8px_rgba(15,23,42,0.08)] transition-shadow hover:shadow-[0_12px_36px_-14px_rgba(0,82,204,0.16)] dark:border-blue-900/50 dark:bg-slate-900/90",
)

export const jobsFieldLabel = "mb-2 block text-sm font-semibold text-[#0a0e1a] dark:text-blue-50"

export const jobsDetailCellClass = cn(
  "rounded-xl border border-[#e8f0ff] bg-[#f8faff] px-3 py-2.5 dark:border-blue-900/50 dark:bg-blue-950/30",
)

export function jobsFieldSelect(className?: string) {
  return cn(
    "h-11 w-full cursor-pointer appearance-none rounded-xl border border-[#dde3f5] bg-[#f8faff] px-3.5 pr-10 text-sm font-medium text-[#0a0e1a] outline-none transition-colors",
    "focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 dark:border-blue-900 dark:bg-blue-950/50 dark:text-blue-50",
    className,
  )
}

export function jobsFieldInput(className?: string) {
  return cn(
    "h-11 w-full rounded-xl border border-[#dde3f5] bg-[#f8faff] px-3.5 text-sm text-[#0a0e1a] outline-none transition-colors placeholder:text-[#7a85a8]",
    "focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 dark:border-blue-900 dark:bg-blue-950/50 dark:text-blue-50",
    className,
  )
}

export const jobsPrimaryBtn =
  "h-11 w-full rounded-xl bg-gradient-to-r from-primary-600 to-primary-500 text-sm font-bold text-white shadow-md shadow-primary-500/25 transition hover:from-primary-700 hover:to-primary-600"

export const jobsChipInactive = cn(
  "inline-flex shrink-0 items-center gap-1.5 rounded-full border border-[#dde3f5] bg-white px-3.5 py-2 text-xs font-semibold text-[#3a4260] shadow-sm transition",
  "hover:border-primary-500/40 hover:bg-[#f8faff] dark:border-blue-800 dark:bg-slate-900 dark:text-blue-100",
)

export const jobsChipActive = cn(
  "inline-flex shrink-0 items-center gap-1.5 rounded-full border border-primary-500/50 bg-primary-50 px-3.5 py-2 text-xs font-semibold text-primary-700 shadow-sm",
  "dark:border-primary-500/60 dark:bg-primary-900/40 dark:text-primary-200",
)
