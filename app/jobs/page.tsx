"use client"

import { Suspense } from "react"
import { Navbar } from "@/components/ui/navbar"
import { NewAllJobs } from "@/components/jobs/NewAllJobs"
import { Footer } from "@/components/ui/footer"
import { useRedirectAuthenticatedFromPublicJobs } from "@/features/jobs-discovery/hooks/useRedirectAuthenticatedFromPublicJobs"

function JobsContent() {
  useRedirectAuthenticatedFromPublicJobs()

  return (
    <div className="flex-grow">
      <NewAllJobs />
    </div>
  )
}

export default function PublicJobsPage() {
  return (
    <div className="flex min-h-screen flex-col bg-sage-canvas dark:bg-slate-950">
      <Navbar variant="transparent" />
      <Suspense
        fallback={
          <div className="flex flex-grow items-center justify-center px-4 pt-24 pb-24 text-sm text-[#7a85a8]">
            Loading jobs…
          </div>
        }
      >
        <JobsContent />
      </Suspense>
      <Footer />
    </div>
  )
}
