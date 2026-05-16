"use client"

import {
  Compass,
  Home,
  UserCircle2,
  LogOut,
  ClipboardList,
  type LucideIcon,
} from 'lucide-react'
import { usePathname } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { useLoading } from '@/contexts/LoadingContext'
import { cn } from '@/lib/utils'
import { useLocale } from '@/contexts/LocaleContext'
import { t } from '@/lib/i18n'
import { SidebarRailHoverCard } from '@/components/dashboard/SidebarRailHoverCard'
import { MobileBottomNav } from '@/components/dashboard/MobileBottomNav'

interface NavItem {
  label: string
  href: string
  icon: LucideIcon
  description: string
  aliases?: string[]
}

interface NavGroup {
  title: string
  items: NavItem[]
}

interface StudentSidebarProps {
  className?: string
}

export function StudentSidebar({ className = '' }: StudentSidebarProps) {
  const pathname = usePathname()
  const { logout } = useAuth()
  const { startLoading } = useLoading()
  const { locale } = useLocale()
  const navGroups: NavGroup[] = [
    {
      title: 'Overview',
      items: [
        { label: 'Home', href: '/dashboard/student', icon: Home, description: 'Your career control center' },
        { label: 'Profile', href: '/dashboard/student/profile', icon: UserCircle2, description: 'Personal details and identity' },
        { label: 'Applications', href: '/dashboard/student/applications', icon: ClipboardList, description: 'Track your pipeline status' },
        {
          label: 'Local Jobs',
          href: '/dashboard/discover-jobs',
          aliases: ['/dashboard/student/jobs'],
          icon: Compass,
          description: 'Local and personalized roles',
        },
      ],
    },
  ]

  // Hidden nav items — restore when re-enabling features
  // { label:'AI Interview Session', href:'/dashboard/student/career-align', icon: MessagesSquare, ... },
  // { label:'AI Communication Assessments', href:'/ai-communication', icon: Mic, ... },
  // { label:'Build with AI', href:'/dashboard/student/resume/ai', icon: Bot, ... },
  // { label:'Resume Builder', href:'/dashboard/student/resume-builder', icon: FileText, ... },
  // { label:'Courses', href:'/dashboard/student/courses', aliases: ['/courses', '/dashboard/student/library'], icon: GraduationCap, ... },
  // { label:'Video Search', href:'/dashboard/student/video-search', icon: Film, ... },

  const allItems = navGroups.flatMap((group) => group.items)

  const bottomTabHrefs = [
    '/dashboard/student',
    '/dashboard/student/profile',
    '/dashboard/student/applications',
    '/dashboard/discover-jobs',
  ] as const

  const bottomTabs = bottomTabHrefs
    .map((href) => allItems.find((item) => item.href === href))
    .filter((item): item is NavItem => Boolean(item))

  const railLinkClass = (isActive: boolean) =>
    cn(
      'flex h-11 w-11 shrink-0 items-center justify-center transition-all hover:-translate-y-0.5',
      isActive
        ? 'rounded-none bg-white text-slate-800 shadow-none dark:bg-white dark:text-slate-900'
        : 'text-slate-700 hover:text-slate-900 dark:text-blue-200 dark:hover:text-white',
    )

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

  return (
    <>
      {/* Desktop: slim blue-50 icon rail */}
      <aside
        className={cn(
          'student-sidebar fixed inset-y-0 left-0 z-40 hidden w-16 flex-col bg-blue-50 pt-16 dark:bg-blue-950 lg:flex',
          'rounded-none',
          className,
        )}
      >
        <nav className="flex min-h-0 flex-1 flex-col items-center px-0 py-4">
          <div className="flex min-h-0 w-full flex-1 flex-col items-center gap-3 overflow-y-auto overflow-x-hidden px-2">
            {allItems.map((item) => {
              const isActive = isItemActive(item)
              return (
                <SidebarRailHoverCard
                  key={item.href}
                  item={item}
                  isActive={isActive}
                  dataSidebarItem={isActive ? 'active' : 'inactive'}
                  railLinkClassName={railLinkClass(isActive)}
                  onNavigate={() => !isActive && startLoading()}
                />
              )
            })}
          </div>
          <button
            type="button"
            title={t(locale, 'dashboard.labels.logout')}
            onClick={handleLogout}
            className="mt-3 flex h-11 w-11 shrink-0 items-center justify-center text-slate-700 transition-colors hover:text-slate-900 dark:text-blue-200 dark:hover:text-white"
          >
            <LogOut className="h-5 w-5" strokeWidth={1.75} />
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
        // Account tab + drawer (mobile) — disabled
        // moreLabel="Account"
        // onMoreClick={() => setIsMobileMenuOpen(true)}
      />
    </>
  )
}
