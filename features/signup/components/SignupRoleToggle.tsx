"use client"

import { cn } from "@/lib/utils"
import { useTranslation } from "@/hooks/useTranslation"

export type SignupRole = "student" | "corporate"

type Props = {
  value: SignupRole
  onChange: (v: SignupRole) => void
  className?: string
}

export function SignupRoleToggle({ value, onChange, className }: Props) {
  const { t } = useTranslation()
  return (
    <div
      className={cn(
        "grid grid-cols-2 gap-1 rounded-xl border border-slate-200/90 bg-slate-200/50 p-1 dark:border-blue-900 dark:bg-blue-950/80",
        className,
      )}
      role="tablist"
      aria-label={t("signup.roleToggle.ariaLabel")}
    >
      {(
        [
          { id: "student" as const, label: t("signup.roleToggle.student") },
          { id: "corporate" as const, label: t("signup.roleToggle.corporate") },
        ] as const
      ).map((tab) => (
        <button
          key={tab.id}
          type="button"
          role="tab"
          aria-selected={value === tab.id}
          className={cn(
            "rounded-lg px-3 py-2.5 text-sm font-semibold transition-colors sm:py-3",
            value === tab.id
              ? "bg-white text-slate-900 shadow-sm dark:bg-blue-900 dark:text-white"
              : "text-slate-600 hover:text-slate-900 dark:text-blue-200/80 dark:hover:text-white",
          )}
          onClick={() => onChange(tab.id)}
        >
          {tab.label}
        </button>
      ))}
    </div>
  )
}
