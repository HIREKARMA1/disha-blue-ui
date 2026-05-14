import minimalClassicEn from "@/data/resume-templates/minimal-classic.en.json"
import type { MinimalClassicModel } from "@/lib/minimalClassicResume"
import { newId } from "@/lib/minimalClassicResume"

function deepClone<T>(v: T): T {
  return JSON.parse(JSON.stringify(v)) as T
}

export function cloneDefaultsFromJson(): MinimalClassicModel {
  const m = deepClone(minimalClassicEn.defaults) as MinimalClassicModel
  return m
}

export function mergeProfileIntoMinimalClassic(
  base: MinimalClassicModel,
  profile: Record<string, unknown> | null | undefined
): MinimalClassicModel {
  if (!profile) return base
  const city = typeof profile.city === "string" ? profile.city : ""
  const state = typeof profile.state === "string" ? profile.state : ""
  const loc = [city, state].filter(Boolean).join(", ")
  const next: MinimalClassicModel = {
    ...base,
    personalInfo: {
      ...base.personalInfo,
      fullName: (profile.name as string) || base.personalInfo.fullName,
      email: (profile.email as string) || base.personalInfo.email,
      phone: (profile.phone as string) || base.personalInfo.phone,
      location: loc || base.personalInfo.location,
      jobTitle: base.personalInfo.jobTitle,
    },
    aboutMe: (profile.bio as string) || base.aboutMe,
  }

  const inst = typeof profile.institution === "string" ? profile.institution : ""
  const deg = typeof profile.degree === "string" ? profile.degree : ""
  const branch = typeof profile.branch === "string" ? profile.branch : ""
  const gy = profile.graduation_year
  const endY = gy != null ? String(gy) : ""

  if (inst || deg) {
    const eduLine = [deg, branch].filter(Boolean).join(" — ")
    next.education = [
      {
        id: newId("edu"),
        dateRange: endY ? `— ${endY}` : "",
        organization: inst || next.education[0]?.organization || "",
        title: eduLine || next.education[0]?.title || "",
        body: next.education[0]?.body || "",
      },
      ...next.education.slice(1),
    ]
  }

  const intern = typeof profile.internship_experience === "string" ? profile.internship_experience : ""
  if (intern) {
    next.experience = [
      {
        id: newId("exp"),
        dateRange: "",
        organization: "",
        title: "Experience",
        body: intern,
      },
      ...next.experience.slice(1),
    ]
  }

  const tech = typeof profile.technical_skills === "string" ? profile.technical_skills : ""
  const soft = typeof profile.soft_skills === "string" ? profile.soft_skills : ""
  const skillParts = [tech, soft]
    .filter(Boolean)
    .join(",")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean)
  if (skillParts.length) {
    const merged = [...skillParts]
    const seen = new Set<string>()
    next.skills = merged.filter((s) => {
      const k = s.toLowerCase()
      if (!s || seen.has(k)) return false
      seen.add(k)
      return true
    })
    const target = Math.max(8, Math.ceil(next.skills.length / 4) * 4)
    while (next.skills.length < target) next.skills.push("")
  }

  return next
}
