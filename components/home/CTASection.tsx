"use client"

import { motion } from "framer-motion"
import Link from "next/link"
import { BRANDING } from "@/config/branding"
import { Button } from "@/components/ui/button"

export default function CTASection() {
  return (
    <section className="relative overflow-hidden border-t border-sage-deep/30 bg-sage-deep py-16 text-white md:py-24 dark:border-emerald-800 dark:bg-emerald-950">
      <div
        className="pointer-events-none absolute inset-0 opacity-40"
        style={{
          backgroundImage: `radial-gradient(circle at 25% 30%, rgb(163 177 138 / 0.45), transparent 50%),
            radial-gradient(circle at 85% 70%, rgb(143 159 120 / 0.35), transparent 45%)`,
        }}
      />
      <div className="relative z-10 mx-auto max-w-4xl px-4 text-center sm:px-6">
        <motion.h2
          initial={{ opacity: 0, y: 14 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="font-display text-3xl font-semibold leading-tight text-white sm:text-4xl md:text-5xl"
        >
          Ready to turn intent into hires?
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.06 }}
          className="mx-auto mt-4 max-w-2xl text-base text-emerald-50/95 md:text-lg dark:text-emerald-200/90"
        >
          Join {BRANDING.appName} to connect talent and employers with AI-informed matching, polished pipelines, and hyperlocal discovery—without the legacy portal feel.
        </motion.p>
        <div className="mx-auto mt-6 inline-flex rounded-none border border-white/30 bg-white/10 px-4 py-1.5 text-xs font-medium text-emerald-50">
          Join as a job seeker or employer in under 2 minutes
        </div>
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.12 }}
          className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row"
        >
          <Link href="/auth/register?type=student" className="w-full sm:w-auto">
            <Button
              size="lg"
              className="h-12 w-full rounded-none border-0 bg-white px-6 text-sage-deep shadow-none hover:bg-emerald-50 dark:text-emerald-950 sm:w-auto"
            >
              I&apos;m looking for a role
            </Button>
          </Link>
          <Link href="/auth/register?type=corporate" className="w-full sm:w-auto">
            <Button
              size="lg"
              variant="outline"
              className="h-12 w-full rounded-none border-2 border-white/80 bg-transparent px-6 text-white shadow-none hover:bg-white/10 sm:w-auto"
            >
              I&apos;m hiring talent
            </Button>
          </Link>
        </motion.div>
      </div>
    </section>
  )
}
