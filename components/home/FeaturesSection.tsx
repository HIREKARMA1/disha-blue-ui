"use client"

import { motion } from "framer-motion"
import { Brain, MapPinned, FileText, LayoutDashboard, Users2, BarChart3 } from "lucide-react"

const highlights = [
  {
    icon: Brain,
    title: "AI matching & signals",
    description:
      "Surface roles and candidates with fit context—not just filters—so decisions feel informed.",
    span: "lg:col-span-2",
  },
  {
    icon: MapPinned,
    title: "Hyperlocal discovery",
    description: "Structured locations from state to village, designed for real regional hiring.",
    span: "",
  },
  {
    icon: FileText,
    title: "Resume & readiness",
    description: "Keep profiles polished with builder tools and nudges that reduce drop-off.",
    span: "",
  },
  {
    icon: LayoutDashboard,
    title: "Recruiter-grade pipeline",
    description: "Kanban-friendly stages, clear ownership, and history that scales with your team.",
    span: "lg:col-span-2",
  },
  {
    icon: Users2,
    title: "Collaborative hiring",
    description: "Share context across reviewers without losing the thread on a candidate.",
    span: "",
  },
  {
    icon: BarChart3,
    title: "Operational analytics",
    description: "Understand funnel health, time-to-hire, and sourcing performance at a glance.",
    span: "",
  },
]

export default function FeaturesSection() {
  return (
    <section id="features" className="scroll-mt-24 bg-background py-16 md:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">Platform</p>
          <h2 className="mt-3 font-display text-3xl font-semibold text-foreground md:text-4xl">
            Everything you need to run modern hiring
          </h2>
          <p className="mt-3 text-muted-foreground md:text-lg">
            A cohesive product layer for discovery, application, and pipeline—without duct-taping
            tools together.
          </p>
        </div>

        <div className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {highlights.map((item, i) => (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05 }}
              className={`rounded-2xl border border-border bg-card p-6 shadow-soft transition-all hover:-translate-y-0.5 hover:border-primary/20 hover:shadow-medium ${item.span}`}
            >
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-primary-500/15 to-secondary-500/15 text-primary">
                <item.icon className="h-5 w-5" />
              </div>
              <p className="mt-3 text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                Product capability
              </p>
              <h3 className="mt-4 font-display text-lg font-semibold text-foreground">{item.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{item.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
