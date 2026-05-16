"use client"

import { ArrowRight, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { signupJobsUpiButtonActiveClass, signupJobsUpiButtonInactiveClass } from "../signupTheme"

type Props = {
  children?: React.ReactNode
  loading?: boolean
  disabled?: boolean
  /** When true, uses solid brand blue (filled / ready state). */
  active?: boolean
  onClick?: () => void
  type?: "button" | "submit"
  className?: string
}

export function SignupContinueButton({
  children = "Continue",
  loading,
  disabled,
  active = false,
  onClick,
  type = "button",
  className,
}: Props) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={cn(active ? signupJobsUpiButtonActiveClass : signupJobsUpiButtonInactiveClass, className)}
    >
      {loading ? (
        <Loader2 className="h-5 w-5 animate-spin" aria-hidden />
      ) : (
        <>
          {children}
          <ArrowRight className="h-4 w-4 stroke-[2.5]" aria-hidden />
        </>
      )}
    </button>
  )
}
