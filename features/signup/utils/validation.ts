import type { KeyboardEvent } from "react"

/** Strip non-digits; drop +91 / leading 0; keep last 10 digits when too long. */
export function sanitizePhoneInput(value: string): string {
  let digits = value.replace(/\D/g, "")

  if (digits.startsWith("0") && digits.length > 10) {
    digits = digits.slice(1)
  }

  if (digits.startsWith("91") && digits.length > 10) {
    digits = digits.slice(2)
  }

  if (digits.length > 10) {
    digits = digits.slice(-10)
  }

  return digits.slice(0, 10)
}

export function validatePhone(value: string, required = false): string | undefined {
  const digits = value.trim()
  if (!digits) {
    return required ? "Phone number is required" : undefined
  }
  if (!/^\d{10}$/.test(digits)) {
    return "Enter exactly 10 digits (numbers only, no +91 or special characters)"
  }
  if (!/^[6-9]/.test(digits)) {
    return "Indian mobile numbers must start with 6, 7, 8, or 9"
  }
  return undefined
}

/** Letters, spaces, hyphen, apostrophe, period — no digits, emojis, or symbols. */
export function sanitizePersonName(value: string): string {
  return value
    .replace(/[0-9]/g, "")
    .replace(/[^a-zA-Z\s.'-]/g, "")
    .replace(/\s{2,}/g, " ")
}

export function validatePersonName(value: string, fieldLabel = "Full name"): string | undefined {
  const trimmed = value.trim()
  if (!trimmed) return `${fieldLabel} is required`
  if (trimmed.length < 2) return `${fieldLabel} must be at least 2 characters`
  if (/\d/.test(trimmed)) return `${fieldLabel} cannot contain numbers`
  if (!/^[a-zA-Z][a-zA-Z\s.'-]*$/.test(trimmed)) {
    return `${fieldLabel} can only contain letters, spaces, hyphens, and apostrophes`
  }
  return undefined
}

export function sanitizeOrganizationName(value: string): string {
  return value
    .replace(/[^\x00-\x7F]/g, "")
    .replace(/[^a-zA-Z0-9\s&.,'-]/g, "")
    .replace(/\s{2,}/g, " ")
}

export function validateOrganizationName(value: string, fieldLabel = "Company name"): string | undefined {
  const trimmed = value.trim()
  if (!trimmed) return `${fieldLabel} is required`
  if (trimmed.length < 2) return `${fieldLabel} must be at least 2 characters`
  if (/[^\x00-\x7F]/.test(trimmed)) {
    return `${fieldLabel} cannot contain emojis or non-ASCII characters`
  }
  if (!/^[a-zA-Z0-9][a-zA-Z0-9\s&.,'-]*$/.test(trimmed)) {
    return `${fieldLabel} contains invalid characters`
  }
  return undefined
}

export function sanitizeEmailInput(value: string): string {
  return value.replace(/[^\x00-\x7F]/g, "").replace(/\s/g, "").toLowerCase()
}

export function validateEmail(value: string): string | undefined {
  const trimmed = sanitizeEmailInput(value)
  if (!trimmed) return "Email is required"
  const emailPattern = /^[a-zA-Z0-9](?:[a-zA-Z0-9._%+-]*[a-zA-Z0-9])?@[a-zA-Z0-9](?:[a-zA-Z0-9-]*[a-zA-Z0-9])?(?:\.[a-zA-Z]{2,})+$/
  if (!emailPattern.test(trimmed)) {
    return "Enter a valid email address"
  }
  return undefined
}

const NAV_KEYS = new Set([
  "Backspace",
  "Delete",
  "Tab",
  "Escape",
  "Enter",
  "ArrowLeft",
  "ArrowRight",
  "ArrowUp",
  "ArrowDown",
  "Home",
  "End",
])

export function isAllowedPersonNameKey(e: KeyboardEvent<HTMLInputElement>): boolean {
  if (e.ctrlKey || e.metaKey || e.altKey) return true
  if (NAV_KEYS.has(e.key)) return true
  if (e.key.length === 1 && /^[a-zA-Z\s.'-]$/.test(e.key)) return true
  return false
}

export function isAllowedPhoneKey(e: KeyboardEvent<HTMLInputElement>): boolean {
  if (e.ctrlKey || e.metaKey || e.altKey) return true
  if (NAV_KEYS.has(e.key)) return true
  if (/^\d$/.test(e.key)) return true
  return false
}

export type SignupFieldFilter = "personName" | "phone" | "email" | "organization"

export function applyFieldFilter(filter: SignupFieldFilter, value: string): string {
  switch (filter) {
    case "personName":
      return sanitizePersonName(value)
    case "phone":
      return sanitizePhoneInput(value)
    case "email":
      return sanitizeEmailInput(value)
    case "organization":
      return sanitizeOrganizationName(value)
    default:
      return value
  }
}
