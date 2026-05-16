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

export function ProfileHeroCard({
  profile,
  applicationsCount,
  completionPercent,
  onEditPhoto,
  onEditName,
}: ProfileHeroCardProps) {
  return (
    <div className={cn(profileCardClass, 'overflow-hidden border-t-4 border-t-primary-600')}>
      <div className="p-5 sm:p-6">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-start">
          <div className="relative mx-auto shrink-0 sm:mx-0">
            <div className="flex h-24 w-24 items-center justify-center overflow-hidden rounded-2xl bg-primary-600 text-2xl font-bold text-white shadow-md sm:h-28 sm:w-28 sm:text-3xl">
              {profile.profile_picture ? (
                <img src={profile.profile_picture} alt={profile.name} className="h-full w-full object-cover" />
              ) : (
                getInitials(profile.name)
              )}
            </div>
            <button
              type="button"
              onClick={onEditPhoto}
              className="absolute -bottom-1 -right-1 flex h-8 w-8 items-center justify-center rounded-full border-2 border-white bg-white text-slate-700 shadow-md hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-800 dark:text-slate-200"
              aria-label="Change profile photo"
            >
              <Camera className="h-4 w-4" />
            </button>
          </div>

          <div className="min-w-0 flex-1 text-center sm:text-left">
            <div className="flex flex-wrap items-center justify-center gap-2 sm:justify-start">
              <h1 className="text-xl font-bold text-slate-900 dark:text-slate-50 sm:text-2xl">{profile.name}</h1>
              <button
                type="button"
                onClick={onEditName}
                className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-800 dark:hover:bg-slate-800"
                aria-label="Edit profile"
              >
                <Pencil className="h-4 w-4" />
              </button>
            </div>
            <p className="mt-1 text-sm font-medium text-slate-600 dark:text-slate-400">{formatRoles(profile)}</p>
            <div className="mt-3 flex flex-wrap items-center justify-center gap-4 text-xs text-slate-500 sm:justify-start dark:text-slate-400">
              <span className="inline-flex items-center gap-1.5">
                <MapPin className="h-3.5 w-3.5" />
                {formatLocation(profile)}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Calendar className="h-3.5 w-3.5" />
                {formatJoinDate(profile.created_at)}
              </span>
            </div>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-3 divide-x divide-slate-200 rounded-xl border border-slate-100 bg-slate-50/80 dark:divide-slate-700 dark:border-slate-800 dark:bg-slate-800/40">
          <div className="flex flex-col items-center px-2 py-4 text-center sm:px-4">
            <Eye className="mb-2 h-5 w-5 text-slate-500" />
            <span className="text-lg font-bold text-slate-900 dark:text-slate-50">—</span>
            <span className="mt-0.5 text-[11px] font-medium text-slate-500 sm:text-xs">Profile Views</span>
          </div>
          <div className="flex flex-col items-center px-2 py-4 text-center sm:px-4">
            <Briefcase className="mb-2 h-5 w-5 text-slate-500" />
            <span className="text-lg font-bold text-slate-900 dark:text-slate-50">{applicationsCount}</span>
            <span className="mt-0.5 text-[11px] font-medium text-slate-500 sm:text-xs">Applications</span>
          </div>
          <div className="flex flex-col items-center px-2 py-4 text-center sm:px-4">
            <TrendingUp className="mb-2 h-5 w-5 text-slate-500" />
            <span className="text-lg font-bold text-slate-900 dark:text-slate-50">{completionPercent}%</span>
            <span className="mt-0.5 text-[11px] font-medium text-slate-500 sm:text-xs">Profile Strength</span>
          </div>
        </div>
      </div>
    </div>
  )
}
