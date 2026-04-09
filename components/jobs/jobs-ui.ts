import { cn } from '@/lib/utils'

/** Hero strip for public + student job discovery */
export const jobsHeroClass =
    'relative overflow-hidden rounded-2xl border border-border/80 bg-gradient-to-br from-primary/[0.08] via-background to-secondary/[0.10] p-6 sm:p-8 shadow-[0_24px_80px_-40px_hsl(var(--primary)/0.35)] dark:from-primary/[0.12] dark:to-secondary/[0.08]'

/** Filter / search surface */
export const jobsSurfaceClass =
    'rounded-2xl border border-border/80 bg-card/90 shadow-[0_16px_48px_-24px_rgba(0,0,0,0.12)] backdrop-blur-sm dark:shadow-[0_16px_48px_-24px_rgba(0,0,0,0.4)]'

export const jobsLabelClass = 'mb-2 block text-xs font-semibold uppercase tracking-wide text-muted-foreground'

export function jobsSelectClassName(className?: string) {
    return cn(
        'h-11 w-full cursor-pointer appearance-none rounded-xl border border-input bg-background px-3 pr-10 text-sm font-medium text-foreground shadow-sm transition-colors',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
        className,
    )
}

export const jobsChipClass =
    'inline-flex items-center rounded-full border border-border/80 bg-muted/50 px-3 py-1 text-xs font-medium text-foreground/90'

export const jobsFilterDrawerClass = 'fixed inset-0 z-50 lg:hidden'
export const jobsFilterBackdropClass =
    'absolute inset-0 bg-background/80 backdrop-blur-sm transition-opacity'
export const jobsFilterPanelClass =
    'absolute bottom-0 left-0 right-0 max-h-[85vh] overflow-y-auto rounded-t-2xl border-t border-border bg-card p-5 shadow-2xl'

const SAVED_JOBS_KEY = 'hirekarma_saved_job_ids_v1'

export function loadSavedJobIds(): string[] {
    if (typeof window === 'undefined') return []
    try {
        const raw = localStorage.getItem(SAVED_JOBS_KEY)
        if (!raw) return []
        const parsed = JSON.parse(raw)
        return Array.isArray(parsed) ? parsed.filter((id) => typeof id === 'string') : []
    } catch {
        return []
    }
}

export function toggleSavedJobId(jobId: string): boolean {
    if (typeof window === 'undefined') return false
    const ids = loadSavedJobIds()
    const next = ids.includes(jobId) ? ids.filter((id) => id !== jobId) : [...ids, jobId]
    localStorage.setItem(SAVED_JOBS_KEY, JSON.stringify(next))
    return next.includes(jobId)
}

export function isJobSaved(jobId: string): boolean {
    return loadSavedJobIds().includes(jobId)
}
