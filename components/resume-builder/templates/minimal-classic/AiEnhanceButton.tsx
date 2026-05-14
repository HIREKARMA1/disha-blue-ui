"use client"

import { Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"

const BTN_CLASS =
  "gap-1.5 border-sage/40 text-sage-deep dark:border-emerald-700 dark:text-emerald-200"

type Props = {
  label: string
  onClick: () => void
  className?: string
  disabled?: boolean
}

/** Shared AI enhance trigger — same Sparkles icon everywhere. */
export function AiEnhanceButton({ label, onClick, className = "", disabled }: Props) {
  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      disabled={disabled}
      className={`${BTN_CLASS} ${className}`.trim()}
      onClick={onClick}
    >
      <Sparkles className="h-4 w-4 shrink-0" aria-hidden />
      {label}
    </Button>
  )
}
