import type { Job } from "@/components/jobs/AllJobs"
import { formatExperience, formatJobType, formatJobLocation, formatSalary } from "./jobFormatters"

export function getCompanyInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return "HK"
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return `${parts[0][0]}${parts[1][0]}`.toUpperCase()
}

export function isUrgentJob(createdAt?: string, canApply?: boolean): boolean {
  if (!createdAt || !canApply) return false
  return Date.now() - new Date(createdAt).getTime() < 3 * 24 * 60 * 60 * 1000
}

export function formatPostedDate(iso?: string): string {
  if (!iso) return "Recently"
  try {
    return new Date(iso).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    })
  } catch {
    return "Recently"
  }
}

export function formatDeadlineLabel(iso?: string): string | null {
  if (!iso) return null
  try {
    const d = new Date(iso)
    const days = Math.ceil((d.getTime() - Date.now()) / (1000 * 60 * 60 * 24))
    const dateStr = d.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    })
    if (days < 0) return `${dateStr}, closed`
    if (days === 0) return `${dateStr}, ends today`
    return `${dateStr}, ${days} day${days === 1 ? "" : "s"} left`
  } catch {
    return null
  }
}

export function formatHeaderExperience(job: Job): string {
  const min = job.experience_min
  const max = job.experience_max
  if (min != null && max != null) return `${min}-${max} years`
  if (min != null) return `${min}+ years`
  if (max != null) return `Up to ${max} years`
  return "Fresher"
}

export function buildFullAddress(job: Job): string {
  const parts = [
    job.company_address,
    job.village_or_locality,
    job.city_or_town,
    job.district,
    job.state,
    job.pincode ? String(job.pincode) : null,
    "India",
  ].filter(Boolean)
  if (parts.length > 1) return parts.join(", ")
  const loc = job.location
  if (Array.isArray(loc)) return loc.filter(Boolean).join(", ") || formatJobLocation(job)
  if (loc && String(loc).trim()) return String(loc)
  return formatJobLocation(job)
}

export function parseDescriptionItems(job: Job): string[] {
  const raw = [job.description, job.responsibilities, job.requirements]
    .filter((s) => s && String(s).trim())
    .join("\n")

  if (!raw.trim()) return []

  const lines = raw
    .split(/\n+/)
    .map((l) => l.trim())
    .filter(Boolean)

  const numbered = lines
    .map((line) => line.replace(/^\d+[\).\s]+/, "").trim())
    .filter(Boolean)

  if (numbered.length >= 2) return numbered

  const sentences = raw
    .split(/(?<=[.!?])\s+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 12)

  return sentences.length ? sentences : [raw.trim()]
}

export function parseBenefitTags(perks?: string | null): string[] {
  if (!perks?.trim()) return []
  const split = perks
    .split(/[,;\n|]+/)
    .map((s) => s.trim())
    .filter(Boolean)
  return split.length ? split : [perks.trim()]
}

export function getOverviewFields(job: Job) {
  return {
    address: buildFullAddress(job),
    city: job.city_or_town || formatJobLocation(job),
    pincode: job.pincode ? String(job.pincode) : "—",
    state: job.state || "—",
    salary: formatSalary(job),
    workingHours: job.mode_of_work
      ? `${formatJobType(job)} · ${job.mode_of_work}`
      : "As per company policy",
    industry: job.industry || "—",
    shift: job.remote_work ? "Flexible / Remote" : "Morning",
  }
}
