import { Navbar } from '@/components/ui/navbar'

export default function WhyPlatformPage() {
  return (
    <div className="min-h-screen bg-white text-slate-900 dark:bg-emerald-950 dark:text-emerald-50">
      <Navbar variant="transparent" />
      <div className="container mx-auto px-4 pb-20 pt-28 sm:px-6">
        <div className="mx-auto max-w-4xl text-center">
          <h1 className="mb-6 font-display text-4xl font-bold tracking-tight text-slate-900 md:text-6xl dark:text-emerald-50">
            Why This Platform?
          </h1>
          <p className="mb-8 text-xl text-slate-600 dark:text-emerald-200/90">
            Discover what makes this hyper-local opportunity platform a practical choice for job seekers and employers.
          </p>
          <div className="rounded-none border border-slate-200 bg-sage/10 p-8 shadow-none dark:border-emerald-800 dark:bg-emerald-900/40">
            <p className="text-lg text-slate-700 dark:text-emerald-100">
              This page is coming soon. We are preparing a complete overview of how local opportunity discovery and regional hiring work across students, employers, and admins.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
