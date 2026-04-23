"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import type { MouseEvent } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { StepForm } from "@/components/signup/StepForm"
import { FieldVoiceButton } from "@/components/signup/FieldVoiceButton"
import { Briefcase, Building2, CalendarClock, FileText } from "lucide-react"
import { getOnboardingStep, getSignupData, saveSignupData, saveStep, setOnboardingStep } from "@/lib/onboarding"
import { useAuth } from "@/hooks/useAuth"

export default function SignupStep4Page() {
  const router = useRouter()
  const { userType, isLoading } = useAuth()
  const initial = getSignupData()
  const [type, setType] = useState("work")
  const [description, setDescription] = useState("")
  const [company, setCompany] = useState("")
  const [duration, setDuration] = useState("")
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    console.log("ROUTER READY", typeof router.push)
    if (!isLoading && userType === "corporate") {
      router.replace("/auth/register?type=corporate")
      return
    }
    if (isLoading) return
    setOnboardingStep("step-4")
  }, [isLoading, router, userType])

  if (isLoading) return null

  const saveStepData = async () => {
    console.log("SAVE API CALL START")
    try {
      const structuredDescription = [duration ? `Duration: ${duration}` : "", company ? `Company: ${company}` : "", description]
        .filter(Boolean)
        .join(" | ")
      const experience = description ? [{ type, description: structuredDescription }] : []
      const response = await saveStep("step-4", { experience }, initial.userId)
      console.log("SAVE API RESPONSE:", response)
      saveSignupData({ ...initial, experience })
    } catch (error) {
      console.log(error)
    }
  }

  const handleSaveAndNavigate = async (
    nextRoute: string,
    nextStep: "step-3" | "review"
  ) => {
    const currentStep = getOnboardingStep()
    console.log("STEP NAV START")
    console.log("STEP:", currentStep)
    setLoading(true)
    saveStepData()
      .then(() => {
        console.log("STEP SAVED OK")
      })
      .catch((err) => console.log(err))
    setOnboardingStep(nextStep)
    console.log("STEP LOCAL UPDATED:", nextStep)
    setLoading(false)
    router.push(nextRoute)
    console.log("NAVIGATED TO:", nextRoute)
  }

  const onSubmit = async (e?: MouseEvent<HTMLButtonElement>) => {
    e?.preventDefault?.()
    console.log("NEXT CLICKED")
    await handleSaveAndNavigate("/signup/review", "review")
  }

  const onPrevious = async (e?: MouseEvent<HTMLButtonElement>) => {
    e?.preventDefault?.()
    console.log("PREVIOUS CLICKED")
    await handleSaveAndNavigate("/signup/step-3", "step-3")
  }

  return (
    <StepForm
      title="Work Experience"
      subtitle="Add work, internship, or training details."
      step={4}
      totalSteps={4}
      helperHint="Share your work experience to improve job matching"
      helperVoiceText="Share your work experience to improve job matching"
    >
      <div className="space-y-1">
        <label className="mb-2 flex items-center gap-2 text-base font-semibold text-foreground">
          <Briefcase className="h-4 w-4 text-primary" />
          Experience Type
        </label>
        <Input className="rounded-xl border border-border bg-muted/20 px-4 py-3 text-base transition-all duration-200 ease-in-out focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary" placeholder="Work / Internship / Training" value={type} onChange={(e) => setType(e.target.value)} />
      </div>
      <div className="space-y-1">
        <label className="mb-2 flex items-center gap-2 text-base font-semibold text-foreground">
          <CalendarClock className="h-4 w-4 text-primary" />
          Duration
        </label>
        <Input className="rounded-xl border border-border bg-muted/20 px-4 py-3 text-base transition-all duration-200 ease-in-out focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary" placeholder="e.g. 2 years" value={duration} onChange={(e) => setDuration(e.target.value)} />
      </div>
      <div className="space-y-1">
        <label className="mb-2 flex items-center gap-2 text-base font-semibold text-foreground">
          <Building2 className="h-4 w-4 text-primary" />
          Company (Optional)
        </label>
        <Input className="rounded-xl border border-border bg-muted/20 px-4 py-3 text-base transition-all duration-200 ease-in-out focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary" placeholder="Company name" value={company} onChange={(e) => setCompany(e.target.value)} />
      </div>
      <div className="space-y-1">
        <label className="mb-2 flex items-center gap-2 text-base font-semibold text-foreground">
          <FileText className="h-4 w-4 text-primary" />
          Role Description
        </label>
        <div className="relative">
          <textarea
            className="min-h-[96px] w-full rounded-xl border border-border bg-muted/20 px-4 py-3 pr-12 text-base text-foreground transition-all duration-200 ease-in-out focus-visible:border-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            placeholder="Describe your role and work details"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
          <div className="absolute right-3 top-3">
            <FieldVoiceButton
              fieldType="experience"
              ariaLabel="Speak experience"
              onParsed={({ translatedText, parsed }) => {
                setDescription(String(parsed?.description || translatedText || "").trim())
                if (parsed?.role) setType(String(parsed.role))
                if (parsed?.company) setCompany(String(parsed.company))
                if (parsed?.duration) setDuration(String(parsed.duration))
              }}
            />
          </div>
        </div>
        <p className="text-xs text-muted-foreground">Hindi/English supported</p>
      </div>
      <div className="fixed bottom-0 left-0 z-40 w-full border-t border-border/70 bg-background/85 p-4 shadow-lg backdrop-blur-md md:static md:border-0 md:bg-transparent md:p-0 md:shadow-none md:backdrop-blur-none">
        <div className="mx-auto flex max-w-2xl justify-between gap-3 rounded-2xl border border-border/70 bg-background/90 p-2 md:mt-6 md:border-0 md:bg-transparent md:p-0">
          <Button type="button" variant="outline" className="h-12 w-1/2 rounded-xl border border-border bg-background px-6 text-sm font-medium text-foreground transition-all duration-200 ease-in-out hover:bg-muted disabled:cursor-not-allowed disabled:opacity-50" onClick={(e) => void onPrevious(e)} loading={loading}>
            Previous
          </Button>
          <Button type="button" className="h-12 w-1/2 rounded-xl bg-primary px-6 text-sm font-semibold text-primary-foreground shadow-sm transition-all duration-200 ease-in-out hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50" onClick={(e) => void onSubmit(e)} loading={loading}>
            Next
          </Button>
        </div>
      </div>
    </StepForm>
  )
}
