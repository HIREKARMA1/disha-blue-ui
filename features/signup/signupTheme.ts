import { cn } from "@/lib/utils"

/** JobsUPI-style signup tokens (reference UI). */
export const signupJobsUpi = {
  pageBg: "#FFF9F0",
  headline: "#1A4480",
  subheadline: "#6B7C93",
  cardShadow: "0 16px 48px -16px rgba(26, 68, 128, 0.14)",
  buttonBg: "#93A5CF",
  buttonHover: "#8496C4",
  inputBorder: "#E8ECF2",
} as const

export const signupJobsUpiLabelClass = "mb-2 block text-sm font-bold text-slate-800"

export const signupJobsUpiFieldClass = cn(
  "h-12 w-full rounded-xl border bg-white px-4 text-base text-slate-900 shadow-none",
  "placeholder:text-slate-400 focus-visible:ring-2 focus-visible:ring-[#93A5CF]/40 focus-visible:ring-offset-0",
)

export const signupJobsUpiButtonBaseClass =
  "inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl text-base font-semibold text-white transition active:scale-[0.99] disabled:pointer-events-none"

export const signupJobsUpiButtonInactiveClass = cn(
  signupJobsUpiButtonBaseClass,
  "bg-[#93A5CF] shadow-[0_4px_14px_-4px_rgba(147,165,207,0.45)] hover:bg-[#8496C4]",
)

export const signupJobsUpiButtonActiveClass = cn(
  signupJobsUpiButtonBaseClass,
  "bg-primary-600 shadow-[0_4px_14px_-4px_rgba(37,99,235,0.45)] hover:bg-primary-700",
)

/** @deprecated Use inactive/active variants via SignupContinueButton */
export const signupJobsUpiButtonClass = signupJobsUpiButtonInactiveClass
