"use client"

import { motion } from "framer-motion"

const metrics = [
  {
    value: "50k+",
    label: "Professionals onboarded",
    hint: "Students & early talent",
  },
  {
    value: "3.2k+",
    label: "Companies hiring",
    hint: "Startups to enterprises",
  },
  {
    value: "12k+",
    label: "Open roles",
    hint: "Updated continuously",
  },
  {
    value: "180+",
    label: "Cities & towns",
    hint: "Hyperlocal discovery",
  },
]

export default function TrustStatsSection() {
  return (
    <section className="border-y border-slate-200 bg-sage/10 py-16 dark:border-emerald-900 dark:bg-emerald-900/25 md:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto mb-12 max-w-3xl text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-sage-deep dark:text-emerald-300">Trust · scale · coverage</p>
          <h2 className="mt-3 font-display text-3xl font-semibold text-slate-900 md:text-4xl dark:text-emerald-50">
            Built for hiring teams that move fast
          </h2>
          <p className="mt-3 text-slate-600 md:text-lg dark:text-emerald-200/85">
            One ecosystem for discovery, screening, and decisions—without the clutter of legacy portals.
          </p>
          <div className="mt-5 inline-flex items-center rounded-none border border-slate-200 bg-white px-4 py-1.5 text-xs font-medium text-slate-600 shadow-none dark:border-emerald-800 dark:bg-emerald-950 dark:text-emerald-200">
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
              className="group rounded-none border border-slate-200 bg-white p-6 shadow-none transition-colors hover:border-sage-deep dark:border-emerald-800 dark:bg-emerald-950 dark:hover:border-emerald-600"
            >
              <p className="font-display text-3xl font-semibold tracking-tight text-slate-900 dark:text-emerald-50">{m.value}</p>
              <p className="mt-1 font-medium text-slate-900 dark:text-emerald-50">{m.label}</p>
              <p className="mt-1 text-sm text-slate-600 dark:text-emerald-300/90">{m.hint}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
