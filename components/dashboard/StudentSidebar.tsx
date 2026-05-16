"use client"

import Link from 'next/link'
import {
  Compass,
  Home,
  UserCircle2,
  LogOut,
  ClipboardList,
  PanelLeftClose,
  PanelLeftOpen,
  type LucideIcon,
} from 'lucide-react'
import { usePathname } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { useLoading } from '@/contexts/LoadingContext'
import { cn } from '@/lib/utils'
import { useLocale } from '@/contexts/LocaleContext'
import { t } from '@/lib/i18n'
import { MobileBottomNav } from '@/components/dashboard/MobileBottomNav'
import { useStudentSidebarExpand } from '@/hooks/useStudentSidebarExpand'

interface NavItem {
  label: string
  href: string
  icon: LucideIcon
  aliases?: string[]
}

interface StudentSidebarProps {
  className?: string
}

const navItems: NavItem[] = [
  { label: 'Home', href: '/dashboard/student', icon: Home },
  {
    label: 'Local Jobs',
    href: '/dashboard/discover-jobs',
    aliases: ['/dashboard/student/jobs'],
    icon: Compass,
  },
  { label: 'Applications', href: '/dashboard/student/applications', icon: ClipboardList },
  { label: 'Profile', href: '/dashboard/student/profile', icon: UserCircle2 },
]

const bottomTabHrefs = [
  '/dashboard/student',
  '/dashboard/discover-jobs',
  '/dashboard/student/applications',
  '/dashboard/student/profile',
] as const

export function StudentSidebar({ className = '' }: StudentSidebarProps) {
  const pathname = usePathname()
  const { logout } = useAuth()
  const { startLoading } = useLoading()
  const { locale } = useLocale()
  const { expanded, toggle, hydrated } = useStudentSidebarExpand()

  const isItemActive = (item: NavItem) => {
    if (pathname === item.href) return true
    if (item.aliases?.includes(pathname || '')) return true
    if (
      item.href === '/dashboard/discover-jobs' &&
      (pathname?.startsWith('/dashboard/discover-jobs') ||
        pathname?.startsWith('/dashboard/student/jobs'))
    ) {
      return true
    }
    return false
  }

  const handleLogout = () => {
    logout()
  }

  const bottomTabs = bottomTabHrefs
    .map((href) => navItems.find((item) => item.href === href))
    .filter((item): item is NavItem => Boolean(item))

  const sidebarExpanded = hydrated ? expanded : true

  return (
    <>
      <aside
        className={cn(
          'student-sidebar fixed inset-y-0 left-0 z-40 hidden flex-col overflow-visible border-r border-slate-200/90 bg-slate-50 pt-16 transition-[width] duration-300 ease-in-out dark:border-slate-800 dark:bg-slate-950 lg:flex',
          sidebarExpanded ? 'w-60' : 'w-[4.25rem]',
          className,
        )}
      >
        <nav className="relative flex min-h-0 flex-1 flex-col px-2 py-4">
          <div className="flex min-h-0 flex-1 flex-col gap-1 overflow-y-auto overflow-x-hidden">
            {navItems.map((item) => {
              const isActive = isItemActive(item)
              const Icon = item.icon
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  title={!sidebarExpanded ? item.label : undefined}
                  onClick={() => !isActive && startLoading()}
                  className={cn(
                    'group relative flex shrink-0 items-center transition-colors duration-200',
                    sidebarExpanded
                      ? cn(
                          'h-11 w-full gap-3 rounded-lg px-3',
                          isActive
                            ? 'bg-primary-600 text-white shadow-sm'
                            : 'text-slate-800 hover:bg-slate-200/70 dark:text-slate-200 dark:hover:bg-slate-800',
                        )
                      : cn(
                          'mx-auto h-11 w-11 justify-center rounded-lg',
                          isActive
                            ? 'bg-primary-600 text-white shadow-sm'
                            : 'text-slate-600 hover:bg-slate-200/80 dark:text-slate-400 dark:hover:bg-slate-800',
                        ),
                  )}
                >
                  <Icon className="h-5 w-5 shrink-0" strokeWidth={1.75} aria-hidden />
                  <span
                    className={cn(
                      'truncate text-sm font-medium transition-all duration-200',
                      sidebarExpanded ? 'opacity-100' : 'pointer-events-none w-0 overflow-hidden opacity-0',
                    )}
                  >
                    {item.label}
                  </span>
                </Link>
              )
            })}
          </div>

          <div className="mt-3 border-t border-slate-200/90 pt-3 dark:border-slate-800">
            <button
              type="button"
              title={t(locale, 'dashboard.labels.logout')}
              onClick={handleLogout}
              className={cn(
                'flex w-full items-center text-slate-700 transition-colors hover:text-slate-900 dark:text-slate-300 dark:hover:text-white',
                sidebarExpanded
                  ? 'h-11 gap-3 rounded-lg px-3 hover:bg-slate-200/70 dark:hover:bg-slate-800'
                  : 'mx-auto h-11 w-11 justify-center rounded-lg hover:bg-slate-200/80 dark:hover:bg-slate-800',
              )}
            >
              <LogOut className="h-5 w-5 shrink-0" strokeWidth={1.75} />
              <span
                className={cn(
                  'truncate text-sm font-medium transition-all duration-200',
                  sidebarExpanded ? 'opacity-100' : 'pointer-events-none w-0 overflow-hidden opacity-0',
                )}
              >
                {t(locale, 'dashboard.labels.logout')}
              </span>
            </button>
          </div>

          <button
            type="button"
            onClick={toggle}
            aria-expanded={sidebarExpanded}
            aria-label={sidebarExpanded ? 'Collapse sidebar' : 'Expand sidebar'}
            className={cn(
              'absolute z-50 flex h-7 w-7 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-700 shadow-md transition-colors hover:bg-slate-50 hover:text-primary-600 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800',
              sidebarExpanded ? '-right-3.5 top-6' : '-right-3.5 top-6',
            )}
          >
            {sidebarExpanded ? (
              <PanelLeftClose className="h-4 w-4" strokeWidth={2} aria-hidden />
            ) : (
              <PanelLeftOpen className="h-4 w-4" strokeWidth={2} aria-hidden />
            )}
          </button>
        </nav>
      </aside>

      <MobileBottomNav
        tabs={bottomTabs.map((item) => ({
          label: item.label,
          shortLabel:
            item.href === '/dashboard/discover-jobs'
              ? 'Jobs'
              : item.href === '/dashboard/student/applications'
                ? 'Apps'
                : item.href === '/dashboard/student/profile'
                  ? 'Profile'
                  : undefined,
          href: item.href,
          icon: item.icon,
          isActive: isItemActive(item),
          onNavigate: () => !isItemActive(item) && startLoading(),
        }))}
      />
    </>
  )
}
