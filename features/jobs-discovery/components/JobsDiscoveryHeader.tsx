"use client"

import Link from "next/link"
import { ChevronRight, Home } from "lucide-react"
import { JobsViewModeToggle, type JobsViewMode } from "./JobsViewModeToggle"

type Props = {
  viewMode: JobsViewMode
  onViewModeChange: (mode: JobsViewMode) => void
  homeHref?: string
}

export function JobsDiscoveryHeader({
  viewMode,
  onViewModeChange,
  homeHref = "/dashboard/student",
}: Props) {
  return (
    <div className="mb-5 space-y-4 sm:mb-6">
      <nav
        className="flex flex-wrap items-center gap-1.5 text-sm text-[#7a85a8] dark:text-blue-300/80"
        aria-label="Breadcrumb"
      >
        <Link
          href={homeHref}
          className="inline-flex items-center gap-1 font-medium transition hover:text-primary-600 dark:hover:text-primary-400"
        >
          <Home className="h-4 w-4 shrink-0" aria-hidden />
          Home
        </Link>
        <ChevronRight className="h-3.5 w-3.5 shrink-0 opacity-60" aria-hidden />
        <span className="font-semibold text-[#0a0e1a] dark:text-white">Job Search</span>
      </nav>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold tracking-tight text-[#0a0e1a] dark:text-white sm:text-[1.75rem]">
          Find Jobs
        </h1>
        <JobsViewModeToggle value={viewMode} onChange={onViewModeChange} className="hidden sm:inline-flex" />
      </div>
    </div>
  )
}
