"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import { ArrowRight, Briefcase, Sparkles, Users } from "lucide-react"
import { Button } from "@/components/ui/button"

const FLOAT_TAGS = ["AI match", "Startup roles", "Verified recruiters", "Hyperlocal", "Pipeline"]

const statSnapshot = [
  { label: "Active roles", value: "12k+" },
  { label: "Employers", value: "3.2k+" },
  { label: "Cities covered", value: "180+" },
]

export default function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-background pt-24 pb-14 md:pt-32 md:pb-20">
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.55] dark:opacity-30"
        style={{
          backgroundImage: `radial-gradient(circle at 20% 20%, hsl(var(--primary) / 0.14) 0%, transparent 42%),
            radial-gradient(circle at 80% 10%, hsl(var(--secondary) / 0.12) 0%, transparent 38%),
            radial-gradient(circle at 50% 80%, hsl(var(--primary) / 0.08) 0%, transparent 45%)`,
        }}
      />

      <div className="relative z-10 mx-auto flex max-w-7xl flex-col gap-10 px-4 sm:px-6 lg:flex-row lg:items-center lg:gap-12 lg:px-8">
        <div className="max-w-2xl flex-1 text-center lg:text-left">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45 }}
            className="mb-6 inline-flex items-center gap-2 rounded-full border border-border bg-card/85 px-4 py-1.5 text-xs font-semibold text-muted-foreground shadow-soft backdrop-blur-md dark:bg-card/60"
          >
            <Sparkles className="h-3.5 w-3.5 text-primary" aria-hidden />
            <span>Smarter hiring for talent and teams</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.05 }}
            className="font-display text-4xl font-semibold leading-[1.02] tracking-tight text-foreground sm:text-5xl md:text-6xl lg:text-[3.7rem]"
          >
            Hire faster. Get hired smarter.
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.12 }}
            className="mt-5 max-w-xl text-base text-muted-foreground sm:text-lg md:text-xl lg:max-w-2xl"
          >
            One modern platform for job seekers and employers, with AI-informed matching and
            recruiter-grade workflows.
          </motion.p>

          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.18 }}
            className="mt-4 max-w-xl text-sm leading-relaxed text-muted-foreground sm:text-base lg:mx-0 lg:mr-auto"
          >
            Choose your lane in seconds: discover jobs with better role fit, or post jobs and
            manage applicants in a clear hiring pipeline.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.22 }}
            className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center lg:justify-start"
          >
            <Link href="/auth/register?type=student" className="w-full sm:w-auto">
              <Button size="lg" className="h-12 w-full gap-2 rounded-full bg-gradient-to-r from-primary to-secondary px-8 text-primary-foreground shadow-medium sm:w-auto">
                <Users className="h-4 w-4" />
                Find jobs
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link href="/auth/register?type=corporate" className="w-full sm:w-auto">
              <Button
                size="lg"
                variant="outline"
                className="h-12 w-full rounded-full border-2 border-border bg-background/80 px-7 backdrop-blur-sm sm:w-auto"
              >
                <Briefcase className="mr-2 h-4 w-4" />
                Post jobs
              </Button>
            </Link>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.35, duration: 0.5 }}
            className="mt-10 flex flex-wrap items-center justify-center gap-x-8 gap-y-3 border-t border-border/80 pt-7 lg:justify-start"
          >
            {statSnapshot.map((s) => (
              <div key={s.label} className="min-w-[120px] text-left">
                <p className="font-display text-2xl font-semibold text-foreground md:text-3xl">
                  {s.value}
                </p>
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  {s.label}
                </p>
              </div>
            ))}
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.55, delay: 0.15 }}
          className="relative mx-auto w-full max-w-lg flex-1 lg:mx-0 lg:max-w-none"
        >
          <div className="relative aspect-square max-h-[520px] w-full md:aspect-[1.08/1]">
            {FLOAT_TAGS.map((tag, i) => (
              <motion.span
                key={tag}
                className="absolute inline-flex items-center rounded-full border border-border/80 bg-card/90 px-3 py-1.5 text-xs font-medium text-foreground shadow-medium backdrop-blur-md dark:bg-card/70"
                style={{
                  left: `${12 + (i * 17) % 62}%`,
                  top: `${8 + (i * 23) % 70}%`,
                }}
                animate={{ y: [0, -6, 0] }}
                transition={{
                  duration: 4.5 + i * 0.3,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: i * 0.15,
                }}
              >
                {tag}
              </motion.span>
            ))}

            <div className="absolute left-1/2 top-1/2 z-10 w-[min(100%,400px)] -translate-x-1/2 -translate-y-1/2 rounded-3xl border border-border bg-card/95 p-5 shadow-large backdrop-blur-xl dark:bg-card/90">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                    Conversion snapshot
                  </p>
                  <p className="font-display text-lg font-semibold text-foreground">Direct role discovery</p>
                </div>
                <span className="rounded-full bg-secondary/15 px-2.5 py-1 text-[10px] font-semibold text-secondary-700 dark:text-secondary-300">
                  Match quality 94%
                </span>
              </div>
              <div className="mt-4 space-y-2 rounded-2xl bg-muted/50 p-3 dark:bg-muted/20">
                {["Discover", "Apply", "Interview"].map((stage, idx) => (
                  <div
                    key={stage}
                    className="flex items-center justify-between rounded-xl bg-background/90 px-3 py-2 text-sm shadow-soft dark:bg-background/40"
                  >
                    <span className="text-muted-foreground">{stage}</span>
                    <span className="font-medium text-foreground">{4 - idx}x faster</span>
                  </div>
                ))}
              </div>
              <div className="mt-4 flex gap-2">
                <div className="h-2 flex-1 overflow-hidden rounded-full bg-muted">
                  <div className="h-full w-2/3 rounded-full bg-gradient-to-r from-primary-500 to-secondary-500" />
                </div>
              </div>
              <p className="mt-2 text-[11px] text-muted-foreground">
                Illustrative preview — your live data appears after sign in.
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
