"use client"

import { LiveJobsView } from "@/features/jobs-discovery/components/LiveJobsView"

/** Public jobs discovery page content (used at `/jobs`). */
export function NewAllJobs() {
  return <LiveJobsView variant="public" />
}
