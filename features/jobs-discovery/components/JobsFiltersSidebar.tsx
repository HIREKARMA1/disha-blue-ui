"use client"

import { cn } from "@/lib/utils"
import {
  jobsFieldInput,
  jobsFieldLabel,
  jobsFieldSelect,
  jobsPrimaryBtn,
  jobsSidebarClass,
} from "../jobsDiscoveryTheme"

export type JobsFilterValues = {
  keyword: string
  location: string
  job_type: string
  salary_range: string
}

type Props = {
  filters: JobsFilterValues
  onChange: (key: keyof JobsFilterValues, value: string) => void
  onApply: () => void
  onClear: () => void
  className?: string
}

export function JobsFiltersSidebar({ filters, onChange, onApply, onClear, className }: Props) {
  return (
    <aside className={cn(jobsSidebarClass, className)}>
      <div className="mb-5 flex items-center justify-between gap-2">
        <h2 className="text-lg font-bold text-[#0a0e1a] dark:text-white">Filters</h2>
        <button
          type="button"
          onClick={onClear}
          className="text-sm font-semibold text-[#0070f3] hover:underline dark:text-blue-400"
        >
          Clear all
        </button>
      </div>

      <div className="space-y-4">
        <div>
          <label className={jobsFieldLabel} htmlFor="jd-role">
            Job role
          </label>
          <input
            id="jd-role"
            className={jobsFieldInput()}
            placeholder="e.g. Software Engineer"
            value={filters.keyword}
            onChange={(e) => onChange("keyword", e.target.value)}
          />
        </div>

        <div>
          <label className={jobsFieldLabel} htmlFor="jd-salary">
            Salary range
          </label>
          <select
            id="jd-salary"
            className={jobsFieldSelect()}
            value={filters.salary_range}
            onChange={(e) => onChange("salary_range", e.target.value)}
          >
            <option value="">Any salary</option>
            <option value="0-300000">Up to ₹3 LPA</option>
            <option value="300000-600000">₹3 – 6 LPA</option>
            <option value="600000-1200000">₹6 – 12 LPA</option>
            <option value="1200000-99999999">₹12 LPA+</option>
          </select>
        </div>

        <div>
          <label className={jobsFieldLabel} htmlFor="jd-type">
            Job type
          </label>
          <select
            id="jd-type"
            className={jobsFieldSelect()}
            value={filters.job_type}
            onChange={(e) => onChange("job_type", e.target.value)}
          >
            <option value="">Any type</option>
            <option value="full_time">Full time</option>
            <option value="part_time">Part time</option>
            <option value="contract">Contract</option>
            <option value="internship">Internship</option>
            <option value="freelance">Freelance</option>
          </select>
        </div>

        <div>
          <label className={jobsFieldLabel} htmlFor="jd-location">
            Location
          </label>
          <input
            id="jd-location"
            className={jobsFieldInput()}
            placeholder="Enter location (e.g. Mumbai)"
            value={filters.location}
            onChange={(e) => onChange("location", e.target.value)}
          />
        </div>

        <button type="button" className={jobsPrimaryBtn} onClick={onApply}>
          Apply filters
        </button>
      </div>

      <div className="mt-6 rounded-xl border border-[#dde3f5] bg-[#f8faff] p-4 dark:border-blue-900/60 dark:bg-blue-950/40">
        <p className="text-sm font-bold text-[#0a0e1a] dark:text-white">Need help?</p>
        <p className="mt-1 text-xs leading-relaxed text-[#3a4260] dark:text-blue-200/80">
          Save roles you like and sign in to apply with one profile.
        </p>
      </div>
    </aside>
  )
}
