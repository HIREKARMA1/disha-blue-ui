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
        <div className={cn('min-h-svh bg-background text-foreground', className)}>
            <Navbar variant="solid" />

            <div className="grid min-h-[calc(100svh-5.5rem)] lg:min-h-[calc(100svh-5rem)] lg:grid-cols-2">
                <aside className="relative hidden overflow-hidden border-border lg:flex lg:flex-col lg:justify-between lg:border-r lg:px-10 lg:py-12 xl:px-14 xl:py-16">
                    <div
                        className="pointer-events-none absolute inset-0 bg-gradient-to-br from-primary/[0.11] via-background to-secondary/[0.14] dark:from-primary/[0.18] dark:via-background dark:to-secondary/[0.12]"
                        aria-hidden
                    />
                    <div
                        className="pointer-events-none absolute -right-24 top-0 h-80 w-80 rounded-full bg-primary/25 blur-3xl dark:bg-primary/20"
                        aria-hidden
                    />
                    <div
                        className="pointer-events-none absolute -bottom-16 left-1/4 h-64 w-64 rounded-full bg-secondary/20 blur-3xl dark:bg-secondary/15"
                        aria-hidden
                    />

                    <div className="relative z-[1]">
                        <p className="font-display text-[11px] font-semibold uppercase tracking-[0.22em] text-primary">
                            {BRANDING.appName}
                        </p>
                        <h2 className="font-display mt-5 text-balance text-3xl font-bold tracking-tight text-foreground xl:text-4xl">
                            {brandHeadline}
                        </h2>
                        <p className="mt-4 max-w-md text-pretty text-base leading-relaxed text-muted-foreground">
                            {sub}
                        </p>

                        <ul className="mt-10 max-w-md space-y-3">
                            {brandBullets.map((line) => (
                                <li key={line} className="flex gap-3 text-sm text-foreground/90">
                                    <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/15 text-primary">
                                        <Check className="h-3 w-3 stroke-[2.5]" aria-hidden />
                                    </span>
                                    <span className="leading-snug">{line}</span>
                                </li>
                            ))}
                        </ul>
                    </div>

                    <p className="relative z-[1] text-xs text-muted-foreground">
                        © {new Date().getFullYear()} {BRANDING.appName}
                    </p>
                </aside>

                <div className="relative flex flex-col px-4 pb-12 pt-24 sm:px-6 sm:pt-28 lg:px-12 lg:pb-16 lg:pt-28 xl:px-16">
                    {showBackLink && (
                        <Link
                            href={backHref}
                            className="mb-6 inline-flex w-fit items-center gap-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
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
