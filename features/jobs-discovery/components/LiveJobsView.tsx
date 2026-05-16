"use client"

import dynamic from "next/dynamic"
import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import axios from "axios"
import {
  ChevronLeft,
  ChevronRight,
  Loader2,
  Search,
  X,
} from "lucide-react"
import { toast } from "react-hot-toast"
import { cn } from "@/lib/utils"
import { useTranslation } from "@/hooks/useTranslation"
import { apiClient } from "@/lib/api"
import { profileService } from "@/services/profileService"
import { ApplicationModal } from "@/components/dashboard/ApplicationModal"
import { JobsBreadcrumb } from "./JobsBreadcrumb"
import { JobsCategoryHero } from "./JobsCategoryHero"
import { JobsDiscoveryHeader } from "./JobsDiscoveryHeader"
import { JobsFiltersSidebar, type JobsFilterValues } from "./JobsFiltersSidebar"
import { JobsMobileFilterDrawer } from "./JobsMobileFilterDrawer"
import { JobsMobileQuickFilters } from "./JobsMobileQuickFilters"
import { JobsViewModeToggle, type JobsViewMode } from "./JobsViewModeToggle"
import { LoginRequiredModal } from "./LoginRequiredModal"
import { PublicJobListingCard } from "./PublicJobListingCard"
import {
  aggregateSalaryRange,
  formatJobLocation,
  getDisplayMatchScore,
  topSkillsFromJobs,
} from "../utils/jobFormatters"
import {
  DASHBOARD_JOBS_ROUTE,
  dashboardJobDetailsPath,
} from "../constants"
import {
  loadSavedJobIds,
  toggleSavedJobId,
} from "@/components/jobs/jobs-ui"
import type { Job } from "@/components/jobs/AllJobs"
import type { JobLocationCluster } from "../utils/indiaGeo"

const JobsIndiaMapView = dynamic(
  () => import("./JobsIndiaMapView").then((m) => m.JobsIndiaMapView),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-[min(72vh,640px)] min-h-[420px] items-center justify-center rounded-2xl border border-[#dde3f5] bg-[#e8eef5] dark:border-blue-900/60">
        <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
      </div>
    ),
  },
)

const MAP_JOBS_LIMIT = 50

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

export type LiveJobsViewProps = {
  variant?: "public" | "dashboard"
}

export function LiveJobsView({ variant = "public" }: LiveJobsViewProps) {
  const isDashboard = variant === "dashboard"
  const { t, tParams } = useTranslation()
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
  const [viewMode, setViewMode] = useState<JobsViewMode>("list")
  const [selectedMapClusterId, setSelectedMapClusterId] = useState<string | null>(null)

  // Selected job for modals
  const [selectedJob, setSelectedJob] = useState<Job | null>(null)
  const [showApplyModal, setShowApplyModal] = useState(false)
  const [showLoginRequired, setShowLoginRequired] = useState(false)
  const [loginRedirectPath, setLoginRedirectPath] = useState("/jobs")
  const [isApplying, setIsApplying] = useState(false)
  const [applyingJobId, setApplyingJobId] = useState<string | null>(null)

  // Auth / profile
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [profileCompletion, setProfileCompletion] = useState<number>(0)

  useEffect(() => {
    setSavedJobIds(loadSavedJobIds())
    if (isDashboard) {
      setIsLoggedIn(true)
      void profileService
        .getProfileCompletion()
        .then((c) => setProfileCompletion(c.completion_percentage ?? 0))
        .catch(() => {})
      return
    }
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
  }, [isDashboard])

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
    async (page: number, activeFilters: JobsFilterValues, options?: { limit?: number }) => {
      const requestLimit = options?.limit ?? pagination.limit
      abortControllerRef.current?.abort()
      const controller = new AbortController()
      abortControllerRef.current = controller
      const requestId = ++fetchRequestId.current

      setLoading(true)
      setListError(null)

      try {
        const params = new URLSearchParams()
        params.set("page", String(page))
        params.set("limit", String(requestLimit))

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
          location: Array.isArray(j.location)
            ? j.location.filter(Boolean).map(String).join(", ")
            : j.location != null
              ? String(j.location)
              : "",
          state: j.state != null ? String(j.state) : undefined,
          district: j.district != null ? String(j.district) : undefined,
          city_or_town: j.city_or_town != null ? String(j.city_or_town) : undefined,
          pincode: j.pincode != null ? String(j.pincode) : undefined,
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
        setListError(t("jobs.loadError"))
        setPagination((prev) => ({ ...prev, total: 0, total_pages: 0 }))
        setJobs([])
      } finally {
        if (requestId === fetchRequestId.current) {
          setLoading(false)
        }
      }
    },
    [pagination.limit, locationParam],
  )

  const jobsFetchLimit =
    viewMode === "map"
      ? Math.min(MAP_JOBS_LIMIT, Math.max(pagination.limit, pagination.total || pagination.limit))
      : pagination.limit
  const jobsFetchPage = viewMode === "map" ? 1 : pagination.page

  // Single fetch path — avoids duplicate requests and stale filter toasts on redirect
  useEffect(() => {
    void fetchJobs(jobsFetchPage, appliedFilters, { limit: jobsFetchLimit })
    return () => {
      abortControllerRef.current?.abort()
    }
  }, [jobsFetchPage, appliedFilters, jobsFetchLimit, fetchJobs])

  const displayJobCount = listError ? jobs.length : pagination.total || jobs.length

  useEffect(() => {
    setSelectedMapClusterId(null)
  }, [appliedFilters, viewMode])

  const handleApplyFilters = (page = 1) => {
    setAppliedFilters(filters)
    setPagination((prev) => ({ ...prev, page }))
  }

  const handlePageChange = (page: number) => {
    setPagination((prev) => ({ ...prev, page }))
  }

  const handleApplyClick = (job: Job) => {
    if (!isLoggedIn) {
      setLoginRedirectPath(jobDetailsPath(job.id))
      setShowLoginRequired(true)
      return
    }
    if (profileCompletion < 75) {
      toast.error(t("jobs.toast.profileIncomplete"))
      return
    }
    if (!job.can_apply) {
      toast.error(t("jobs.toast.applicationsClosed"))
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
      toast.success(t("jobs.toast.applySuccess"))
      setShowApplyModal(false)
      setJobs((prev) =>
        prev.map((j) =>
          j.id === selectedJob.id ? { ...j, application_status: "applied", can_apply: false } : j
        )
      )
    } catch (err: unknown) {
      const detail = (err as { response?: { data?: { detail?: unknown } } })?.response?.data?.detail
      toast.error(typeof detail === "string" ? detail : t("jobs.toast.applyFailed"))
    } finally {
      setIsApplying(false)
      setApplyingJobId(null)
    }
  }

  const displayLocation = locationParam || appliedFilters.location

  const heroTitle = useMemo(() => {
    if (appliedFilters.keyword) return `${appliedFilters.keyword} Jobs in India`
    if (displayLocation) return `Jobs in ${displayLocation}`
    return t("jobs.hero.defaultTitle")
  }, [appliedFilters.keyword, displayLocation, t])

  const heroDesc = useMemo(() => {
    if (appliedFilters.keyword)
      return tParams("jobs.hero.keywordDescription", { keyword: appliedFilters.keyword })
    return t("jobs.hero.defaultDescription")
  }, [appliedFilters.keyword, t, tParams])

  const salaryLabel = useMemo(() => aggregateSalaryRange(jobs), [jobs])
  const skillsLabel = useMemo(
    () => topSkillsFromJobs(jobs, 3).join(" · ") || t("jobs.hero.defaultSkills"),
    [jobs, t]
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
      router.replace(isDashboard ? DASHBOARD_JOBS_ROUTE : "/jobs")
    }
  }

  const activeFilterCount = [
    appliedFilters.keyword,
    appliedFilters.location,
    appliedFilters.job_type,
    appliedFilters.salary_range,
    locationParam,
  ].filter(Boolean).length

  const jobDetailsPath = (id: string) =>
    isDashboard ? dashboardJobDetailsPath(id) : `/jobs/${id}`

  const handleViewModeChange = (mode: JobsViewMode) => {
    setViewMode(mode)
    if (mode === "map") {
      setPagination((prev) => ({ ...prev, page: 1 }))
    }
  }

  const handleMapClusterSelect = (cluster: JobLocationCluster | null) => {
    setSelectedMapClusterId(cluster?.id ?? null)
  }

  const skeletonItems = Array.from({ length: 6 })
  const pageStart = pagination.total > 0 ? (pagination.page - 1) * pagination.limit + 1 : 0
  const pageEnd = Math.min(pagination.page * pagination.limit, pagination.total || jobs.length)

  return (
    <div
      className={cn(
        "mx-auto w-full max-w-[1400px]",
        isDashboard ? "pb-4 lg:pb-10" : "px-4 pb-16 pt-24 sm:px-6 lg:px-8",
      )}
    >
      {isDashboard ? (
        <JobsDiscoveryHeader viewMode={viewMode} onViewModeChange={handleViewModeChange} />
      ) : (
        <div className="mb-4 lg:hidden">
          <JobsBreadcrumb items={[{ label: "Job Search" }]} homeHref="/" />
        </div>
      )}

      <div className="flex gap-6">
        {/* Sidebar — desktop only */}
        <div className="hidden w-64 shrink-0 lg:block xl:w-72">
          <div className={cn("sticky", isDashboard ? "top-4" : "top-24")}>
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
          {!isDashboard ? (
            <JobsCategoryHero
              title={heroTitle}
              description={heroDesc}
              locationLabel={locationLabel}
              roleLabel={appliedFilters.keyword || t("jobs.hero.allRoles")}
              salaryRangeLabel={salaryLabel}
              skillsLabel={skillsLabel}
              className="hidden lg:block"
            />
          ) : null}

          <div className="flex items-center gap-2 lg:hidden">
            <JobsMobileQuickFilters
              filters={filters}
              activeFilterCount={activeFilterCount}
              variant="bar"
              onOpenFilters={() => setShowMobileFilters(true)}
              className="min-w-0 flex-1"
            />
            <JobsViewModeToggle value={viewMode} onChange={handleViewModeChange} compact />
          </div>

          {listError && jobs.length === 0 ? (
            <div
              className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800 lg:hidden dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-200"
              role="alert"
            >
              {listError}{" "}
              <button
                type="button"
                className="font-semibold underline underline-offset-2"
                onClick={() => void fetchJobs(pagination.page, appliedFilters)}
              >
                {t("jobs.retry")}
              </button>
            </div>
          ) : null}

          <p className="text-sm text-[#3a4260] lg:hidden dark:text-blue-200/90">
            {loading ? (
              <span className="inline-flex items-center gap-1.5 text-[#7a85a8]">
                <Loader2 className="h-4 w-4 animate-spin" />
                Loading…
              </span>
            ) : (
              <>
                <strong className="font-bold text-[#0a0e1a] dark:text-white">
                  {displayJobCount}
                </strong>{" "}
                {isDashboard ? "jobs that match your search" : "roles found"}
              </>
            )}
          </p>

          {/* Search + count bar — desktop */}
          <div className="hidden flex-col gap-3 lg:flex lg:flex-row lg:items-center lg:justify-between">
            {listError && jobs.length === 0 ? (
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
                  {t("jobs.retry")}
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
                placeholder={t("jobs.searchPlaceholder")}
                value={filters.keyword}
                onChange={(e) => handleFilterChange("keyword", e.target.value)}
                className="h-11 w-full rounded-xl border border-[#dde3f5] bg-white py-2 pl-10 pr-4 text-sm text-[#0a0e1a] outline-none transition focus:border-[#3b82f6] focus:ring-2 focus:ring-[#3b82f6]/20 dark:border-blue-900 dark:bg-slate-900 dark:text-blue-50"
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
                  aria-label={t("jobs.clearSearch")}
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
                  <strong className="font-semibold text-[#0a0e1a] dark:text-white">{displayJobCount}</strong> {isDashboard ? "jobs that match your search" : "roles found"}
                </span>
              )}
            </p>
          </div>

          {viewMode === "map" ? (
            <JobsIndiaMapView
              jobs={jobs}
              loading={loading}
              selectedClusterId={selectedMapClusterId}
              onSelectCluster={handleMapClusterSelect}
              applyingJobId={applyingJobId}
              onViewDetails={(job) => router.push(jobDetailsPath(job.id))}
              onApply={handleApplyClick}
            />
          ) : null}

          {/* Job listing */}
          {viewMode === "list" && loading ? (
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
          ) : viewMode === "list" && jobs.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-4 rounded-2xl border border-[#dde3f5] bg-white px-6 py-16 text-center dark:border-blue-900/50 dark:bg-slate-900">
              <p className="text-xl font-bold text-[#0a0e1a] dark:text-white">No roles found</p>
              <p className="max-w-sm text-sm text-[#7a85a8] dark:text-blue-300/80">
                Try clearing your filters or searching with different keywords.
              </p>
              <button
                type="button"
                onClick={handleFilterClear}
                className="h-10 rounded-xl bg-gradient-to-r from-[#2563eb] to-[#3b82f6] px-6 text-sm font-bold text-white shadow-md"
              >
                Clear filters
              </button>
            </div>
          ) : viewMode === "list" ? (
            <div className="space-y-3 sm:space-y-4">
              {jobs.map((job) => (
                <PublicJobListingCard
                  key={job.id}
                  job={job}
                  isSaved={savedJobIds.includes(job.id)}
                  isApplying={applyingJobId === job.id}
                  showMatchScore={isDashboard || isLoggedIn}
                  matchScore={getDisplayMatchScore(job)}
                  onViewDetails={() => router.push(jobDetailsPath(job.id))}
                  onApply={() => handleApplyClick(job)}
                  onSaveToggle={() => {
                    toggleSavedJobId(job.id)
                    setSavedJobIds(loadSavedJobIds())
                  }}
                />
              ))}
            </div>
          ) : null}

          {/* Pagination */}
          {viewMode === "list" && pagination.total_pages > 1 && !loading && (
            <div className="space-y-3 pt-2">
              <p className="text-center text-xs font-medium text-[#7a85a8] sm:text-sm dark:text-blue-300/80">
                Showing {pageStart} to {pageEnd} of {pagination.total} results
              </p>
              <div className="flex items-center justify-center gap-1">
              <button
                type="button"
                disabled={pagination.page === 1}
                onClick={() => handlePageChange(pagination.page - 1)}
                className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#dde3f5] bg-white text-[#3a4260] transition hover:border-[#3b82f6]/50 hover:text-[#3b82f6] disabled:opacity-40 dark:border-blue-900 dark:bg-slate-900 dark:text-blue-200"
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
                          ? "bg-gradient-to-r from-[#2563eb] to-[#3b82f6] text-white shadow-md"
                          : "border border-[#dde3f5] bg-white text-[#3a4260] hover:border-[#3b82f6]/50 hover:text-[#3b82f6] dark:border-blue-900 dark:bg-slate-900 dark:text-blue-200",
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
                className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#dde3f5] bg-white text-[#3a4260] transition hover:border-[#3b82f6]/50 hover:text-[#3b82f6] disabled:opacity-40 dark:border-blue-900 dark:bg-slate-900 dark:text-blue-200"
                aria-label="Next page"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
              </div>
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

      {showApplyModal && selectedJob && (
        <ApplicationModal
          job={selectedJob}
          isApplying={isApplying}
          onClose={() => setShowApplyModal(false)}
          onSubmit={handleApplySubmit}
        />
      )}

      {!isDashboard ? (
        <LoginRequiredModal
          open={showLoginRequired}
          onClose={() => setShowLoginRequired(false)}
          redirectPath={loginRedirectPath}
        />
      ) : null}
    </div>
  )
}
