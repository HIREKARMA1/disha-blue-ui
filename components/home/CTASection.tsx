"use client"

import { motion } from "framer-motion"
import { ArrowRight } from "lucide-react"
import Link from "next/link"
import { BRANDING } from "@/config/branding"
import { Button } from "@/components/ui/button"

export default function CTASection() {
  return (
    <section className="relative overflow-hidden bg-foreground py-16 text-background md:py-24 dark:bg-zinc-950">
      <div
        className="pointer-events-none absolute inset-0 opacity-40"
        style={{
          backgroundImage: `radial-gradient(circle at 30% 20%, hsl(258 90% 59% / 0.35), transparent 45%),
            radial-gradient(circle at 80% 80%, hsl(187 92% 41% / 0.3), transparent 40%)`,
        }}
      />
      <div className="relative z-10 mx-auto max-w-4xl px-4 text-center sm:px-6">
        <motion.h2
          initial={{ opacity: 0, y: 14 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="font-display text-3xl font-semibold leading-tight sm:text-4xl md:text-5xl"
        >
          Ready to turn intent into hires?
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.06 }}
          className="mx-auto mt-4 max-w-2xl text-base text-zinc-300 md:text-lg"
        >
          Join {BRANDING.appName} to connect talent and employers with AI-informed matching,
          polished pipelines, and hyperlocal discovery—without the legacy portal feel.
        </motion.p>
        <div className="mx-auto mt-6 inline-flex rounded-full border border-white/20 bg-white/5 px-4 py-1.5 text-xs font-medium text-zinc-200">
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
              className="h-12 w-full rounded-full border-0 bg-background px-6 text-foreground shadow-medium hover:bg-background/90 sm:w-auto"
            >
              I&apos;m looking for a role
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
          <Link href="/auth/register?type=corporate" className="w-full sm:w-auto">
            <Button
              size="lg"
              variant="outline"
              className="h-12 w-full rounded-full border-2 border-white/40 bg-transparent px-6 text-white hover:bg-white/10 sm:w-auto"
            >
              I&apos;m hiring talent
            </Button>
          </Link>
        </motion.div>
      </div>
    </section>
  )
}
