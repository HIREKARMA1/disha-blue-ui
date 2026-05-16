'use client'

import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import Link from 'next/link'
import { Menu, type LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

export type MobileBottomNavTab = {
  label: string
  shortLabel?: string
  href: string
  icon: LucideIcon
  isActive: boolean
  onNavigate?: () => void
}

type MobileBottomNavProps = {
  tabs: MobileBottomNavTab[]
  moreLabel?: string
  onMoreClick?: () => void
}

function shortenLabel(label: string) {
  if (label.length <= 10) return label
  const words = label.split(' ')
  if (words.length > 1 && words[0].length <= 10) return words[0]
  return `${label.slice(0, 9)}…`
}

export function MobileBottomNav({ tabs, moreLabel = 'More', onMoreClick }: MobileBottomNavProps) {
  const showMore = Boolean(onMoreClick)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    document.body.classList.add('has-mobile-bottom-nav')
    return () => {
      document.body.classList.remove('has-mobile-bottom-nav')
    }
  }, [])

  // SSR + first client paint: render nothing (matches server HTML)
  if (!mounted) {
    return null
  }

  return createPortal(
    <nav
      className="student-mobile-nav fixed inset-x-0 bottom-0 z-[200] border-t border-slate-200 bg-white shadow-[0_-4px_24px_rgba(15,23,42,0.14)] dark:border-blue-900 dark:bg-slate-950 lg:hidden"
      style={{ paddingBottom: 'max(0.5rem, env(safe-area-inset-bottom))' }}
      aria-label="Main navigation"
    >
      <div className={cn('mx-auto grid h-[4.25rem] max-w-lg', showMore ? 'grid-cols-5' : 'grid-cols-4')}>
        {tabs.map((tab) => {
          const Icon = tab.icon
          return (
            <Link
              key={tab.href}
              href={tab.href}
              onClick={() => tab.onNavigate?.()}
              className={cn(
                'flex min-w-0 flex-col items-center justify-center gap-0.5 px-1 py-1.5 text-[10px] font-semibold leading-tight transition-colors',
                tab.isActive
                  ? 'text-blue-700 dark:text-blue-300'
                  : 'text-slate-600 hover:text-blue-700 dark:text-slate-400 dark:hover:text-blue-300',
              )}
            >
              <span
                className={cn(
                  'flex h-9 w-9 items-center justify-center rounded-2xl transition-colors',
                  tab.isActive
                    ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/70 dark:text-blue-100'
                    : 'text-slate-700 dark:text-slate-300',
                )}
              >
                <Icon className="h-[1.35rem] w-[1.35rem]" strokeWidth={2.25} aria-hidden />
              </span>
              <span className="max-w-full truncate">{tab.shortLabel ?? shortenLabel(tab.label)}</span>
            </Link>
          )
        })}
        {showMore ? (
          <button
            type="button"
            onClick={onMoreClick}
            className="flex min-w-0 flex-col items-center justify-center gap-0.5 px-1 py-1.5 text-[10px] font-semibold leading-tight text-slate-600 transition-colors hover:text-blue-700 dark:text-slate-400 dark:hover:text-blue-300"
          >
            <span className="flex h-9 w-9 items-center justify-center rounded-2xl text-slate-700 dark:text-slate-300">
              <Menu className="h-[1.35rem] w-[1.35rem]" strokeWidth={2.25} aria-hidden />
            </span>
            <span>{moreLabel}</span>
          </button>
        ) : null}
      </div>
    </nav>,
    document.body,
  )
}
