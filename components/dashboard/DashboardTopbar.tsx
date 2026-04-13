"use client"

import { useMemo } from "react"
import { usePathname } from "next/navigation"
import { CalendarDays } from "lucide-react"
import { useLocale } from "@/contexts/LocaleContext"
import { t } from "@/lib/i18n"
interface DashboardTopbarProps {
  role: "student" | "corporate" | "admin"
}

const roleMeta = {
 student: {
 label:"Student Workspace",
 description:"Track opportunities, applications, and career growth in one place.",
 },
 corporate: {
 label:"Recruiter Workspace",
 description:"Manage hiring pipelines, applicants, and role performance clearly.",
 },
 admin: {
 label:"Admin Workspace",
 description:"Oversee platform operations, quality, and reporting with confidence.",
 },
} as const

function prettifySegment(segment: string) {
  if (!segment) return "Overview"
  return segment.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())
}

export function DashboardTopbar({ role }: DashboardTopbarProps) {
 const pathname = usePathname()
 const { locale } = useLocale()
 const today = useMemo(
 () =>
 new Intl.DateTimeFormat("en-IN", {
 weekday:"short",
 month:"short",
 day:"numeric",
 }).format(new Date()),
 [],
 )

 const title = useMemo(() => {
 const segments = (pathname ||"").split("/").filter(Boolean)
 const roleIndex = segments.indexOf(role)
 const nextSegment = roleIndex >= 0 ? segments[roleIndex + 1] : undefined
 const fallback = prettifySegment(nextSegment ||"overview")
 const direct = t(locale, `dashboard.${(nextSegment ||"overview").toLowerCase()}`)
 return direct.includes(".") ? fallback : direct
 }, [pathname, role, locale])

 const meta = roleMeta[role]

 return (
 <section className="mb-2 border-b border-slate-100 pb-5 dark:border-emerald-800/45">
 <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
 <div className="min-w-0">
 <p className="text-xs font-semibold uppercase tracking-[0.16em] text-sage-deep">
 {role ==="student"? t(locale,"dashboard.labels.studentWorkspace")
 : role ==="corporate"? t(locale,"dashboard.labels.recruiterWorkspace")
 : t(locale,"dashboard.labels.adminWorkspace")}
 </p>
 <h1 className="mt-2 font-display text-2xl font-semibold tracking-tight text-slate-900 sm:text-[1.7rem]">
 {title}
 </h1>
 <p className="mt-1.5 max-w-2xl text-sm text-slate-600">{meta.description}</p>
 </div>
 <div className="inline-flex items-center rounded-full border border-slate-200/90 bg-sage px-3 py-1.5 text-xs font-medium text-slate-900 shadow-sm dark:border-emerald-700 dark:bg-emerald-900/70 dark:text-emerald-100">
 <CalendarDays className="mr-1.5 h-3.5 w-3.5 text-sage-deep"/>
 {today}
 </div>
 </div>
 </section>
 )
}
