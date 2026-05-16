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
  getCompanyInitials,
} from "../utils/jobFormatters"

type Props = {
  job: Job
  isSaved?: boolean
  isApplying?: boolean
  matchScore?: number
  showMatchScore?: boolean
  onViewDetails: () => void
  onApply: () => void
  onSaveToggle?: () => void
  onViewCompany?: () => void
}

type DetailCellProps = {
  icon: typeof MapPin
  label: string
  value: string
  iconClass: string
  iconWrapClass: string
}

function DetailCell({ icon: Icon, label, value, iconClass, iconWrapClass }: DetailCellProps) {
  return (
    <div className="flex min-h-[4.5rem] items-center gap-2.5 px-3 py-3 sm:gap-3 sm:px-3.5 sm:py-3.5">
      <span
        className={cn(
          "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white shadow-sm ring-1 ring-black/[0.04] sm:h-9 sm:w-9",
          iconWrapClass,
        )}
      >
        <Icon className={cn("h-3.5 w-3.5 sm:h-4 sm:w-4", iconClass)} aria-hidden />
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-[9px] font-semibold uppercase tracking-[0.06em] text-[#7a85a8] sm:text-[10px]">
          {label}
        </p>
        <p className="mt-0.5 line-clamp-2 text-[13px] font-bold leading-snug text-[#0a0e1a] sm:text-[15px] dark:text-blue-50">
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
  matchScore,
  showMatchScore = false,
  onViewDetails,
  onApply,
  onSaveToggle,
  onViewCompany,
}: Props) {
  const company = job.company_name || job.corporate_name || "Hiring partner"
  const openings = job.number_of_openings ?? 1
  const applied = job.applications_count ?? job.current_applications ?? 0
  const showUrgent = isUrgentPosting(job.created_at) && job.can_apply
  const initials = getCompanyInitials(company)

  const handleViewCompany = () => {
    if (onViewCompany) {
      onViewCompany()
      return
    }
    if (job.company_website) {
      const url = job.company_website.startsWith("http")
        ? job.company_website
        : `https://${job.company_website}`
      window.open(url, "_blank", "noopener,noreferrer")
    }
  }

  return (
    <article className={cn(jobsCardClass, "overflow-hidden p-4 sm:p-5")}>
      <div className="flex items-start gap-3">
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#e8f0ff] text-sm font-bold text-primary-700 ring-1 ring-[#dde3f5] sm:h-12 sm:w-12 dark:bg-blue-900/60 dark:ring-blue-800">
          {initials}
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0 flex-1 pr-1">
              <h3 className="text-[15px] font-bold leading-snug text-[#0a0e1a] sm:text-base dark:text-blue-50">
                {job.title}
              </h3>
              <p className="mt-0.5 truncate text-xs font-semibold text-[#7a85a8] dark:text-blue-300/80">
                {company}
              </p>
            </div>
            <div className="flex shrink-0 flex-col items-end gap-1.5">
              <button
                type="button"
                onClick={handleViewCompany}
                className="rounded-lg border border-[#dde3f5] bg-white px-2 py-1 text-[10px] font-semibold text-primary-700 transition hover:border-primary-400 hover:bg-[#f8faff] sm:px-2.5 sm:text-[11px] dark:border-blue-800 dark:bg-slate-900 dark:text-primary-300"
              >
                View Company
              </button>
              {onSaveToggle ? (
                <button
                  type="button"
                  onClick={onSaveToggle}
                  className="rounded-lg p-1 text-[#9aa3bd] transition hover:bg-[#f0f4ff] hover:text-primary-600 dark:hover:bg-blue-900/50"
                  aria-label={isSaved ? "Remove bookmark" : "Save job"}
                >
                  <Bookmark
                    className={cn("h-5 w-5", isSaved ? "fill-primary-600 text-primary-600" : "fill-none")}
                  />
                </button>
              ) : null}
            </div>
          </div>

          <div className="mt-2 flex flex-wrap items-center gap-2">
            {showMatchScore && matchScore != null ? (
              <span className="inline-flex items-center gap-1 rounded-md bg-emerald-50 px-2 py-0.5 text-[11px] font-bold text-emerald-700 ring-1 ring-emerald-100 dark:bg-emerald-950/50 dark:text-emerald-400">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" aria-hidden />
                {matchScore}% Match
              </span>
            ) : null}
            {showUrgent ? (
              <span className="inline-flex rounded-full bg-primary-600 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white">
                Urgent hiring
              </span>
            ) : null}
          </div>
        </div>
      </div>

      <div className="mt-3.5 overflow-hidden rounded-xl border border-[#e8edf5] bg-[#f4f6fa] dark:border-blue-900/50 dark:bg-slate-800/50">
        <div className="grid grid-cols-2 divide-x divide-y divide-[#e8edf5] dark:divide-blue-900/60">
          <DetailCell
            icon={MapPin}
            label="Location"
            value={formatJobLocation(job)}
            iconClass="text-blue-600"
            iconWrapClass="bg-blue-50 dark:bg-blue-950/80"
          />
          <DetailCell
            icon={Wallet}
            label="Salary"
            value={formatSalary(job)}
            iconClass="text-emerald-600"
            iconWrapClass="bg-emerald-50 dark:bg-emerald-950/80"
          />
          <DetailCell
            icon={Briefcase}
            label="Type"
            value={formatJobType(job)}
            iconClass="text-violet-600"
            iconWrapClass="bg-violet-50 dark:bg-violet-950/80"
          />
          <DetailCell
            icon={Calendar}
            label="Experience"
            value={formatExperience(job)}
            iconClass="text-orange-600"
            iconWrapClass="bg-orange-50 dark:bg-orange-950/80"
          />
        </div>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] font-medium text-[#7a85a8] sm:gap-x-4 sm:text-xs dark:text-blue-300/80">
        <span className="inline-flex items-center gap-1">
          <Clock className="h-3.5 w-3.5 shrink-0" aria-hidden />
          Posted {formatPostedAgo(job.created_at)}
        </span>
        <span className="inline-flex items-center gap-1">
          <Briefcase className="h-3.5 w-3.5 shrink-0" aria-hidden />
          {applied} Applied
        </span>
        <span className="inline-flex items-center gap-1">
          <Users className="h-3.5 w-3.5 shrink-0" aria-hidden />
          {openings} Opening{openings === 1 ? "" : "s"}
        </span>
      </div>

      <div className="mt-3.5 grid grid-cols-2 gap-2 sm:mt-4 sm:gap-2.5">
        <button
          type="button"
          onClick={onViewDetails}
          className="h-11 rounded-xl border border-[#dde3f5] bg-white px-2 text-[13px] font-semibold text-[#0a0e1a] transition hover:border-primary-500/40 hover:bg-[#f8faff] sm:px-3 sm:text-sm dark:border-blue-800 dark:bg-slate-900 dark:text-blue-50"
        >
          View details
        </button>
        <button
          type="button"
          onClick={onApply}
          disabled={isApplying || (!job.can_apply && !!job.application_status)}
          className="inline-flex h-11 items-center justify-center gap-1 rounded-xl bg-gradient-to-r from-primary-700 to-primary-600 px-2 text-[13px] font-bold text-white shadow-md shadow-primary-600/20 transition hover:from-primary-800 disabled:opacity-60 sm:gap-1.5 sm:px-3 sm:text-sm"
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
