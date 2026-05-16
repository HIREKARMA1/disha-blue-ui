"use client"

import { cn } from "@/lib/utils"
import { jobsPrimaryBtn, jobsSidebarClass } from "../jobsDiscoveryTheme"
import { JobsFilterInput, JobsFilterSelect } from "./JobsFilterField"
import { JobsNeedHelpIllustration } from "./JobsHeroIllustration"

export type JobsFilterValues = {
  keyword: string
  location: string
  job_type: string
  salary_range: string
}

const ROLE_OPTIONS = [
  { value: "", label: "Any role" },
  { value: "Software Engineer", label: "Software Engineer" },
  { value: "In-store Promoter", label: "In-store Promoter" },
  { value: "Sales Executive", label: "Sales Executive" },
  { value: "Data Analyst", label: "Data Analyst" },
  { value: "Customer Support", label: "Customer Support" },
  { value: "Field Executive", label: "Field Executive" },
  { value: "Delivery Partner", label: "Delivery Partner" },
]

const SALARY_OPTIONS = [
  { value: "", label: "Any salary" },
  { value: "0-300000", label: "Up to ₹3 LPA" },
  { value: "300000-600000", label: "₹3 – 6 LPA" },
  { value: "600000-1200000", label: "₹6 – 12 LPA" },
  { value: "1200000-99999999", label: "₹12 LPA+" },
]

const TYPE_OPTIONS = [
  { value: "", label: "Any type" },
  { value: "full_time", label: "Full time" },
  { value: "part_time", label: "Part time" },
  { value: "contract", label: "Contract" },
  { value: "internship", label: "Internship" },
  { value: "freelance", label: "Freelance" },
]

type Props = {
  filters: JobsFilterValues
  onChange: (key: keyof JobsFilterValues, value: string) => void
  onApply: () => void
  onClear: () => void
  className?: string
}

export function JobsFiltersSidebar({ filters, onChange, onApply, onClear, className }: Props) {
  const roleSelectValue = ROLE_OPTIONS.some((o) => o.value === filters.keyword)
    ? filters.keyword
    : ""

  return (
    <aside className={cn(jobsSidebarClass, className)}>
      <div className="mb-5 flex items-center justify-between gap-2">
        <h2 className="text-lg font-bold text-[#0a0e1a] dark:text-white">Filters</h2>
        <button
          type="button"
          onClick={onClear}
          className="text-sm font-semibold text-primary-600 hover:underline dark:text-primary-400"
        >
          Clear all
        </button>
      </div>

      <div className="space-y-4">
        <JobsFilterSelect
          id="jd-role"
          label="Job role"
          value={roleSelectValue}
          onChange={(v) => onChange("keyword", v)}
          options={ROLE_OPTIONS}
        />

        <JobsFilterSelect
          id="jd-salary"
          label="Salary range"
          value={filters.salary_range}
          onChange={(v) => onChange("salary_range", v)}
          options={SALARY_OPTIONS}
        />

        <JobsFilterSelect
          id="jd-type"
          label="Job type"
          value={filters.job_type}
          onChange={(v) => onChange("job_type", v)}
          options={TYPE_OPTIONS}
        />

        <JobsFilterInput
          id="jd-location"
          label="Location"
          placeholder="Enter location (e.g. Mumbai)"
          value={filters.location}
          onChange={(v) => onChange("location", v)}
        />

        <button type="button" className={jobsPrimaryBtn} onClick={onApply}>
          Apply filters
        </button>
      </div>

      <div className="mt-6 flex items-center gap-3 rounded-xl border border-[#dde3f5] bg-[#f8faff] p-4 dark:border-blue-900/60 dark:bg-blue-950/40">
        <JobsNeedHelpIllustration className="h-14 w-[4.5rem] shrink-0" />
        <div className="min-w-0">
          <p className="text-sm font-bold text-[#0a0e1a] dark:text-white">Need help?</p>
          <p className="mt-1 text-xs leading-relaxed text-[#3a4260] dark:text-blue-200/80">
            Save roles you like and sign in to apply with one profile.
          </p>
        </div>
      </div>
    </aside>
  )
}
