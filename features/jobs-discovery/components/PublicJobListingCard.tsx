"use client"

import {
  ArrowRight,
  Bookmark,
  Briefcase,
  Calendar,
  Clock,
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

type DetailRowProps = {
  icon: typeof MapPin
  label: string
  value: string
  iconClass: string
  iconWrapClass: string
}

function DetailRow({ icon: Icon, label, value, iconClass, iconWrapClass }: DetailRowProps) {
  return (
    <div className="flex items-center gap-3 px-3.5 py-3 sm:px-4 sm:py-3.5">
      <span
        className={cn(
          "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white shadow-sm ring-1 ring-black/[0.04]",
          iconWrapClass,
        )}
      >
        <Icon className={cn("h-4 w-4", iconClass)} aria-hidden />
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-[10px] font-semibold uppercase tracking-[0.06em] text-[#7a85a8]">
          {label}
        </p>
        <p className="mt-0.5 break-words text-[15px] font-bold leading-snug text-[#0a0e1a] sm:text-base dark:text-blue-50">
          {value}
        </p>
      </div>
    </div>
  )
}

function isUrgentPosting(createdAt?: string): boolean {
  if (!createdAt) return false
  const ms = Date.now() - new Date(createdAt).getTime()
  return ms < 3 * 24 * 60 * 60 * 1000
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
  const showUrgent = isUrgentPosting(job.created_at) && job.can_apply

  return (
    <article className={cn(jobsCardClass, "overflow-hidden p-4 sm:p-5")}>
      {/* Header */}
      <div className="flex items-start gap-3">
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#e8f0ff] text-primary-600 ring-1 ring-[#dde3f5] dark:bg-blue-900/60 dark:ring-blue-800">
          <Briefcase className="h-5 w-5" strokeWidth={2} aria-hidden />
        </span>
        <div className="min-w-0 flex-1">
          <h3 className="text-base font-bold leading-snug text-[#0a0e1a] sm:text-lg dark:text-white">
            {job.title}
          </h3>
          <p className="mt-0.5 truncate text-xs font-semibold uppercase tracking-wide text-[#7a85a8] dark:text-blue-300/80">
            {company}
          </p>
          {showUrgent ? (
            <span className="mt-2 inline-flex rounded-full bg-[#f05a28] px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white">
              Urgent hiring
            </span>
          ) : null}
        </div>
        {onSaveToggle ? (
          <button
            type="button"
            onClick={onSaveToggle}
            className="shrink-0 rounded-lg p-1.5 text-[#9aa3bd] transition hover:bg-[#f0f4ff] hover:text-primary-600 dark:hover:bg-blue-900/50"
            aria-label={isSaved ? "Remove bookmark" : "Save job"}
          >
            <Bookmark
              className={cn("h-5 w-5", isSaved ? "fill-primary-600 text-primary-600" : "fill-none")}
            />
          </button>
        ) : null}
      </div>

      {/* Unified details panel — reference-style stacked rows */}
      <div className="mt-4 overflow-hidden rounded-xl border border-[#e8edf5] bg-[#f4f6fa] dark:border-blue-900/50 dark:bg-slate-800/50">
        <div className="divide-y divide-[#e8edf5] dark:divide-blue-900/60">
          <DetailRow
            icon={MapPin}
            label="Location"
            value={formatJobLocation(job)}
            iconClass="text-blue-600"
            iconWrapClass="bg-blue-50 dark:bg-blue-950/80"
          />
          <DetailRow
            icon={Wallet}
            label="Salary range"
            value={formatSalary(job)}
            iconClass="text-emerald-600"
            iconWrapClass="bg-emerald-50 dark:bg-emerald-950/80"
          />
          <DetailRow
            icon={Briefcase}
            label="Job type"
            value={formatJobType(job)}
            iconClass="text-violet-600"
            iconWrapClass="bg-violet-50 dark:bg-violet-950/80"
          />
          <DetailRow
            icon={Calendar}
            label="Experience"
            value={formatExperience(job)}
            iconClass="text-orange-600"
            iconWrapClass="bg-orange-50 dark:bg-orange-950/80"
          />
        </div>
      </div>

      {/* Metadata */}
      <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs font-medium text-[#7a85a8] dark:text-blue-300/80">
        <span className="inline-flex items-center gap-1.5">
          <Clock className="h-3.5 w-3.5 shrink-0" aria-hidden />
          Posted {formatPostedAgo(job.created_at)}
        </span>
        <span className="inline-flex items-center gap-1.5">
          <Briefcase className="h-3.5 w-3.5 shrink-0" aria-hidden />
          {applied} applied
        </span>
        <span className="inline-flex items-center gap-1.5">
          <Users className="h-3.5 w-3.5 shrink-0" aria-hidden />
          {openings} opening{openings === 1 ? "" : "s"}
        </span>
      </div>

      {/* Actions — side by side on mobile (reference) */}
      <div className="mt-4 grid grid-cols-2 gap-2.5">
        <button
          type="button"
          onClick={onViewDetails}
          className="h-11 rounded-xl border border-[#dde3f5] bg-white px-3 text-sm font-semibold text-[#0a0e1a] transition hover:border-primary-500/40 hover:bg-[#f8faff] dark:border-blue-800 dark:bg-slate-900 dark:text-blue-50"
        >
          View details
        </button>
        <button
          type="button"
          onClick={onApply}
          disabled={isApplying || (!job.can_apply && !!job.application_status)}
          className="inline-flex h-11 items-center justify-center gap-1.5 rounded-xl bg-gradient-to-r from-primary-700 to-primary-600 px-3 text-sm font-bold text-white shadow-md shadow-primary-600/20 transition hover:from-primary-800 disabled:opacity-60"
        >
          <span className="truncate">
            {isApplying ? "Applying…" : job.application_status === "applied" ? "Applied" : "Apply now"}
          </span>
          {!isApplying && job.application_status !== "applied" ? (
            <ArrowRight className="h-4 w-4 shrink-0" aria-hidden />
          ) : null}
        </button>
      </div>
    </article>
  )
}
