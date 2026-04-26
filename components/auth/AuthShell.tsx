"use client"

import Link from 'next/link'
import { ArrowLeft, Check } from 'lucide-react'

import { BRANDING } from '@/config/branding'
import { cn } from '@/lib/utils'
import { Navbar } from '@/components/ui/navbar'

export type AuthShellProps = {
  children: React.ReactNode
  /** Wider main column for long forms (e.g. register). */
  wide?: boolean
  showBackLink?: boolean
  backHref?: string
  brandHeadline?: string
  brandSub?: string
  brandBullets?: string[]
  className?: string
}

const defaultBullets = [
  'Secure access with encrypted sessions',
  'Role-aware flows for students and employers',
  'Built for real hiring and career outcomes',
]

export function AuthShell({
  children,
  wide = false,
  showBackLink = true,
  backHref = '/',
  brandHeadline = 'Move faster on the work that matters.',
  brandSub,
  brandBullets = defaultBullets,
  className,
}: AuthShellProps) {
  const sub = brandSub ?? BRANDING.tagline

  return (
    <div className={cn('min-h-svh bg-white text-slate-900 dark:bg-slate-950 dark:text-blue-50', className)}>
      <Navbar variant="transparent" />

      <div className="grid min-h-[calc(100svh-5.5rem)] lg:min-h-[calc(100svh-5rem)] lg:grid-cols-2">
        <aside
          className="relative hidden overflow-hidden border-slate-200 bg-sage/25 dark:border-blue-900 lg:flex lg:flex-col lg:justify-between lg:border-r lg:px-10 lg:py-12 xl:px-14 xl:py-16 dark:bg-blue-950"
        >
          <div className="relative z-[1]">
            <p className="font-display text-[11px] font-semibold uppercase tracking-[0.22em] text-sage-deep dark:text-blue-300">
              {BRANDING.appName}
            </p>
            <h2 className="font-display mt-5 text-balance text-3xl font-bold tracking-tight text-slate-900 xl:text-4xl dark:text-blue-50">
              {brandHeadline}
            </h2>
            <p className="mt-4 max-w-md text-pretty text-base leading-relaxed text-slate-700 dark:text-blue-200/90">
              {sub}
            </p>

            <ul className="mt-10 max-w-md space-y-3">
              {brandBullets.map((line) => (
                <li key={line} className="flex gap-3 text-sm text-slate-800 dark:text-blue-100">
                  <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-none border border-sage-deep/40 bg-white text-sage-deep dark:border-blue-700 dark:bg-blue-900/70 dark:text-blue-200">
                    <Check className="h-3 w-3 stroke-[2.5]" aria-hidden />
                  </span>
                  <span className="leading-snug">{line}</span>
                </li>
              ))}
            </ul>
          </div>

          <p className="relative z-[1] text-xs text-slate-600 dark:text-blue-400">
            © {new Date().getFullYear()} {BRANDING.appName}
          </p>
        </aside>

        <div className="relative flex flex-col bg-white px-4 pb-12 pt-24 dark:bg-slate-950 sm:px-6 sm:pt-28 lg:px-12 lg:pb-16 lg:pt-28 xl:px-16">
          {showBackLink && (
            <Link
              href={backHref}
              className="mb-6 inline-flex w-fit items-center gap-1.5 text-sm font-medium text-slate-600 transition-colors hover:text-sage-deep dark:text-blue-300 dark:hover:text-white"
            >
              <ArrowLeft className="h-4 w-4 shrink-0" aria-hidden />
              Back to home
            </Link>
          )}

          <div
            className={cn(
              'mx-auto flex w-full flex-1 flex-col justify-center',
              wide ? 'max-w-lg xl:max-w-xl' : 'max-w-[440px]',
            )}
          >
            {children}
          </div>
        </div>
      </div>
    </div>
  )
}
