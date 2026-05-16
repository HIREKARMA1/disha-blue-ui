import { cn } from "@/lib/utils"

/** Shared height & shape for marketing navbar pills (language + CTAs). */
export const navMarketingPillBase = cn(
  "inline-flex h-10 shrink-0 items-center justify-center gap-2 rounded-full",
  "text-[11px] font-semibold uppercase tracking-[0.08em] sm:text-xs",
  "whitespace-nowrap transition-all duration-200",
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500/35 focus-visible:ring-offset-2",
)

export const navMarketingLangPill = cn(
  navMarketingPillBase,
  "min-w-[10.25rem] border border-slate-200/90 bg-white px-4 text-slate-700 sm:min-w-[11rem]",
  "shadow-[0_1px_2px_rgba(15,23,42,0.05)]",
  "hover:border-slate-300 hover:bg-slate-50/90",
)

export const navMarketingCtaHire = cn(
  navMarketingPillBase,
  "bg-accent-orange-500 px-5 text-white",
  "shadow-[0_4px_14px_-6px_rgba(245,128,32,0.55)]",
  "hover:bg-accent-orange-600 hover:shadow-[0_6px_18px_-6px_rgba(245,128,32,0.5)]",
  "active:scale-[0.98]",
)

export const navMarketingCtaFind = cn(
  navMarketingPillBase,
  "bg-primary-600 px-5 text-white",
  "shadow-[0_4px_14px_-6px_rgba(37,99,235,0.45)]",
  "hover:bg-primary-700 hover:shadow-[0_6px_18px_-6px_rgba(37,99,235,0.4)]",
  "active:scale-[0.98]",
)

export const navMarketingActionsRow = "flex items-center gap-2 sm:gap-2.5"
