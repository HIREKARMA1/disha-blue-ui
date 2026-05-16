import type { Job } from "@/components/jobs/AllJobs"

export function formatJobLocation(job: Job): string {
  if (job.city_or_town) return job.city_or_town
  if (job.district) return job.district
  if (job.state) return job.state
  const loc = job.location
  if (Array.isArray(loc)) return loc.filter(Boolean).join(", ") || "Pan India"
  if (loc && String(loc).trim()) return String(loc)
  if (job.remote_work) return "Remote"
  return "Pan India"
}

export function formatJobType(job: Job): string {
  const t = (job.job_type || "").replace(/_/g, " ")
  if (!t) return "Full time"
  return t.replace(/\b\w/g, (c) => c.toUpperCase())
}

export function formatExperience(job: Job): string {
  const min = job.experience_min
  const max = job.experience_max
  if ((min == null || min === 0) && (max == null || max === 0)) return "Fresher (0 years)"
  if (min != null && max != null) return `${min}–${max} years`
  if (min != null) return `${min}+ years`
  if (max != null) return `Up to ${max} years`
  return "Fresher (0 years)"
}

function formatInrAmount(n: number): string {
  if (n >= 100000) return `${(n / 100000).toFixed(n % 100000 === 0 ? 0 : 1)}L`
  if (n >= 1000) return n.toLocaleString("en-IN")
  return String(n)
}

export function formatSalary(job: Job): string {
  if (job.ctc_with_probation?.trim()) return job.ctc_with_probation
  if (job.ctc_after_probation?.trim()) return job.ctc_after_probation
  const min = job.salary_min
  const max = job.salary_max
  const cur = job.salary_currency === "INR" || !job.salary_currency ? "₹" : job.salary_currency
  if (min != null && max != null) {
    if (max < 50000) return `${cur}${min.toLocaleString("en-IN")} - ${cur}${max.toLocaleString("en-IN")}/day`
    if (max < 500000) return `${cur}${min.toLocaleString("en-IN")} - ${cur}${max.toLocaleString("en-IN")}/month`
    return `${cur}${formatInrAmount(min)} - ${cur}${formatInrAmount(max)}/yr`
  }
  if (min != null) return `${cur}${formatInrAmount(min)}+`
  if (max != null) return `Up to ${cur}${formatInrAmount(max)}`
  return "Not disclosed"
}

export function formatPostedAgo(iso?: string): string {
  if (!iso) return "Recently"
  const ms = Date.now() - new Date(iso).getTime()
  const days = Math.floor(ms / (1000 * 60 * 60 * 24))
  if (days < 1) return "Today"
  if (days === 1) return "1d ago"
  return `${days}d ago`
}

export function aggregateSalaryRange(jobs: Job[]): string {
  const mins = jobs.map((j) => j.salary_min).filter((n): n is number => n != null && n > 0)
  const maxs = jobs.map((j) => j.salary_max).filter((n): n is number => n != null && n > 0)
  if (!mins.length && !maxs.length) return "Competitive packages"
  const low = mins.length ? Math.min(...mins) : Math.min(...maxs)
  const high = maxs.length ? Math.max(...maxs) : Math.max(...mins)
  return `₹${low.toLocaleString("en-IN")} - ₹${high.toLocaleString("en-IN")}`
}

export function topSkillsFromJobs(jobs: Job[], limit = 3): string[] {
  const counts = new Map<string, number>()
  for (const job of jobs) {
    for (const skill of job.skills_required || []) {
      const key = skill.trim()
      if (!key) continue
      counts.set(key, (counts.get(key) || 0) + 1)
    }
  }
  return Array.from(counts.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([s]) => s)
}
