"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

type StatFormat = "intK" | "decK" | "intPlus"

const heroStats: Array<{ label: string; end: number; format: StatFormat }> = [
  { label: "Active roles", end: 12, format: "intK" },
  { label: "Employers", end: 3.2, format: "decK" },
  { label: "Cities covered", end: 180, format: "intPlus" },
]

function StatCounter({
  end,
  format,
  className,
  delayMs = 0,
}: {
  end: number
  format: StatFormat
  className?: string
  /** Stagger so stats read left-to-right. */
  delayMs?: number
}) {
  const [display, setDisplay] = useState(0)

  useEffect(() => {
    const duration = 2000
    let rafId = 0
    let t0 = 0
    const easeOutCubic = (t: number) => 1 - (1 - t) ** 3

    const tick = (now: number) => {
      const t = Math.min(1, (now - t0) / duration)
      const eased = easeOutCubic(t)
      const raw = end * eased
      let next: number
      if (format === "decK") {
        next = t >= 1 ? end : Math.round(raw * 10) / 10
      } else {
        next = t >= 1 ? end : Math.floor(raw)
      }
      setDisplay(next)
      if (t < 1) rafId = requestAnimationFrame(tick)
    }

    const delayHandle = window.setTimeout(() => {
      t0 = performance.now()
      rafId = requestAnimationFrame(tick)
    }, delayMs)

    return () => {
      window.clearTimeout(delayHandle)
      cancelAnimationFrame(rafId)
    }
  }, [end, format, delayMs])

  const text =
    format === "intK"
      ? `${Math.min(Math.round(display), end)}k+`
      : format === "decK"
        ? `${display.toFixed(1)}k+`
        : `${Math.min(Math.round(display), end)}+`

  return <span className={cn("tabular-nums", className)}>{text}</span>
}

/** Reference-style accent (burnt orange / terracotta) */
const ACCENT = "#c95628"

export default function HeroSection() {
  const heroStat = heroStats[0]

  return (
    <section className="relative overflow-hidden bg-transparent pt-24 pb-16 md:pt-32 md:pb-24 dark:bg-transparent">
      {/* Very subtle warm wash on light mode only */}
      <div
        className="pointer-events-none absolute inset-0 opacity-40 dark:hidden"
        aria-hidden
        style={{
          backgroundImage: `radial-gradient(circle at 85% 20%, rgb(201 86 40 / 0.06) 0%, transparent 45%),
            radial-gradient(circle at 15% 70%, rgb(163 177 138 / 0.12) 0%, transparent 40%)`,
        }}
      />

      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="relative grid gap-10 lg:grid-cols-2 lg:items-center lg:gap-14">
          {/* Connector diagram — desktop */}
          <svg
            className="pointer-events-none absolute left-0 top-0 hidden h-full w-full overflow-visible lg:block"
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
            aria-hidden
          >
            <path
              d="M 46 38 C 52 36, 54 42, 58 44"
              fill="none"
              stroke="rgb(212 212 212)"
              strokeWidth="0.12"
              vectorEffect="nonScalingStroke"
              className="dark:stroke-emerald-700/60"
            />
            <circle cx="46" cy="38" r="0.35" fill="rgb(115 115 115)" className="dark:fill-emerald-500" />
            <circle cx="58" cy="44" r="0.35" fill="rgb(115 115 115)" className="dark:fill-emerald-500" />
            <path
              d="M 44 62 L 56 58"
              fill="none"
              stroke="rgb(212 212 212)"
              strokeWidth="0.1"
              vectorEffect="nonScalingStroke"
              className="dark:stroke-emerald-700/50"
            />
            <circle cx="44" cy="62" r="0.3" fill="rgb(163 163 163)" className="dark:fill-emerald-600" />
            <circle cx="56" cy="58" r="0.3" fill="rgb(163 163 163)" className="dark:fill-emerald-600" />
          </svg>

          {/* Image column — first on mobile */}
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.08 }}
            className="order-1 w-full justify-self-center lg:order-2 lg:max-w-[min(100%,560px)] lg:justify-self-end"
          >
            <div className="relative mx-auto w-full max-w-lg lg:max-w-none">
              <div className="relative aspect-[16/10] w-full max-h-[min(420px,78vw)] overflow-hidden rounded-[2rem] border border-slate-200/90 bg-white shadow-[0_12px_40px_-12px_rgba(0,0,0,0.12)] sm:max-h-[min(480px,70vh)] dark:border-emerald-800/80 dark:shadow-none lg:max-h-[520px] lg:aspect-[16/11]">
                <Image
                  src="/home/hero-handshake.png"
                  alt="Employer and candidate shaking hands across a desk in a bright office"
                  fill
                  className="object-cover object-[center_35%]"
                  priority
                  sizes="(max-width: 1024px) 100vw, 560px"
                />
                <div
                  className="pointer-events-none absolute inset-0 bg-gradient-to-t from-neutral-900/25 via-transparent to-transparent dark:from-emerald-950/50"
                  aria-hidden
                />

                {/* Floating stat — bracket style */}
                <div className="pointer-events-none absolute left-4 top-4 hidden flex-col gap-0.5 sm:flex">
                  <div className="flex items-stretch gap-2">
                    <div className="flex w-2 flex-col justify-between py-1">
                      <span className="h-px w-full bg-slate-400/80 dark:bg-emerald-500/60" />
                      <span className="h-px w-full bg-slate-400/80 dark:bg-emerald-500/60" />
                    </div>
                    <div className="rounded-2xl bg-white/95 px-3 py-2 shadow-sm backdrop-blur-sm dark:bg-emerald-950/90">
                      <p className="font-display text-lg font-bold tabular-nums text-neutral-900 dark:text-emerald-50">
                        <StatCounter end={heroStat.end} format={heroStat.format} />
                      </p>
                      <p className="text-[10px] font-medium uppercase tracking-wide text-slate-500 dark:text-emerald-400">
                        {heroStat.label}
                      </p>
                    </div>
                    <div className="flex w-2 flex-col justify-between py-1">
                      <span className="h-px w-full bg-slate-400/80 dark:bg-emerald-500/60" />
                      <span className="h-px w-full bg-slate-400/80 dark:bg-emerald-500/60" />
                    </div>
                  </div>
                </div>

                {/* Sunburst + terracotta scroll */}
                <div className="absolute bottom-6 right-5 flex items-center gap-0 sm:right-8">
                  <svg
                    width="56"
                    height="56"
                    viewBox="0 0 56 56"
                    className="pointer-events-none -mr-2 text-slate-300/90 dark:text-emerald-600/50"
                    aria-hidden
                  >
                    {[...Array(12)].map((_, i) => (
                      <line
                        key={i}
                        x1="28"
                        y1="8"
                        x2="28"
                        y2="14"
                        stroke="currentColor"
                        strokeWidth="0.75"
                        transform={`rotate(${i * 30} 28 28)`}
                      />
                    ))}
                  </svg>
                  <a
                    href="#roles"
                    className="relative z-10 flex h-14 w-14 shrink-0 items-center justify-center rounded-full text-center text-xs font-bold leading-tight text-white shadow-md transition-transform hover:scale-105 focus-visible:outline focus-visible:ring-2 focus-visible:ring-offset-2"
                    style={{ backgroundColor: ACCENT }}
                    aria-label="Scroll to choose your path"
                  >
                    <span className="px-1">Next</span>
                  </a>
                </div>

                <p className="pointer-events-none absolute bottom-0 left-0 right-0 rounded-b-[2rem] border-t border-white/25 bg-neutral-900/40 px-4 py-3 text-center text-xs font-medium text-white backdrop-blur-[2px] sm:text-sm dark:bg-emerald-950/55 dark:text-emerald-100">
                  Where great hires start—with clarity, respect, and a real connection.
                </p>
              </div>
            </div>
          </motion.div>

          {/* Copy column */}
          <div className="order-2 max-w-2xl flex-1 text-center lg:order-1 lg:text-left">
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.05 }}
              className="font-display text-4xl font-bold leading-[1.05] tracking-tight text-neutral-900 sm:text-5xl md:text-6xl lg:text-[3.7rem] dark:text-emerald-50"
            >
              Hire faster. Get hired smarter.
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.12 }}
              className="mt-5 max-w-xl text-base text-slate-600 sm:text-lg md:text-xl lg:max-w-2xl dark:text-emerald-200/90"
            >
              One modern platform for job seekers and employers.
            </motion.p>

            <motion.p
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, delay: 0.18 }}
              className="mt-4 max-w-xl text-sm leading-relaxed text-slate-600 sm:text-base lg:mx-0 lg:mr-auto dark:text-emerald-200/80"
            >
              Choose your lane in seconds: discover jobs with better role fit, or post jobs and manage applicants in a clear hiring pipeline.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, delay: 0.22 }}
              className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center lg:justify-start"
            >
              <Link href="/auth/register?type=student" className="w-full sm:w-auto">
                <Button
                  size="lg"
                  className="h-12 w-full rounded-full border-0 bg-neutral-900 px-8 text-white shadow-sm hover:bg-neutral-800 dark:bg-emerald-600 dark:hover:bg-emerald-500 sm:w-auto"
                >
                  Find jobs
                </Button>
              </Link>
              <Link href="/auth/register?type=corporate" className="w-full sm:w-auto">
                <Button
                  size="lg"
                  variant="outline"
                  className="h-12 w-full rounded-full border-2 border-slate-300 bg-white/90 px-7 text-neutral-900 shadow-sm hover:border-neutral-400 hover:bg-white dark:border-emerald-600 dark:bg-emerald-950 dark:text-emerald-50 dark:hover:bg-emerald-900 sm:w-auto"
                >
                  Post jobs
                </Button>
              </Link>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.35, duration: 0.5 }}
              className="mt-10 flex flex-wrap items-center justify-center gap-x-8 gap-y-3 border-t border-slate-200/80 pt-7 dark:border-emerald-800 lg:justify-start"
            >
              {heroStats.map((s, i) => (
                <div key={s.label} className="min-w-[120px] text-left">
                  <p className="font-display text-2xl font-semibold tabular-nums text-neutral-900 md:text-3xl dark:text-emerald-50">
                    <StatCounter end={s.end} format={s.format} delayMs={i * 140} />
                  </p>
                  <p className="text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-emerald-400">{s.label}</p>
                </div>
              ))}
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  )
}
