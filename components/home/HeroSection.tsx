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
          className="pointer-events-none absolute inset-0 bg-gradient-to-r from-black/18 via-black/6 to-transparent dark:from-emerald-950/26 dark:via-emerald-950/10 dark:to-transparent"
          aria-hidden
        />

        <div className="absolute inset-0 flex items-end justify-center p-3 sm:justify-start sm:p-8 lg:p-12">
          <motion.div
            initial={{ opacity: 0, x: -14 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.45, delay: 0.1 }}
            className="w-full max-w-lg rounded-2xl border border-white/20 bg-black/15 p-4 text-center text-white backdrop-blur-[1.5px] sm:max-w-md sm:p-6 sm:text-left"
          >
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-white/80 sm:text-xs sm:tracking-[0.22em]">
              Career growth simplified
            </p>
            <h1 className="mt-2 font-display text-3xl font-bold leading-[1.02] drop-shadow-[0_3px_10px_rgba(0,0,0,0.35)] sm:mt-3 sm:text-5xl">
              Find Your
              <br />
              Next Opportunity
            </h1>
            <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-white/90 sm:mx-0 sm:mt-4 sm:text-base">
              Disha helps students discover better-fit jobs and helps employers hire with a cleaner, faster workflow.
            </p>

            <div className="mt-5 flex flex-col items-stretch gap-2.5 sm:mt-6 sm:flex-row sm:flex-wrap sm:items-center sm:justify-start sm:gap-3">
              <Link href="/auth/register?type=student" className="w-full sm:w-auto">
                <Button className="h-10 w-full rounded-lg bg-white px-5 text-sm font-semibold text-slate-900 hover:bg-slate-100 sm:h-11 sm:w-auto sm:px-6">
                  Get Started
                </Button>
              </Link>
              <Link href="/auth/register?type=corporate" className="w-full sm:w-auto">
                <Button
                  variant="outline"
                  className="h-10 w-full rounded-lg border-white/60 bg-transparent px-5 text-sm font-semibold text-white hover:bg-white/10 sm:h-11 sm:w-auto sm:px-6"
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
