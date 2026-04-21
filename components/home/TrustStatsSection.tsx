"use client"

import { useEffect, useRef } from "react"
import { animate, motion, useInView, useMotionValue, useTransform } from "framer-motion"

const metrics = [
  {
    value: 50000,
    suffix: "k+",
    divisor: 1000,
    label: "Professionals onboarded",
    hint: "Students & early talent",
  },
  {
    value: 3200,
    suffix: "k+",
    divisor: 1000,
    decimals: 1,
    label: "Companies hiring",
    hint: "Startups to enterprises",
  },
  {
    value: 12000,
    suffix: "k+",
    divisor: 1000,
    label: "Open roles",
    hint: "Updated continuously",
  },
  {
    value: 180,
    suffix: "+",
    label: "Cities & towns",
    hint: "Hyperlocal discovery",
  },
]

type Metric = (typeof metrics)[number]

function CountUp({ metric, start }: { metric: Metric; start: boolean }) {
  const value = useMotionValue(0)
  const rendered = useTransform(value, (latest) => {
    const normalized = metric.divisor ? latest / metric.divisor : latest
    const decimals = metric.decimals ?? 0
    return `${normalized.toFixed(decimals)}${metric.suffix}`
  })

  useEffect(() => {
    if (!start) return
    const controls = animate(value, metric.value, {
      duration: 1.4,
      ease: [0.22, 1, 0.36, 1],
    })
    return () => controls.stop()
  }, [metric.value, start, value])

  return <motion.span>{rendered}</motion.span>
}

export default function TrustStatsSection() {
  const cardContainerVariants = {
    hidden: {},
    show: {
      transition: {
        staggerChildren: 0.12,
        delayChildren: 0.12,
      },
    },
  }

  const cardVariants = {
    hidden: { opacity: 0, y: 22, scale: 0.95 },
    show: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        duration: 0.55,
        ease: [0.22, 1, 0.36, 1] as const,
      },
    },
  }

  return (
    <motion.section
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, amount: 0.24 }}
      variants={{
        hidden: { opacity: 0, y: 26 },
        show: {
          opacity: 1,
          y: 0,
          transition: {
            duration: 0.65,
            ease: [0.22, 1, 0.36, 1],
            staggerChildren: 0.12,
          },
        },
      }}
      className="relative isolate overflow-hidden border-y border-slate-200/75 bg-[#f8f9f7] py-16 dark:border-emerald-900 dark:bg-emerald-900/25 md:py-24"
    >
      <div
        className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(90%_70%_at_50%_0%,rgba(148,163,184,0.12)_0%,rgba(248,249,247,0)_72%)] dark:bg-[radial-gradient(90%_70%_at_50%_0%,rgba(16,185,129,0.12)_0%,rgba(6,78,59,0)_70%)]"
        aria-hidden
      />
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto mb-12 max-w-3xl text-center md:mb-14">
          <motion.p
            variants={{
              hidden: { opacity: 0, y: 10 },
              show: { opacity: 1, y: 0, transition: { duration: 0.45 } },
            }}
            className="text-[11px] font-semibold uppercase tracking-[0.28em] text-slate-500 dark:text-emerald-300/85"
          >
            TRUST · SCALE · COVERAGE
          </motion.p>
          <motion.h2
            variants={{
              hidden: { opacity: 0, y: 18 },
              show: { opacity: 1, y: 0, transition: { duration: 0.56, delay: 0.05 } },
            }}
            className="mt-4 text-balance font-display text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl md:text-5xl dark:text-emerald-50"
          >
            Built for hiring teams that move fast
          </motion.h2>
          <motion.p
            variants={{
              hidden: { opacity: 0, y: 16 },
              show: { opacity: 1, y: 0, transition: { duration: 0.5, delay: 0.12 } },
            }}
            className="mx-auto mt-4 max-w-2xl text-pretty text-slate-600 md:text-lg dark:text-emerald-200/85"
          >
            One ecosystem for discovery, screening, and decisions—without the clutter of legacy portals.
          </motion.p>
          <motion.div
            variants={{
              hidden: { opacity: 0, y: 14, scale: 0.98 },
              show: {
                opacity: 1,
                y: 0,
                scale: 1,
                transition: { duration: 0.55, delay: 0.2 },
              },
            }}
            animate={{
              boxShadow: [
                "0 0 0 0 rgba(15,23,42,0.06)",
                "0 0 0 8px rgba(15,23,42,0)",
                "0 0 0 0 rgba(15,23,42,0)",
              ],
            }}
            transition={{
              duration: 2.8,
              ease: "easeInOut",
              repeat: Infinity,
              repeatDelay: 1.2,
            }}
            className="mt-6 inline-flex items-center rounded-full border border-slate-200 bg-white/95 px-4 py-2 text-xs font-medium text-slate-600 shadow-sm backdrop-blur dark:border-emerald-800 dark:bg-emerald-950/90 dark:text-emerald-200"
          >
            Updated daily with active jobs and engaged employers
          </motion.div>
        </div>

        <motion.div
          variants={cardContainerVariants}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.2 }}
          className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 lg:gap-5"
        >
          {metrics.map((m) => (
            <StatCard
              key={m.label}
              metric={m}
              variants={cardVariants}
            />
          ))}
        </motion.div>
      </div>
    </motion.section>
  )
}

function StatCard({
  metric,
  variants,
}: {
  metric: Metric
  variants: {
    hidden: { opacity: number; y: number; scale: number }
    show: {
      opacity: number
      y: number
      scale: number
      transition: { duration: number; ease: readonly [number, number, number, number] }
    }
  }
}) {
  const ref = useRef<HTMLElement | null>(null)
  const inView = useInView(ref, { once: true, amount: 0.55 })

  return (
    <motion.article
      ref={ref}
      variants={variants}
      whileHover={{
        y: -5,
        boxShadow: "0 20px 40px rgba(15,23,42,0.12)",
        borderColor: "rgba(148,163,184,0.5)",
      }}
      className="rounded-2xl border border-slate-200/85 bg-white p-6 shadow-[0_10px_28px_rgba(15,23,42,0.06)] transition-[border-color,box-shadow,transform] duration-300 dark:border-emerald-800 dark:bg-emerald-950/95 dark:shadow-[0_10px_30px_rgba(0,0,0,0.25)]"
    >
      <p className="font-display text-3xl font-semibold tracking-tight text-slate-900 sm:text-[2.05rem] dark:text-emerald-50">
        <CountUp metric={metric} start={inView} />
      </p>
      <p className="mt-2 text-base font-medium text-slate-900 dark:text-emerald-50">{metric.label}</p>
      <p className="mt-1 text-sm text-slate-600 dark:text-emerald-300/90">{metric.hint}</p>
    </motion.article>
  )
}
