"use client"

import { Suspense } from "react"
import { Loader2 } from "lucide-react"
import { ErrorBoundary } from "@/components/ErrorBoundary"
import { StudentDashboardLayout } from "@/components/dashboard/StudentDashboardLayout"
import { LiveJobsView } from "@/features/jobs-discovery/components/LiveJobsView"

function DiscoverJobsContent() {
  return (
    <div className="min-h-full bg-sage-canvas -mx-4 px-3 py-4 dark:bg-slate-950 sm:mx-0 sm:px-0 sm:py-5">
      <LiveJobsView variant="dashboard" />
    </div>
  )
}

export default function DiscoverJobsPage() {
  return (
    <ErrorBoundary>
      <StudentDashboardLayout>
        <Suspense
          fallback={
            <div className="flex min-h-[50vh] items-center justify-center bg-sage-canvas dark:bg-slate-950">
              <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
            </div>
          }
        >
          <DiscoverJobsContent />
        </Suspense>
      </StudentDashboardLayout>
    </ErrorBoundary>
  )
}
