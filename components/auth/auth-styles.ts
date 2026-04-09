import { cn } from '@/lib/utils'

export function authRoleTileClassNames(selected: boolean) {
    return cn(
        'group relative flex flex-col items-center gap-2 rounded-xl border px-4 py-3.5 transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background',
        selected
            ? 'border-primary/70 bg-gradient-to-b from-primary/[0.12] to-primary/[0.04] shadow-md shadow-primary/10 ring-2 ring-primary/20 dark:from-primary/20 dark:to-primary/5'
            : 'border-border/80 bg-card/50 hover:border-primary/35 hover:bg-muted/30',
    )
}

export function authOtpDigitClassNames(hasError?: boolean) {
    return cn(
        'text-center text-lg font-semibold tabular-nums tracking-tight transition-all sm:h-14 sm:w-12 sm:text-2xl',
        'h-11 w-10 rounded-xl border-2 bg-muted/40 font-mono text-foreground shadow-sm sm:rounded-2xl',
        'focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/25',
        hasError ? 'border-destructive focus:border-destructive focus:ring-destructive/25' : 'border-input',
    )
}

export const authFormCardClass =
    'rounded-2xl border border-border/80 bg-card/90 p-6 shadow-[0_24px_80px_-32px_hsl(var(--primary)/0.35)] backdrop-blur-sm dark:shadow-[0_24px_80px_-32px_rgba(0,0,0,0.55)] sm:p-8'

export const authLabelClass = 'mb-2 block text-sm font-medium text-foreground/85'

export const authCtaButtonClass = 'h-11 w-full rounded-xl text-base font-semibold shadow-lg shadow-primary/15 sm:h-12'
