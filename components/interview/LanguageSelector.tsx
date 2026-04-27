"use client"

import { Languages } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ExperienceLevel, InterviewLanguage, InterviewMode, InterviewPersonality } from "@/services/aiInterviewService"
import { cn } from "@/lib/utils"

interface Props {
  selectedLanguage: InterviewLanguage | null
  selectedRole: string
  selectedExperience: ExperienceLevel | null
  selectedMode: InterviewMode | null
  selectedPersonality: InterviewPersonality | null
  onSelect: (language: InterviewLanguage) => void
  onRoleSelect: (role: string) => void
  onExperienceSelect: (level: ExperienceLevel) => void
  onModeSelect: (mode: InterviewMode) => void
  onPersonalitySelect: (mode: InterviewPersonality) => void
  onContinue: () => void
}

const languageOptions: Array<{ code: InterviewLanguage; label: string }> = [
  { code: "en", label: "English" },
  { code: "hi", label: "Hindi" },
  { code: "or", label: "Odia" },
  { code: "bn", label: "Bengali" },
  { code: "ta", label: "Tamil" },
  { code: "te", label: "Telugu" },
]

const roleOptions = [
  "Electrician",
  "Plumber",
  "Welder",
  "HVAC Technician",
  "Delivery Associate",
  "Warehouse Assistant",
  "Field Sales",
  "Housekeeping Staff",
  "Security Guard",
  "Data Entry Operator",
]
const experienceOptions: Array<{ id: ExperienceLevel; label: string }> = [
  { id: "fresher", label: "Fresher" },
  { id: "1-3", label: "1-3 years" },
  { id: "3+", label: "3+ years" },
]
const modeOptions: Array<{ id: InterviewMode; label: string }> = [
  { id: "hr", label: "HR Round" },
  { id: "technical", label: "Technical Round" },
  { id: "rapid_fire", label: "Rapid Fire" },
]
const personalityOptions: Array<{ id: InterviewPersonality; label: string; subtitle: string }> = [
  { id: "friendly_mentor", label: "Friendly Mentor", subtitle: "Supportive and encouraging" },
  { id: "strict_hr", label: "Strict HR", subtitle: "Direct and pressure-based" },
  { id: "technical_expert", label: "Technical Expert", subtitle: "Deep analytical technical focus" },
]

export function LanguageSelector({
  selectedLanguage,
  selectedRole,
  selectedExperience,
  selectedMode,
  selectedPersonality,
  onSelect,
  onRoleSelect,
  onExperienceSelect,
  onModeSelect,
  onPersonalitySelect,
  onContinue,
}: Props) {
  const resolvedRole = selectedRole.trim()
  const selectTriggerClassName =
    "h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm transition-colors duration-150 focus:ring-2 focus:ring-sage-deep/25 dark:border-emerald-800 dark:bg-emerald-950/30 dark:focus:ring-emerald-500/25 md:hover:border-sage-deep/40 dark:md:hover:border-emerald-500/50"
  const optionCardClassName =
    "w-full rounded-xl border px-3 py-2.5 text-left text-sm transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-sage-deep/25 dark:focus:ring-emerald-500/25 md:hover:-translate-y-0.5 md:hover:shadow-sm"

  return (
    <div className="dashboard-overview-card p-4 sm:p-6 lg:p-8">
      <div className="mb-5 flex items-start gap-3 sm:mb-6 sm:items-center">
        <div className="rounded-2xl border border-slate-200/90 bg-sage p-3 dark:border-emerald-700 dark:bg-emerald-900/50">
          <Languages className="h-5 w-5 text-sage-deep dark:text-emerald-300" />
        </div>
        <div>
          <h2 className="font-display text-xl font-semibold text-slate-900 dark:text-emerald-50 sm:text-2xl">Configure your interview</h2>
          <p className="text-sm text-slate-600 dark:text-emerald-200/85">AI questions, voice prompts, and feedback will follow this selection.</p>
        </div>
      </div>
      <div className="mt-5 grid gap-4 sm:mt-6 md:grid-cols-2">
        <div>
        <p className="mb-2 text-sm font-semibold text-slate-900 dark:text-emerald-50">Interview language</p>
        <Select value={selectedLanguage || ""} onValueChange={(value) => onSelect(value as InterviewLanguage)}>
          <SelectTrigger className={selectTriggerClassName}>
            <SelectValue placeholder="Select language" />
          </SelectTrigger>
          <SelectContent position="item-aligned" sideOffset={6} className="max-h-72 w-[var(--radix-select-trigger-width)]">
            {languageOptions.map((item) => (
              <SelectItem key={item.code} value={item.code} className="min-h-10">
                {item.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <p className="mb-2 text-sm font-semibold text-slate-900 dark:text-emerald-50">Job role (Blue-collar)</p>
        <Select value={selectedRole || ""} onValueChange={onRoleSelect}>
          <SelectTrigger className={selectTriggerClassName}>
            <SelectValue placeholder="Select blue-collar job role" />
          </SelectTrigger>
          <SelectContent position="item-aligned" sideOffset={6} className="max-h-72 w-[var(--radix-select-trigger-width)]">
            {roleOptions.map((role) => (
              <SelectItem key={role} value={role} className="min-h-10">
                {role}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-2">
        <div>
          <p className="mb-2 text-sm font-semibold text-slate-900 dark:text-emerald-50">Experience level</p>
          <Select value={selectedExperience || ""} onValueChange={(value) => onExperienceSelect(value as ExperienceLevel)}>
            <SelectTrigger className={selectTriggerClassName}>
              <SelectValue placeholder="Select experience level" />
            </SelectTrigger>
            <SelectContent position="item-aligned" sideOffset={6} className="max-h-72 w-[var(--radix-select-trigger-width)]">
              {experienceOptions.map((item) => (
                <SelectItem key={item.id} value={item.id} className="min-h-10">
                  {item.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <p className="mb-2 text-sm font-semibold text-slate-900 dark:text-emerald-50">Interview mode</p>
          <Select value={selectedMode || ""} onValueChange={(value) => onModeSelect(value as InterviewMode)}>
            <SelectTrigger className={selectTriggerClassName}>
              <SelectValue placeholder="Select interview mode" />
            </SelectTrigger>
            <SelectContent position="item-aligned" sideOffset={6} className="max-h-72 w-[var(--radix-select-trigger-width)]">
              {modeOptions.map((item) => (
                <SelectItem key={item.id} value={item.id} className="min-h-10">
                  {item.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="mt-6">
        <p className="mb-2 text-sm font-semibold text-slate-900 dark:text-emerald-50">Interviewer personality</p>
        <div className="grid gap-2 sm:grid-cols-2 md:grid-cols-3">
          {personalityOptions.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => onPersonalitySelect(item.id)}
              className={cn(
                optionCardClassName,
                selectedPersonality === item.id
                  ? "border-sage-deep bg-sage/15 dark:border-emerald-500 dark:bg-emerald-900/40"
                  : "border-slate-200 bg-white dark:border-emerald-800 dark:bg-emerald-950/30",
              )}
            >
              <p className="font-medium">{item.label}</p>
              <p className="text-xs text-slate-600 dark:text-emerald-300">{item.subtitle}</p>
            </button>
          ))}
        </div>
      </div>

      <Button
        onClick={onContinue}
        disabled={!selectedLanguage || !resolvedRole || !selectedExperience || !selectedMode || !selectedPersonality}
        className="mt-6 h-11 w-full bg-sage-deep text-white transition-transform duration-200 hover:-translate-y-0.5 hover:bg-sage-deep/90 sm:w-auto dark:bg-emerald-600 dark:hover:bg-emerald-500"
      >
        Continue
      </Button>
      {!resolvedRole && <p className="mt-2 text-xs text-red-600">Please select role.</p>}
    </div>
  )
}
