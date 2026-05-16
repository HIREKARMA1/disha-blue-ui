"use client"

import { Suspense } from "react"
import { Loader2 } from "lucide-react"
import { ErrorBoundary } from "@/components/ErrorBoundary"
import { StudentDashboardLayout } from "@/components/dashboard/StudentDashboardLayout"
import { JobDetailsContent } from "@/features/jobs-discovery/components/JobDetailsContent"

function DashboardJobDetailsPageContent() {
  return (
    <div className="min-h-full bg-sage-canvas px-4 py-5 dark:bg-slate-950 sm:px-6 lg:px-8">
      <JobDetailsContent variant="dashboard" />
    </div>
  )
}

export default function DashboardJobDetailPage() {
  return (
    <ErrorBoundary>
      <StudentDashboardLayout>
        <Suspense
          fallback={
            <div className="flex min-h-[40vh] items-center justify-center bg-sage-canvas dark:bg-slate-950">
              <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
            </div>
          }
        >
          <DashboardJobDetailsPageContent />
        </Suspense>
      </StudentDashboardLayout>
    </ErrorBoundary>
  )
}
