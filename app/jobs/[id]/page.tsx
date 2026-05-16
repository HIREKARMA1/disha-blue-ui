"use client"

import { Suspense, useCallback, useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { Loader2 } from "lucide-react"
import { toast } from "react-hot-toast"
import { Navbar } from "@/components/ui/navbar"
import { Footer } from "@/components/ui/footer"
import { ApplicationModal } from "@/components/dashboard/ApplicationModal"
import { PublicJobDetailsView } from "@/features/jobs-discovery/components/PublicJobDetailsView"
import { apiClient } from "@/lib/api"
import { profileService } from "@/services/profileService"
import type { Job } from "@/components/jobs/AllJobs"

function JobDetailsContent() {
  const params = useParams()
  const router = useRouter()
  const jobId = params?.id as string

  const [job, setJob] = useState<Job | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showApplyModal, setShowApplyModal] = useState(false)
  const [isApplying, setIsApplying] = useState(false)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [profileCompletion, setProfileCompletion] = useState(0)

  const fetchJob = useCallback(async () => {
    if (!jobId) return
    setLoading(true)
    setError(null)
    try {
      const data = await apiClient.getJobById(jobId)
      setJob(data as Job)
    } catch {
      setError("Job not found or unavailable.")
      setJob(null)
    } finally {
      setLoading(false)
    }
  }, [jobId])

  useEffect(() => {
    void fetchJob()
  }, [fetchJob])

  useEffect(() => {
    const token = apiClient.getAccessToken?.() ?? localStorage.getItem("access_token")
    if (!token) return
    setIsLoggedIn(true)
    void profileService
      .getProfileCompletion()
      .then((c) => setProfileCompletion(c.completion_percentage ?? 0))
      .catch(() => {})
  }, [])

  const handleApplyClick = () => {
    if (!job) return
    if (!isLoggedIn) {
      router.push(`/auth/login?redirect=${encodeURIComponent(`/jobs/${job.id}`)}&type=student`)
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
    setShowApplyModal(true)
  }

  const handleApplySubmit = async (data: {
    cover_letter: string
    expected_salary?: string
    availability_date: string
  }) => {
    if (!job) return
    setIsApplying(true)
    try {
      await apiClient.applyForJob(job.id, {
        job_id: job.id,
        cover_letter: data.cover_letter,
        expected_salary: data.expected_salary ? Number(data.expected_salary) : null,
        availability_date: data.availability_date,
      })
      toast.success("Application submitted!")
      setShowApplyModal(false)
      setJob((prev) =>
        prev
          ? { ...prev, application_status: "applied", can_apply: false }
          : prev,
      )
    } catch (err: unknown) {
      const detail = (err as { response?: { data?: { detail?: unknown } } })?.response?.data
        ?.detail
      toast.error(typeof detail === "string" ? detail : "Failed to submit application")
    } finally {
      setIsApplying(false)
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center pt-24">
        <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
      </div>
    )
  }

  if (error || !job) {
    return (
      <div className="mx-auto max-w-lg px-4 py-32 text-center">
        <p className="text-lg font-semibold text-[#0a0e1a] dark:text-white">{error ?? "Job not found"}</p>
        <button
          type="button"
          onClick={() => router.push("/jobs")}
          className="mt-4 text-sm font-semibold text-primary-600 hover:underline"
        >
          Back to jobs
        </button>
      </div>
    )
  }

  return (
    <>
      <PublicJobDetailsView
        job={job}
        isApplying={isApplying}
        onApply={handleApplyClick}
        applicationStatus={job.application_status}
      />
      {showApplyModal ? (
        <ApplicationModal
          job={job}
          isApplying={isApplying}
          onClose={() => setShowApplyModal(false)}
          onSubmit={handleApplySubmit}
        />
      ) : null}
    </>
  )
}

export default function PublicJobDetailPage() {
  return (
    <div className="flex min-h-screen flex-col bg-sage-canvas dark:bg-slate-950">
      <Navbar variant="transparent" />
      <main className="flex-grow pt-20">
        <Suspense
          fallback={
            <div className="flex min-h-[50vh] items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
            </div>
          }
        >
          <JobDetailsContent />
        </Suspense>
      </main>
      <Footer />
    </div>
  )
}
