"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import type { MouseEvent } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { StepForm } from "@/components/signup/StepForm"
import { VoiceInput } from "@/components/signup/VoiceInput"
import { getOnboardingStep, getSignupData, saveSignupData, saveStep, setOnboardingStep, startOnboardingSession } from "@/lib/onboarding"
import { useAuth } from "@/hooks/useAuth"

export default function SignupStep1Page() {
  const router = useRouter()
  const { userType, isLoading } = useAuth()
  const initial = getSignupData()
  const [form, setForm] = useState(initial.basicInfo)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    console.log("ROUTER READY", typeof router.push)
    localStorage.removeItem("onboarding_step")
    localStorage.removeItem("onboarding_data")
    setOnboardingStep("step-1")
  }, [])

  useEffect(() => {
    if (!isLoading && userType === "corporate") {
      router.replace("/auth/register?type=corporate")
      return
    }
    if (isLoading) return
    setOnboardingStep("step-1")
    startOnboardingSession()
    console.log("STEP 1 LOADED")
    if (!navigator.geolocation) return
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setForm((prev) => ({
          ...prev,
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
        }))
      },
      () => {
        // ignore denied location permission
      },
      { enableHighAccuracy: false, timeout: 5000 }
    )
  }, [isLoading, router, userType])

  if (isLoading) return null

  const saveStepData = async () => {
    console.log("SAVE API CALL START")
    try {
      const payload = { basic_info: form }
      const response = await saveStep("step-1", payload, initial.userId)
      console.log("SAVE API RESPONSE:", response)
      const next = { ...initial, basicInfo: form, userId: response.user_id }
      saveSignupData(next)
    } catch (error) {
      console.log(error)
    }
  }

  const handleSaveAndNavigate = async (nextRoute: string, nextStep: "step-2") => {
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
    if (!form.name || !form.phone || !form.email || !form.location) return
    await handleSaveAndNavigate("/signup/step-2", "step-2")
  }

  const onPrevious = async (e?: MouseEvent<HTMLButtonElement>) => {
    e?.preventDefault?.()
    console.log("PREVIOUS CLICKED")
    // Step-1 previous stays disabled; keep handler noop.
    return
  }

  return (
    <StepForm
      title="Hi 👋 What should we call you?"
      subtitle="Minimal typing, voice supported."
      step={1}
      totalSteps={4}
      helperHint="You can speak or type your name"
      helperVoiceText="You can speak or type your name"
    >
      <VoiceInput
        label="🎤 Fill Name + Location"
        fieldType="name"
        onTranscript={(text) => setForm((prev) => ({ ...prev, name: prev.name || text }))}
        onParsedSuggestions={(parsed) =>
          setForm((prev) => ({
            ...prev,
            name: prev.name || parsed?.name || prev.name,
            phone: prev.phone || parsed?.phone || prev.phone,
            location: prev.location || parsed?.location || prev.location,
          }))
        }
      />
      <Input className="rounded-xl border px-4 py-3 focus-visible:ring-2 focus-visible:ring-primary" placeholder="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
      <Input className="rounded-xl border px-4 py-3 focus-visible:ring-2 focus-visible:ring-primary" placeholder="Phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
      <Input className="rounded-xl border px-4 py-3 focus-visible:ring-2 focus-visible:ring-primary" placeholder="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
      <Input className="rounded-xl border px-4 py-3 focus-visible:ring-2 focus-visible:ring-primary" placeholder="Location" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} />
      <div className="fixed bottom-0 left-0 z-40 w-full border-t bg-white p-4 shadow-md dark:bg-zinc-900 md:static md:border-0 md:bg-transparent md:p-0 md:shadow-none">
        <div className="mx-auto flex max-w-xl justify-between gap-3 md:mt-6">
          <Button type="button" variant="outline" disabled onClick={(e) => void onPrevious(e)} className="h-12 w-1/2 rounded-xl border border-gray-300 text-gray-700 opacity-60">
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
