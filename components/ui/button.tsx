import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

/** Radix Slot requires exactly one element; ignore whitespace-only JSX text nodes between tags. */
function getSingleComposableChild(children: React.ReactNode): React.ReactElement | null {
  const filtered = React.Children.toArray(children).filter((child) => {
    if (typeof child === "string" || typeof child === "number") {
      return String(child).trim() !== ""
    }
    return child != null
  })
  if (filtered.length !== 1) return null
  const only = filtered[0]
  if (!React.isValidElement(only)) return null
  if (only.type === React.Fragment) return null
  return only
}

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-full text-sm font-semibold shadow-soft ring-offset-background transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
  variants: {
  variant: {
  default:
  "bg-primary text-primary-foreground hover:bg-primary-600 hover:shadow-medium focus-visible:ring-primary",
  destructive:
  "bg-destructive text-destructive-foreground hover:bg-destructive/90 focus-visible:ring-destructive",
  outline: "border border-border bg-background text-foreground hover:bg-muted hover:text-foreground",
  secondary:
  "bg-secondary text-secondary-foreground hover:bg-secondary-600 hover:shadow-medium",
  ghost: "hover:bg-muted hover:text-foreground",
  link: "text-primary underline-offset-4 hover:underline",
  gradient:
  "bg-gradient-to-r from-primary-500 to-secondary-500 text-white hover:from-primary-600 hover:to-secondary-600 hover:shadow-large",
  success: "bg-success text-white hover:bg-success/90 focus-visible:ring-success",
  warning:
  "bg-warning text-foreground hover:bg-warning/90 focus-visible:ring-warning",
  info: "bg-info text-white hover:bg-info/90 focus-visible:ring-info",
  },
  size: {
  default: "h-10 px-4 py-2",
  sm: "h-9 rounded-md px-3",
  lg: "h-11 rounded-md px-8",
  xl: "h-12 rounded-md px-10 text-base",
  icon: "h-10 w-10",
  },
  },
  defaultVariants: {
  variant: "default",
  size: "default",
  },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
  VariantProps<typeof buttonVariants> {
  asChild?: boolean
  loading?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, loading = false, disabled, children, ...props }, ref) => {
  const slotChild = asChild ? getSingleComposableChild(children) : null
  const canUseSlot = Boolean(slotChild)

  if (canUseSlot && slotChild) {
 return (
  <Slot
  className={cn(buttonVariants({ variant, size, className }))}
  ref={ref}
  {...props}
  >
  {slotChild}
  </Slot>
  )
  }

  const shouldShowLoader = Boolean(loading)

  return (
  <button
  className={cn(buttonVariants({ variant, size, className }))}
  ref={ref}
  disabled={disabled || loading}
  {...props}
  >
  {shouldShowLoader && (
  <svg
  className="mr-2 h-4 w-4 animate-spin"
  xmlns="http://www.w3.org/2000/svg"
  fill="none"
  viewBox="0 0 24 24"
  >
  <circle
  className="opacity-25"
  cx="12"
  cy="12"
  r="10"
  stroke="currentColor"
  strokeWidth="4"
  ></circle>
  <path
  className="opacity-75"
  fill="currentColor"
  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
  ></path>
  </svg>
  )}
  {children}
  </button>
  )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
