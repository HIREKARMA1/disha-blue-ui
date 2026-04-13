import type { FullResumeSchema } from '@/hooks/useResumeAI'

/**
 * Dedupe and trim skills from AI resume; falls back to project tech stacks.
 */
export function normalizeResumeSkills(resume: FullResumeSchema): string[] {
  const out = new Set<string>()
  for (const s of resume.skills || []) {
    const t = typeof s === 'string' ? s.trim() : ''
    if (t) out.add(t)
  }
  if (out.size === 0) {
    for (const p of resume.projects || []) {
      for (const tech of p.tech_stack || []) {
        const t = typeof tech === 'string' ? tech.trim() : ''
        if (t) out.add(t)
      }
    }
  }
  return Array.from(out)
}

/** Prefer explicit AI field, then most recent job title. */
export function inferPreferredRoleFromResume(resume: FullResumeSchema): string {
  const explicit = resume.preferred_role?.trim()
  if (explicit) return explicit
  const firstExp = resume.experience?.[0]
  if (firstExp?.role?.trim()) return firstExp.role.trim()
  return ''
}
