"use client"

import { cn } from "@/lib/utils"
import {
  signupJobsUpiFieldClass,
  signupJobsUpiLabelClass,
} from "../../signupTheme"
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
  type?: React.HTMLInputTypeAttribute
  autoComplete?: string
  placeholder?: string
  value: string
  onChange: (v: string) => void
  error?: string
  disabled?: boolean
  maxLength?: number
  inputMode?: React.HTMLAttributes<HTMLInputElement>["inputMode"]
  filter?: SignupFieldFilter
}

export function SignupPlainField({
  id,
  label,
  required,
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
    if (filter === "organization" && e.key.length === 1 && !/^[a-zA-Z0-9\s&.,'-]$/.test(e.key)) {
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
    <div className="space-y-0">
      <label htmlFor={id} className={signupJobsUpiLabelClass}>
        {label}
        {required ? null : null}
      </label>
      <input
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
        onBlur={(e) => commit(e.target.value)}
        className={cn(
          signupJobsUpiFieldClass,
          error ? "border-red-400 focus-visible:ring-red-200" : "border-[#E8ECF2]",
        )}
        aria-invalid={Boolean(error)}
      />
      {error ? <p className="mt-1.5 text-xs text-red-600">{error}</p> : null}
    </div>
  )
}
