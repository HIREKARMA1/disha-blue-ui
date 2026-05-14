import daniEn from "@/data/resume-templates/dani-sidebar.en.json"
import type { DaniModel } from "@/lib/designerVariantsResume"
import { newId } from "@/lib/minimalClassicResume"

function deepClone<T>(v: T): T {
  return JSON.parse(JSON.stringify(v)) as T
}

export function cloneDaniDefaults(): DaniModel {
  return deepClone(daniEn.defaults) as DaniModel
}

export function mergeProfileIntoDani(
  base: DaniModel,
  profile: Record<string, unknown> | null | undefined
): DaniModel {
  if (!profile) return base
  const city = typeof profile.city === "string" ? profile.city : ""
  const state = typeof profile.state === "string" ? profile.state : ""
  const loc = [city, state].filter(Boolean).join(", ")
  const next: DaniModel = {
    ...base,
    personalInfo: {
      ...base.personalInfo,
      fullName: (profile.name as string) || base.personalInfo.fullName,
    },
    profileSummary: (profile.bio as string) || base.profileSummary,
    sidebar: {
      ...base.sidebar,
      photoUrl: (profile.profile_picture as string) || base.sidebar.photoUrl,
    },
  }

  const contacts = [...next.sidebar.contacts]
  const patchContact = (icon: (typeof contacts)[0]["icon"], text: string) => {
    const i = contacts.findIndex((c) => c.icon === icon)
    if (i >= 0 && text) contacts[i] = { ...contacts[i], text }
  }
  const email = (profile.email as string) || ""
  const phone = (profile.phone as string) || ""
  if (phone) patchContact("phone", phone)
  if (email) patchContact("email", email)
  if (loc) patchContact("location", loc)
  const web = typeof profile.personal_website === "string" ? profile.personal_website : ""
  if (web) patchContact("web", web)
  next.sidebar = { ...next.sidebar, contacts }

  const inst = typeof profile.institution === "string" ? profile.institution : ""
  const deg = typeof profile.degree === "string" ? profile.degree : ""
  const branch = typeof profile.branch === "string" ? profile.branch : ""
  const gy = profile.graduation_year
  const years = gy != null ? String(gy) : ""
  if (inst || deg) {
    const level = [deg, branch].filter(Boolean).join(" — ").toUpperCase()
    next.sidebar.education = [
      {
        id: newId("de"),
        level: level || next.sidebar.education[0]?.level || "",
        schoolYearsLine: inst ? `${inst}${years ? `, ${years}` : ""}` : next.sidebar.education[0]?.schoolYearsLine || "",
      },
      ...next.sidebar.education.slice(1),
    ]
  }

  const tech = typeof profile.technical_skills === "string" ? profile.technical_skills : ""
  if (tech) {
    const parts = tech.split(",").map((s) => s.trim()).filter(Boolean)
    if (parts.length) {
      const merged = [...parts, ...next.sidebar.skills]
      const seen = new Set<string>()
      next.sidebar.skills = merged
        .filter((s) => {
          const k = s.toLowerCase()
          if (!s || seen.has(k)) return false
          seen.add(k)
          return true
        })
        .slice(0, 24)
    }
  }

  const intern = typeof profile.internship_experience === "string" ? profile.internship_experience : ""
  if (intern) {
    next.experience = [
      {
        id: newId("dx"),
        title: "EXPERIENCE",
        company: "",
        dates: "",
        bullets: intern.split(/[\n.;]+/).map((s) => s.trim()).filter(Boolean).slice(0, 8),
      },
      ...next.experience.slice(1),
    ]
  }

  return next
}
