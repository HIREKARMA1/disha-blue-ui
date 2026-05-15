"use client"

import type { LucideIcon } from "lucide-react"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import { signupFieldClass, signupLabelClass } from "../signupStyles"

type Props = {
  id: string
  label: string
  required?: boolean
  icon: LucideIcon
  type?: React.HTMLInputTypeAttribute
  autoComplete?: string
  placeholder?: string
  value: string
  onChange: (v: string) => void
  error?: string
  disabled?: boolean
}

export function SignupLabeledField({
  id,
  label,
  required,
  icon: Icon,
  type = "text",
  autoComplete,
  placeholder,
  value,
  onChange,
  error,
  disabled,
}: Props) {
  return (
    <div className="space-y-1">
      <label htmlFor={id} className={signupLabelClass}>
        {label}
        {required ? <span className="text-red-500"> *</span> : null}
      </label>
      <Input
        id={id}
        type={type}
        autoComplete={autoComplete}
        placeholder={placeholder}
        value={value}
        disabled={disabled}
        onChange={(e) => onChange(e.target.value)}
        leftIcon={<Icon className="h-4 w-4 shrink-0 opacity-70" aria-hidden />}
        error={Boolean(error)}
        className={cn(signupFieldClass, "text-base sm:text-sm")}
      />
      {error ? <p className="text-xs text-red-600 dark:text-red-400">{error}</p> : null}
    </div>
  )
}
