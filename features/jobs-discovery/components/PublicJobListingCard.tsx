"use client"

import {
  ArrowRight,
  Bookmark,
  Briefcase,
  Calendar,
  MapPin,
  Users,
  Wallet,
} from "lucide-react"
import { cn } from "@/lib/utils"
import type { Job } from "@/components/jobs/AllJobs"
import { jobsCardClass } from "../jobsDiscoveryTheme"
import {
  formatExperience,
  formatJobLocation,
  formatJobType,
  formatPostedAgo,
  formatSalary,
} from "../utils/jobFormatters"

type Props = {
  job: Job
  isSaved?: boolean
  isApplying?: boolean
  onViewDetails: () => void
  onApply: () => void
  onSaveToggle?: () => void
}

function DetailCell({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof MapPin
  label: string
  value: string
}) {
  return (
    <div className="rounded-xl border border-[#e8f0ff] bg-[#f8faff] px-3 py-2.5 dark:border-blue-900/50 dark:bg-blue-950/30">
      <div className="flex items-start gap-2">
        <Icon className="mt-0.5 h-4 w-4 shrink-0 text-[#0070f3]" aria-hidden />
        <div className="min-w-0">
          <p className="text-[10px] font-semibold uppercase tracking-wide text-[#7a85a8]">{label}</p>
          <p className="mt-0.5 text-sm font-semibold text-[#0a0e1a] dark:text-blue-50">{value}</p>
        </div>
      </div>
    </div>
  )
}

export function PublicJobListingCard({
  job,
  isSaved,
  isApplying,
  onViewDetails,
  onApply,
  onSaveToggle,
}: Props) {
  const company = job.company_name || job.corporate_name || "Hiring partner"
  const openings = job.number_of_openings ?? 1
  const applied = job.applications_count ?? job.current_applications ?? 0

  return (
    <article className={cn(jobsCardClass, "p-4 sm:p-5")}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 flex-1 gap-3">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#e8f0ff] text-[#0070f3] dark:bg-blue-900/60">
            <Briefcase className="h-5 w-5" aria-hidden />
          </span>
          <div className="min-w-0">
            <h3 className="truncate text-lg font-bold text-[#0a0e1a] dark:text-white">{job.title}</h3>
            <p className="truncate text-sm font-medium text-[#3a4260] dark:text-blue-200/80">{company}</p>
          </div>
        </div>
        {onSaveToggle ? (
          <button
            type="button"
            onClick={onSaveToggle}
            className="rounded-lg p-2 text-[#7a85a8] transition hover:bg-[#f0f4ff] hover:text-[#0070f3] dark:hover:bg-blue-900/50"
            aria-label={isSaved ? "Remove bookmark" : "Save job"}
          >
            <Bookmark className={cn("h-5 w-5", isSaved && "fill-[#0070f3] text-[#0070f3]")} />
          </button>
        ) : null}
      </div>

      <div className="mt-4 grid grid-cols-2 gap-2.5 sm:gap-3">
        <DetailCell icon={MapPin} label="Location" value={formatJobLocation(job)} />
        <DetailCell icon={Wallet} label="Salary range" value={formatSalary(job)} />
        <DetailCell icon={Briefcase} label="Job type" value={formatJobType(job)} />
        <DetailCell icon={Calendar} label="Experience" value={formatExperience(job)} />
      </div>

      <div className="mt-4 flex flex-col gap-3 border-t border-[#dde3f5] pt-4 sm:flex-row sm:items-center sm:justify-between dark:border-blue-900/50">
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs font-medium text-[#7a85a8] dark:text-blue-300/80">
          <span>Posted {formatPostedAgo(job.created_at)}</span>
          <span className="hidden sm:inline">·</span>
          <span className="inline-flex items-center gap-1">
            <Users className="h-3.5 w-3.5" aria-hidden />
            {applied} applied
          </span>
          <span className="hidden sm:inline">·</span>
          <span>
            {openings} opening{openings === 1 ? "" : "s"}
          </span>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row sm:shrink-0">
          <button
            type="button"
            onClick={onViewDetails}
            className="h-10 rounded-xl border border-[#dde3f5] bg-white px-4 text-sm font-semibold text-[#0a0e1a] transition hover:border-[#0070f3]/40 hover:bg-[#f8faff] dark:border-blue-800 dark:bg-slate-900 dark:text-blue-50"
          >
            View details
          </button>
          <button
            type="button"
            onClick={onApply}
            disabled={isApplying || (!job.can_apply && !!job.application_status)}
            className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#0052cc] to-[#0070f3] px-4 text-sm font-bold text-white shadow-md shadow-[#0070f3]/20 transition hover:from-[#0041a3] disabled:opacity-60"
          >
            {isApplying ? "Applying…" : job.application_status === "applied" ? "Applied" : "Apply now"}
            {!isApplying && job.application_status !== "applied" ? (
              <ArrowRight className="h-4 w-4" aria-hidden />
            ) : null}
          </button>
        </div>
      </div>
    </article>
  )
}
