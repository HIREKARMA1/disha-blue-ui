"use client"

import { useRef } from "react"
import { motion, useScroll, useSpring } from "framer-motion"

const forTalent = [
  {
    step: "01",
    title: "Create your profile",
    body: "Structured profile for smarter matching.",
  },
  {
    step: "02",
    title: "Get AI-informed matches",
    body: "Roles ranked by fit, location, and timing.",
  },
  {
    step: "03",
    title: "Apply with context",
    body: "Track every application with clarity.",
  },
  {
    step: "04",
    title: "Grow your career",
    body: "Tools and insights to keep momentum.",
  },
]

const forRecruiters = [
  {
    step: "01",
    title: "Publish structured roles",
    body: "Rich job posts with skills and compensation.",
  },
  {
    step: "02",
    title: "Discover talent",
    body: "Modern search and pipeline workflows.",
  },
  {
    step: "03",
    title: "Track every applicant",
    body: "Stages, notes, and history—no spreadsheets.",
  },
  {
    step: "04",
    title: "Hire with signal",
    body: "Clear insights for better hiring decisions.",
  },
]

type Step = {
  step: string
  title: string
  body: string
}

export default function HowItsWork() {
  return (
    <motion.section
      id="how-it-works"
      initial={{ opacity: 0, y: 14 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.58, ease: [0.22, 1, 0.36, 1] }}
      className="scroll-mt-24 bg-[#f8f9f7] py-16 md:py-24"
    >
      <div
        className="pointer-events-none absolute inset-0 -z-10 bg-[linear-gradient(to_bottom,rgba(15,23,42,0.016)_0%,rgba(15,23,42,0.006)_22%,rgba(15,23,42,0)_42%)]"
        aria-hidden
      />
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-slate-500">HOW IT WORKS</p>
          <h2 className="mt-4 text-balance font-display text-3xl font-semibold tracking-tight text-slate-950 leading-[1.08] sm:text-4xl md:text-5xl md:leading-[1.03]">
            Two journeys, one connected platform
          </h2>
          <p className="mx-auto mt-4 max-w-[66ch] text-pretty text-slate-600 md:text-lg">
            Candidates get clarity. Recruiters get control. Everyone gets a product that feels intentional—not pieced together.
          </p>
          <div className="mx-auto mt-7 h-px w-full max-w-2xl bg-slate-200/70" aria-hidden />
        </div>

        <div className="mt-12 grid items-start gap-10 lg:grid-cols-2 lg:gap-[4.25rem]">
          <JourneyColumn
            category="FOR TALENT"
            title="Students & job seekers"
            steps={forTalent}
            delay={0.04}
          />
          <JourneyColumn
            category="FOR HIRING TEAMS"
            title="Employers & recruiters"
            steps={forRecruiters}
            delay={0.16}
          />
        </div>
      </div>
    </motion.section>
  )
}

function JourneyColumn({
  category,
  title,
  steps,
  delay,
}: {
  category: string
  title: string
  steps: Step[]
  delay?: number
}) {
  const timelineRef = useRef<HTMLUListElement | null>(null)
  const { scrollYProgress } = useScroll({
    target: timelineRef,
    offset: ["start 78%", "end 35%"],
  })

  const progress = useSpring(scrollYProgress, {
    stiffness: 130,
    damping: 24,
    mass: 0.2,
  })

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.28 }}
      transition={{ duration: 0.5, delay, ease: [0.22, 1, 0.36, 1] }}
      className="min-w-0 h-full"
    >
      <div className="mb-7 min-h-[4.85rem] sm:min-h-[5.2rem]">
        <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-500">{category}</p>
        <h3 className="mt-2 font-display text-2xl font-semibold tracking-tight leading-[1.12] text-slate-950 sm:text-[1.82rem]">
          {title}
        </h3>
      </div>

      <ul ref={timelineRef} className="relative space-y-[1.65rem] pl-[2.35rem]">
        <div className="absolute bottom-[1.12rem] left-[0.90625rem] top-[0.5rem] w-px bg-slate-200/70" aria-hidden />
        <motion.div
          style={{ scaleY: progress }}
          transition={{ duration: 0.38, ease: [0.22, 1, 0.36, 1] }}
          className="absolute bottom-[1.12rem] left-[0.90625rem] top-[0.5rem] w-px origin-top bg-slate-400/35"
          aria-hidden
        />
        {steps.map((item, idx) => (
          <StepRow key={item.step} step={item} index={idx} />
        ))}
      </ul>
    </motion.div>
  )
}

function StepRow({ step, index }: { step: Step; index: number }) {
  return (
    <motion.li
      initial={{ opacity: 0, y: 5 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.5 }}
      transition={{
        duration: 0.36,
        delay: index * 0.052 + (index % 2 === 0 ? 0.01 : 0.022),
        ease: [0.22, 1, 0.36, 1],
      }}
      className="group relative flex items-start gap-[0.95rem] rounded-md px-[0.4rem] py-[0.28rem] transition-colors duration-300 ease-out hover:bg-white/45"
    >
      <span className="relative z-10 inline-flex w-[2.35rem] shrink-0 text-sm font-medium tabular-nums tracking-[0.09em] text-slate-400/85 transition-colors duration-300 ease-out group-hover:text-slate-500/95">
        {step.step}
      </span>
      <div className="min-w-0">
        <motion.h4
          whileHover={{ x: 4 }}
          transition={{ duration: 0.26, ease: [0.22, 1, 0.36, 1] }}
          className="text-base font-semibold text-slate-950 transition-colors duration-300 ease-out group-hover:text-slate-900"
        >
          {step.title}
        </motion.h4>
        <p className="mt-[0.32rem] max-w-[33ch] text-sm leading-[1.55] text-slate-500">{step.body}</p>
      </div>
    </motion.li>
  )
}
