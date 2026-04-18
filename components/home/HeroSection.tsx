"use client"

import Image from "next/image"
import Link from "next/link"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"

export default function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-white pt-20 sm:pt-24 dark:bg-emerald-950">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative min-h-[68vh] overflow-hidden sm:min-h-[74vh] md:min-h-[78vh] lg:min-h-[calc(100vh-6rem)]"
      >
        <Image
          src="/images/hero-handshake.png"
          alt="Employer and candidate shaking hands across a desk in a bright office"
          fill
          priority
          className="scale-[1.04] object-cover object-[52%_50%] sm:scale-[1.08] sm:object-[48%_44%] lg:scale-[1.12] lg:object-[42%_38%]"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 100vw, 100vw"
        />

        <div
          className="pointer-events-none absolute inset-0 bg-gradient-to-l from-black/28 via-black/10 to-transparent dark:from-emerald-950/35 dark:via-emerald-950/14 dark:to-transparent"
          aria-hidden
        />

        <div className="absolute inset-0 flex items-end p-3 sm:p-8 lg:p-12">
          <motion.div
            initial={{ opacity: 0, x: 14 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.45, delay: 0.1 }}
            className="ml-auto flex w-full max-w-lg flex-col items-stretch rounded-none border border-slate-200/90 bg-[#f1f1ee] p-6 text-left text-slate-900 shadow-none sm:max-w-md sm:p-8 dark:border-emerald-800 dark:bg-emerald-950 dark:text-emerald-50"
          >
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-sage-deep sm:text-xs dark:text-emerald-300">
              Career growth simplified
            </p>
            <h1 className="mt-4 font-display text-3xl font-bold leading-[1.12] tracking-tight sm:mt-5 sm:text-5xl sm:leading-[1.08]">
              <span className="block">Find Your</span>
              <span className="block">Next Opportunity</span>
            </h1>
            <p className="mt-4 max-w-prose text-sm leading-relaxed text-slate-600 sm:mt-5 sm:text-base dark:text-emerald-200/85">
              Disha helps students discover better-fit jobs and helps employers hire with a cleaner, faster workflow.
            </p>

            <div className="mt-6 flex flex-col gap-3 sm:mt-8 sm:flex-row sm:flex-wrap sm:items-center">
              <Link href="/auth/register?type=student" className="w-full sm:w-auto">
                <Button className="h-11 w-full rounded-none border-0 bg-sage-deep px-6 text-sm font-semibold text-white shadow-none hover:bg-sage-deep/90 dark:bg-emerald-600 dark:hover:bg-emerald-500 sm:w-auto">
                  Get Started
                </Button>
              </Link>
              <Link href="/auth/register?type=corporate" className="w-full sm:w-auto">
                <Button
                  variant="outline"
                  className="h-11 w-full rounded-none border-2 border-slate-300 bg-[#f1f1ee] px-6 text-sm font-semibold text-slate-900 shadow-none hover:border-sage-deep hover:bg-[#e8e8e4] dark:border-emerald-600 dark:bg-emerald-950 dark:text-emerald-50 dark:hover:bg-emerald-900 sm:w-auto"
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
