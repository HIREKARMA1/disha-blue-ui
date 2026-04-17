"use client"

import * as React from "react"
import { Check } from "lucide-react"
import { cn } from "@/lib/utils"

interface CheckboxProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: React.ReactNode
  description?: string
}

const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className, label, description, ...props }, ref) => {
  return (
  <div className="flex items-start space-x-3">
  <div className={cn(
  "relative inline-flex h-4 w-4 shrink-0 items-center justify-center",
  className
  )}
  >
  <input
  type="checkbox"
  className="peer absolute inset-0 z-10 m-0 h-full w-full cursor-pointer appearance-none opacity-0"
  ref={ref}
  {...props}
  />
  <span
  aria-hidden
  className={cn(
  "pointer-events-none absolute inset-0 flex items-center justify-center rounded-sm border border-input bg-background ring-offset-background transition-colors",
  "peer-focus-visible:outline-none peer-focus-visible:ring-2 peer-focus-visible:ring-ring peer-focus-visible:ring-offset-2",
  "peer-checked:border-primary peer-checked:bg-primary",
  "peer-disabled:opacity-50",
  "[&_svg]:shrink-0 [&_svg]:text-primary-foreground [&_svg]:opacity-0 [&_svg]:transition-opacity",
  "peer-checked:[&_svg]:opacity-100"
  )}
  >
  <Check strokeWidth={3} className="h-3 w-3" aria-hidden />
  </span>
  </div>
  {(label || description) && (
  <div className="grid gap-1.5 leading-none">
  {label && (
  <label
  htmlFor={props.id}
  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
  >
  {label}
  </label>
  )}
  {description && (
  <p className="text-xs text-gray-600 dark:text-gray-400">
  {description}
  </p>
  )}
  </div>
  )}
  </div>
  )
  }
)
Checkbox.displayName = "Checkbox"

export { Checkbox }
