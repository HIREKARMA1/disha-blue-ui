'use client'

import { AlertCircle, Camera, User, ShieldCheck, Briefcase } from 'lucide-react'
import { cn } from '@/lib/utils'
import { profileCardClass } from '../profileTheme'
import type { ProfileCompletionResponse } from '@/services/profileService'
import type { StudentProfile } from '@/services/profileService'

type ProfileCompletionJobsUpiProps = {
  profile: StudentProfile
  completion: number
  completionData?: ProfileCompletionResponse
  onAction: (sectionId: string) => void
}

const TASKS = [
  { id: 'basic', icon: Camera, title: 'Profile Photo', subtitle: 'Add your profile photo' },
  { id: 'basic', icon: User, title: 'Complete Your Profile', subtitle: 'Complete your personal details' },
  { id: 'documents', icon: ShieldCheck, title: 'Verify Identity', subtitle: 'Upload resume & certificates' },
  { id: 'experience', icon: Briefcase, title: 'Work Experience', subtitle: 'Add your past jobs & projects' },
]

export function ProfileCompletionJobsUpi({
  profile,
  completion,
  completionData,
  onAction,
}: ProfileCompletionJobsUpiProps) {
  const missing = new Set(completionData?.missing_fields ?? [])
  const hasPhoto = Boolean(profile.profile_picture)
  const isComplete = completion >= 100

  return (
    <div className={cn(profileCardClass, 'border-amber-100 bg-[#fff8f0] dark:border-amber-900/40 dark:bg-amber-950/20')}>
      <div className="p-5 sm:p-6">
        <div className="text-center">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-amber-500 text-white">
            <AlertCircle className="h-6 w-6" />
          </div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-slate-50">
            {isComplete ? 'Profile complete' : 'Complete Your Profile to Get Started'}
          </h2>
          <p className="mx-auto mt-2 max-w-md text-sm text-slate-600 dark:text-slate-400">
            {isComplete
              ? 'Your profile is ready for recruiters. Keep it updated for better matches.'
              : 'A complete profile helps you get better job opportunities and up to 3× higher visibility with employers.'}
          </p>
        </div>

        <div className="mt-5">
          <div className="h-2.5 w-full overflow-hidden rounded-full bg-amber-100 dark:bg-amber-900/40">
            <div
              className="h-full rounded-full bg-amber-500 transition-all duration-500"
              style={{ width: `${Math.min(100, Math.max(0, completion))}%` }}
            />
          </div>
          <p className="mt-2 text-center text-sm font-semibold text-amber-700 dark:text-amber-400">
            {completion}% complete
            {completionData ? ` · ${completionData.completed_count}/${completionData.total_fields} fields` : ''}
          </p>
        </div>

        {!isComplete && (
          <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
            {TASKS.map((task) => {
              const Icon = task.icon
              const done =
                task.id === 'basic' && task.title === 'Profile Photo'
                  ? hasPhoto
                  : task.id === 'basic'
                    ? !missing.has('name') && !missing.has('phone')
                    : false
              return (
                <button
                  key={task.title}
                  type="button"
                  onClick={() => onAction(task.id)}
                  className="flex items-start gap-3 rounded-xl border border-white bg-white p-4 text-left shadow-sm transition hover:border-amber-200 hover:shadow-md dark:border-slate-800 dark:bg-slate-900 dark:hover:border-amber-800"
                >
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-50 text-amber-600 dark:bg-amber-900/30">
                    <Icon className="h-5 w-5" />
                  </span>
                  <span className="min-w-0">
                    <span className="block text-sm font-semibold text-slate-900 dark:text-slate-50">{task.title}</span>
                    <span className="mt-0.5 block text-xs text-slate-500">{task.subtitle}</span>
                    {done ? (
                      <span className="mt-1 inline-block text-xs font-medium text-emerald-600">Done</span>
                    ) : null}
                  </span>
                </button>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
