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

export default function SignupStep3Page() {
  const router = useRouter()
  const { userType, isLoading } = useAuth()
  const initial = getSignupData()
  const [skillsText, setSkillsText] = useState(initial.skills.join(", "))
  const [loading, setLoading] = useState(false)
  const [retry, setRetry] = useState(false)
  const [skillsMeta, setSkillsMeta] = useState<Array<{ name: string; source: "auto-detected" | "verified" }>>(
    initial.skillsMeta || []
  )

  useEffect(() => {
    console.log("ROUTER READY", typeof router.push)
    if (!isLoading && userType === "corporate") {
      router.replace("/auth/register?type=corporate")
      return
    }
    if (isLoading) return
    setOnboardingStep("step-3")
  }, [isLoading, router, userType])

  if (isLoading) return null

  const normalize = (value: string) =>
    value
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean)

  const saveStepData = async () => {
    console.log("SAVE API CALL START")
    try {
      const skills = normalize(skillsText)
      const meta = skills.map((name) => {
        const found = skillsMeta.find((item) => item.name.toLowerCase() === name.toLowerCase())
        return found || { name, source: "verified" as const }
      })
      const response = await saveStep("step-3", { skills: meta }, initial.userId)
      console.log("SAVE API RESPONSE:", response)
      saveSignupData({ ...initial, skills, skillsMeta: meta })
    } catch (error) {
      console.log(error)
    }
  }

  const handleSaveAndNavigate = async (
    nextRoute: string,
    nextStep: "step-2" | "step-4"
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
    await handleSaveAndNavigate("/signup/step-4", "step-4")
  }

  const onPrevious = async (e?: MouseEvent<HTMLButtonElement>) => {
    e?.preventDefault?.()
    console.log("PREVIOUS CLICKED")
    await handleSaveAndNavigate("/signup/step-2", "step-2")
  }

  return (
    <StepForm
      title="What skills do you have?"
      subtitle="Hindi and English voice supported."
      step={3}
      totalSteps={4}
      helperHint="Speak your skills like electrician, helper, or driver"
      helperVoiceText="Speak your skills like electrician, helper, or driver"
    >
      <Input
        className="rounded-xl border border-border bg-background px-4 py-3 text-base transition-all duration-200 ease-in-out focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary"
        placeholder="e.g. Electrician, Welding, Plumbing"
        value={skillsText}
        onChange={(e) => {
          setSkillsText(e.target.value)
          const list = normalize(e.target.value)
          setSkillsMeta((prev) =>
            list.map((name) => {
              const found = prev.find((item) => item.name.toLowerCase() === name.toLowerCase())
              return found || { name, source: "verified" }
            })
          )
        }}
        rightIcon={
          <FieldVoiceButton
            fieldType="skills"
            ariaLabel="Speak skills"
            onParsed={({ translatedText, parsed }) => {
              const fallback = normalize(translatedText)
              const parsedSkills = Array.isArray(parsed?.skills) ? parsed.skills.map((item: any) => String(item).trim()).filter(Boolean) : []
              const nextSkills = parsedSkills.length > 0 ? parsedSkills : fallback
              if (!nextSkills.length) return
              setSkillsText((prev) => [...normalize(prev), ...nextSkills].join(", "))
              setSkillsMeta((prev) => {
                const map = new Map(prev.map((item) => [item.name.toLowerCase(), item]))
                nextSkills.forEach((skill) => {
                  if (!map.has(skill.toLowerCase())) {
                    map.set(skill.toLowerCase(), { name: skill, source: "auto-detected" })
                  }
                })
                return Array.from(map.values())
              })
            }}
          />
        }
      />
      <p className="text-xs text-muted-foreground">Hindi/English supported</p>
      {skillsMeta.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {skillsMeta.map((item) => (
            <button
              key={`${item.name}-${item.source}`}
              type="button"
              className="rounded-full border border-border bg-background px-3 py-1 text-xs text-foreground transition-all duration-200 ease-in-out hover:bg-muted"
              onClick={() => {
                const filtered = skillsMeta.filter((chip) => chip.name.toLowerCase() !== item.name.toLowerCase())
                setSkillsMeta(filtered)
                setSkillsText(filtered.map((chip) => chip.name).join(", "))
              }}
            >
              {item.name} · {item.source === "auto-detected" ? "Auto-detected" : "Verified"}
            </button>
          ))}
        </div>
      )}
      <div className="fixed bottom-0 left-0 z-40 w-full border-t border-border bg-background/80 p-4 shadow-sm backdrop-blur-md md:static md:border-0 md:bg-transparent md:p-0 md:shadow-none md:backdrop-blur-none">
        <div className="mx-auto flex max-w-xl justify-between gap-3 md:mt-6">
          <Button type="button" variant="outline" className="h-11 w-1/2 rounded-xl border border-border bg-background px-6 text-foreground transition-all duration-200 ease-in-out hover:bg-muted disabled:cursor-not-allowed disabled:opacity-50" onClick={(e) => void onPrevious(e)} loading={loading}>
            Previous
          </Button>
          <Button type="button" className="h-11 w-1/2 rounded-xl bg-primary px-6 font-medium text-primary-foreground shadow-sm transition-all duration-200 ease-in-out hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50" onClick={(e) => void onSubmit(e)} loading={loading}>
            Next
          </Button>
        </div>
      </div>
      {retry && (
        <Button variant="outline" className="h-11 w-full rounded-xl border border-border bg-background px-6 text-foreground transition-all duration-200 ease-in-out hover:bg-muted disabled:cursor-not-allowed disabled:opacity-50" onClick={onSubmit}>Retry Save</Button>
      )}
    </StepForm>
  )
}
