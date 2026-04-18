"use client"

import Image from "next/image"
import Link from "next/link"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"

export default function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-sage/10 pt-20 sm:pt-24 dark:bg-emerald-950">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative flex min-h-0 flex-col sm:block sm:min-h-[74vh] md:min-h-[78vh] lg:min-h-[calc(100vh-6rem)]"
      >
        {/* Mobile: wide image band (similar framing to desktop); sm+: full-bleed behind copy */}
        <div className="relative h-[min(48vh,540px)] min-h-[260px] w-full sm:absolute sm:inset-0 sm:h-auto sm:min-h-full sm:max-h-none">
          <Image
            src="/images/hero-handshake.png"
            alt="Employer and candidate shaking hands across a desk in a bright office"
            fill
            priority
            className="object-cover object-[48%_38%] sm:scale-[1.08] sm:object-[48%_44%] lg:scale-[1.12] lg:object-[42%_38%]"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 100vw, 100vw"
          />
          <div
            className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/18 via-transparent to-transparent dark:from-emerald-950/22 dark:via-transparent dark:to-transparent sm:bg-gradient-to-l sm:from-black/28 sm:via-black/10 sm:to-transparent sm:dark:from-emerald-950/35 sm:dark:via-emerald-950/14 sm:dark:to-transparent"
            aria-hidden
          />
          {/* Fade into sage-tinted canvas (matches ConnectionStories & theme) */}
          <div
            className="pointer-events-none absolute inset-x-0 bottom-0 z-[1] h-[min(48%,440px)] bg-[linear-gradient(to_top,rgba(163,177,138,0.38)_0%,rgba(163,177,138,0.2)_14%,rgba(163,177,138,0.09)_34%,rgba(163,177,138,0.03)_52%,transparent_100%)] dark:bg-[linear-gradient(to_top,hsl(150_12%_8%)_0%,hsla(150,12%,8%,0.9)_16%,hsla(150,12%,8%,0.38)_38%,transparent_100%)] sm:h-[min(42%,520px)] sm:bg-[linear-gradient(to_top,rgba(163,177,138,0.34)_0%,rgba(163,177,138,0.18)_12%,rgba(163,177,138,0.08)_36%,transparent_86%)] sm:dark:bg-[linear-gradient(to_top,hsl(150_12%_8%)_0%,hsla(150,12%,8%,0.85)_14%,hsla(150,12%,8%,0.32)_40%,transparent_88%)]"
            aria-hidden
          />
        </div>

        <div className="relative z-10 flex w-full shrink-0 p-4 pb-6 max-sm:-mt-6 sm:absolute sm:inset-0 sm:mt-0 sm:items-end sm:justify-end sm:p-8 lg:p-12">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.08 }}
            className="ml-auto flex w-full max-w-lg flex-col items-stretch rounded-none border border-sage-deep/20 bg-secondary p-5 text-left text-secondary-foreground shadow-none sm:max-w-md sm:p-8 dark:border-emerald-800 dark:bg-emerald-950 dark:text-emerald-50"
          >
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-sage-deep sm:text-xs dark:text-emerald-300">
              Career growth simplified
            </p>
            <h1 className="mt-3 font-display text-2xl font-bold leading-[1.12] tracking-tight sm:mt-5 sm:text-5xl sm:leading-[1.08]">
              <span className="block">Find Your</span>
              <span className="block">Next Opportunity</span>
            </h1>
            <p className="mt-3 max-w-prose text-sm leading-relaxed text-slate-600 sm:mt-5 sm:text-base dark:text-emerald-200/85">
              Disha helps students discover better-fit jobs and helps employers hire with a cleaner, faster workflow.
            </p>

            <div className="mt-5 flex flex-col gap-3 sm:mt-8 sm:flex-row sm:flex-wrap sm:items-center">
              <Link href="/auth/register?type=student" className="w-full min-w-0 sm:w-auto">
                <Button className="h-11 min-h-[44px] w-full rounded-none border-0 bg-sage-deep px-5 text-sm font-semibold text-white shadow-none hover:bg-sage-deep/90 dark:bg-emerald-600 dark:hover:bg-emerald-500 sm:w-auto sm:px-6">
                  Get Started
                </Button>
              </Link>
              <Link href="/auth/register?type=corporate" className="w-full min-w-0 sm:w-auto">
                <Button
                  variant="outline"
                  className="h-11 min-h-[44px] w-full rounded-none border-2 border-sage-deep/35 bg-secondary px-5 text-sm font-semibold text-secondary-foreground shadow-none hover:border-sage-deep hover:bg-sage/25 dark:border-emerald-600 dark:bg-emerald-950 dark:text-emerald-50 dark:hover:bg-emerald-900 sm:w-auto sm:px-6"
                >
                  For Employers
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </motion.div>
    </section>
  )
}
