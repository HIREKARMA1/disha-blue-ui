import { cn } from '@/lib/utils'

/** Re-export job-discovery tokens for a single premium product language */
export {
    jobsHeroClass as corporateHeroClass,
    jobsSurfaceClass as corporateSurfaceClass,
    jobsLabelClass as corporateLabelClass,
    jobsSelectClassName as corporateSelectClassName,
    jobsChipClass as corporateChipClass,
} from '@/components/jobs/jobs-ui'

/** Modal backdrop: blur + token background */
export const corporateModalBackdropClass =
    'fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4'

/** Modal panel: elevated card */
export const corporateModalShellClass = cn(
    'overflow-hidden rounded-2xl border border-border/80 bg-card',
    'shadow-[0_24px_80px_-40px_rgba(0,0,0,0.22)] dark:shadow-[0_24px_80px_-40px_rgba(0,0,0,0.55)]',
)

/** Sticky-style modal header band */
export const corporateModalHeaderClass =
    'border-b border-border/80 bg-gradient-to-br from-primary/[0.08] via-card to-secondary/[0.08] p-6'
