/** Student onboarding — used by “Find Jobs” CTAs (not the public jobs listing). */
export const STUDENT_SIGNUP_ROUTE = "/signup"

/** Public job discovery — used by the hero “Apply for jobs” location bar. */
export const PUBLIC_JOBS_ROUTE = "/jobs"

export function jobsUrlWithLocation(location?: string) {
  const q = location?.trim()
  if (!q) return PUBLIC_JOBS_ROUTE
  return `${PUBLIC_JOBS_ROUTE}?location=${encodeURIComponent(q)}`
}
