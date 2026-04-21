"use client"

import { useEffect, useRef, useState } from "react"
import { motion, useInView, useScroll, useSpring } from "framer-motion"

const highlights = [
  {
    id: "01",
    title: "AI matching & signals",
    description: "Surface roles and candidates with fit context-not just filters.",
  },
  {
    id: "02",
    title: "Hyperlocal discovery",
    description: "Structured locations from state to village.",
  },
  {
    id: "03",
    title: "Resume & readiness",
    description: "Keep profiles polished with builder tools.",
  },
  {
    id: "04",
    title: "Recruiter-grade pipeline",
    description: "Kanban-friendly stages with clear ownership.",
  },
  {
    id: "05",
    title: "Collaborative hiring",
    description: "Share context across reviewers seamlessly.",
  },
  {
    id: "06",
    title: "Operational analytics",
    description: "Understand funnel health and hiring performance.",
  },
]

export default function FeaturesSection() {
  const [activeIndex, setActiveIndex] = useState(0)
  const listRef = useRef<HTMLDivElement | null>(null)
  const { scrollYProgress } = useScroll({
    target: listRef,
    offset: ["start 70%", "end 35%"],
  })
  const progress = useSpring(scrollYProgress, {
    stiffness: 130,
    damping: 26,
    mass: 0.24,
  })

  return (
    <section id="features" className="scroll-mt-24 bg-[#f8f9f7] py-16 md:py-24">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-12 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.15fr)] lg:gap-16">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="lg:sticky lg:top-28 lg:self-start"
          >
            <p className="text-[11px] font-semibold uppercase tracking-[0.26em] text-slate-500">PLATFORM</p>
            <h2 className="mt-4 text-balance font-display text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl md:leading-[1.06]">
              Everything you need to run modern hiring
            </h2>
            <p className="mt-4 max-w-[36ch] text-pretty text-slate-600 md:text-lg">
              A cohesive product layer for discovery, application, and pipeline-without duct-taping tools together.
            </p>
          </motion.div>

          <div ref={listRef} className="relative pl-8 sm:pl-10">
            <div className="absolute bottom-1 left-2 top-1 w-px bg-slate-200/85" aria-hidden />
            <motion.div
              style={{ scaleY: progress }}
              className="absolute bottom-1 left-2 top-1 w-px origin-top bg-slate-400/50"
              aria-hidden
            />

            <div className="space-y-14 md:space-y-16">
              {highlights.map((item, i) => (
                <FeatureItem
                  key={item.title}
                  item={item}
                  index={i}
                  active={activeIndex === i}
                  onActive={setActiveIndex}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

function FeatureItem({
  item,
  index,
  active,
  onActive,
}: {
  item: { id: string; title: string; description: string }
  index: number
  active: boolean
  onActive: (index: number) => void
}) {
  const ref = useRef<HTMLDivElement | null>(null)
  const inView = useInView(ref, { amount: 0.62 })

  useEffect(() => {
    if (inView) onActive(index)
  }, [inView, index, onActive])

  return (
    <motion.article
      ref={ref}
      initial={{ opacity: 0, y: 14 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.35 }}
      transition={{
        duration: 0.42,
        delay: index * 0.04,
        ease: [0.22, 1, 0.36, 1],
      }}
      className="group relative"
    >
      <motion.span
        animate={{
          opacity: active ? 1 : 0.45,
          scale: active ? 1 : 0.86,
          backgroundColor: active ? "rgba(15,23,42,0.78)" : "rgba(148,163,184,0.65)",
        }}
        transition={{ duration: 0.26, ease: [0.22, 1, 0.36, 1] }}
        className="absolute -left-[1.58rem] top-[0.45rem] h-2.5 w-2.5 rounded-full"
      />

      <p className="text-[11px] font-medium uppercase tracking-[0.15em] text-slate-400">{item.id}</p>
      <h3
        className={`mt-2 font-display text-2xl font-semibold tracking-tight transition-colors duration-300 ${
          active ? "text-slate-950" : "text-slate-700"
        }`}
      >
        {item.title}
      </h3>
      <p
        className={`mt-3 max-w-[44ch] leading-relaxed transition-colors duration-300 ${
          active ? "text-slate-600" : "text-slate-500/85"
        }`}
      >
        {item.description}
      </p>
    </motion.article>
  )
}
