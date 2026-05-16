"use client"

import { useCallback, useMemo, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  ArrowLeft,
  Bookmark,
  Briefcase,
  Building2,
  Clock,
  Flame,
  MapPin,
  Share2,
  Star,
} from "lucide-react"
import { toast } from "react-hot-toast"
import { cn } from "@/lib/utils"
import type { Job } from "@/components/jobs/AllJobs"
import { toggleSavedJobId, isJobSaved } from "@/components/jobs/jobs-ui"
import {
  formatHeaderExperience,
  formatPostedDate,
  formatDeadlineLabel,
  getCompanyInitials,
  getOverviewFields,
  isUrgentJob,
  parseBenefitTags,
  parseDescriptionItems,
} from "../utils/jobDetailsHelpers"
import { formatJobLocation, formatJobType } from "../utils/jobFormatters"

type Props = {
  job: Job
  isApplying?: boolean
  onApply: () => void
  applicationStatus?: string
  /** Where "Back to jobs" navigates (default public listing). */
  backHref?: string
  backLabel?: string
  /** Links that point at the jobs list (e.g. reviews placeholder). */
  jobsListHref?: string
  /** Render inside dashboard shell (no extra top padding). */
  embedded?: boolean
}

function DetailCard({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) {
  return (
    <section
      className={cn(
        "rounded-2xl border border-[#e8edf5] bg-white p-5 shadow-sm sm:p-6 dark:border-blue-900/50 dark:bg-slate-900",
        className,
      )}
    >
      {children}
    </section>
  )
}

function OverviewField({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0">
      <p className="text-xs font-medium text-[#7a85a8] dark:text-blue-300/80">{label}</p>
      <p className="mt-1 break-words text-sm font-semibold text-[#0a0e1a] dark:text-blue-50">{value}</p>
    </div>
  )
}

function ActionsPanel({
  job,
  isApplying,
  onApply,
  applicationStatus,
  isSaved,
  onSaveToggle,
  className,
}: {
  job: Job
  isApplying?: boolean
  onApply: () => void
  applicationStatus?: string
  isSaved: boolean
  onSaveToggle: () => void
  className?: string
}) {
  const applied = job.applications_count ?? job.current_applications ?? 0
  const openings = job.number_of_openings ?? 1
  const deadline = formatDeadlineLabel(job.application_deadline || job.expiration_date)

  return (
    <DetailCard className={className}>
      <button
        type="button"
        onClick={onApply}
        disabled={isApplying || (!job.can_apply && !!applicationStatus)}
        className="h-12 w-full rounded-xl bg-gradient-to-r from-primary-700 to-primary-600 text-sm font-bold text-white shadow-md shadow-primary-600/20 transition hover:from-primary-800 disabled:opacity-60"
      >
        {isApplying
          ? "Applying…"
          : applicationStatus === "applied"
            ? "Applied"
            : "Apply now"}
      </button>
      <button
        type="button"
        onClick={onSaveToggle}
        className="mt-3 flex h-12 w-full items-center justify-center gap-2 rounded-xl border border-[#dde3f5] bg-white text-sm font-semibold text-primary-700 transition hover:bg-[#f8faff] dark:border-blue-800 dark:bg-slate-950 dark:text-primary-300"
      >
        <Bookmark className={cn("h-4 w-4", isSaved && "fill-primary-600 text-primary-600")} />
        {isSaved ? "Saved" : "Save job"}
      </button>

      <dl className="mt-5 space-y-4 border-t border-[#e8edf5] pt-5 dark:border-blue-900/50">
        {deadline ? (
          <div>
            <dt className="text-xs font-medium text-[#7a85a8]">Application deadline</dt>
            <dd className="mt-1 text-sm font-bold text-[#0a0e1a] dark:text-white">{deadline}</dd>
          </div>
        ) : null}
        <div>
          <dt className="text-xs font-medium text-[#7a85a8]">Job type</dt>
          <dd className="mt-2">
            <span className="inline-flex rounded-full bg-primary-50 px-3 py-1 text-xs font-semibold text-primary-700 dark:bg-primary-900/40 dark:text-primary-200">
              {formatJobType(job)}
            </span>
          </dd>
        </div>
        <div>
          <dt className="text-xs font-medium text-[#7a85a8]">Application activity</dt>
          <dd className="mt-1 text-sm">
            <span className="font-bold text-[#0a0e1a] dark:text-white">{applied}</span> applied
          </dd>
        </div>
        <div>
          <dt className="text-xs font-medium text-[#7a85a8]">Opening</dt>
          <dd className="mt-1 text-sm font-bold text-[#0a0e1a] dark:text-white">{openings}</dd>
        </div>
      </dl>
    </DetailCard>
  )
}

export function PublicJobDetailsView({
  job,
  isApplying,
  onApply,
  applicationStatus,
  backHref = "/jobs",
  backLabel = "Back to jobs",
  jobsListHref = "/jobs",
  embedded = false,
}: Props) {
  const router = useRouter()
  const [saved, setSaved] = useState(() => isJobSaved(job.id))

  const company = job.company_name || job.corporate_name || "Hiring partner"
  const initials = getCompanyInitials(company)
  const showUrgent = isUrgentJob(job.created_at, job.can_apply)
  const descriptionItems = useMemo(() => parseDescriptionItems(job), [job])
  const benefitTags = useMemo(() => parseBenefitTags(job.perks_and_benefits), [job])
  const overview = useMemo(() => getOverviewFields(job), [job])

  const handleShare = useCallback(async () => {
    const url = typeof window !== "undefined" ? window.location.href : ""
    try {
      if (navigator.share) {
        await navigator.share({ title: job.title, text: company, url })
      } else {
        await navigator.clipboard.writeText(url)
        toast.success("Link copied")
      }
    } catch {
      /* user cancelled */
    }
  }, [company, job.title])

  const handleSave = () => {
    toggleSavedJobId(job.id)
    setSaved(isJobSaved(job.id))
  }

  return (
    <div
      className={cn(
        "mx-auto w-full max-w-6xl px-4 pb-16 sm:px-6 lg:px-8",
        embedded ? "pt-0" : "pt-4 lg:pt-6",
      )}
    >
      {/* Toolbar */}
      <div className="mb-5 flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={() => router.push(backHref)}
          className="inline-flex items-center gap-2 text-sm font-semibold text-[#3a4260] transition hover:text-primary-600 dark:text-blue-200"
        >
          <ArrowLeft className="h-4 w-4" />
          {backLabel}
        </button>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => void handleShare()}
            className="rounded-lg p-2.5 text-[#7a85a8] transition hover:bg-white hover:text-primary-600 dark:hover:bg-slate-800"
            aria-label="Share job"
          >
            <Share2 className="h-5 w-5" />
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="rounded-lg p-2.5 text-[#7a85a8] transition hover:bg-white hover:text-primary-600 dark:hover:bg-slate-800"
            aria-label={saved ? "Unsave job" : "Save job"}
          >
            <Bookmark className={cn("h-5 w-5", saved && "fill-primary-600 text-primary-600")} />
          </button>
        </div>
      </div>

      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_320px] lg:gap-6 xl:grid-cols-[minmax(0,1fr)_340px]">
        {/* Main column */}
        <div className="space-y-5">
          {/* Job header */}
          <DetailCard>
            <div className="flex gap-4">
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-primary-600 to-primary-500 text-base font-bold text-white sm:h-14 sm:w-14 sm:text-lg">
                {initials}
              </span>
              <div className="min-w-0 flex-1">
                <h1 className="text-xl font-bold leading-snug text-[#0a0e1a] sm:text-2xl dark:text-white">
                  {job.title}
                </h1>
                <p className="mt-1 inline-flex items-center gap-1.5 text-sm font-medium text-[#3a4260] dark:text-blue-200/90">
                  <Building2 className="h-4 w-4 shrink-0 text-[#7a85a8]" aria-hidden />
                  {company}
                </p>
                {showUrgent ? (
                  <span className="mt-2 inline-flex rounded-full bg-[#fff0e8] px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-[#e85d04]">
                    Urgent hiring
                  </span>
                ) : null}
                <div className="mt-4 flex flex-wrap gap-x-4 gap-y-2 text-sm text-[#3a4260] dark:text-blue-200/80">
                  <span className="inline-flex items-center gap-1.5">
                    <MapPin className="h-4 w-4 shrink-0 text-primary-600" />
                    {formatJobLocation(job)}
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <Briefcase className="h-4 w-4 shrink-0 text-primary-600" />
                    {formatJobType(job)}
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <Clock className="h-4 w-4 shrink-0 text-primary-600" />
                    {formatHeaderExperience(job)}
                  </span>
                </div>
                <p className="mt-4 text-xs text-[#7a85a8]">Posted {formatPostedDate(job.created_at)}</p>
              </div>
            </div>
          </DetailCard>

          {/* Mobile actions — after header */}
          <ActionsPanel
            job={job}
            isApplying={isApplying}
            onApply={onApply}
            applicationStatus={applicationStatus}
            isSaved={saved}
            onSaveToggle={handleSave}
            className="lg:hidden"
          />

          {/* Description */}
          <DetailCard>
            <h2 className="text-lg font-bold text-[#0a0e1a] dark:text-white">Job description</h2>
            {descriptionItems.length > 0 ? (
              <ol className="mt-4 list-decimal space-y-3 pl-5 text-sm leading-relaxed text-[#3a4260] marker:font-semibold marker:text-[#0a0e1a] dark:text-blue-100/90 dark:marker:text-white">
                {descriptionItems.map((item, i) => (
                  <li key={i}>{item}</li>
                ))}
              </ol>
            ) : (
              <p className="mt-4 text-sm leading-relaxed text-[#3a4260] dark:text-blue-100/90">
                {job.description || "No description provided."}
              </p>
            )}
          </DetailCard>

          {/* Benefits */}
          {benefitTags.length > 0 ? (
            <DetailCard>
              <h2 className="text-lg font-bold text-[#0a0e1a] dark:text-white">Job benefits</h2>
              <div className="mt-4 flex flex-wrap gap-2">
                {benefitTags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full bg-[#e8f0ff] px-3.5 py-2 text-xs font-semibold text-primary-700 dark:bg-blue-900/50 dark:text-primary-200"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </DetailCard>
          ) : null}

          {/* Overview */}
          <DetailCard>
            <h2 className="text-lg font-bold text-[#0a0e1a] dark:text-white">Job overview</h2>

            <div className="mt-5 space-y-6">
              <div>
                <h3 className="flex items-center gap-2 text-sm font-bold text-primary-700 dark:text-primary-300">
                  <MapPin className="h-4 w-4" />
                  Location details
                </h3>
                <div className="mt-4 space-y-4">
                  <OverviewField label="Address" value={overview.address} />
                  <div className="grid grid-cols-2 gap-4">
                    <OverviewField label="City" value={overview.city} />
                    <OverviewField label="Pincode" value={overview.pincode} />
                  </div>
                  <OverviewField label="State" value={overview.state} />
                </div>
              </div>

              <div className="border-t border-[#e8edf5] pt-6 dark:border-blue-900/50">
                <h3 className="flex items-center gap-2 text-sm font-bold text-primary-700 dark:text-primary-300">
                  <Briefcase className="h-4 w-4" />
                  Job details
                </h3>
                <div className="mt-4 space-y-4">
                  <OverviewField label="Salary range" value={overview.salary} />
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <OverviewField label="Working hours" value={overview.workingHours} />
                    <OverviewField label="Industry type" value={overview.industry} />
                  </div>
                  <div>
                    <p className="text-xs font-medium text-[#7a85a8]">Available shifts</p>
                    <span className="mt-2 inline-flex rounded-md bg-[#f4f6fa] px-2.5 py-1 text-xs font-semibold text-[#3a4260] dark:bg-slate-800 dark:text-blue-100">
                      {overview.shift}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </DetailCard>

          <DetailCard className="border-primary-200/80 lg:hidden dark:border-primary-800/60">
            <h2 className="text-lg font-bold text-[#0a0e1a] dark:text-white">Reviews & ratings</h2>
            <div className="mt-4 rounded-xl border border-primary-200/60 bg-[#f8faff] p-4 dark:border-primary-800/50 dark:bg-blue-950/30">
              <p className="flex items-center gap-1.5 text-xs font-semibold text-[#e85d04]">
                <Flame className="h-3.5 w-3.5" />
                Platform rating
              </p>
              <p className="mt-3 flex items-center gap-2 text-sm font-bold text-[#0a0e1a] dark:text-white">
                <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                Not available
              </p>
              <p className="mt-1 text-xs text-[#7a85a8]">0 reviews</p>
              <Link
                href={jobsListHref}
                className="mt-3 inline-block text-sm font-semibold text-primary-600 hover:underline"
              >
                View reviews →
              </Link>
            </div>
          </DetailCard>
        </div>

        {/* Sidebar — desktop */}
        <aside className="hidden space-y-5 lg:block">
          <div className={cn("sticky space-y-5", embedded ? "top-4" : "top-24")}>
            <ActionsPanel
              job={job}
              isApplying={isApplying}
              onApply={onApply}
              applicationStatus={applicationStatus}
              isSaved={saved}
              onSaveToggle={handleSave}
            />

            <DetailCard className="border-primary-200/80 dark:border-primary-800/60">
              <h2 className="text-lg font-bold text-[#0a0e1a] dark:text-white">Reviews & ratings</h2>
              <div className="mt-4 rounded-xl border border-primary-200/60 bg-[#f8faff] p-4 dark:border-primary-800/50 dark:bg-blue-950/30">
                <p className="flex items-center gap-1.5 text-xs font-semibold text-[#e85d04]">
                  <Flame className="h-3.5 w-3.5" />
                  Platform rating
                </p>
                <p className="mt-3 flex items-center gap-2 text-sm font-bold text-[#0a0e1a] dark:text-white">
                  <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                  Not available
                </p>
                <p className="mt-1 text-xs text-[#7a85a8]">0 reviews</p>
                <Link
                  href={jobsListHref}
                  className="mt-3 inline-block text-sm font-semibold text-primary-600 hover:underline"
                >
                  View reviews →
                </Link>
              </div>
            </DetailCard>
          </div>
        </aside>
      </div>
    </div>
  )
}
