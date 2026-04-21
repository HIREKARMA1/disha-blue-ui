"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import type { MouseEvent } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { StepForm } from "@/components/signup/StepForm"
import { FieldVoiceButton } from "@/components/signup/FieldVoiceButton"
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
      title="Any work experience?"
      subtitle="Work / Internship / Training"
      step={4}
      totalSteps={4}
      helperHint="Share your work experience to improve job matching"
      helperVoiceText="Share your work experience to improve job matching"
    >
      <Input className="rounded-xl border px-4 py-3 focus-visible:ring-2 focus-visible:ring-primary" placeholder="Type: work / internship / training" value={type} onChange={(e) => setType(e.target.value)} />
      <Input className="rounded-xl border px-4 py-3 focus-visible:ring-2 focus-visible:ring-primary" placeholder="Duration (e.g. 2 years)" value={duration} onChange={(e) => setDuration(e.target.value)} />
      <Input className="rounded-xl border px-4 py-3 focus-visible:ring-2 focus-visible:ring-primary" placeholder="Company (optional)" value={company} onChange={(e) => setCompany(e.target.value)} />
      <div className="space-y-1">
        <div className="relative">
          <textarea
            className="min-h-[96px] w-full rounded-xl border px-4 py-3 pr-12 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
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
      <div className="fixed bottom-0 left-0 z-40 w-full border-t bg-white p-4 shadow-md dark:bg-zinc-900 md:static md:border-0 md:bg-transparent md:p-0 md:shadow-none">
        <div className="mx-auto flex max-w-xl justify-between gap-3 md:mt-6">
          <Button type="button" variant="outline" className="h-12 w-1/2 rounded-xl border border-gray-300 text-gray-700" onClick={(e) => void onPrevious(e)} loading={loading}>
            Previous
          </Button>
          <Button type="button" className="h-12 w-1/2 rounded-xl bg-primary text-white" onClick={(e) => void onSubmit(e)} loading={loading}>
            Next
          </Button>
        </div>
      </div>
    </StepForm>
  )
}
