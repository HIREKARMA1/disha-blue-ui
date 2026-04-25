"use client"

import { Languages } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ExperienceLevel, InterviewLanguage, InterviewMode, InterviewPersonality } from "@/services/aiInterviewService"
import { cn } from "@/lib/utils"

interface Props {
  selectedLanguage: InterviewLanguage | null
  selectedRole: string
  customRole: string
  selectedExperience: ExperienceLevel | null
  selectedMode: InterviewMode | null
  selectedPersonality: InterviewPersonality | null
  onSelect: (language: InterviewLanguage) => void
  onRoleSelect: (role: string) => void
  onCustomRoleChange: (role: string) => void
  onExperienceSelect: (level: ExperienceLevel) => void
  onModeSelect: (mode: InterviewMode) => void
  onPersonalitySelect: (mode: InterviewPersonality) => void
  onContinue: () => void
}

const options: Array<{ code: InterviewLanguage; label: string; subtitle: string }> = [
  { code: "en", label: "English", subtitle: "Interview in English" },
  { code: "hi", label: "Hindi", subtitle: "हिंदी में इंटरव्यू" },
]

const roleOptions = ["Electrical Engineer", "Frontend Developer", "Electrician", "Custom"]
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
  customRole,
  selectedExperience,
  selectedMode,
  selectedPersonality,
  onSelect,
  onRoleSelect,
  onCustomRoleChange,
  onExperienceSelect,
  onModeSelect,
  onPersonalitySelect,
  onContinue,
}: Props) {
  const resolvedRole = selectedRole === "Custom" ? customRole.trim() : selectedRole

  return (
    <div className="dashboard-overview-card p-8">
      <div className="mb-6 flex items-center gap-3">
        <div className="rounded-2xl border border-slate-200/90 bg-sage p-3 dark:border-emerald-700 dark:bg-emerald-900/50">
          <Languages className="h-5 w-5 text-sage-deep dark:text-emerald-300" />
        </div>
        <div>
          <h2 className="font-display text-2xl font-semibold text-slate-900 dark:text-emerald-50">Choose interview language</h2>
          <p className="text-sm text-slate-600 dark:text-emerald-200/85">AI questions, voice prompts, and feedback will follow this selection.</p>
        </div>
      </div>
      <div className="grid gap-3 md:grid-cols-2">
        {options.map((option) => {
          const selected = selectedLanguage === option.code
          return (
            <button
              key={option.code}
              type="button"
              onClick={() => onSelect(option.code)}
              className={cn(
                "rounded-2xl border p-4 text-left transition",
                selected
                  ? "border-sage-deep bg-sage/15 dark:border-emerald-500 dark:bg-emerald-900/40"
                  : "border-slate-200 bg-white hover:border-sage-deep/40 dark:border-emerald-800 dark:bg-emerald-950/30",
              )}
            >
              <p className="text-base font-semibold text-slate-900 dark:text-emerald-50">{option.label}</p>
              <p className="text-sm text-slate-600 dark:text-emerald-300">{option.subtitle}</p>
            </button>
          )
        })}
      </div>
      <div className="mt-6">
        <p className="mb-2 text-sm font-semibold text-slate-900 dark:text-emerald-50">Select role</p>
        <div className="grid gap-2 md:grid-cols-2">
          {roleOptions.map((role) => (
            <button
              key={role}
              type="button"
              onClick={() => onRoleSelect(role)}
              className={cn(
                "rounded-xl border px-3 py-2 text-left text-sm",
                selectedRole === role
                  ? "border-sage-deep bg-sage/15 dark:border-emerald-500 dark:bg-emerald-900/40"
                  : "border-slate-200 bg-white dark:border-emerald-800 dark:bg-emerald-950/30",
              )}
            >
              {role}
            </button>
          ))}
        </div>
        {selectedRole === "Custom" && (
          <input
            value={customRole}
            onChange={(event) => onCustomRoleChange(event.target.value)}
            placeholder="Enter custom role"
            className="mt-2 h-10 w-full rounded-xl border border-slate-200 px-3 text-sm dark:border-emerald-800 dark:bg-emerald-950/30 dark:text-emerald-100"
          />
        )}
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-2">
        <div>
          <p className="mb-2 text-sm font-semibold text-slate-900 dark:text-emerald-50">Experience level</p>
          <div className="space-y-2">
            {experienceOptions.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => onExperienceSelect(item.id)}
                className={cn(
                  "w-full rounded-xl border px-3 py-2 text-left text-sm",
                  selectedExperience === item.id
                    ? "border-sage-deep bg-sage/15 dark:border-emerald-500 dark:bg-emerald-900/40"
                    : "border-slate-200 bg-white dark:border-emerald-800 dark:bg-emerald-950/30",
                )}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>
        <div>
          <p className="mb-2 text-sm font-semibold text-slate-900 dark:text-emerald-50">Interview mode</p>
          <div className="space-y-2">
            {modeOptions.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => onModeSelect(item.id)}
                className={cn(
                  "w-full rounded-xl border px-3 py-2 text-left text-sm",
                  selectedMode === item.id
                    ? "border-sage-deep bg-sage/15 dark:border-emerald-500 dark:bg-emerald-900/40"
                    : "border-slate-200 bg-white dark:border-emerald-800 dark:bg-emerald-950/30",
                )}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>
      </div>
      <div className="mt-6">
        <p className="mb-2 text-sm font-semibold text-slate-900 dark:text-emerald-50">Interviewer personality</p>
        <div className="grid gap-2 md:grid-cols-3">
          {personalityOptions.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => onPersonalitySelect(item.id)}
              className={cn(
                "rounded-xl border px-3 py-2 text-left text-sm",
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
        className="mt-6 h-11 bg-sage-deep text-white hover:bg-sage-deep/90 dark:bg-emerald-600 dark:hover:bg-emerald-500"
      >
        Continue
      </Button>
      {!resolvedRole && <p className="mt-2 text-xs text-red-600">Please select role.</p>}
    </div>
  )
}
