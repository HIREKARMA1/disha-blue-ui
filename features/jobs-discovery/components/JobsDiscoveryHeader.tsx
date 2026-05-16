"use client"

import { JobsBreadcrumb } from "./JobsBreadcrumb"
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
    <div className="mb-4 space-y-3 sm:mb-6 sm:space-y-4">
      <JobsBreadcrumb items={[{ label: "Job Search" }]} homeHref={homeHref} />

      <div className="hidden flex-wrap items-center justify-between gap-3 sm:flex">
        <h1 className="text-2xl font-bold tracking-tight text-[#0a0e1a] dark:text-white sm:text-[1.75rem]">
          Find Jobs
        </h1>
        <JobsViewModeToggle value={viewMode} onChange={onViewModeChange} />
      </div>
    </div>
  )
}
