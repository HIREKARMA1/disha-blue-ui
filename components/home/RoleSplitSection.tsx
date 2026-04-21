"use client"

import { motion } from "framer-motion"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { getOnboardingEntryRoute } from "@/lib/onboarding"

export default function RoleSplitSection() {
  const router = useRouter()

  const handleFindJobsClick = () => {
    router.push(getOnboardingEntryRoute())
  }

  return (
    <section className="bg-white py-16 dark:bg-emerald-950 md:py-24" id="roles">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto mb-12 max-w-3xl text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-sage-deep dark:text-emerald-300">Choose your path</p>
          <h2 className="mt-3 font-display text-3xl font-semibold tracking-tight text-slate-900 md:text-4xl dark:text-emerald-50">
            Built for job seekers and hiring teams
          </h2>
          <p className="mt-3 text-slate-600 md:text-lg dark:text-emerald-200/85">
            A direct two-lane experience: discover opportunities faster, or hire with clearer pipeline control.
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <motion.article
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="relative overflow-hidden rounded-none border border-slate-200 bg-white p-7 shadow-none transition-colors duration-200 hover:border-sage-deep md:p-9 dark:border-emerald-800 dark:bg-emerald-900/40 dark:hover:border-emerald-600"
          >
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-sage-deep dark:text-emerald-300">For talent</p>
            <h3 className="mt-2 font-display text-2xl font-semibold text-slate-900 md:text-[1.75rem] dark:text-emerald-50">I am a job seeker</h3>
            <p className="mt-3 text-sm leading-relaxed text-slate-600 md:text-base dark:text-emerald-200/85">
              Find relevant jobs by location, role fit, and application stage clarity. Build your profile and move faster from discovery to interviews.
            </p>
            <ul className="mt-6 space-y-2.5 text-sm text-slate-600 dark:text-emerald-200/80">
              <li className="rounded-none border border-slate-100 bg-sage/10 px-3 py-2 dark:border-emerald-800 dark:bg-emerald-950/60">
                AI-informed role matching
              </li>
              <li className="rounded-none border border-slate-100 bg-sage/10 px-3 py-2 dark:border-emerald-800 dark:bg-emerald-950/60">
                Clear application tracking
              </li>
            </ul>
            <div className="mt-8">
              <div className="w-full sm:w-auto">
                <Button
                  onClick={handleFindJobsClick}
                  size="lg"
                  className="h-11 w-full rounded-none border-0 bg-sage-deep text-white shadow-none hover:bg-sage-deep/90 dark:bg-emerald-600 dark:hover:bg-emerald-500 sm:w-auto"
                >
                  🎓 Find Jobs (Student)
                </Button>
              </div>
            </div>
          </motion.article>

          <motion.article
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.08 }}
            className="relative overflow-hidden rounded-none border border-slate-200 bg-white p-7 shadow-none transition-colors duration-200 hover:border-sage-deep md:p-9 dark:border-emerald-800 dark:bg-emerald-900/40 dark:hover:border-emerald-600"
          >
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-sage-deep dark:text-emerald-300">For hiring teams</p>
            <h3 className="mt-2 font-display text-2xl font-semibold text-slate-900 md:text-[1.75rem] dark:text-emerald-50">I am an employer</h3>
            <p className="mt-3 text-sm leading-relaxed text-slate-600 md:text-base dark:text-emerald-200/85">
              Post jobs, manage applicants, and move candidates through a structured hiring pipeline designed for modern recruiting teams.
            </p>
            <ul className="mt-6 space-y-2.5 text-sm text-slate-600 dark:text-emerald-200/80">
              <li className="rounded-none border border-slate-100 bg-sage/10 px-3 py-2 dark:border-emerald-800 dark:bg-emerald-950/60">
                Organized ATS-style workflow
              </li>
              <li className="rounded-none border border-slate-100 bg-sage/10 px-3 py-2 dark:border-emerald-800 dark:bg-emerald-950/60">
                Better shortlist and stage visibility
              </li>
            </ul>
            <div className="mt-8">
              <Link href="/auth/register?type=corporate" className="w-full sm:w-auto">
                <Button
                  size="lg"
                  variant="outline"
                  className="h-11 w-full rounded-none border-2 border-slate-300 bg-white shadow-none hover:border-sage-deep hover:bg-slate-50 dark:border-emerald-600 dark:bg-emerald-950 dark:text-emerald-50 dark:hover:bg-emerald-900 sm:w-auto"
                >
                  🏢 Hire Talent (Corporate)
                </Button>
              </Link>
            </div>
          </motion.article>
        </div>
      </div>
    </section>
  )
}
