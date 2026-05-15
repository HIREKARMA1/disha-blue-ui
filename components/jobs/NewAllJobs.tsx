"use client"

import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import axios from "axios"
import {
  ChevronLeft,
  ChevronRight,
  Loader2,
  Search,
  SlidersHorizontal,
  X,
} from "lucide-react"
import { toast } from "react-hot-toast"
import { cn } from "@/lib/utils"
import { apiClient } from "@/lib/api"
import { profileService } from "@/services/profileService"
import { ApplicationModal } from "@/components/dashboard/ApplicationModal"
import { JobDescriptionModal } from "@/components/dashboard/JobDescriptionModal"
import {
  JobsCategoryHero,
  JobsFiltersSidebar,
  JobsMobileFilterDrawer,
  PublicJobListingCard,
  aggregateSalaryRange,
  formatJobLocation,
  topSkillsFromJobs,
  type JobsFilterValues,
} from "@/features/jobs-discovery"
import {
  loadSavedJobIds,
  toggleSavedJobId,
} from "./jobs-ui"
import type { Job } from "./AllJobs"

interface JobSearchResponse {
  jobs: Job[]
  total_count: number
  page: number
  limit: number
  total_pages: number
  has_next: boolean
  has_prev: boolean
}

function deepClean(obj: unknown): unknown {
  if (obj === null || obj === undefined) return obj
  if (typeof obj !== "object") return obj
  if (Array.isArray(obj)) return (obj as unknown[]).map(deepClean)
  const o = obj as Record<string, unknown>
  if ("type" in o && "loc" in o && "msg" in o) return null
  const out: Record<string, unknown> = {}
  for (const [k, v] of Object.entries(o)) {
    if (v && typeof v === "object" && "type" in (v as object) && "loc" in (v as object)) {
      out[k] = null
    } else {
      out[k] = deepClean(v)
    }
  }
  return out
}

const DEFAULT_FILTERS: JobsFilterValues = {
  keyword: "",
  location: "",
  job_type: "",
  salary_range: "",
}

function isRequestCancelled(error: unknown): boolean {
  return (
    axios.isCancel(error) ||
    (error instanceof Error && error.name === "CanceledError") ||
    (typeof error === "object" &&
      error !== null &&
      "code" in error &&
      (error as { code?: string }).code === "ERR_CANCELED")
  )
}

export function NewAllJobs() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const locationParam = searchParams.get("location")?.trim() ?? ""

  const [jobs, setJobs] = useState<Job[]>([])
  const [loading, setLoading] = useState(true)
  const [listError, setListError] = useState<string | null>(null)
  /** Draft filters in the sidebar/search — applied only on Apply / search submit */
  const [filters, setFilters] = useState<JobsFilterValues>({
    ...DEFAULT_FILTERS,
    location: locationParam,
  })
  /** Filters used for the last successful (or attempted) API request */
  const [appliedFilters, setAppliedFilters] = useState<JobsFilterValues>({
    ...DEFAULT_FILTERS,
    location: locationParam,
  })
  const fetchRequestId = useRef(0)
  const abortControllerRef = useRef<AbortController | null>(null)
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 15,
    total: 0,
    total_pages: 0,
  })
  const [savedJobIds, setSavedJobIds] = useState<string[]>([])
  const [showMobileFilters, setShowMobileFilters] = useState(false)

  // Selected job for modals
  const [viewJob, setViewJob] = useState<Job | null>(null)
  const [selectedJob, setSelectedJob] = useState<Job | null>(null)
  const [showApplyModal, setShowApplyModal] = useState(false)
  const [isApplying, setIsApplying] = useState(false)
  const [applyingJobId, setApplyingJobId] = useState<string | null>(null)

  // Auth / profile
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [profileCompletion, setProfileCompletion] = useState<number>(0)

  useEffect(() => {
    setSavedJobIds(loadSavedJobIds())
    const checkAuth = async () => {
      const token = apiClient.getAccessToken?.() ?? localStorage.getItem("access_token")
      if (token) {
        setIsLoggedIn(true)
        try {
          const comp = await profileService.getProfileCompletion()
          setProfileCompletion(comp.completion_percentage ?? 0)
        } catch {
          // silent
        }
      }
    }
    void checkAuth()
  }, [])

  // Sync ?location= from landing redirect without resetting other filters
  useEffect(() => {
    setFilters((prev) =>
      prev.location === locationParam ? prev : { ...prev, location: locationParam },
    )
    setAppliedFilters((prev) =>
      prev.location === locationParam ? prev : { ...prev, location: locationParam },
    )
  }, [locationParam])

  const fetchJobs = useCallback(
    async (page: number, activeFilters: JobsFilterValues) => {
      abortControllerRef.current?.abort()
      const controller = new AbortController()
      abortControllerRef.current = controller
      const requestId = ++fetchRequestId.current

      setLoading(true)
      setListError(null)

      try {
        const params = new URLSearchParams()
        params.set("page", String(page))
        params.set("limit", String(pagination.limit))

        if (activeFilters.keyword) params.set("keyword", activeFilters.keyword)
        // Prefer URL location when present (e.g. redirect from landing hero bar)
        if (locationParam) {
          params.set("location", locationParam)
        } else if (activeFilters.location) {
          params.set("location", activeFilters.location)
        }
        if (activeFilters.job_type) params.set("job_type", activeFilters.job_type)
        if (activeFilters.salary_range) {
          const [min, max] = activeFilters.salary_range.split("-")
          if (min) params.set("salary_min", min)
          if (max && max !== "99999999") params.set("salary_max", max)
        }

        const res = await apiClient.client.get(`/public/jobs/?${params}`, {
          signal: controller.signal,
        })

        if (requestId !== fetchRequestId.current) return

        const raw = deepClean(res.data) as JobSearchResponse

        const cleaned = (raw.jobs || []).map((j: Job) => ({
          ...j,
          title: String(j.title || ""),
          description: String(j.description || ""),
          job_type: String(j.job_type || ""),
          status: String(j.status || ""),
          location: String(j.location || ""),
          remote_work: Boolean(j.remote_work),
          travel_required: Boolean(j.travel_required),
          salary_currency: String(j.salary_currency || "INR"),
          created_at: String(j.created_at || ""),
          is_active: Boolean(j.is_active),
          can_apply: Boolean(j.can_apply),
          salary_min: j.salary_min != null ? Number(j.salary_min) : undefined,
          salary_max: j.salary_max != null ? Number(j.salary_max) : undefined,
          experience_min: j.experience_min != null ? Number(j.experience_min) : undefined,
          experience_max: j.experience_max != null ? Number(j.experience_max) : undefined,
          skills_required: Array.isArray(j.skills_required) ? j.skills_required.map(String) : [],
        }))

        setJobs(cleaned)
        setPagination((prev) => ({
          ...prev,
          page: raw.page || page,
          total: raw.total_count || 0,
          total_pages: raw.total_pages || 1,
        }))
      } catch (err: unknown) {
        if (isRequestCancelled(err) || requestId !== fetchRequestId.current) return
        setJobs([])
        setListError("We couldn't load jobs right now. Please try again.")
      } finally {
        if (requestId === fetchRequestId.current) {
          setLoading(false)
        }
      }
    },
    [pagination.limit, locationParam]
  )

  // Single fetch path — avoids duplicate requests and stale filter toasts on redirect
  useEffect(() => {
    void fetchJobs(pagination.page, appliedFilters)
    return () => {
      abortControllerRef.current?.abort()
    }
  }, [pagination.page, appliedFilters, fetchJobs])

  const handleApplyFilters = (page = 1) => {
    setAppliedFilters(filters)
    setPagination((prev) => ({ ...prev, page }))
  }

  const handlePageChange = (page: number) => {
    setPagination((prev) => ({ ...prev, page }))
  }

  const handleApplyClick = (job: Job) => {
    if (!isLoggedIn) {
      router.push(`/auth/login?redirect=${encodeURIComponent("/jobs")}&type=student`)
      return
    }
    if (profileCompletion < 75) {
      toast.error("Profile must be at least 75% complete to apply.")
      return
    }
    if (!job.can_apply) {
      toast.error("Applications are closed for this job.")
      return
    }
    setSelectedJob(job)
    setShowApplyModal(true)
  }

  const handleApplySubmit = async (data: { cover_letter: string; expected_salary?: string; availability_date: string }) => {
    if (!selectedJob) return
    setIsApplying(true)
    setApplyingJobId(selectedJob.id)
    try {
      await apiClient.applyForJob(selectedJob.id, {
        job_id: selectedJob.id,
        cover_letter: data.cover_letter,
        expected_salary: data.expected_salary ? Number(data.expected_salary) : null,
        availability_date: data.availability_date,
      })
      toast.success("Application submitted!")
      setShowApplyModal(false)
      setJobs((prev) =>
        prev.map((j) =>
          j.id === selectedJob.id ? { ...j, application_status: "applied", can_apply: false } : j
        )
      )
    } catch (err: unknown) {
      const detail = (err as { response?: { data?: { detail?: unknown } } })?.response?.data?.detail
      toast.error(typeof detail === "string" ? detail : "Failed to submit application")
    } finally {
      setIsApplying(false)
      setApplyingJobId(null)
    }
  }

  const displayLocation = locationParam || appliedFilters.location

  const heroTitle = useMemo(() => {
    if (appliedFilters.keyword) return `${appliedFilters.keyword} Jobs in India`
    if (displayLocation) return `Jobs in ${displayLocation}`
    return "Jobs in India"
  }, [appliedFilters.keyword, displayLocation])

  const heroDesc = useMemo(() => {
    if (appliedFilters.keyword)
      return `Browse verified ${appliedFilters.keyword} vacancies with salary details. Apply free today.`
    return "Explore verified job openings across India with salary details. Apply free today."
  }, [appliedFilters.keyword])

  const salaryLabel = useMemo(() => aggregateSalaryRange(jobs), [jobs])
  const skillsLabel = useMemo(
    () => topSkillsFromJobs(jobs, 3).join(" · ") || "Communication · Teamwork",
    [jobs]
  )
  const locationLabel = useMemo(
    () =>
      displayLocation ||
      (jobs.length > 0 ? formatJobLocation(jobs[0]) : "Pan India"),
    [displayLocation, jobs]
  )

  const handleFilterChange = (key: keyof JobsFilterValues, value: string) =>
    setFilters((prev) => ({ ...prev, [key]: value }))

  const handleFilterClear = () => {
    const cleared = { ...DEFAULT_FILTERS }
    setFilters(cleared)
    setAppliedFilters(cleared)
    setPagination((prev) => ({ ...prev, page: 1 }))
    if (locationParam) {
      router.replace("/jobs")
    }
  }

  const skeletonItems = Array.from({ length: 6 })

  return (
    <div className="mx-auto w-full max-w-[1400px] px-4 pb-16 pt-24 sm:px-6 lg:px-8">
      {/* Mobile filter toggle bar */}
      <div className="mb-4 flex items-center justify-between lg:hidden">
        <h1 className="text-xl font-bold text-[#0a0e1a] dark:text-white">Find Jobs</h1>
        <button
          type="button"
          onClick={() => setShowMobileFilters(true)}
          className="inline-flex items-center gap-2 rounded-xl border border-[#dde3f5] bg-white px-4 py-2.5 text-sm font-semibold text-[#0a0e1a] shadow-sm dark:border-blue-800 dark:bg-slate-900 dark:text-white"
        >
          <SlidersHorizontal className="h-4 w-4 text-[#0070f3]" />
          Filters
        </button>
      </div>

      <div className="flex gap-6">
        {/* Sidebar — desktop only */}
        <div className="hidden w-64 shrink-0 lg:block xl:w-72">
          <div className="sticky top-24">
            <JobsFiltersSidebar
              filters={filters}
              onChange={handleFilterChange}
              onApply={() => handleApplyFilters(1)}
              onClear={handleFilterClear}
            />
          </div>
        </div>

        {/* Main content */}
        <div className="min-w-0 flex-1 space-y-5">
          {/* Hero banner */}
          <JobsCategoryHero
            title={heroTitle}
            description={heroDesc}
            locationLabel={locationLabel}
            roleLabel={appliedFilters.keyword || "All roles"}
            salaryRangeLabel={salaryLabel}
            skillsLabel={skillsLabel}
          />

          {/* Search + count bar */}
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            {listError ? (
              <div
                className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-200"
                role="alert"
              >
                {listError}{" "}
                <button
                  type="button"
                  className="font-semibold underline underline-offset-2"
                  onClick={() => void fetchJobs(pagination.page, appliedFilters)}
                >
                  Retry
                </button>
              </div>
            ) : null}

            <form
              onSubmit={(e) => {
                e.preventDefault()
                handleApplyFilters(1)
              }}
              className="relative flex-1"
            >
              <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#7a85a8]" aria-hidden />
              <input
                type="search"
                placeholder="Role, skill, company…"
                value={filters.keyword}
                onChange={(e) => handleFilterChange("keyword", e.target.value)}
                className="h-11 w-full rounded-xl border border-[#dde3f5] bg-white py-2 pl-10 pr-4 text-sm text-[#0a0e1a] outline-none transition focus:border-[#0070f3] focus:ring-2 focus:ring-[#0070f3]/20 dark:border-blue-900 dark:bg-slate-900 dark:text-blue-50"
              />
              {filters.keyword ? (
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#7a85a8] hover:text-[#0a0e1a]"
                  onClick={() => {
                    const next = { ...filters, keyword: "" }
                    setFilters(next)
                    setAppliedFilters(next)
                    setPagination((p) => ({ ...p, page: 1 }))
                  }}
                  aria-label="Clear search"
                >
                  <X className="h-4 w-4" />
                </button>
              ) : null}
            </form>
            <p className="shrink-0 text-sm text-[#7a85a8] dark:text-blue-300/80">
              {loading ? (
                <span className="inline-flex items-center gap-1.5">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Loading…
                </span>
              ) : (
                <span>
                  <strong className="font-semibold text-[#0a0e1a] dark:text-white">{jobs.length}</strong> roles found
                </span>
              )}
            </p>
          </div>

          {/* Job listing */}
          {loading ? (
            <div className="space-y-4">
              {skeletonItems.map((_, i) => (
                <div
                  key={i}
                  className="animate-pulse rounded-2xl border border-[#dde3f5] bg-white p-5 dark:border-blue-900/50 dark:bg-slate-900"
                >
                  <div className="flex items-start gap-3">
                    <div className="h-11 w-11 rounded-xl bg-[#e8f0ff] dark:bg-blue-900/40" />
                    <div className="flex-1 space-y-2">
                      <div className="h-5 w-2/3 rounded-lg bg-[#e8f0ff] dark:bg-blue-900/40" />
                      <div className="h-4 w-1/3 rounded-lg bg-[#e8f0ff] dark:bg-blue-900/40" />
                    </div>
                  </div>
                  <div className="mt-4 grid grid-cols-2 gap-2.5">
                    {[1, 2, 3, 4].map((j) => (
                      <div key={j} className="h-14 rounded-xl bg-[#f0f4ff] dark:bg-blue-900/30" />
                    ))}
                  </div>
                  <div className="mt-4 h-10 rounded-xl bg-[#e8f0ff] dark:bg-blue-900/40" />
                </div>
              ))}
            </div>
          ) : jobs.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-4 rounded-2xl border border-[#dde3f5] bg-white px-6 py-16 text-center dark:border-blue-900/50 dark:bg-slate-900">
              <p className="text-xl font-bold text-[#0a0e1a] dark:text-white">No roles found</p>
              <p className="max-w-sm text-sm text-[#7a85a8] dark:text-blue-300/80">
                Try clearing your filters or searching with different keywords.
              </p>
              <button
                type="button"
                onClick={handleFilterClear}
                className="h-10 rounded-xl bg-gradient-to-r from-[#0052cc] to-[#0070f3] px-6 text-sm font-bold text-white shadow-md"
              >
                Clear filters
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {jobs.map((job) => (
                <PublicJobListingCard
                  key={job.id}
                  job={job}
                  isSaved={savedJobIds.includes(job.id)}
                  isApplying={applyingJobId === job.id}
                  onViewDetails={() => setViewJob(job)}
                  onApply={() => handleApplyClick(job)}
                  onSaveToggle={() => {
                    toggleSavedJobId(job.id)
                    setSavedJobIds(loadSavedJobIds())
                  }}
                />
              ))}
            </div>
          )}

          {/* Pagination */}
          {pagination.total_pages > 1 && !loading && (
            <div className="flex items-center justify-center gap-1 pt-4">
              <button
                type="button"
                disabled={pagination.page === 1}
                onClick={() => handlePageChange(pagination.page - 1)}
                className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#dde3f5] bg-white text-[#3a4260] transition hover:border-[#0070f3]/50 hover:text-[#0070f3] disabled:opacity-40 dark:border-blue-900 dark:bg-slate-900 dark:text-blue-200"
                aria-label="Previous page"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              {Array.from({ length: pagination.total_pages }, (_, i) => i + 1)
                .filter((p) => {
                  const c = pagination.page
                  return p === 1 || p === pagination.total_pages || Math.abs(p - c) <= 1
                })
                .reduce<(number | "…")[]>((acc, p) => {
                  const last = acc[acc.length - 1]
                  if (typeof last === "number" && p - last > 1) acc.push("…")
                  acc.push(p)
                  return acc
                }, [])
                .map((p, idx) =>
                  p === "…" ? (
                    <span key={`e-${idx}`} className="px-1 text-sm text-[#7a85a8]">…</span>
                  ) : (
                    <button
                      key={p}
                      type="button"
                      onClick={() => handlePageChange(p as number)}
                      className={cn(
                        "h-10 min-w-[2.5rem] rounded-xl px-2 text-sm font-semibold transition",
                        pagination.page === p
                          ? "bg-gradient-to-r from-[#0052cc] to-[#0070f3] text-white shadow-md"
                          : "border border-[#dde3f5] bg-white text-[#3a4260] hover:border-[#0070f3]/50 hover:text-[#0070f3] dark:border-blue-900 dark:bg-slate-900 dark:text-blue-200",
                      )}
                    >
                      {p}
                    </button>
                  )
                )}
              <button
                type="button"
                disabled={pagination.page === pagination.total_pages}
                onClick={() => handlePageChange(pagination.page + 1)}
                className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#dde3f5] bg-white text-[#3a4260] transition hover:border-[#0070f3]/50 hover:text-[#0070f3] disabled:opacity-40 dark:border-blue-900 dark:bg-slate-900 dark:text-blue-200"
                aria-label="Next page"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Mobile filter drawer */}
      <JobsMobileFilterDrawer
        open={showMobileFilters}
        onClose={() => setShowMobileFilters(false)}
        filters={filters}
        onChange={handleFilterChange}
        onApply={() => handleApplyFilters(1)}
        onClear={handleFilterClear}
      />

      {/* Modals */}
      {viewJob && (
        <JobDescriptionModal
          job={viewJob}
          onClose={() => setViewJob(null)}
          onApply={() => {
            setViewJob(null)
            handleApplyClick(viewJob)
          }}
          applicationStatus={viewJob.application_status}
        />
      )}
      {showApplyModal && selectedJob && (
        <ApplicationModal
          job={selectedJob}
          isApplying={isApplying}
          onClose={() => setShowApplyModal(false)}
          onSubmit={handleApplySubmit}
        />
      )}
    </div>
  )
}
