"use client"

import { useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { MapPin, X, Briefcase } from "lucide-react"
import toast from "react-hot-toast"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import { useJobDiscoveryPreferencesStore } from "@/stores/jobDiscoveryPreferencesStore"
import { profileService } from "@/services/profileService"
import { normalizeResumeSkills, inferPreferredRoleFromResume } from "@/lib/resumeSkillUtils"
import type { FullResumeSchema } from "@/hooks/useResumeAI"

/** Starter list; free-text role is always allowed via datalist + input */
const ROLE_SUGGESTIONS = [
  "Software Engineer",
  "Full Stack Developer",
  "Frontend Developer",
  "Backend Developer",
  "Data Analyst",
  "Data Scientist",
  "DevOps Engineer",
  "QA / Test Engineer",
  "Product Manager",
  "Business Analyst",
  "UI/UX Designer",
  "Mobile App Developer",
  "Cloud Engineer",
  "Machine Learning Engineer",
  "Intern / Trainee",
]

const LOCATION_PRESETS = ["Remote", "Bengaluru", "Hyderabad", "Mumbai", "Pune", "Delhi NCR", "Chennai", "Kolkata"]

const surfaceClass =
  "border border-border bg-card text-foreground dark:bg-black dark:border-border shadow-sm"

const labelClass = "text-xs font-semibold uppercase tracking-[0.12em] text-primary"

export interface PostResumePreferencesProps {
  resume: FullResumeSchema
  className?: string
}

export function PostResumePreferences({ resume, className }: PostResumePreferencesProps) {
  const router = useRouter()
  const setJobDiscoveryPreferences = useJobDiscoveryPreferencesStore((s) => s.setJobDiscoveryPreferences)

  const derivedSkills = useMemo(() => normalizeResumeSkills(resume), [resume])
  const defaultRole = useMemo(() => inferPreferredRoleFromResume(resume), [resume])

  const [preferredRole, setPreferredRole] = useState(defaultRole)
  const [locations, setLocations] = useState<string[]>([])
  const [locationInput, setLocationInput] = useState("")
  const [saving, setSaving] = useState(false)

  const addLocation = (raw: string) => {
    const t = raw.trim()
    if (!t) return
    if (locations.some((l) => l.toLowerCase() === t.toLowerCase())) {
      setLocationInput("")
      return
    }
    setLocations((prev) => [...prev, t])
    setLocationInput("")
  }

  const handleFindJobs = async () => {
    const role = preferredRole.trim()
    if (!role) {
      toast.error("Please enter a preferred job role")
      return
    }

    setSaving(true)
    try {
      setJobDiscoveryPreferences({
        resumeSkills: derivedSkills,
        preferredRole: role,
        preferredLocations: locations,
        fromResumeFlow: true,
      })
      console.log("[job-recommendation] payload", {
        skills: derivedSkills,
        education: resume.education.map((item) => `${item.degree} ${item.field_of_study}`.trim()).filter(Boolean),
        experience: resume.experience.map((item) => `${item.role} ${item.company}`.trim()).filter(Boolean),
        preferred_role: role,
        locations,
      })

      try {
        await profileService.updateProfile({
          job_roles_of_interest: role,
          location_preferences: locations.length ? locations.join(", ") : undefined,
          technical_skills: derivedSkills.length ? derivedSkills.join(", ") : undefined,
          preferred_job_city: locations[0] || undefined,
          preferred_job_remote: locations.some((l) => /remote/i.test(l)) || undefined,
        })
      } catch {
        // preferences still live in store + recommend API
      }

      toast.success("Preferences saved")
      try {
        sessionStorage.setItem(
          "disha-resume-rec-payload",
          JSON.stringify({
            skills: derivedSkills,
            preferred_role: role,
            locations,
          })
        )
      } catch {
        // ignore quota / private mode
      }
      router.push("/dashboard/discover-jobs")
    } finally {
      setSaving(false)
    }
  }

  return (
    <section className={cn(surfaceClass, "p-4 sm:p-5", className)} aria-labelledby="post-resume-prefs-heading">
      <h2 id="post-resume-prefs-heading" className="font-display text-lg font-semibold tracking-tight text-foreground">
        Next: job preferences
      </h2>
      <p className="mt-1 text-sm text-muted-foreground">
        We’ll match openings to your resume skills{derivedSkills.length ? ` (${derivedSkills.length} detected)` : ""},
        target role, and locations. Leave locations empty to include remote and all regions.
      </p>

      <div className="mt-4 space-y-4">
        <div>
          <label className={labelClass} htmlFor="preferred-role">
            Preferred job role
          </label>
          <Input
            id="preferred-role"
            list="job-role-suggestions"
            value={preferredRole}
            onChange={(e) => setPreferredRole(e.target.value)}
            placeholder="e.g. Software Engineer"
            className="mt-2 h-11 rounded-none border-border bg-background dark:bg-black"
          />
          <datalist id="job-role-suggestions">
            {ROLE_SUGGESTIONS.map((r) => (
              <option key={r} value={r} />
            ))}
          </datalist>
        </div>

        <div>
          <span className={labelClass}>Preferred locations</span>
          <p className="mt-1 text-xs text-muted-foreground">Optional — add cities or &quot;Remote&quot;. Empty = all / remote-friendly.</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {LOCATION_PRESETS.map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => addLocation(p)}
                className="rounded-none border border-border bg-muted/40 px-2.5 py-1 text-xs font-medium text-foreground hover:bg-primary/10 hover:border-primary/40 dark:bg-muted/20"
              >
                + {p}
              </button>
            ))}
          </div>
          <div className="mt-2 flex gap-2">
            <div className="relative min-w-0 flex-1">
              <MapPin className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={locationInput}
                onChange={(e) => setLocationInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault()
                    addLocation(locationInput)
                  }
                }}
                placeholder="Type a city and press Enter"
                className="h-11 rounded-none border-border bg-background pl-10 dark:bg-black"
              />
            </div>
          </div>
          {locations.length > 0 && (
            <ul className="mt-3 flex flex-wrap gap-2">
              {locations.map((loc) => (
                <li
                  key={loc}
                  className="inline-flex items-center gap-1 rounded-none border border-primary/30 bg-primary/10 px-2.5 py-1 text-xs font-medium text-foreground"
                >
                  {loc}
                  <button
                    type="button"
                    className="p-0.5 hover:text-destructive"
                    onClick={() => setLocations((prev) => prev.filter((l) => l !== loc))}
                    aria-label={`Remove ${loc}`}
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <div className="mt-5 flex flex-wrap items-center gap-3">
        <Button
          type="button"
          variant="default"
          disabled={saving}
          onClick={() => void handleFindJobs()}
          className="rounded-none bg-primary font-semibold text-primary-foreground hover:bg-primary/90 dark:bg-primary dark:text-primary-foreground"
        >
          <Briefcase className="mr-2 h-4 w-4" />
          {saving ? "Saving…" : "Find Jobs"}
        </Button>
      </div>
    </section>
  )
}
