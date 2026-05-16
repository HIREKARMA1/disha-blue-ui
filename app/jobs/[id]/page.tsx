"use client"

import { Suspense } from "react"
import { useParams } from "next/navigation"
import { Loader2 } from "lucide-react"
import { Navbar } from "@/components/ui/navbar"
import { Footer } from "@/components/ui/footer"
import { JobDetailsContent } from "@/features/jobs-discovery/components/JobDetailsContent"
import { useRedirectAuthenticatedFromPublicJobs } from "@/features/jobs-discovery/hooks/useRedirectAuthenticatedFromPublicJobs"

function PublicJobDetailsPageInner() {
  const params = useParams()
  const jobId = params?.id as string | undefined

  useRedirectAuthenticatedFromPublicJobs(jobId)

  return <JobDetailsContent variant="public" />
}

export default function PublicJobDetailPage() {
  return (
    <div className="flex min-h-screen flex-col bg-sage-canvas dark:bg-slate-950">
      <Navbar variant="transparent" />
      <main className="flex-grow pt-20">
        <Suspense
          fallback={
            <div className="flex min-h-[50vh] items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
            </div>
          }
        >
          <PublicJobDetailsPageInner />
        </Suspense>
      </main>
      <Footer />
    </div>
  )
}
