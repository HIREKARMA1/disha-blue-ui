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
  onOpenFilters: () => void
  onOpenSection?: (section: keyof JobsFilterValues) => void
}

function hasValue(v: string) {
  return Boolean(v.trim())
}

export function JobsMobileQuickFilters({ filters, onOpenFilters, onOpenSection }: Props) {
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

  return (
    <div className="lg:hidden">
      <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1 scrollbar-hide">
        <button
          type="button"
          onClick={onOpenFilters}
          className={cn(jobsChipInactive, "border-primary-500/30 bg-primary-50 text-primary-700")}
        >
          <SlidersHorizontal className="h-3.5 w-3.5 text-primary-600" aria-hidden />
          All filters
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
