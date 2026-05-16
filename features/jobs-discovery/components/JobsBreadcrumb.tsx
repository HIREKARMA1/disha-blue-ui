"use client"

import Link from "next/link"
import { ChevronRight, Home } from "lucide-react"
import { cn } from "@/lib/utils"

type Crumb = {
  label: string
  href?: string
}

type Props = {
  items: Crumb[]
  homeHref?: string
  className?: string
}

export function JobsBreadcrumb({ items, homeHref = "/dashboard/student", className }: Props) {
  return (
    <nav
      className={cn(
        "flex flex-wrap items-center gap-1 text-xs font-medium text-[#7a85a8] sm:text-sm dark:text-blue-300/80",
        className,
      )}
      aria-label="Breadcrumb"
    >
      <Link
        href={homeHref}
        className="inline-flex items-center gap-1 transition hover:text-primary-600 dark:hover:text-primary-400"
      >
        <Home className="h-3.5 w-3.5 shrink-0 sm:h-4 sm:w-4" aria-hidden />
        Home
      </Link>
      {items.map((item, i) => (
        <span key={`${item.label}-${i}`} className="inline-flex items-center gap-1">
          <ChevronRight className="h-3 w-3 shrink-0 opacity-60" aria-hidden />
          {item.href ? (
            <Link href={item.href} className="transition hover:text-primary-600 dark:hover:text-primary-400">
              {item.label}
            </Link>
          ) : (
            <span className="font-semibold text-[#0a0e1a] dark:text-white">{item.label}</span>
          )}
        </span>
      ))}
    </nav>
  )
}
