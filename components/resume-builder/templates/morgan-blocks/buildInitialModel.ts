import morganEn from "@/data/resume-templates/morgan-blocks.en.json"
import type { MorganModel } from "@/lib/designerVariantsResume"
import { newId } from "@/lib/minimalClassicResume"

function deepClone<T>(v: T): T {
  return JSON.parse(JSON.stringify(v)) as T
}

export function cloneMorganDefaults(): MorganModel {
  return deepClone(morganEn.defaults) as MorganModel
}

export function mergeProfileIntoMorgan(
  base: MorganModel,
  profile: Record<string, unknown> | null | undefined
): MorganModel {
  if (!profile) return base
  const city = typeof profile.city === "string" ? profile.city : ""
  const state = typeof profile.state === "string" ? profile.state : ""
  const loc = [city, state].filter(Boolean).join(", ")
  const next: MorganModel = {
    ...base,
    personalInfo: {
      ...base.personalInfo,
      fullName: (profile.name as string) || base.personalInfo.fullName,
      photoUrl: (profile.profile_picture as string) || base.personalInfo.photoUrl,
    },
    summary: (profile.bio as string) || base.summary,
  }

  const contacts = [...next.contacts]
  const setText = (icon: MorganModel["contacts"][0]["icon"], text: string) => {
    const i = contacts.findIndex((c) => c.icon === icon)
    if (i >= 0 && text) contacts[i] = { ...contacts[i], text }
  }
  const email = (profile.email as string) || ""
  const phone = (profile.phone as string) || ""
  if (phone) setText("phone", phone)
  if (email) setText("email", email)
  if (loc) setText("location", loc)
  const li = typeof profile.linkedin_profile === "string" ? profile.linkedin_profile : ""
  if (li) setText("linkedin", li)
  const web = typeof profile.personal_website === "string" ? profile.personal_website : ""
  if (web) setText("web", web)
  next.contacts = contacts

  const inst = typeof profile.institution === "string" ? profile.institution : ""
  const deg = typeof profile.degree === "string" ? profile.degree : ""
  const branch = typeof profile.branch === "string" ? profile.branch : ""
  const gy = profile.graduation_year
  const year = gy != null ? String(gy) : ""
  if (inst || deg) {
    const line = [deg, branch].filter(Boolean).join(" — ")
    next.education = [
      {
        id: newId("mrg-ed"),
        institution: (inst || "Education").toUpperCase(),
        degreeDatesLine: `${line}${year ? ` | ${year}` : ""}`.toUpperCase(),
        bullets: next.education[0]?.bullets?.length ? next.education[0].bullets : [""],
      },
      ...next.education.slice(1),
    ]
  }

  const intern = typeof profile.internship_experience === "string" ? profile.internship_experience : ""
  if (intern) {
    next.experience = [
      {
        id: newId("mrg-xp"),
        title: "PROFESSIONAL EXPERIENCE",
        companyDatesLine: "",
        bullets: intern.split(/[\n.;]+/).map((s) => s.trim()).filter(Boolean).slice(0, 8),
      },
      ...next.experience.slice(1),
    ]
  }

  const tech = typeof profile.technical_skills === "string" ? profile.technical_skills : ""
  if (tech) {
    next.expertise = [next.expertise, tech].filter(Boolean).join(" ")
  }

  return next
}
