"use client"

import { Suspense } from "react"
import { Navbar } from '@/components/ui/navbar'
import { AllJobs } from '@/components/jobs/AllJobs'
import { Footer } from '@/components/ui/footer'

function JobsContent() {
  return (
  <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 pt-24 max-w-[1600px] pb-24 flex-grow">
  <AllJobs />
  </div>
  )
}

export default function PublicJobsPage() {
  return (
  <div className="min-h-screen flex flex-col bg-background">
  <Navbar variant="transparent" />
  <Suspense fallback={<div className="container mx-auto flex flex-grow items-center justify-center px-4 pt-24 pb-24 text-muted-foreground">Loading jobs…</div>}>
    <JobsContent />
  </Suspense>
  <Footer />
  </div>
  )
}
