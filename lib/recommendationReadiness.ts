import type { StudentProfile } from '@/services/profileService'

export interface RecommendationReadiness {
  score: number
  missing: string[]
  locationReady: boolean
  rolesReady: boolean
  skillsReady: boolean
  resumeReady: boolean
  isReady: boolean
}

const hasText = (value?: string) => Boolean(value && value.trim().length > 0)

export function getRecommendationReadiness(profile: Partial<StudentProfile> | null | undefined): RecommendationReadiness {
  if (!profile) {
  return {
  score: 0,
  missing: ['Preferred location', 'Job interests', 'Skills', 'Resume/Profile'],
  locationReady: false,
  rolesReady: false,
  skillsReady: false,
  resumeReady: false,
  isReady: false,
  }
  }

  const locationReady = Boolean(
  hasText(profile.preferred_job_city) ||
  hasText(profile.preferred_job_district) ||
  hasText(profile.preferred_job_state) ||
  hasText(profile.location_preferences) ||
  profile.preferred_job_remote
  )
  const rolesReady = hasText(profile.job_roles_of_interest)
  const skillsReady = hasText(profile.technical_skills) || hasText(profile.certifications)
  const resumeReady = hasText(profile.resume) || (profile.profile_completion_percentage || 0) >= 65

  const buckets = [locationReady, rolesReady, skillsReady, resumeReady]
  const score = Math.round((buckets.filter(Boolean).length / buckets.length) * 100)

  const missing: string[] = []
  if (!locationReady) missing.push('Preferred location')
  if (!rolesReady) missing.push('Job interests')
  if (!skillsReady) missing.push('Skills')
  if (!resumeReady) missing.push('Resume/Profile')

  return {
  score,
  missing,
  locationReady,
  rolesReady,
  skillsReady,
  resumeReady,
  isReady: score >= 75,
  }
}
