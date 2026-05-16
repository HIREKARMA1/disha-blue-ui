"use client"

import { useEffect } from "react"
import { usePathname, useRouter } from "next/navigation"
import { apiClient } from "@/lib/api"
import {
  DASHBOARD_JOBS_ROUTE,
  dashboardJobDetailsPath,
} from "../constants"

/**
 * Sends logged-in students to in-app Local Jobs routes instead of public `/jobs`.
 * No-op for guests — public jobs pages stay unchanged.
 */
export function useRedirectAuthenticatedFromPublicJobs(jobId?: string) {
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    if (!pathname?.startsWith("/jobs")) return

    const token = apiClient.getAccessToken?.() ?? localStorage.getItem("access_token")
    if (!token) return

    const target = jobId ? dashboardJobDetailsPath(jobId) : DASHBOARD_JOBS_ROUTE
    if (pathname !== target) {
      router.replace(target)
    }
  }, [pathname, router, jobId])
}
