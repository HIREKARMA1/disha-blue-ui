/** In-app job discovery for logged-in students (sidebar Local Jobs). */
export const DASHBOARD_JOBS_ROUTE = "/dashboard/discover-jobs"

export function dashboardJobDetailsPath(jobId: string) {
  return `${DASHBOARD_JOBS_ROUTE}/${jobId}`
}
