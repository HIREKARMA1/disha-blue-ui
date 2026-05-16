import { cn } from '@/lib/utils'

/** Page shell — transparent inside dashboard shell on mobile to avoid double boxes */
export const profilePageBg = 'min-h-0 bg-transparent lg:min-h-screen lg:bg-[#f4f6f9] dark:lg:bg-slate-950'

export const profilePageContainer = cn(
  'mx-auto w-full max-w-6xl',
  'space-y-6 py-1 pb-12',
  'sm:space-y-5 sm:py-4 sm:pb-10',
  'lg:px-2 lg:py-6',
)

export const profileCardClass = cn(
  'rounded-2xl border border-slate-200/90 bg-white',
  'shadow-[0_2px_16px_-4px_rgba(15,23,42,0.08)]',
  'dark:border-slate-800 dark:bg-slate-900',
)

export const profileCardHeaderClass = cn(
  'flex items-start justify-between gap-4',
  'border-b border-slate-100 px-5 py-5 sm:px-6 sm:py-5',
  'dark:border-slate-800',
)

export const profileCardBodyClass = 'px-5 py-5 sm:px-6 sm:py-6'

export const profileSectionTitleClass =
  'text-lg font-bold tracking-tight text-slate-900 dark:text-slate-50 sm:text-base'

export const profileLabelClass = 'text-sm font-medium leading-snug text-slate-500 dark:text-slate-400'

export const profileValueClass =
  'mt-2 text-base font-semibold leading-relaxed text-slate-900 break-words dark:text-slate-50'

export const profileFieldWrapperClass =
  'border-b border-slate-100 py-4 last:border-0 sm:py-3.5 dark:border-slate-800'

export const profileEditBtnClass = cn(
  'inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl',
  'border border-slate-200 bg-white text-primary-600',
  'transition hover:bg-slate-50 active:scale-[0.98]',
  'dark:border-slate-700 dark:bg-slate-800 dark:hover:bg-slate-700',
  'sm:h-9 sm:w-9 sm:rounded-lg',
)

/** Break out of dashboard-overview-shell padding on small screens */
export const profileMobileBleed = '-mx-4 w-[calc(100%+2rem)] max-w-none sm:mx-0 sm:w-full'
