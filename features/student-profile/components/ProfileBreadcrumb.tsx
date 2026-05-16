import Link from 'next/link'
import { ChevronRight, Home } from 'lucide-react'

export function ProfileBreadcrumb() {
  return (
    <nav aria-label="Breadcrumb" className="flex items-center gap-2 py-1 text-base sm:text-sm">
      <Link
        href="/dashboard/student"
        className="inline-flex min-h-[44px] items-center gap-1.5 font-medium text-primary-600 hover:text-primary-700 active:opacity-80 dark:text-primary-400"
      >
        <Home className="h-4 w-4 shrink-0" aria-hidden />
        Home
      </Link>
      <ChevronRight className="h-4 w-4 shrink-0 text-slate-400" aria-hidden />
      <span className="min-h-[44px] py-2.5 font-medium leading-none text-slate-700 dark:text-slate-300">Profile</span>
    </nav>
  )
}
