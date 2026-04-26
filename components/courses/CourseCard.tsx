"use client"

import { Briefcase, Clock4, ExternalLink } from "lucide-react"
import { CourseItem } from "@/components/courses/types"

interface CourseCardProps {
  course: CourseItem
}

export function CourseCard({ course }: CourseCardProps) {
  const costTone =
    course.cost === "Free"
      ? "bg-emerald-50 text-emerald-700 ring-emerald-200 dark:bg-emerald-900/40 dark:text-emerald-200 dark:ring-emerald-700/60"
      : course.cost === "Low-cost"
        ? "bg-amber-50 text-amber-700 ring-amber-200 dark:bg-amber-900/30 dark:text-amber-200 dark:ring-amber-700/60"
        : "bg-slate-100 text-slate-700 ring-slate-200 dark:bg-slate-800/70 dark:text-slate-200 dark:ring-slate-700"

  return (
    <article className="group relative overflow-hidden rounded-2xl border border-slate-200/90 bg-gradient-to-b from-white to-slate-50/80 p-5 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-slate-300/30 dark:border-emerald-800/70 dark:from-emerald-950/40 dark:to-emerald-950/70 dark:hover:shadow-emerald-900/20">
      <div className="mb-3 flex items-start justify-between gap-2">
        <span className="inline-flex items-center rounded-full bg-sage/15 px-2.5 py-1 text-[11px] font-semibold tracking-wide text-sage-deep ring-1 ring-sage/25 dark:bg-emerald-900/50 dark:text-emerald-200 dark:ring-emerald-800">
          {course.jobRole}
        </span>
        <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-semibold ring-1 ${costTone}`}>
          {course.cost}
        </span>
      </div>

      <h3 className="line-clamp-2 text-lg font-semibold leading-tight text-slate-900 dark:text-emerald-50">{course.title}</h3>
      <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-slate-600 dark:text-emerald-200/80">{course.description}</p>

      <div className="mt-4 space-y-2 rounded-xl border border-slate-200/70 bg-white/70 p-3 text-xs text-slate-700 dark:border-emerald-800/60 dark:bg-emerald-900/20 dark:text-emerald-100">
        <p className="flex items-center gap-2">
          <Clock4 className="h-3.5 w-3.5 text-sage-deep dark:text-emerald-300" />
          <span className="font-medium">{course.duration}</span>
          <span className="text-slate-400 dark:text-emerald-500/70">•</span>
          <span>{course.level}</span>
        </p>
        <p className="flex items-center gap-2">
          <Briefcase className="h-3.5 w-3.5 text-sage-deep dark:text-emerald-300" />
          <span>{course.platform}</span>
        </p>
      </div>

      <a
        href={course.link}
        target="_blank"
        rel="noreferrer"
        className="mt-4 inline-flex w-full items-center justify-center gap-1.5 rounded-xl bg-sage-deep px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-sage-deep/90 group-hover:shadow-md dark:bg-emerald-600 dark:hover:bg-emerald-500"
      >
        {course.ctaLabel || "Watch / Enroll"} <ExternalLink className="h-3.5 w-3.5" />
      </a>
    </article>
  )
}
