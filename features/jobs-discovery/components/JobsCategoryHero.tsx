"use client"

import {
  GraduationCap,
  IndianRupee,
  MapPin,
  Sparkles,
  UserRound,
  Zap,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { JobsHeroIllustration } from "./JobsHeroIllustration"

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
  const chips = [
    { label: "Location", value: locationLabel, icon: MapPin },
    { label: "Role", value: roleLabel, icon: UserRound },
    { label: "Response", value: "Under 30 mins", icon: Zap },
  ]

  const stats = [
    { icon: IndianRupee, title: "Salary range", value: salaryRangeLabel },
    { icon: Sparkles, title: "Top skills", value: skillsLabel },
    { icon: GraduationCap, title: "Documents", value: documentsLabel },
  ]

  return (
    <section
      className={cn(
        "overflow-hidden rounded-2xl border border-primary-700/25 shadow-lg",
        className,
      )}
    >
      <div className="relative bg-gradient-to-br from-primary-700 via-primary-600 to-primary-500 px-5 py-6 sm:px-8 sm:py-8">
        <div className="relative z-[1] flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between lg:gap-8">
          <div className="max-w-2xl flex-1">
            <h1 className="text-2xl font-bold leading-tight text-white sm:text-3xl">{title}</h1>
            <p className="mt-3 text-sm leading-relaxed text-blue-100/95 sm:text-base">{description}</p>
            <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:flex-wrap">
              {chips.map((chip) => (
                <span
                  key={chip.label}
                  className="inline-flex items-center gap-2 rounded-lg border border-white/20 bg-white/10 px-3 py-2 text-xs font-medium text-white backdrop-blur-sm sm:rounded-md"
                >
                  <chip.icon className="h-3.5 w-3.5 shrink-0 text-blue-200" aria-hidden />
                  <span>
                    <span className="font-semibold uppercase tracking-wide text-blue-200/90">
                      {chip.label}:
                    </span>{" "}
                    {chip.value}
                  </span>
                </span>
              ))}
            </div>
          </div>
          <JobsHeroIllustration className="hidden h-36 w-36 shrink-0 lg:block" />
        </div>
      </div>

      <div className="grid grid-cols-1 divide-y divide-[#dde3f5] bg-white sm:grid-cols-3 sm:divide-x sm:divide-y-0 dark:divide-blue-900/60 dark:bg-slate-900">
        {stats.map((item) => (
          <div key={item.title} className="flex gap-3 px-5 py-4 sm:px-6">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#e8f0ff] text-primary-600 dark:bg-blue-900/50 dark:text-blue-300">
              <item.icon className="h-5 w-5" aria-hidden />
            </span>
            <div className="min-w-0">
              <p className="text-xs font-semibold uppercase tracking-wide text-[#7a85a8] dark:text-blue-300/80">
                {item.title}
              </p>
              <p className="mt-0.5 text-sm font-semibold leading-snug text-[#0a0e1a] dark:text-blue-50">
                {item.value}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
