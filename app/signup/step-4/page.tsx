"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import type { MouseEvent } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { StepForm } from "@/components/signup/StepForm"
import { VoiceInput } from "@/components/signup/VoiceInput"
import { getOnboardingStep, getSignupData, saveSignupData, saveStep, setOnboardingStep } from "@/lib/onboarding"
import { useAuth } from "@/hooks/useAuth"

export default function SignupStep4Page() {
  const router = useRouter()
  const { userType, isLoading } = useAuth()
  const initial = getSignupData()
  const [type, setType] = useState("work")
  const [description, setDescription] = useState("")
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
      const experience = description ? [{ type, description }] : []
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
      <VoiceInput label="🎤 Add experience" onTranscript={setDescription} />
      <Input className="rounded-xl border px-4 py-3 focus-visible:ring-2 focus-visible:ring-primary" placeholder="Type: work / internship / training" value={type} onChange={(e) => setType(e.target.value)} />
      <Input className="rounded-xl border px-4 py-3 focus-visible:ring-2 focus-visible:ring-primary" placeholder="Description" value={description} onChange={(e) => setDescription(e.target.value)} />
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
