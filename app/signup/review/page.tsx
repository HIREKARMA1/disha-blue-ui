"use client"

import { useEffect, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import { apiClient } from "@/lib/api"
import { completeOnboardingSession, getOnboardingStep, getSignupData, saveSignupData, setOnboardingStep } from "@/lib/onboarding"
import { ResumePreview, type OnboardingResumeTemplate } from "@/components/signup/ResumePreview"
import { speakText } from "@/lib/speech"
import { useAuth } from "@/hooks/useAuth"

function formatRelativeMinutes(ts: number | undefined): string {
  if (ts == null || !Number.isFinite(ts)) return "time not recorded yet"
  const mins = Math.floor((Date.now() - ts) / 60_000)
  if (mins < 1) return "less than a minute ago"
  if (mins === 1) return "1 minute ago"
  return `${mins} minutes ago`
}

export default function SignupReviewPage() {
  const router = useRouter()
  const { userType, isLoading } = useAuth()
  const [pageLoading, setPageLoading] = useState(true)
  const [resumeRegenerating, setResumeRegenerating] = useState(false)
  const [resume, setResume] = useState<any>(null)
  const [resumeHtml, setResumeHtml] = useState<string>("")
  const [atsScore, setAtsScore] = useState<number>(0)
  const [template, setTemplate] = useState<OnboardingResumeTemplate>(() => {
    const t = getSignupData().template
    if (t === "compact" || t === "compact_professional") return "compact_professional"
    return "blue_collar_basic"
  })
  const [error, setError] = useState<string>("")
  const [retrying, setRetrying] = useState(false)
  const [resumeScore, setResumeScore] = useState<number>(0)
  const [toast, setToast] = useState<string>("")
  const [loadingSpeech, setLoadingSpeech] = useState(false)
  const [isSendingOtp, setIsSendingOtp] = useState(false)
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false)
  const [showOtpModal, setShowOtpModal] = useState(false)
  const [otp, setOtp] = useState("")
  const [otpError, setOtpError] = useState("")
  const [registrationCompleted, setRegistrationCompleted] = useState(false)
  const [profileStrength, setProfileStrength] = useState(0)
  const [resumeUpdatedAt, setResumeUpdatedAt] = useState<number | undefined>(() => getSignupData().resumeUpdatedAt)
  const lastRegenerateAtRef = useRef(0)

  const computeProfileStrength = (data: ReturnType<typeof getSignupData>) => {
    const skillsCount = (data.skillsMeta?.length || data.skills.length || 0) > 0 ? 34 : 0
    const hasEducation =
      Boolean(data.education?.tenth?.school_name?.trim()) ||
      Boolean(data.education?.twelfth?.school_name?.trim()) ||
      Boolean(data.education?.graduation?.college_name?.trim())
    const educationCount = hasEducation ? 33 : 0
    const experienceCount = (data.experience || []).filter((item) => String(item.description || "").trim()).length > 0 ? 33 : 0
    return skillsCount + educationCount + experienceCount
  }

  const loadReviewPageData = async () => {
    const data = getSignupData()
    if (!data.userId) {
      setPageLoading(false)
      return
    }
    setError("")
    try {
      const jobsResponse = await apiClient.client.get("/jobs/match", {
        params: { user_id: data.userId, limit: 6 },
      })
      const d = getSignupData()
      setProfileStrength(computeProfileStrength(d))
      if (d.resume) {
        setResume(d.resume)
        setResumeHtml(d.resumeHtml || "")
        setAtsScore(Number(d.resume?.ats_score ?? 0))
        const resumeTpl = d.resume?.template as OnboardingResumeTemplate | undefined
        if (resumeTpl === "compact_professional" || resumeTpl === "blue_collar_basic") {
          setTemplate(resumeTpl)
        } else {
          const storedTpl = d.template
          if (storedTpl === "compact" || storedTpl === "compact_professional") setTemplate("compact_professional")
          else setTemplate("blue_collar_basic")
        }
      }
      setResumeUpdatedAt(d.resumeUpdatedAt)
      setResumeScore(Number(jobsResponse.data.resume_score || 0))
    } catch (err) {
      console.error("Onboarding review: load failed:", err)
      setError("Could not load review data. Check your connection and try again.")
    } finally {
      setPageLoading(false)
      setRetrying(false)
    }
  }

  const regenerateResume = async () => {
    const now = Date.now()
    if (now - lastRegenerateAtRef.current < 5000) {
      setToast("Please wait a few seconds before regenerating again.")
      window.setTimeout(() => setToast(""), 2200)
      return
    }
    lastRegenerateAtRef.current = now

    const data = getSignupData()
    if (!data.userId) return
    setResumeRegenerating(true)
    setError("")
    try {
      const tpl = template
      const resumeResponse = await apiClient.client.post("/onboarding/generate-resume", {
        user_id: data.userId,
        force_regenerate: true,
        template: tpl,
      })
      const jobsResponse = await apiClient.client.get("/jobs/match", {
        params: { user_id: data.userId, limit: 6 },
      })
      setResume(resumeResponse.data.resume_json)
      setResumeHtml(resumeResponse.data.resume_html || "")
      const nextTpl = resumeResponse.data.resume_json?.template as OnboardingResumeTemplate | undefined
      if (nextTpl === "compact_professional" || nextTpl === "blue_collar_basic") {
        setTemplate(nextTpl)
      }
      setAtsScore(Number(resumeResponse.data.ats_score ?? 0))
      setResumeScore(Number(jobsResponse.data.resume_score || 0))
      const fresh = getSignupData()
      const updatedAt = Date.now()
      setProfileStrength(computeProfileStrength(fresh))
      setResumeUpdatedAt(updatedAt)
      saveSignupData({
        ...fresh,
        resume: resumeResponse.data.resume_json,
        resumeHtml: resumeResponse.data.resume_html,
        template: nextTpl === "compact_professional" || nextTpl === "blue_collar_basic" ? nextTpl : tpl,
        resumeUpdatedAt: updatedAt,
      })
    } catch (err) {
      console.error("Onboarding review: regenerate failed:", err)
      setError("Resume generation failed. Check your connection and try again.")
      lastRegenerateAtRef.current = 0
    } finally {
      setResumeRegenerating(false)
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
    void loadReviewPageData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoading, userType])

  if (isLoading) return null

  if (pageLoading) {
    return (
      <div className="mx-auto flex max-w-xl flex-col items-center gap-3 p-10 text-center">
        <p className="text-lg font-semibold">Loading your review…</p>
        <p className="text-sm text-muted-foreground">Fetching courses and job matches.</p>
      </div>
    )
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
            onClick={() => {
              if (registrationCompleted) {
                window.location.href = "/dashboard/student"
                return
              }
              void startOtpFlow()
            }}
            disabled={registrationCompleted ? false : isSendingOtp}
          >
            {registrationCompleted ? "Go to Dashboard" : isSendingOtp ? "Sending..." : "Verify & Complete Registration"}
          </button>
        </div>
      </div>
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold">Your resume is ready</h1>
        <p className="text-sm text-muted-foreground">You are now ready to apply for jobs</p>
        {resume ? (
          <p className="text-sm text-muted-foreground">
            Using saved resume (last updated {formatRelativeMinutes(resumeUpdatedAt)})
          </p>
        ) : (
          <p className="text-sm text-muted-foreground">
            No resume loaded yet. Click &quot;Regenerate Resume&quot; to build one from your profile (nothing is sent until you do).
          </p>
        )}
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
                    setRegistrationCompleted(true)
                    setShowOtpModal(false)
                    setOtp("")
                    setToast("Registration complete. You can now download your resume and then go to dashboard.")
                    setTimeout(() => setToast(""), 3000)
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
          <span>ATS resume score</span>
          <span>{atsScore}%</span>
        </div>
        <div className="mt-2 h-2 w-full rounded-full bg-muted">
          <div className="h-full rounded-full bg-sky-600" style={{ width: `${Math.max(0, Math.min(100, atsScore))}%` }} />
        </div>
        <p className="mt-2 text-xs text-muted-foreground">
          Based on skills, experience, education, and summary completeness for blue-collar job platforms.
        </p>
      </section>
      <section className="rounded-xl border p-3">
        <div className="flex items-center justify-between text-sm font-medium">
          <span>Resume strength (job match)</span>
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
              if (error.includes("Could not load")) {
                void loadReviewPageData()
              } else {
                void regenerateResume()
              }
            }}
            disabled={resumeRegenerating}
          >
            {retrying ? "Retrying..." : "Retry"}
          </button>
        </div>
      )}
      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground disabled:opacity-60"
          disabled={resumeRegenerating || !getSignupData().userId}
          onClick={() => void regenerateResume()}
        >
          {resumeRegenerating ? "Regenerating…" : "Regenerate Resume"}
        </button>
        <p className="text-xs text-muted-foreground">Resume is only rebuilt when you use this button (not on page load or template change).</p>
      </div>
      <div className="relative rounded-xl border p-3">
        {resumeRegenerating && (
          <div className="absolute inset-0 z-10 flex items-center justify-center rounded-xl bg-background/80 backdrop-blur-sm">
            <p className="text-sm font-medium text-foreground">Regenerating resume...</p>
          </div>
        )}
        <ResumePreview
          resume={resume}
          resumeHtml={resumeHtml}
          template={template}
          regenerating={resumeRegenerating}
          onBeforeDownloadPdf={async () => {
            if (registrationCompleted) return true
            window.alert("For downloading the resume, you have to verify your email first.")
            setToast("Please verify your email using Verify & Complete Registration.")
            setTimeout(() => setToast(""), 2500)
            await startOtpFlow()
            return false
          }}
          onTemplateChange={(next) => {
            setTemplate(next)
            const d = getSignupData()
            saveSignupData({ ...d, template: next })
          }}
          onChange={(next) => {
            setResume(next)
            const d = getSignupData()
            saveSignupData({ ...d, resume: next })
          }}
        />
      </div>
      {resume && (
        <button
          type="button"
          className="rounded-md border px-3 py-2 text-sm font-medium"
          disabled={loadingSpeech || resumeRegenerating}
          onClick={async () => {
            const summary = String(resume?.professional_summary || resume?.summary || "").trim()
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
      )}
      {resumeHtml && (
        <section className="rounded-xl border p-3">
          <h3 className="mb-2 text-sm font-semibold">HTML Preview</h3>
          <iframe title="resume-html" className="h-80 w-full rounded border" srcDoc={resumeHtml} />
        </section>
      )}
    </div>
  )
}
