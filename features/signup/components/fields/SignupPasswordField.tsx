"use client"

import { useState } from "react"
import type { LucideIcon } from "lucide-react"
import { Eye, EyeOff, Lock } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { signupFieldClass, signupLabelClass } from "../signupStyles"

type Props = {
  id: string
  label: string
  required?: boolean
  icon?: LucideIcon
  autoComplete?: string
  placeholder?: string
  value: string
  onChange: (v: string) => void
  error?: string
  disabled?: boolean
}

export function SignupPasswordField({
  id,
  label,
  required,
  icon: Icon = Lock,
  autoComplete,
  placeholder,
  value,
  onChange,
  error,
  disabled,
}: Props) {
  const [show, setShow] = useState(false)

  return (
    <div className="space-y-1">
      <label htmlFor={id} className={signupLabelClass}>
        {label}
        {required ? <span className="text-red-500"> *</span> : null}
      </label>
      <Input
        id={id}
        type={show ? "text" : "password"}
        autoComplete={autoComplete}
        placeholder={placeholder}
        value={value}
        disabled={disabled}
        onChange={(e) => onChange(e.target.value)}
        leftIcon={<Icon className="h-4 w-4 shrink-0 opacity-70" aria-hidden />}
        rightIcon={
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-8 w-8 shrink-0 text-slate-500 hover:bg-transparent hover:text-slate-800 dark:text-blue-300 dark:hover:text-white"
            onClick={() => setShow((s) => !s)}
            aria-label={show ? "Hide password" : "Show password"}
          >
            {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </Button>
        }
        error={Boolean(error)}
        className={cn(signupFieldClass, "text-base sm:text-sm")}
      />
      {error ? <p className="text-xs text-red-600 dark:text-red-400">{error}</p> : null}
    </div>
  )
}
