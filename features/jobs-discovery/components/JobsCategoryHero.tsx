"use client"

import { Briefcase, FileText, IndianRupee, Sparkles } from "lucide-react"
import { cn } from "@/lib/utils"

type Props = {
  title: string
  description: string
  locationLabel: string
  roleLabel: string
  salaryRangeLabel: string
  skillsLabel: string
  documentsLabel?: string
  className?: string
}

export function JobsCategoryHero({
  title,
  description,
  locationLabel,
  roleLabel,
  salaryRangeLabel,
  skillsLabel,
  documentsLabel = "Aadhaar · Resume · Education certificates",
  className,
}: Props) {
  return (
    <section className={cn("overflow-hidden rounded-2xl border border-[#0041a3]/30 shadow-lg", className)}>
      <div className="relative bg-gradient-to-br from-[#0052cc] via-[#0066e0] to-[#0070f3] px-5 py-6 sm:px-8 sm:py-8">
        <div className="relative z-[1] flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-2xl">
            <h1 className="text-2xl font-bold leading-tight text-white sm:text-3xl">{title}</h1>
            <p className="mt-3 text-sm leading-relaxed text-blue-100/95 sm:text-base">{description}</p>
            <div className="mt-4 flex flex-wrap gap-2">
              {[
                { label: "Location", value: locationLabel },
                { label: "Role", value: roleLabel },
                { label: "Response", value: "Under 30 mins" },
              ].map((chip) => (
                <span
                  key={chip.label}
                  className="rounded-full border border-white/25 bg-white/10 px-3 py-1 text-xs font-medium text-white"
                >
                  <span className="text-blue-200/90">{chip.label}:</span> {chip.value}
                </span>
              ))}
            </div>
          </div>
          <div
            className="mx-auto flex h-28 w-28 shrink-0 items-center justify-center rounded-full bg-white/15 ring-2 ring-white/20 sm:h-32 sm:w-32 lg:mx-0"
            aria-hidden
          >
            <Briefcase className="h-14 w-14 text-white/90 sm:h-16 sm:w-16" strokeWidth={1.25} />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 divide-y divide-[#dde3f5] bg-white sm:grid-cols-3 sm:divide-x sm:divide-y-0 dark:divide-blue-900/60 dark:bg-slate-900">
        {[
          { icon: IndianRupee, title: "Salary range", value: salaryRangeLabel },
          { icon: Sparkles, title: "Top skills", value: skillsLabel },
          { icon: FileText, title: "Documents", value: documentsLabel },
        ].map((item) => (
          <div key={item.title} className="flex gap-3 px-5 py-4 sm:px-6">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#e8f0ff] text-[#0070f3] dark:bg-blue-900/50 dark:text-blue-300">
              <item.icon className="h-5 w-5" aria-hidden />
            </span>
            <div className="min-w-0">
              <p className="text-xs font-semibold uppercase tracking-wide text-[#7a85a8]">{item.title}</p>
              <p className="mt-0.5 text-sm font-semibold leading-snug text-[#0a0e1a] dark:text-blue-50">{item.value}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
