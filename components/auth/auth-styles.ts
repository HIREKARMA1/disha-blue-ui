import { cn } from '@/lib/utils'

export function authRoleTileClassNames(selected: boolean) {
  return cn(
    'group relative flex flex-col items-center gap-2 rounded-none border px-4 py-3.5 transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sage-deep focus-visible:ring-offset-2 focus-visible:ring-offset-background',
    selected
      ? 'border-sage-deep bg-sage text-slate-900 shadow-none ring-2 ring-sage-deep/30 dark:border-emerald-400 dark:bg-emerald-900 dark:text-emerald-50 dark:ring-emerald-500/30'
      : 'border-slate-200 bg-white hover:border-sage-deep/50 hover:bg-slate-50 dark:border-emerald-800 dark:bg-emerald-950 dark:text-emerald-100 dark:hover:border-emerald-600 dark:hover:bg-emerald-900',
  )
}

export function authOtpDigitClassNames(hasError?: boolean) {
  return cn(
    'text-center text-lg font-semibold tabular-nums tracking-tight transition-all sm:h-14 sm:w-12 sm:text-2xl',
    'h-11 w-10 rounded-none border-2 bg-slate-50 font-mono text-foreground shadow-none sm:h-14',
    'focus:border-sage-deep focus:outline-none focus:ring-2 focus:ring-sage-deep/30 dark:bg-emerald-950 dark:focus:border-emerald-400 dark:focus:ring-emerald-500/25',
    hasError
      ? 'border-destructive focus:border-destructive focus:ring-destructive/25'
      : 'border-slate-200 dark:border-emerald-800',
  )
}

export const authFormCardClass =
  'rounded-none border border-slate-200 bg-white p-6 shadow-none dark:border-emerald-800 dark:bg-emerald-950 sm:p-8'

export const authLabelClass = 'mb-2 block text-sm font-medium text-slate-800 dark:text-emerald-100'

/** Layout for primary actions; color comes from `variant="default"` (theme primary = sage). */
export const authCtaButtonClass =
  'h-11 w-full rounded-none text-base font-semibold shadow-none sm:h-12'
