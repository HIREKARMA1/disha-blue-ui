"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import type { MouseEvent } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { StepForm } from "@/components/signup/StepForm"
import { VoiceInput } from "@/components/signup/VoiceInput"
import { getOnboardingStep, getSignupData, saveSignupData, saveStep, setOnboardingStep, uploadOnboardingDocument } from "@/lib/onboarding"
import { useAuth } from "@/hooks/useAuth"

export default function SignupStep2Page() {
  const router = useRouter()
  const { userType, isLoading } = useAuth()
  const initial = getSignupData()
  const [education, setEducation] = useState(initial.education)
  const [loading, setLoading] = useState(false)
  const [uploadingIdx, setUploadingIdx] = useState<number | null>(null)
  const [visibleIdx, setVisibleIdx] = useState(0)
  const [simpleMode, setSimpleMode] = useState(false)

  useEffect(() => {
    console.log("ROUTER READY", typeof router.push)
    if (!isLoading && userType === "corporate") {
      router.replace("/auth/register?type=corporate")
      return
    }
    if (isLoading) return
    setOnboardingStep("step-2")
    setSimpleMode(localStorage.getItem("hk_simple_mode") === "true")
  }, [isLoading, router, userType])

  if (isLoading) return null

  const update = (idx: number, value: string) => {
    const next = [...education]
    next[idx] = { ...next[idx], details: value }
    setEducation(next)
  }

  const handleUpload = async (idx: number, file?: File) => {
    if (!file) return
    setUploadingIdx(idx)
    try {
      const response = await uploadOnboardingDocument(file)
      const next = [...education]
      next[idx] = { ...next[idx], documents: [...(next[idx].documents || []), response.file_url] }
      setEducation(next)
    } finally {
      setUploadingIdx(null)
    }
  }

  const saveStepData = async () => {
    console.log("SAVE API CALL START")
    try {
      const response = await saveStep("step-2", { education }, initial.userId)
      console.log("SAVE API RESPONSE:", response)
      saveSignupData({ ...initial, education })
    } catch (error) {
      console.log(error)
    }
  }

  const handleSaveAndNavigate = async (
    nextRoute: string,
    nextStep: "step-1" | "step-3"
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
    await handleSaveAndNavigate("/signup/step-3", "step-3")
  }

  const onPrevious = async (e?: MouseEvent<HTMLButtonElement>) => {
    e?.preventDefault?.()
    console.log("PREVIOUS CLICKED")
    await handleSaveAndNavigate("/signup/step-1", "step-1")
  }

  return (
    <StepForm
      title="Tell us about your education"
      subtitle="Add 10th, 12th, Graduation details."
      step={2}
      totalSteps={4}
      helperHint="You can speak your education details"
      helperVoiceText="You can speak your education details"
    >
      <VoiceInput
        label="🎤 Add Education"
        onTranscript={(text) => update(2, text)}
        onParsedSuggestions={(parsed) => {
          const level = parsed?.education?.level
          const stream = parsed?.education?.stream
          if (!level) return
          const idx = education.findIndex((e) => e.level.toLowerCase() === String(level).toLowerCase())
          if (idx >= 0) update(idx, stream ? `${education[idx].details} ${stream}`.trim() : education[idx].details)
        }}
      />
      {education.map((item, idx) => (
        (!simpleMode || idx === visibleIdx) && (
        <div key={item.level} className="space-y-2 rounded-lg border p-3">
          <Input className="rounded-xl border px-4 py-3 focus-visible:ring-2 focus-visible:ring-primary" placeholder={`${item.level} details`} value={item.details} onChange={(e) => update(idx, e.target.value)} />
          <input
            type="file"
            accept=".pdf,image/*"
            onChange={(e) => void handleUpload(idx, e.target.files?.[0])}
            className="text-xs"
          />
          {uploadingIdx === idx && <p className="text-xs text-muted-foreground">Uploading document...</p>}
          {item.documents?.length > 0 && (
            <p className="text-xs text-emerald-700">{item.documents.length} document(s) linked</p>
          )}
          {simpleMode && (
            <div className="flex gap-2">
              <Button type="button" variant="outline" className="h-9" onClick={() => setVisibleIdx(Math.max(0, visibleIdx - 1))}>Previous</Button>
              <Button type="button" variant="outline" className="h-9" onClick={() => setVisibleIdx(Math.min(education.length - 1, visibleIdx + 1))}>Next Field</Button>
            </div>
          )}
        </div>
        )
      ))}
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
