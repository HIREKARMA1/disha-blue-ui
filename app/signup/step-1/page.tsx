"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import type { MouseEvent } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { StepForm } from "@/components/signup/StepForm"
import { FieldVoiceButton } from "@/components/signup/FieldVoiceButton"
import { getSignupLanguage } from "@/components/signup/LanguageSwitcher"
import { getOnboardingStep, getSignupData, saveSignupData, saveStep, setOnboardingStep, startOnboardingSession } from "@/lib/onboarding"
import { useAuth } from "@/hooks/useAuth"

export default function SignupStep1Page() {
  const router = useRouter()
  const { userType, isLoading } = useAuth()
  const initial = getSignupData()
  const [form, setForm] = useState(initial.basicInfo)
  const [loading, setLoading] = useState(false)
  const [selectedLanguage, setSelectedLanguage] = useState<"en" | "hi">("en")

  useEffect(() => {
    console.log("ROUTER READY", typeof router.push)
    localStorage.removeItem("onboarding_step")
    localStorage.removeItem("onboarding_data")
    setOnboardingStep("step-1")
  }, [])

  useEffect(() => {
    setSelectedLanguage(getSignupLanguage())
    const onLanguageChange = () => setSelectedLanguage(getSignupLanguage())
    window.addEventListener("hk_language_changed", onLanguageChange as EventListener)
    window.addEventListener("storage", onLanguageChange)
    return () => {
      window.removeEventListener("hk_language_changed", onLanguageChange as EventListener)
      window.removeEventListener("storage", onLanguageChange)
    }
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
      helperHint={selectedLanguage === "hi" ? "नाम, फोन और लोकेशन के लिए माइक का उपयोग करें (हिंदी/English)।" : "Use mic for name, phone, and location (Hindi/English)."}
      helperVoiceText={selectedLanguage === "hi" ? "नाम, फोन और लोकेशन के लिए माइक का उपयोग करें।" : "Use mic for name, phone, and location."}
    >
      <div className="space-y-1">
        <Input
          className="rounded-xl border border-border bg-background px-4 py-3 text-base transition-all duration-200 ease-in-out focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary"
          placeholder="Name"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          rightIcon={
            <FieldVoiceButton
              fieldType="name"
              ariaLabel="Speak name"
              onParsed={({ translatedText, parsed }) =>
                setForm((prev) => ({ ...prev, name: String(parsed?.name || translatedText || "").trim() }))
              }
            />
          }
        />
        <p className="text-xs text-muted-foreground">Hindi/English supported</p>
      </div>
      <div className="space-y-1">
        <Input
          className="rounded-xl border border-border bg-background px-4 py-3 text-base transition-all duration-200 ease-in-out focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary"
          placeholder="Phone"
          value={form.phone}
          onChange={(e) => setForm({ ...form, phone: e.target.value.replace(/\D/g, "") })}
          rightIcon={
            <FieldVoiceButton
              fieldType="phone"
              ariaLabel="Speak phone number"
              onParsed={({ translatedText, parsed }) => {
                const phone = String(parsed?.phone || translatedText || "").replace(/\D/g, "")
                setForm((prev) => ({ ...prev, phone }))
              }}
            />
          }
        />
        <p className="text-xs text-muted-foreground">Hindi/English supported</p>
      </div>
      <Input className="rounded-xl border border-border bg-background px-4 py-3 text-base transition-all duration-200 ease-in-out focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary" placeholder="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
      <div className="space-y-1">
        <Input
          className="rounded-xl border border-border bg-background px-4 py-3 text-base transition-all duration-200 ease-in-out focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary"
          placeholder="Location"
          value={form.location}
          onChange={(e) => setForm({ ...form, location: e.target.value })}
          rightIcon={
            <FieldVoiceButton
              fieldType="location"
              ariaLabel="Speak location"
              onParsed={({ translatedText, parsed }) => {
                const location = String(parsed?.location || translatedText || "").trim()
                setForm((prev) => ({ ...prev, location }))
              }}
            />
          }
        />
        <p className="text-xs text-muted-foreground">Hindi/English supported</p>
      </div>
      <div className="fixed bottom-0 left-0 z-40 w-full border-t border-border bg-background/80 p-4 shadow-sm backdrop-blur-md md:static md:border-0 md:bg-transparent md:p-0 md:shadow-none md:backdrop-blur-none">
        <div className="mx-auto flex max-w-xl justify-between gap-3 md:mt-6">
          <Button type="button" variant="outline" disabled onClick={(e) => void onPrevious(e)} className="h-11 w-1/2 rounded-xl border border-border bg-background px-6 text-foreground transition-all duration-200 ease-in-out hover:bg-muted disabled:cursor-not-allowed disabled:opacity-50">
            Previous
          </Button>
          <Button type="button" className="h-11 w-1/2 rounded-xl bg-primary px-6 font-medium text-primary-foreground shadow-sm transition-all duration-200 ease-in-out hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50" onClick={(e) => void onSubmit(e)} loading={loading}>
            Next
          </Button>
        </div>
      </div>
    </StepForm>
  )
}
