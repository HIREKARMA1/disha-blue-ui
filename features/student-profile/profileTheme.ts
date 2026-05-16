import { cn } from '@/lib/utils'

export const profilePageBg = 'min-h-screen bg-[#f4f6f9] dark:bg-slate-950'

export const profileCardClass = cn(
  'rounded-2xl border border-slate-200/90 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900',
)

export const profileCardHeaderClass = 'flex items-start justify-between gap-3 border-b border-slate-100 px-5 py-4 dark:border-slate-800'

export const profileCardBodyClass = 'px-5 py-4'

export const profileLabelClass = 'text-xs font-medium text-slate-500 dark:text-slate-400'

export const profileValueClass = 'mt-1 text-sm font-semibold text-slate-900 dark:text-slate-50'

export const profileEditBtnClass =
  'inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-slate-200 bg-white text-primary-600 transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:hover:bg-slate-700'
