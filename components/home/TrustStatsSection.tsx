"use client"

import { motion } from "framer-motion"
import { Building2, Briefcase, MapPin, Users } from "lucide-react"

const metrics = [
  {
    icon: Users,
    value: "50k+",
    label: "Professionals onboarded",
    hint: "Students & early talent",
  },
  {
    icon: Building2,
    value: "3.2k+",
    label: "Companies hiring",
    hint: "Startups to enterprises",
  },
  {
    icon: Briefcase,
    value: "12k+",
    label: "Open roles",
    hint: "Updated continuously",
  },
  {
    icon: MapPin,
    value: "180+",
    label: "Cities & towns",
    hint: "Hyperlocal discovery",
  },
]

export default function TrustStatsSection() {
  return (
    <section className="border-y border-border bg-muted/40 py-16 dark:bg-muted/10 md:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto mb-12 max-w-3xl text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
            Trust · scale · coverage
          </p>
          <h2 className="mt-3 font-display text-3xl font-semibold text-foreground md:text-4xl">
            Built for hiring teams that move fast
          </h2>
          <p className="mt-3 text-muted-foreground md:text-lg">
            One ecosystem for discovery, screening, and decisions—without the clutter of legacy
            portals.
          </p>
          <div className="mt-5 inline-flex items-center rounded-full border border-border/70 bg-card/70 px-4 py-1.5 text-xs font-medium text-muted-foreground shadow-soft">
            Updated daily with active jobs and engaged employers
          </div>
        </div>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {metrics.map((m, i) => (
            <motion.div
              key={m.label}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.06, duration: 0.35 }}
              className="group rounded-2xl border border-border bg-card p-6 shadow-soft transition-all duration-300 hover:-translate-y-0.5 hover:border-primary/20 hover:shadow-medium"
            >
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-primary/15 to-secondary/15 text-primary">
                <m.icon className="h-5 w-5" aria-hidden />
              </div>
              <p className="mt-4 font-display text-3xl font-semibold tracking-tight text-foreground">
                {m.value}
              </p>
              <p className="mt-1 font-medium text-foreground">{m.label}</p>
              <p className="mt-1 text-sm text-muted-foreground">{m.hint}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
