"use client"

import { motion } from "framer-motion"
import { UserCircle2, Building2, Sparkles, Send, Kanban, LineChart } from "lucide-react"

const forTalent = [
  {
    step: "01",
    title: "Create your profile",
    body: "Resume, skills, and preferences—structured for matching and discovery.",
    icon: UserCircle2,
  },
  {
    step: "02",
    title: "Get AI-informed matches",
    body: "See roles ranked by fit, location, and timing—not just keyword overlap.",
    icon: Sparkles,
  },
  {
    step: "03",
    title: "Apply with context",
    body: "Track every application with clarity from first touch to final decision.",
    icon: Send,
  },
  {
    step: "04",
    title: "Grow your career",
    body: "Resume tools, practice, and insights keep momentum between applications.",
    icon: LineChart,
  },
]

const forRecruiters = [
  {
    step: "01",
    title: "Publish structured roles",
    body: "Rich job records with skills, compensation bands, and location intelligence.",
    icon: Building2,
  },
  {
    step: "02",
    title: "Discover talent",
    body: "Search and pipeline views inspired by modern ATS workflows.",
    icon: Kanban,
  },
  {
    step: "03",
    title: "Track every applicant",
    body: "Stages, notes, and history—without spreadsheet chaos.",
    icon: Send,
  },
  {
    step: "04",
    title: "Hire with signal",
    body: "Reports and operational visibility for recruiting leadership.",
    icon: LineChart,
  },
]

export default function HowItsWork() {
  return (
    <section id="how-it-works" className="scroll-mt-24 bg-muted/30 py-16 md:py-24 dark:bg-muted/5">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
            How it works
          </p>
          <h2 className="mt-3 font-display text-3xl font-semibold text-foreground md:text-4xl">
            Two journeys, one connected platform
          </h2>
          <p className="mt-3 text-muted-foreground md:text-lg">
            Candidates get clarity. Recruiters get control. Everyone gets a product that feels
            intentional—not pieced together.
          </p>
        </div>

        <div className="mt-14 grid gap-8 lg:grid-cols-2 lg:gap-10">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="rounded-3xl border border-border bg-card p-6 shadow-soft sm:p-8 md:p-10"
          >
            <div className="mb-8 flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                <UserCircle2 className="h-6 w-6" />
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  For talent
                </p>
                <h3 className="font-display text-xl font-semibold text-foreground">Students & job seekers</h3>
              </div>
            </div>
            <ul className="space-y-4">
              {forTalent.map((item) => (
                <li key={item.step} className="flex gap-4 rounded-2xl border border-border/70 bg-muted/30 p-4">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-background text-xs font-bold text-primary shadow-soft">
                    {item.step}
                  </span>
                  <div>
                    <div className="flex items-center gap-2">
                      <item.icon className="h-4 w-4 text-secondary" aria-hidden />
                      <h4 className="font-semibold text-foreground">{item.title}</h4>
                    </div>
                    <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{item.body}</p>
                  </div>
                </li>
              ))}
            </ul>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.08 }}
            className="rounded-3xl border border-border bg-card p-6 shadow-soft sm:p-8 md:p-10"
          >
            <div className="mb-8 flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-secondary/15 text-secondary-700 dark:text-secondary-300">
                <Building2 className="h-6 w-6" />
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  For hiring teams
                </p>
                <h3 className="font-display text-xl font-semibold text-foreground">Employers & recruiters</h3>
              </div>
            </div>
            <ul className="space-y-4">
              {forRecruiters.map((item) => (
                <li key={item.step} className="flex gap-4 rounded-2xl border border-border/70 bg-muted/30 p-4">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-background text-xs font-bold text-secondary-600 shadow-soft dark:text-secondary-400">
                    {item.step}
                  </span>
                  <div>
                    <div className="flex items-center gap-2">
                      <item.icon className="h-4 w-4 text-primary" aria-hidden />
                      <h4 className="font-semibold text-foreground">{item.title}</h4>
                    </div>
                    <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{item.body}</p>
                  </div>
                </li>
              ))}
            </ul>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
