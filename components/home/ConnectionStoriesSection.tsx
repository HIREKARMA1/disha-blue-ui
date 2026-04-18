"use client"

import Image from "next/image"
import { motion } from "framer-motion"
const stories = [
  {
    src: "/home/mentorship-collaboration.png",
    alt: "Mentor and learner reviewing work together at a laptop in a modern office",
    eyebrow: "Guidance that lands",
    title: "Learn beside people who have done the work",
    body: "Students and early-career talent grow faster when hiring teams and mentors share context—not just job titles. HireKarma keeps that relationship visible from first conversation to offer.",
  },
  {
    src: "/home/placement-handshake.png",
    alt: "Professional handshake between a job seeker and employer after a successful meeting",
    eyebrow: "Outcomes you can feel",
    title: "When the match is right, everyone wins",
    body: "The platform exists to turn structured profiles and clear pipelines into real moments: confidence at the desk, a firm handshake, and a path forward for both sides.",
  },
] as const

export default function ConnectionStoriesSection() {
  return (
    <section
      className="bg-sage/10 py-16 dark:bg-emerald-900/25 md:py-24"
      aria-labelledby="connection-stories-heading"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-sage-deep dark:text-emerald-300">People first</p>
          <h2
            id="connection-stories-heading"
            className="mt-3 font-display text-3xl font-semibold tracking-tight text-slate-900 md:text-4xl dark:text-emerald-50"
          >
            Built on real relationships between talent and employers
          </h2>
          <p className="mt-3 text-slate-600 md:text-lg dark:text-emerald-200/85">
            Hiring is never only software—these are the moments we design for: mentorship at the screen, and trust across the table.
          </p>
        </div>

        <div className="mt-14 grid gap-10 lg:grid-cols-2 lg:gap-12 lg:items-stretch">
          {stories.map((item, index) => (
              <motion.article
                key={item.src}
                initial={{ opacity: 0, y: 18 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{ duration: 0.45, delay: index * 0.08 }}
                className="group flex flex-col overflow-hidden rounded-none border border-slate-200 bg-white shadow-none dark:border-emerald-800 dark:bg-emerald-950/60"
              >
                <div className="relative aspect-[16/10] w-full overflow-hidden bg-slate-100 dark:bg-emerald-900/40">
                  <Image
                    src={item.src}
                    alt={item.alt}
                    fill
                    className="object-cover object-center transition-transform duration-500 group-hover:scale-[1.02]"
                    sizes="(max-width: 1024px) 100vw, 50vw"
                    priority={index === 0}
                  />
                  <div
                    className="pointer-events-none absolute inset-0 bg-gradient-to-t from-sage-deep/25 via-transparent to-transparent opacity-80 dark:from-emerald-950/50"
                    aria-hidden
                  />
                </div>
                <div className="flex flex-1 flex-col border-t border-slate-200 p-6 sm:p-8 dark:border-emerald-800">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-sage-deep dark:text-emerald-300">{item.eyebrow}</p>
                  <h3 className="mt-3 font-display text-xl font-semibold text-slate-900 sm:text-2xl dark:text-emerald-50">{item.title}</h3>
                  <p className="mt-3 flex-1 text-sm leading-relaxed text-slate-600 sm:text-base dark:text-emerald-200/85">{item.body}</p>
                </div>
              </motion.article>
          ))}
        </div>
      </div>
    </section>
  )
}
