"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import type { MouseEvent } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { StepForm } from "@/components/signup/StepForm"
import { FieldVoiceButton } from "@/components/signup/FieldVoiceButton"
import { getOnboardingStep, getSignupData, saveSignupData, saveStep, setOnboardingStep, uploadOnboardingDocument } from "@/lib/onboarding"
import { useAuth } from "@/hooks/useAuth"

export default function SignupStep2Page() {
  const router = useRouter()
  const { userType, isLoading } = useAuth()
  const initial = getSignupData()
  const [education, setEducation] = useState(initial.education)
  const [loading, setLoading] = useState(false)
  const [uploadingSection, setUploadingSection] = useState<"tenth" | "twelfth" | "graduation" | null>(null)
  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    console.log("ROUTER READY", typeof router.push)
    if (!isLoading && userType === "corporate") {
      router.replace("/auth/register?type=corporate")
      return
    }
    if (isLoading) return
    setOnboardingStep("step-2")
  }, [isLoading, router, userType])

  if (isLoading) return null

  const updateField = (
    section: "tenth" | "twelfth" | "graduation",
    field: "school_name" | "percentage" | "year_of_passing" | "college_name" | "cgpa",
    value: string
  ) => {
    setEducation((prev) => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value,
      },
    }))
  }

  const validate = () => {
    const nextErrors: Record<string, string> = {}
    const yearRegex = /^(19|20)\d{2}$/
    const nowYear = new Date().getFullYear()
    const validatePercentage = (value: string, key: string) => {
      if (!value.trim()) return
      const numeric = Number(value)
      if (Number.isNaN(numeric) || numeric < 0 || numeric > 100) {
        nextErrors[key] = "Value must be between 0 and 100"
      }
    }
    const validateYear = (value: string, key: string) => {
      if (!value.trim()) return
      const numeric = Number(value)
      if (!yearRegex.test(value) || numeric > nowYear + 1 || numeric < 1950) {
        nextErrors[key] = "Enter a valid 4-digit year"
      }
    }

    validatePercentage(education.tenth.percentage, "tenth.percentage")
    validatePercentage(education.twelfth.percentage, "twelfth.percentage")
    validatePercentage(education.graduation.cgpa, "graduation.cgpa")

    validateYear(education.tenth.year_of_passing, "tenth.year_of_passing")
    validateYear(education.twelfth.year_of_passing, "twelfth.year_of_passing")
    validateYear(education.graduation.year_of_passing, "graduation.year_of_passing")

    setErrors(nextErrors)
    return Object.keys(nextErrors).length === 0
  }

  const normalizeNumericVoiceValue = (value: string, mode: "year" | "score") => {
    if (mode === "year") return value.replace(/\D/g, "").slice(0, 4)
    return value.replace(/[^0-9.]/g, "")
  }

  const getParsedEducationValue = (
    parsed: Record<string, any>,
    section: "tenth" | "twelfth" | "graduation",
    field: "school_name" | "percentage" | "year_of_passing" | "college_name" | "cgpa",
    translatedText: string
  ) => {
    const parsedEducation = parsed?.education || {}
    const parsedSection = parsedEducation?.[section] || {}
    const directValue = parsedSection?.[field] ?? parsed?.[field]
    const fallbackText = String(directValue || translatedText || "").trim()
    if (!fallbackText) return ""
    if (field === "year_of_passing") return normalizeNumericVoiceValue(fallbackText, "year")
    if (field === "percentage" || field === "cgpa") return normalizeNumericVoiceValue(fallbackText, "score")
    return fallbackText
  }

  const handleUpload = async (section: "tenth" | "twelfth" | "graduation", file?: File) => {
    if (!file) return
    setUploadingSection(section)
    try {
      const response = await uploadOnboardingDocument(file)
      setEducation((prev) => ({
        ...prev,
        [section]: {
          ...prev[section],
          certificate_url: response.file_url,
        },
      }))
    } finally {
      setUploadingSection(null)
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
    if (!validate()) return
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
      helperHint="Use mic for education fields and upload certificates."
      helperVoiceText="Use mic for education fields and upload certificates."
    >
      <div className="space-y-4">
        <div className="rounded-xl border bg-card p-4 shadow-sm">
          <h3 className="mb-3 text-base font-semibold">📘 10th Details</h3>
          <div className="grid gap-3 md:grid-cols-2">
            <Input
              placeholder="School Name"
              value={education.tenth.school_name}
              onChange={(e) => updateField("tenth", "school_name", e.target.value)}
              rightIcon={
                <FieldVoiceButton
                  fieldType="education"
                  ariaLabel="Speak 10th school name"
                  onParsed={({ translatedText, parsed }) => {
                    const next = getParsedEducationValue(parsed, "tenth", "school_name", translatedText)
                    if (next) updateField("tenth", "school_name", next)
                  }}
                />
              }
            />
            <Input
              type="number"
              placeholder="Percentage"
              value={education.tenth.percentage}
              onChange={(e) => updateField("tenth", "percentage", e.target.value)}
              rightIcon={
                <FieldVoiceButton
                  fieldType="education"
                  ariaLabel="Speak 10th percentage"
                  onParsed={({ translatedText, parsed }) => {
                    const next = getParsedEducationValue(parsed, "tenth", "percentage", translatedText)
                    if (next) updateField("tenth", "percentage", next)
                  }}
                />
              }
            />
            <Input
              type="number"
              placeholder="Year of Passing"
              value={education.tenth.year_of_passing}
              onChange={(e) => updateField("tenth", "year_of_passing", e.target.value)}
              rightIcon={
                <FieldVoiceButton
                  fieldType="education"
                  ariaLabel="Speak 10th passing year"
                  onParsed={({ translatedText, parsed }) => {
                    const next = getParsedEducationValue(parsed, "tenth", "year_of_passing", translatedText)
                    if (next) updateField("tenth", "year_of_passing", next)
                  }}
                />
              }
            />
          </div>
          {errors["tenth.percentage"] && <p className="mt-2 text-xs text-red-600">{errors["tenth.percentage"]}</p>}
          {errors["tenth.year_of_passing"] && <p className="mt-1 text-xs text-red-600">{errors["tenth.year_of_passing"]}</p>}
          <label className="mt-3 block rounded-lg border border-dashed p-3 text-sm">
            Upload Certificate (PDF/JPG/PNG)
            <input type="file" accept=".pdf,.jpg,.jpeg,.png" onChange={(e) => void handleUpload("tenth", e.target.files?.[0])} className="mt-2 block text-xs" />
          </label>
          <p className="mt-2 text-xs">{education.tenth.certificate_url ? "✔ Uploaded" : "Not uploaded"}</p>
          {uploadingSection === "tenth" && <p className="text-xs text-muted-foreground">Uploading document...</p>}
        </div>

        <div className="rounded-xl border bg-card p-4 shadow-sm">
          <h3 className="mb-3 text-base font-semibold">📗 12th Details</h3>
          <div className="grid gap-3 md:grid-cols-2">
            <Input
              placeholder="School/College Name"
              value={education.twelfth.school_name}
              onChange={(e) => updateField("twelfth", "school_name", e.target.value)}
              rightIcon={
                <FieldVoiceButton
                  fieldType="education"
                  ariaLabel="Speak 12th school or college name"
                  onParsed={({ translatedText, parsed }) => {
                    const next = getParsedEducationValue(parsed, "twelfth", "school_name", translatedText)
                    if (next) updateField("twelfth", "school_name", next)
                  }}
                />
              }
            />
            <Input
              type="number"
              placeholder="Percentage"
              value={education.twelfth.percentage}
              onChange={(e) => updateField("twelfth", "percentage", e.target.value)}
              rightIcon={
                <FieldVoiceButton
                  fieldType="education"
                  ariaLabel="Speak 12th percentage"
                  onParsed={({ translatedText, parsed }) => {
                    const next = getParsedEducationValue(parsed, "twelfth", "percentage", translatedText)
                    if (next) updateField("twelfth", "percentage", next)
                  }}
                />
              }
            />
            <Input
              type="number"
              placeholder="Year of Passing"
              value={education.twelfth.year_of_passing}
              onChange={(e) => updateField("twelfth", "year_of_passing", e.target.value)}
              rightIcon={
                <FieldVoiceButton
                  fieldType="education"
                  ariaLabel="Speak 12th passing year"
                  onParsed={({ translatedText, parsed }) => {
                    const next = getParsedEducationValue(parsed, "twelfth", "year_of_passing", translatedText)
                    if (next) updateField("twelfth", "year_of_passing", next)
                  }}
                />
              }
            />
          </div>
          {errors["twelfth.percentage"] && <p className="mt-2 text-xs text-red-600">{errors["twelfth.percentage"]}</p>}
          {errors["twelfth.year_of_passing"] && <p className="mt-1 text-xs text-red-600">{errors["twelfth.year_of_passing"]}</p>}
          <label className="mt-3 block rounded-lg border border-dashed p-3 text-sm">
            Upload Certificate (PDF/JPG/PNG)
            <input type="file" accept=".pdf,.jpg,.jpeg,.png" onChange={(e) => void handleUpload("twelfth", e.target.files?.[0])} className="mt-2 block text-xs" />
          </label>
          <p className="mt-2 text-xs">{education.twelfth.certificate_url ? "✔ Uploaded" : "Not uploaded"}</p>
          {uploadingSection === "twelfth" && <p className="text-xs text-muted-foreground">Uploading document...</p>}
        </div>

        <div className="rounded-xl border bg-card p-4 shadow-sm">
          <h3 className="mb-3 text-base font-semibold">🎓 Graduation Details</h3>
          <div className="grid gap-3 md:grid-cols-2">
            <Input
              placeholder="University/College Name"
              value={education.graduation.college_name}
              onChange={(e) => updateField("graduation", "college_name", e.target.value)}
              rightIcon={
                <FieldVoiceButton
                  fieldType="education"
                  ariaLabel="Speak graduation university or college name"
                  onParsed={({ translatedText, parsed }) => {
                    const next = getParsedEducationValue(parsed, "graduation", "college_name", translatedText)
                    if (next) updateField("graduation", "college_name", next)
                  }}
                />
              }
            />
            <Input
              type="number"
              placeholder="CGPA / Percentage"
              value={education.graduation.cgpa}
              onChange={(e) => updateField("graduation", "cgpa", e.target.value)}
              rightIcon={
                <FieldVoiceButton
                  fieldType="education"
                  ariaLabel="Speak graduation CGPA or percentage"
                  onParsed={({ translatedText, parsed }) => {
                    const next = getParsedEducationValue(parsed, "graduation", "cgpa", translatedText)
                    if (next) updateField("graduation", "cgpa", next)
                  }}
                />
              }
            />
            <Input
              type="number"
              placeholder="Year of Passing"
              value={education.graduation.year_of_passing}
              onChange={(e) => updateField("graduation", "year_of_passing", e.target.value)}
              rightIcon={
                <FieldVoiceButton
                  fieldType="education"
                  ariaLabel="Speak graduation passing year"
                  onParsed={({ translatedText, parsed }) => {
                    const next = getParsedEducationValue(parsed, "graduation", "year_of_passing", translatedText)
                    if (next) updateField("graduation", "year_of_passing", next)
                  }}
                />
              }
            />
          </div>
          {errors["graduation.cgpa"] && <p className="mt-2 text-xs text-red-600">{errors["graduation.cgpa"]}</p>}
          {errors["graduation.year_of_passing"] && <p className="mt-1 text-xs text-red-600">{errors["graduation.year_of_passing"]}</p>}
          <label className="mt-3 block rounded-lg border border-dashed p-3 text-sm">
            Upload Certificate (PDF/JPG/PNG)
            <input type="file" accept=".pdf,.jpg,.jpeg,.png" onChange={(e) => void handleUpload("graduation", e.target.files?.[0])} className="mt-2 block text-xs" />
          </label>
          <p className="mt-2 text-xs">{education.graduation.certificate_url ? "✔ Uploaded" : "Not uploaded"}</p>
          {uploadingSection === "graduation" && <p className="text-xs text-muted-foreground">Uploading document...</p>}
        </div>
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
