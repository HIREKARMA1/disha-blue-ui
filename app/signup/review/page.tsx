"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { apiClient } from "@/lib/api"
import { completeOnboardingSession, getOnboardingStep, getSignupData, saveSignupData, setOnboardingStep } from "@/lib/onboarding"
import { ResumePreview } from "@/components/signup/ResumePreview"
import { CourseCard } from "@/components/dashboard/CourseCard"
import { speakText } from "@/lib/speech"
import { useAuth } from "@/hooks/useAuth"

export default function SignupReviewPage() {
  const router = useRouter()
  const { userType, isLoading } = useAuth()
  const [loading, setLoading] = useState(true)
  const [resume, setResume] = useState<any>(null)
  const [resumeHtml, setResumeHtml] = useState<string>("")
  const [template, setTemplate] = useState<"simple-ats" | "modern-clean" | "compact">("simple-ats")
  const [courses, setCourses] = useState<any[]>([])
  const [jobs, setJobs] = useState<any[]>([])
  const [suggestedRoles, setSuggestedRoles] = useState<string[]>([])
  const [error, setError] = useState<string>("")
  const [retrying, setRetrying] = useState(false)
  const [applyingJobId, setApplyingJobId] = useState<string | null>(null)
  const [resumeScore, setResumeScore] = useState<number>(0)
  const [toast, setToast] = useState<string>("")
  const [loadingSpeech, setLoadingSpeech] = useState(false)
  const [isSendingOtp, setIsSendingOtp] = useState(false)
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false)
  const [showOtpModal, setShowOtpModal] = useState(false)
  const [otp, setOtp] = useState("")
  const [otpError, setOtpError] = useState("")
  const [profileStrength, setProfileStrength] = useState(0)

  const run = async (forceRegenerate = false, overrideTemplate = template) => {
    const data = getSignupData()
    if (!data.userId) return
    try {
      const resumeResponse = await apiClient.client.post("/onboarding/generate-resume", {
        user_id: data.userId,
        force_regenerate: forceRegenerate,
        template: overrideTemplate,
      })
      const courseResponse = await apiClient.client.get("/onboarding/courses/recommend", {
        params: { user_id: data.userId, location: data.basicInfo.location, category: "all" },
      })
      const jobsResponse = await apiClient.client.get("/jobs/match", {
        params: { user_id: data.userId, limit: 6 },
      })
      setResume(resumeResponse.data.resume_json)
      setResumeHtml(resumeResponse.data.resume_html || "")
      setCourses(courseResponse.data.courses || [])
      setJobs(jobsResponse.data.jobs || [])
      setSuggestedRoles(jobsResponse.data.suggested_roles || [])
      setResumeScore(Number(jobsResponse.data.resume_score || 0))
      const skillsCount = (data.skillsMeta?.length || data.skills.length || 0) > 0 ? 34 : 0
      const hasEducation =
        Boolean(data.education?.tenth?.school_name?.trim()) ||
        Boolean(data.education?.twelfth?.school_name?.trim()) ||
        Boolean(data.education?.graduation?.college_name?.trim())
      const educationCount = hasEducation ? 33 : 0
      const experienceCount = (data.experience || []).filter((item) => String(item.description || "").trim()).length > 0 ? 33 : 0
      setProfileStrength(skillsCount + educationCount + experienceCount)
      saveSignupData({
        ...data,
        resume: resumeResponse.data.resume_json,
        resumeHtml: resumeResponse.data.resume_html,
        template: overrideTemplate,
      })
      setError("")
      window.setTimeout(() => {
        const section = document.getElementById("instant-job-list")
        if (section) section.scrollIntoView({ behavior: "smooth", block: "start" })
      }, 250)
    } catch {
      setError("Resume API failed. Please retry.")
    } finally {
      setLoading(false)
      setRetrying(false)
    }
  }

  useEffect(() => {
    console.log("ROUTER READY", typeof router.push)
    if (!isLoading && userType === "corporate") {
      router.replace("/auth/register?type=corporate")
      return
    }
    if (isLoading) return
    setOnboardingStep("review")
    void run()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoading, userType])

  if (isLoading) return null

  if (loading) {
    return <div className="mx-auto max-w-xl p-6 text-lg font-semibold">Your resume is building...</div>
  }

  const onPrevious = async () => {
    const data = getSignupData()
    const experience = data.experience || []
    await apiClient.client.post("/onboarding/register-step", {
      user_id: data.userId,
      step: "step-4",
      data: { experience },
    })
    console.log("Backend step: step-4")
    setOnboardingStep("step-4")
    router.push("/signup/step-4")
  }

  const startOtpFlow = async () => {
    const data = getSignupData()
    const email = String(data.basicInfo.email || "").trim()
    if (!email) {
      setOtpError("Email is required to complete registration")
      return
    }
    setOtpError("")
    setIsSendingOtp(true)
    try {
      await apiClient.sendOtp(email)
      setShowOtpModal(true)
      setToast("OTP sent to your email")
      setTimeout(() => setToast(""), 2200)
    } catch (err: any) {
      setOtpError(String(err?.response?.data?.detail || "Failed to send OTP"))
    } finally {
      setIsSendingOtp(false)
    }
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6 p-4">
      {toast && (
        <div className="fixed left-1/2 top-4 z-50 -translate-x-1/2 rounded-full bg-emerald-600 px-4 py-2 text-sm font-medium text-white shadow-lg">
          {toast}
        </div>
      )}
      <div className="fixed bottom-0 left-0 z-40 w-full border-t bg-white p-4 shadow-md dark:bg-zinc-900 md:static md:border-0 md:bg-transparent md:p-0 md:shadow-none">
        <div className="mx-auto flex max-w-3xl justify-between gap-3 md:mb-2">
          <button
            type="button"
            className="h-12 w-1/2 rounded-xl border border-gray-300 text-gray-700"
            onClick={() => {
              void onPrevious()
            }}
          >
            Previous
          </button>
          <button
            type="button"
            className="h-12 w-1/2 rounded-xl bg-primary text-white"
            onClick={() => void startOtpFlow()}
            disabled={isSendingOtp}
          >
            {isSendingOtp ? "Sending..." : "Verify & Complete Registration"}
          </button>
        </div>
      </div>
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold">Your resume is ready 🎉</h1>
        <p className="text-sm text-muted-foreground">You are now ready to apply for jobs</p>
        {otpError && <p className="text-sm text-red-600">{otpError}</p>}
      </div>
      {showOtpModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-sm rounded-xl bg-background p-4 shadow-lg">
            <h3 className="text-lg font-semibold">Verify OTP</h3>
            <p className="mt-1 text-sm text-muted-foreground">Enter the 6-digit code sent to your email.</p>
            <input
              type="text"
              inputMode="numeric"
              maxLength={6}
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
              className="mt-3 w-full rounded-md border px-3 py-2 text-sm"
              placeholder="Enter OTP"
            />
            {otpError && <p className="mt-2 text-sm text-red-600">{otpError}</p>}
            <div className="mt-4 flex gap-2">
              <button
                type="button"
                className="flex-1 rounded-md border px-3 py-2 text-sm"
                onClick={() => {
                  setShowOtpModal(false)
                  setOtp("")
                  setOtpError("")
                }}
              >
                Cancel
              </button>
              <button
                type="button"
                className="flex-1 rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground disabled:opacity-60"
                disabled={isVerifyingOtp || otp.length !== 6}
                onClick={async () => {
                  const data = getSignupData()
                  const email = String(data.basicInfo.email || "").trim()
                  const name = String(data.basicInfo.name || "").trim()
                  const phone = String(data.basicInfo.phone || "").trim()
                  const onboardingUserId = String(data.userId || "").trim()
                  if (!email || !name || !onboardingUserId) {
                    setOtpError("Missing onboarding details. Please restart step 1.")
                    return
                  }
                  setIsVerifyingOtp(true)
                  setOtpError("")
                  try {
                    await apiClient.verifyOtp({ email, otp })
                    console.log("OTP VERIFIED")
                    const registration = await apiClient.completeRegistration({
                      email,
                      phone,
                      name,
                      onboarding_user_id: onboardingUserId,
                    })
                    console.log("USER CREATED", registration)

                    localStorage.setItem("access_token", registration.access_token)
                    localStorage.setItem("refresh_token", registration.refresh_token)
                    localStorage.setItem("token", registration.access_token)
                    console.log("TOKEN SAVED:", localStorage.getItem("access_token"))
                    console.log("FINAL TOKEN:", localStorage.getItem("access_token"))
                    localStorage.setItem(
                      "user_data",
                      JSON.stringify({
                        id: registration.user.id,
                        email: registration.user.email,
                        user_type: registration.user.user_type,
                        name: registration.user.name,
                      })
                    )
                    console.log("REGISTRATION SUCCESS")
                    completeOnboardingSession()
                    console.log("REDIRECTING TO DASHBOARD")
                    window.location.href = "/dashboard/student"
                  } catch (err: any) {
                    setOtpError(String(err?.response?.data?.detail || "OTP verification failed"))
                  } finally {
                    setIsVerifyingOtp(false)
                  }
                }}
              >
                {isVerifyingOtp ? "Verifying..." : "Verify & Continue"}
              </button>
            </div>
          </div>
        </div>
      )}
      <section className="rounded-xl border p-3">
        <div className="flex items-center justify-between text-sm font-medium">
          <span>Resume Strength</span>
          <span>{resumeScore}%</span>
        </div>
        <div className="mt-2 h-2 w-full rounded-full bg-muted">
          <div className="h-full rounded-full bg-emerald-500" style={{ width: `${Math.max(0, Math.min(100, resumeScore))}%` }} />
        </div>
      </section>
      <section className="rounded-xl border p-3">
        <div className="flex items-center justify-between text-sm font-medium">
          <span>Profile Strength</span>
          <span>{profileStrength}%</span>
        </div>
        <div className="mt-2 h-2 w-full rounded-full bg-muted">
          <div className="h-full rounded-full bg-primary" style={{ width: `${Math.max(0, Math.min(100, profileStrength))}%` }} />
        </div>
      </section>
      {getSignupData().skillsMeta && getSignupData().skillsMeta!.length > 0 && (
        <section className="rounded-xl border p-3">
          <h3 className="text-sm font-semibold">Skill Confidence</h3>
          <div className="mt-2 flex flex-wrap gap-2">
            {getSignupData().skillsMeta!.map((item) => (
              <span key={`${item.name}-${item.source}`} className="rounded-full border px-3 py-1 text-xs">
                {item.name} · {item.source === "auto-detected" ? "Auto-detected" : "Verified"}
              </span>
            ))}
          </div>
        </section>
      )}
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {error}
          <button
            type="button"
            className="ml-2 rounded border px-2 py-1 text-xs"
            onClick={() => {
              setRetrying(true)
              void run(true, template)
            }}
          >
            {retrying ? "Retrying..." : "Retry"}
          </button>
        </div>
      )}
      {resume && (
        <>
          <ResumePreview
            resume={resume}
            template={template}
            onTemplateChange={(next) => {
              setTemplate(next)
              setLoading(true)
              void run(true, next)
            }}
            onChange={setResume}
          />
          <button
            type="button"
            className="rounded-md border px-3 py-2 text-sm font-medium"
            disabled={loadingSpeech}
            onClick={async () => {
              const summary = String(resume?.summary || "").trim()
              if (!summary) return
              setLoadingSpeech(true)
              try {
                await speakText(summary)
              } finally {
                setLoadingSpeech(false)
              }
            }}
          >
            {loadingSpeech ? "Preparing audio..." : "Listen to your resume"}
          </button>
        </>
      )}
      {resumeHtml && (
        <section className="rounded-xl border p-3">
          <h3 className="mb-2 text-sm font-semibold">HTML Preview</h3>
          <iframe title="resume-html" className="h-80 w-full rounded border" srcDoc={resumeHtml} />
        </section>
      )}
      <section className="space-y-3">
        <h2 className="text-xl font-semibold">Recommended Courses</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          {courses.map((course) => (
            <CourseCard key={`${course.title}-${course.location}`} course={course} />
          ))}
        </div>
      </section>
      <section id="instant-job-list" className="space-y-3">
        <h2 className="text-xl font-semibold">Jobs You Can Apply Now</h2>
        {suggestedRoles.length > 0 && (
          <p className="text-sm text-muted-foreground">
            Suggested roles: {suggestedRoles.join(", ")}
          </p>
        )}
        <div className="grid gap-3 sm:grid-cols-2">
          {jobs.map((job) => (
            <article key={job.job_id} className="rounded-xl border bg-card p-4 space-y-2">
              <h3 className="text-base font-semibold">{job.title}</h3>
              <p className="text-sm text-muted-foreground">Salary: {job.salary}</p>
              <p className="text-sm text-muted-foreground">Location: {job.location}</p>
              {job.distance_km != null && <p className="text-xs text-muted-foreground">Distance: {job.distance_km} km</p>}
              <p className="text-sm font-medium">Match score: {job.match_score}%</p>
              {Array.isArray(job.match_reasons) && job.match_reasons.length > 0 && (
                <div className="rounded-md bg-muted/30 p-2 text-xs">
                  <p className="font-semibold">Match Reasons:</p>
                  <ul className="mt-1 space-y-1">
                    {job.match_reasons.map((reason: string) => (
                      <li key={reason}>✔ {reason}</li>
                    ))}
                  </ul>
                </div>
              )}
              {job.application_status === "applied" ? (
                <span className="inline-flex rounded-md bg-emerald-100 px-3 py-2 text-sm font-medium text-emerald-700">
                  Applied ✅
                </span>
              ) : (
                <button
                  type="button"
                  className="rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground disabled:opacity-60"
                  disabled={applyingJobId === job.job_id}
                  onClick={async () => {
                    const data = getSignupData()
                    if (!data.userId || !resume) return
                    setApplyingJobId(job.job_id)
                    try {
                      const response = await apiClient.client.post("/jobs/match/apply", {
                        user_id: data.userId,
                        job_id: job.job_id,
                        resume_json: resume,
                      })
                      if (response.data?.already_applied) {
                        setJobs((prev) =>
                          prev.map((item) =>
                            item.job_id === job.job_id ? { ...item, application_status: "applied" } : item
                          )
                        )
                        setToast("Application sent successfully! Employer will contact you soon.")
                        setTimeout(() => setToast(""), 2600)
                        return
                      }
                      setJobs((prev) =>
                        prev.map((item) =>
                          item.job_id === job.job_id ? { ...item, application_status: "applied" } : item
                        )
                      )
                      setToast("Application sent successfully! Employer will contact you soon.")
                      setTimeout(() => setToast(""), 2600)
                    } finally {
                      setApplyingJobId(null)
                    }
                  }}
                >
                  {applyingJobId === job.job_id ? "Applying..." : "Apply with this Resume"}
                </button>
              )}
            </article>
          ))}
        </div>
        {jobs.length === 0 && (
          <div className="rounded-xl border border-dashed p-4 text-sm text-muted-foreground">
            No jobs found nearby. Try expanding your skills.
            {suggestedRoles.length > 0 && (
              <p className="mt-2">Try alternative roles: {suggestedRoles.join(", ")}</p>
            )}
          </div>
        )}
      </section>
    </div>
  )
}
