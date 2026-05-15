"use client"

import type { LucideIcon } from "lucide-react"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import { signupFieldClass, signupLabelClass } from "../signupStyles"
import {
  applyFieldFilter,
  isAllowedPersonNameKey,
  isAllowedPhoneKey,
  type SignupFieldFilter,
} from "../../utils/validation"

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
  maxLength?: number
  inputMode?: React.HTMLAttributes<HTMLInputElement>["inputMode"]
  /** Applies live sanitization + blocks invalid keystrokes and paste */
  filter?: SignupFieldFilter
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
  maxLength,
  inputMode,
  filter,
}: Props) {
  const displayValue = filter ? applyFieldFilter(filter, value) : value

  const commit = (raw: string) => {
    onChange(filter ? applyFieldFilter(filter, raw) : raw)
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!filter || e.ctrlKey || e.metaKey || e.altKey) return

    if (filter === "personName" && !isAllowedPersonNameKey(e)) {
      e.preventDefault()
      return
    }

    if (filter === "phone" && !isAllowedPhoneKey(e)) {
      e.preventDefault()
    }
  }

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    if (!filter) return
    e.preventDefault()
    const pasted = e.clipboardData.getData("text")
    const input = e.currentTarget
    const start = input.selectionStart ?? displayValue.length
    const end = input.selectionEnd ?? displayValue.length
    const merged = displayValue.slice(0, start) + pasted + displayValue.slice(end)
    commit(merged)
  }

  return (
    <div className="space-y-1">
      <label htmlFor={id} className={signupLabelClass}>
        {label}
        {required ? <span className="text-red-500"> *</span> : null}
      </label>
      <Input
        id={id}
        type={filter === "phone" ? "tel" : type}
        autoComplete={autoComplete}
        placeholder={placeholder}
        value={displayValue}
        disabled={disabled}
        maxLength={filter === "phone" ? 10 : maxLength}
        inputMode={filter === "phone" ? "numeric" : inputMode}
        onKeyDown={handleKeyDown}
        onPaste={handlePaste}
        onChange={(e) => commit(e.target.value)}
        onInput={(e) => commit(e.currentTarget.value)}
        onBlur={(e) => commit(e.currentTarget.value)}
        leftIcon={<Icon className="h-4 w-4 shrink-0 opacity-70" aria-hidden />}
        error={Boolean(error)}
        className={cn(signupFieldClass, "text-base sm:text-sm")}
      />
      {error ? <p className="text-xs text-red-600 dark:text-red-400">{error}</p> : null}
    </div>
  )
}
