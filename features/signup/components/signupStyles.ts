import { cn } from "@/lib/utils"

export const signupCardClass = cn(
  "w-full rounded-2xl border border-slate-200/90 bg-white p-6 shadow-[0_8px_30px_-12px_rgba(15,23,42,0.12)] dark:border-blue-900/80 dark:bg-slate-900/95 dark:shadow-none sm:p-8",
)

export const signupFieldClass = cn(
  "h-11 rounded-xl border-slate-200 bg-white text-slate-900 placeholder:text-slate-400 dark:border-blue-900 dark:bg-slate-950 dark:text-blue-50 sm:h-12",
)

export const signupLabelClass = "mb-1.5 block text-sm font-medium text-slate-800 dark:text-blue-100"

export const signupPrimaryButtonClass =
  "h-12 w-full rounded-xl bg-blue-700 text-base font-semibold text-white shadow-sm hover:bg-blue-800 dark:bg-blue-600 dark:hover:bg-blue-500"
