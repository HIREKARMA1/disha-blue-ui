"use client"

import { List, Map } from "lucide-react"
import { cn } from "@/lib/utils"

export type JobsViewMode = "list" | "map"

type Props = {
  value: JobsViewMode
  onChange: (mode: JobsViewMode) => void
  className?: string
  compact?: boolean
}

export function JobsViewModeToggle({ value, onChange, className, compact }: Props) {
  return (
    <div
      className={cn(
        "inline-flex shrink-0 rounded-xl border border-[#dde3f5] bg-white p-1 shadow-sm dark:border-blue-900/60 dark:bg-slate-900",
        className,
      )}
      role="group"
      aria-label="View mode"
    >
      <button
        type="button"
        onClick={() => onChange("list")}
        className={cn(
          "inline-flex items-center gap-1.5 rounded-lg font-semibold transition",
          compact ? "px-2.5 py-2 text-xs" : "px-3 py-2 text-sm",
          value === "list"
            ? "bg-primary-600 text-white shadow-sm"
            : "text-[#5c6b7a] hover:bg-slate-50 dark:text-blue-200/80",
        )}
      >
        <List className="h-4 w-4" aria-hidden />
        {!compact && <span>List</span>}
      </button>
      <button
        type="button"
        onClick={() => onChange("map")}
        className={cn(
          "inline-flex items-center gap-1.5 rounded-lg font-semibold transition",
          compact ? "px-2.5 py-2 text-xs" : "px-3 py-2 text-sm",
          value === "map"
            ? "bg-primary-600 text-white shadow-sm"
            : "text-[#5c6b7a] hover:bg-slate-50 dark:text-blue-200/80",
        )}
      >
        <Map className="h-4 w-4" aria-hidden />
        {!compact && <span>Map</span>}
      </button>
    </div>
  )
}
