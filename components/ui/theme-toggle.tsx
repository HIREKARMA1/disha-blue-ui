"use client"

import * as React from "react"
import { Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

/** Navbar / sage-emerald bar: high-contrast white (light) vs deep emerald (dark). */
const barClasses =
  "border-2 border-white/90 bg-white text-slate-800 hover:bg-slate-50 hover:text-slate-900 " +
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-sage-deep " +
  "dark:border-emerald-400/70 dark:bg-emerald-900 dark:text-emerald-50 dark:hover:bg-emerald-800 dark:hover:text-white " +
  "dark:focus-visible:ring-emerald-400 dark:focus-visible:ring-offset-emerald-950"

/** White or neutral surfaces (e.g. dashboard hub header). */
const surfaceClasses =
  "border border-slate-200 bg-white text-slate-900 hover:bg-slate-50 hover:border-slate-300 " +
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sage-deep/50 focus-visible:ring-offset-2 focus-visible:ring-offset-white " +
  "dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100 dark:hover:bg-slate-800 dark:hover:border-slate-500 " +
  "dark:focus-visible:ring-slate-500 dark:focus-visible:ring-offset-slate-900"

const toggleVariants = {
  /** @deprecated use `bar` */
  onDarkBar: barClasses,
  bar: barClasses,
  /** @deprecated use `surface` */
  onLight: surfaceClasses,
  surface: surfaceClasses,
} as const

export function ThemeToggle({
  variant = "bar",
  labelsOnly = false,
}: {
  variant?: keyof typeof toggleVariants
  /** No sun/moon icons—text label only (e.g. marketing home). */
  labelsOnly?: boolean
}) {
  const { theme, setTheme, resolvedTheme } = useTheme()
  const styles = toggleVariants[variant] ?? barClasses
  const [mounted, setMounted] = React.useState(false)
  React.useEffect(() => setMounted(true), [])

  if (labelsOnly) {
    const next = resolvedTheme === "dark" ? "light" : "dark"
    const label = mounted ? (resolvedTheme === "dark" ? "Light mode" : "Dark mode") : "Theme"
    return (
      <Button
        type="button"
        variant="ghost"
        onClick={() => setTheme(next)}
        className={cn("h-9 shrink-0 rounded-none px-3 text-sm font-medium shadow-none", styles)}
      >
        {label}
      </Button>
    )
  }

  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      onClick={() => setTheme(theme === "light" ? "dark" : "light")}
      className={cn(
        "relative h-9 w-9 shrink-0 rounded-none p-0 shadow-none",
        styles,
      )}
    >
      <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 text-current transition-all dark:-rotate-90 dark:scale-0" />
      <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 text-current transition-all dark:rotate-0 dark:scale-100" />
      <span className="sr-only">Toggle theme</span>
    </Button>
  )
}
