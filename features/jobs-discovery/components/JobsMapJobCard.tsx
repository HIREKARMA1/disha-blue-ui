"use client"

import { ChevronRight, Clock, MapPin, Wallet } from "lucide-react"
import { cn } from "@/lib/utils"
import type { Job } from "@/components/jobs/AllJobs"
import {
  formatJobLocation,
  formatJobType,
  formatPostedAgo,
  formatSalary,
  getCompanyInitials,
} from "../utils/jobFormatters"

type Props = {
  job: Job
  isApplying?: boolean
  onViewDetails: () => void
  onApply: () => void
}

function isUrgentPosting(createdAt?: string): boolean {
  if (!createdAt) return false
  const ms = Date.now() - new Date(createdAt).getTime()
  return ms < 3 * 24 * 60 * 60 * 1000
}

export function JobsMapJobCard({ job, isApplying, onViewDetails, onApply }: Props) {
  const company = job.company_name || job.corporate_name || "Company"
  const urgent = isUrgentPosting(job.created_at)

  return (
    <article
      className="cursor-pointer rounded-xl border border-slate-200/90 bg-white p-4 shadow-sm transition-all duration-200 ease-out hover:-translate-y-0.5 hover:border-primary-200 hover:shadow-md active:scale-[0.99] dark:border-slate-700 dark:bg-slate-900 dark:hover:border-primary-800"
      onClick={onViewDetails}
      onKeyDown={(e) => e.key === "Enter" && onViewDetails()}
      role="button"
      tabIndex={0}
    >
      <div className="flex gap-3">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary-50 text-sm font-bold text-primary-700 dark:bg-primary-950/50 dark:text-primary-300">
          {job.company_logo ? (
            <img src={job.company_logo} alt="" className="h-full w-full rounded-xl object-cover" />
          ) : (
            getCompanyInitials(company)
          )}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div className="min-w-0">
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-50">{job.title}</h3>
              <p className="text-sm text-slate-500">{company}</p>
            </div>
            {urgent ? (
              <span className="shrink-0 rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-amber-800">
                Urgent hiring
              </span>
            ) : null}
          </div>

          <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1.5 text-sm">
            <span className="inline-flex items-center gap-1 text-emerald-700 dark:text-emerald-400">
              <Wallet className="h-3.5 w-3.5" />
              {formatSalary(job)}
            </span>
            <span className="inline-flex items-center gap-1 text-slate-600 dark:text-slate-400">
              <MapPin className="h-3.5 w-3.5" />
              {formatJobLocation(job)}
            </span>
            <span className="inline-flex items-center gap-1 text-violet-700 dark:text-violet-400">
              <Clock className="h-3.5 w-3.5" />
              {formatJobType(job)}
            </span>
          </div>

          <div className="mt-4 flex items-center justify-between gap-2 border-t border-slate-100 pt-3 dark:border-slate-800">
            <span className="text-xs text-slate-500">{formatPostedAgo(job.created_at)}</span>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation()
                onApply()
              }}
              disabled={isApplying || !job.can_apply}
              className={cn(
                "inline-flex items-center gap-1 rounded-lg bg-primary-50 px-3 py-1.5 text-sm font-semibold text-primary-700 transition hover:bg-primary-100 disabled:opacity-50 dark:bg-primary-950/40 dark:text-primary-300",
              )}
            >
              {isApplying ? "Applying…" : "Apply"}
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </article>
  )
}
