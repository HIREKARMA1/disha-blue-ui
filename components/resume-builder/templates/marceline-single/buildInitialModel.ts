import marcelineEn from "@/data/resume-templates/marceline-single.en.json"
import type { MarcelineModel } from "@/lib/designerVariantsResume"
import { newId } from "@/lib/minimalClassicResume"

function deepClone<T>(v: T): T {
  return JSON.parse(JSON.stringify(v)) as T
}

export function cloneMarcelineDefaults(): MarcelineModel {
  return deepClone(marcelineEn.defaults) as MarcelineModel
}

export function mergeProfileIntoMarceline(
  base: MarcelineModel,
  profile: Record<string, unknown> | null | undefined
): MarcelineModel {
  if (!profile) return base
  const city = typeof profile.city === "string" ? profile.city : ""
  const state = typeof profile.state === "string" ? profile.state : ""
  const loc = [city, state].filter(Boolean).join(", ")
  const next: MarcelineModel = {
    ...base,
    personalInfo: {
      ...base.personalInfo,
      fullName: (profile.name as string) || base.personalInfo.fullName,
      email: (profile.email as string) || base.personalInfo.email,
      phone: (profile.phone as string) || base.personalInfo.phone,
      addressLine: loc || base.personalInfo.addressLine,
    },
    profileSummary: (profile.bio as string) || base.profileSummary,
  }

  const inst = typeof profile.institution === "string" ? profile.institution : ""
  const deg = typeof profile.degree === "string" ? profile.degree : ""
  const branch = typeof profile.branch === "string" ? profile.branch : ""
  const gy = profile.graduation_year
  const year = gy != null ? String(gy) : ""
  if (inst || deg) {
    const degreeLine = [deg, branch].filter(Boolean).join(" — ")
    next.education = [
      {
        id: newId("med"),
        degree: degreeLine || next.education[0]?.degree || "",
        institutionYear: inst ? `${inst}${year ? `, ${year}` : ""}` : next.education[0]?.institutionYear || "",
      },
      ...next.education.slice(1),
    ]
  }

  const intern = typeof profile.internship_experience === "string" ? profile.internship_experience : ""
  if (intern) {
    next.experience = [
      {
        id: newId("mxp"),
        role: "Experience",
        company: "",
        dates: "",
        bullets: intern.split(/[\n.;]+/).map((s) => s.trim()).filter(Boolean).slice(0, 8),
      },
      ...next.experience.slice(1),
    ]
  }

  const tech = typeof profile.technical_skills === "string" ? profile.technical_skills : ""
  if (tech) {
    const groups = [...next.skillGroups]
    const toolsIdx = groups.findIndex((g) => /design tools/i.test(g.label))
    const idx = toolsIdx >= 0 ? toolsIdx : 0
    groups[idx] = { ...groups[idx], itemsLine: tech }
    next.skillGroups = groups.length ? groups : next.skillGroups
  }

  return next
}
