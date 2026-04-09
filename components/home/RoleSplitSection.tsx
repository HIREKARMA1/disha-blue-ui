"use client"

import { motion } from "framer-motion"
import Link from "next/link"
import { ArrowRight, Briefcase, Sparkles, Users } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function RoleSplitSection() {
  return (
    <section className="bg-background py-16 md:py-24" id="roles">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto mb-12 max-w-3xl text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
            Choose your path
          </p>
          <h2 className="mt-3 font-display text-3xl font-semibold tracking-tight text-foreground md:text-4xl">
            Built for job seekers and hiring teams
          </h2>
          <p className="mt-3 text-muted-foreground md:text-lg">
            A direct two-lane experience: discover opportunities faster, or hire with clearer
            pipeline control.
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <motion.article
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="group relative overflow-hidden rounded-3xl border border-border bg-card p-7 shadow-soft transition-all duration-300 hover:-translate-y-1 hover:border-primary/35 hover:shadow-large md:p-9"
          >
            <div className="pointer-events-none absolute inset-0 opacity-0 transition-opacity group-hover:opacity-100">
              <div className="absolute -right-20 -top-16 h-52 w-52 rounded-full bg-primary/10 blur-2xl" />
            </div>
            <div className="relative">
              <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/12 text-primary ring-1 ring-primary/20">
                <Users className="h-6 w-6" />
              </div>
              <p className="mt-5 text-xs font-semibold uppercase tracking-[0.18em] text-primary/80">For talent</p>
              <h3 className="mt-2 font-display text-2xl font-semibold text-foreground md:text-[1.75rem]">I am a job seeker</h3>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground md:text-base">
                Find relevant jobs by location, role fit, and application stage clarity. Build your
                profile and move faster from discovery to interviews.
              </p>
              <ul className="mt-6 space-y-2.5 text-sm text-muted-foreground">
                <li className="flex items-center gap-2 rounded-lg bg-muted/50 px-3 py-2">
                  <Sparkles className="h-4 w-4 text-secondary" />
                  AI-informed role matching
                </li>
                <li className="flex items-center gap-2 rounded-lg bg-muted/50 px-3 py-2">
                  <Sparkles className="h-4 w-4 text-secondary" />
                  Clear application tracking
                </li>
              </ul>
              <div className="mt-8">
                <Link href="/auth/register?type=student" className="w-full sm:w-auto">
                  <Button size="lg" className="h-11 w-full gap-2 rounded-full bg-gradient-to-r from-primary to-secondary text-primary-foreground shadow-medium sm:w-auto">
                    Find jobs
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </div>
          </motion.article>

          <motion.article
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.08 }}
            className="group relative overflow-hidden rounded-3xl border border-border bg-card p-7 shadow-soft transition-all duration-300 hover:-translate-y-1 hover:border-secondary/40 hover:shadow-large md:p-9"
          >
            <div className="pointer-events-none absolute inset-0 opacity-0 transition-opacity group-hover:opacity-100">
              <div className="absolute -left-20 -bottom-20 h-56 w-56 rounded-full bg-secondary/12 blur-2xl" />
            </div>
            <div className="relative">
              <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-secondary/12 text-secondary-700 ring-1 ring-secondary/25 dark:text-secondary-300">
                <Briefcase className="h-6 w-6" />
              </div>
              <p className="mt-5 text-xs font-semibold uppercase tracking-[0.18em] text-secondary-700/80 dark:text-secondary-300/80">For hiring teams</p>
              <h3 className="mt-2 font-display text-2xl font-semibold text-foreground md:text-[1.75rem]">I am an employer</h3>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground md:text-base">
                Post jobs, manage applicants, and move candidates through a structured hiring
                pipeline designed for modern recruiting teams.
              </p>
              <ul className="mt-6 space-y-2.5 text-sm text-muted-foreground">
                <li className="flex items-center gap-2 rounded-lg bg-muted/50 px-3 py-2">
                  <Sparkles className="h-4 w-4 text-primary" />
                  Organized ATS-style workflow
                </li>
                <li className="flex items-center gap-2 rounded-lg bg-muted/50 px-3 py-2">
                  <Sparkles className="h-4 w-4 text-primary" />
                  Better shortlist and stage visibility
                </li>
              </ul>
              <div className="mt-8">
                <Link href="/auth/register?type=corporate" className="w-full sm:w-auto">
                  <Button size="lg" variant="outline" className="h-11 w-full gap-2 rounded-full border-2 bg-background/90 sm:w-auto">
                    Hire talent
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </div>
          </motion.article>
        </div>
      </div>
    </section>
  )
}
