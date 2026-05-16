'use client'

import { Camera, Eye, Briefcase, TrendingUp, MapPin, Calendar, Pencil } from 'lucide-react'
import { cn, getInitials } from '@/lib/utils'
import { profileCardClass } from '../profileTheme'
import type { StudentProfile } from '@/services/profileService'

type ProfileHeroCardProps = {
  profile: StudentProfile
  applicationsCount: number
  completionPercent: number
  onEditPhoto: () => void
  onEditName: () => void
}

function formatJoinDate(iso?: string) {
  if (!iso) return 'Recently joined'
  try {
    return `Joined ${new Date(iso).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })}`
  } catch {
    return 'Recently joined'
  }
}

function formatLocation(profile: StudentProfile) {
  const parts = [profile.city, profile.state, profile.country].filter(Boolean)
  return parts.length ? parts.join(', ') : 'Location not set'
}

function formatRoles(profile: StudentProfile) {
  if (profile.job_roles_of_interest?.trim()) {
    return profile.job_roles_of_interest
      .split(/[,;]/)
      .map((r) => r.trim())
      .filter(Boolean)
      .slice(0, 4)
      .join(', ')
  }
  if (profile.degree && profile.branch) return `${profile.degree}, ${profile.branch}`
  return profile.degree || profile.branch || 'Add your preferred roles'
}

const STATS = [
  { key: 'views', icon: Eye, label: 'Profile Views', getValue: () => '—' },
  {
    key: 'applications',
    icon: Briefcase,
    label: 'Applications',
    getValue: (n: number) => String(n),
  },
  {
    key: 'strength',
    icon: TrendingUp,
    label: 'Profile Strength',
    getValue: (n: number) => `${n}%`,
  },
] as const

export function ProfileHeroCard({
  profile,
  applicationsCount,
  completionPercent,
  onEditPhoto,
  onEditName,
}: ProfileHeroCardProps) {
  return (
    <div className={cn(profileCardClass, 'overflow-hidden border-t-[5px] border-t-primary-600')}>
      <div className="p-6 sm:p-6">
        <div className="flex flex-col items-center gap-6 sm:flex-row sm:items-start sm:gap-5">
          <div className="relative shrink-0">
            <div className="flex h-28 w-28 items-center justify-center overflow-hidden rounded-2xl bg-primary-600 text-3xl font-bold text-white shadow-lg sm:h-28 sm:w-28">
              {profile.profile_picture ? (
                <img src={profile.profile_picture} alt={profile.name} className="h-full w-full object-cover" />
              ) : (
                getInitials(profile.name)
              )}
            </div>
            <button
              type="button"
              onClick={onEditPhoto}
              className="absolute -bottom-1 -right-1 flex h-10 w-10 items-center justify-center rounded-full border-2 border-white bg-white text-slate-700 shadow-md hover:bg-slate-50 active:scale-95 dark:border-slate-800 dark:bg-slate-800 dark:text-slate-200"
              aria-label="Change profile photo"
            >
              <Camera className="h-4 w-4" />
            </button>
          </div>

          <div className="min-w-0 flex-1 text-center sm:text-left">
            <div className="flex flex-wrap items-center justify-center gap-2 sm:justify-start">
              <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-50 sm:text-2xl">
                {profile.name}
              </h1>
              <button
                type="button"
                onClick={onEditName}
                className="inline-flex h-10 w-10 items-center justify-center rounded-xl text-slate-500 hover:bg-slate-100 active:scale-95 dark:hover:bg-slate-800"
                aria-label="Edit profile"
              >
                <Pencil className="h-4 w-4" />
              </button>
            </div>
            <p className="mt-2 text-base font-medium leading-relaxed text-slate-600 dark:text-slate-400">
              {formatRoles(profile)}
            </p>
            <div className="mt-4 flex flex-col items-center gap-2.5 text-sm text-slate-500 sm:flex-row sm:flex-wrap sm:items-center sm:justify-start sm:gap-4 dark:text-slate-400">
              <span className="inline-flex max-w-full items-center justify-center gap-2 sm:justify-start">
                <MapPin className="h-4 w-4 shrink-0 text-slate-400" />
                <span className="text-center sm:text-left">{formatLocation(profile)}</span>
              </span>
              <span className="inline-flex items-center justify-center gap-2 sm:justify-start">
                <Calendar className="h-4 w-4 shrink-0 text-slate-400" />
                {formatJoinDate(profile.created_at)}
              </span>
            </div>
          </div>
        </div>

        {/* Mobile: stacked stat rows · Desktop: 3-column bar */}
        <div className="mt-8 flex flex-col gap-3 sm:mt-6 sm:grid sm:grid-cols-3 sm:gap-0 sm:divide-x sm:divide-slate-200 sm:overflow-hidden sm:rounded-xl sm:border sm:border-slate-100 sm:bg-slate-50/80 dark:sm:divide-slate-700 dark:sm:border-slate-800 dark:sm:bg-slate-800/40">
          {STATS.map((stat) => {
            const Icon = stat.icon
            const value =
              stat.key === 'views'
                ? '—'
                : stat.key === 'applications'
                  ? String(applicationsCount)
                  : `${completionPercent}%`
            return (
              <div
                key={stat.key}
                className="flex items-center gap-4 rounded-xl border border-slate-100 bg-slate-50/90 px-5 py-4 sm:flex-col sm:items-center sm:justify-center sm:gap-0 sm:border-0 sm:bg-transparent sm:px-4 sm:py-5 sm:text-center dark:border-slate-800 dark:bg-slate-800/50 dark:sm:border-0 dark:sm:bg-transparent"
              >
                <Icon className="h-5 w-5 shrink-0 text-slate-400 sm:mb-2" />
                <div className="min-w-0 flex-1 sm:flex-none">
                  <p className="text-xl font-bold tabular-nums text-slate-900 dark:text-slate-50 sm:text-lg">{value}</p>
                  <p className="mt-0.5 text-sm font-medium text-slate-500 sm:text-xs">{stat.label}</p>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
