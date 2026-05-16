"use client"

import {
  Briefcase,
  IndianRupee,
  MapPin,
  SlidersHorizontal,
  UserRound,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { jobsChipActive, jobsChipInactive } from "../jobsDiscoveryTheme"
import type { JobsFilterValues } from "./JobsFiltersSidebar"

type Props = {
  filters: JobsFilterValues
  activeFilterCount?: number
  onOpenFilters: () => void
  onOpenSection?: (section: keyof JobsFilterValues) => void
  className?: string
  /** Reference-style primary filters button (dashboard mobile). */
  variant?: "chips" | "bar"
}

function hasValue(v: string) {
  return Boolean(v.trim())
}

export function JobsMobileQuickFilters({
  filters,
  activeFilterCount = 0,
  onOpenFilters,
  onOpenSection,
  className,
  variant = "chips",
}: Props) {
  const chips = [
    {
      key: "keyword" as const,
      label: hasValue(filters.keyword) ? filters.keyword : "Job role",
      icon: UserRound,
      active: hasValue(filters.keyword),
    },
    {
      key: "salary_range" as const,
      label: hasValue(filters.salary_range) ? "Salary set" : "Salary",
      icon: IndianRupee,
      active: hasValue(filters.salary_range),
    },
    {
      key: "job_type" as const,
      label: hasValue(filters.job_type)
        ? filters.job_type.replace(/_/g, " ")
        : "Job type",
      icon: Briefcase,
      active: hasValue(filters.job_type),
    },
    {
      key: "location" as const,
      label: hasValue(filters.location) ? filters.location : "Location",
      icon: MapPin,
      active: hasValue(filters.location),
    },
  ]

  if (variant === "bar") {
    return (
      <div className={cn("lg:hidden", className)}>
        <button
          type="button"
          onClick={onOpenFilters}
          className="flex h-11 w-full items-center justify-center gap-2 rounded-xl border border-[#dde3f5] bg-white px-4 text-sm font-semibold text-[#0a0e1a] shadow-sm transition hover:border-primary-500/30 dark:border-blue-900 dark:bg-slate-900 dark:text-blue-50"
        >
          <SlidersHorizontal className="h-4 w-4 text-primary-600" aria-hidden />
          Filters
          {activeFilterCount > 0 ? (
            <span className="flex h-5 min-w-[1.25rem] items-center justify-center rounded-full bg-primary-600 px-1.5 text-[11px] font-bold text-white">
              {activeFilterCount}
            </span>
          ) : null}
        </button>
      </div>
    )
  }

  return (
    <div className={cn("lg:hidden", className)}>
      <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1 scrollbar-hide">
        <button
          type="button"
          onClick={onOpenFilters}
          className={cn(
            jobsChipInactive,
            "border-primary-500/30 bg-primary-50 text-primary-700 dark:bg-primary-950/40",
          )}
        >
          <SlidersHorizontal className="h-3.5 w-3.5 text-primary-600" aria-hidden />
          Filters
          {activeFilterCount > 0 ? (
            <span className="ml-0.5 flex h-4 min-w-[1rem] items-center justify-center rounded-full bg-primary-600 px-1 text-[10px] font-bold text-white">
              {activeFilterCount}
            </span>
          ) : null}
        </button>
        {chips.map((chip) => (
          <button
            key={chip.key}
            type="button"
            onClick={() => {
              onOpenSection?.(chip.key)
              onOpenFilters()
            }}
            className={chip.active ? jobsChipActive : jobsChipInactive}
          >
            <chip.icon className="h-3.5 w-3.5 shrink-0 text-primary-600" aria-hidden />
            <span className="max-w-[7rem] truncate capitalize">{chip.label}</span>
          </button>
        ))}
      </div>
    </div>
  )
}
