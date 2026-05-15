import { cn } from "@/lib/utils"

export const jobsPageBg = "min-h-screen bg-[#f4f7fc] dark:bg-slate-950"

export const jobsSidebarClass = cn(
  "rounded-2xl border border-[#dde3f5] bg-white p-5 shadow-[0_8px_30px_-18px_rgba(0,82,204,0.12)] dark:border-blue-900/60 dark:bg-slate-900/95",
)

export const jobsCardClass = cn(
  "rounded-2xl border border-[#dde3f5] bg-white shadow-[0_8px_28px_-16px_rgba(15,23,42,0.1)] transition-shadow hover:shadow-[0_12px_36px_-14px_rgba(0,82,204,0.18)] dark:border-blue-900/50 dark:bg-slate-900/90",
)

export const jobsFieldLabel = "mb-2 block text-sm font-semibold text-[#0a0e1a] dark:text-blue-50"

export function jobsFieldSelect(className?: string) {
  return cn(
    "h-11 w-full cursor-pointer appearance-none rounded-xl border border-[#dde3f5] bg-[#f8faff] px-3.5 text-sm font-medium text-[#0a0e1a] outline-none transition-colors",
    "focus:border-[#0070f3] focus:ring-2 focus:ring-[#0070f3]/20 dark:border-blue-900 dark:bg-blue-950/50 dark:text-blue-50",
    className,
  )
}

export function jobsFieldInput(className?: string) {
  return cn(
    "h-11 w-full rounded-xl border border-[#dde3f5] bg-[#f8faff] px-3.5 text-sm text-[#0a0e1a] outline-none transition-colors placeholder:text-[#7a85a8]",
    "focus:border-[#0070f3] focus:ring-2 focus:ring-[#0070f3]/20 dark:border-blue-900 dark:bg-blue-950/50 dark:text-blue-50",
    className,
  )
}

export const jobsPrimaryBtn =
  "h-11 w-full rounded-xl bg-gradient-to-r from-[#0052cc] to-[#0070f3] text-sm font-bold text-white shadow-md shadow-[#0070f3]/25 transition hover:from-[#0041a3] hover:to-[#0066d6]"
