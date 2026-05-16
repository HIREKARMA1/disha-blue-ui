import Link from 'next/link'
import { ChevronRight, Home } from 'lucide-react'

export function ProfileBreadcrumb() {
  return (
    <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-sm">
      <Link
        href="/dashboard/student"
        className="inline-flex items-center gap-1 font-medium text-primary-600 hover:text-primary-700 dark:text-primary-400"
      >
        <Home className="h-4 w-4" aria-hidden />
        Home
      </Link>
      <ChevronRight className="h-4 w-4 text-slate-400" aria-hidden />
      <span className="font-medium text-slate-700 dark:text-slate-300">Profile</span>
    </nav>
  )
}
