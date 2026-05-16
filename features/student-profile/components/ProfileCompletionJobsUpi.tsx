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
      <div className="p-6 sm:p-6">
        <div className="text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-amber-500 text-white shadow-md">
            <AlertCircle className="h-7 w-7" />
          </div>
          <h2 className="text-xl font-bold leading-snug text-slate-900 dark:text-slate-50 sm:text-lg">
            {isComplete ? 'Profile complete' : 'Complete Your Profile to Get Started'}
          </h2>
          <p className="mx-auto mt-3 max-w-md text-base leading-relaxed text-slate-600 dark:text-slate-400 sm:text-sm">
            {isComplete
              ? 'Your profile is ready for recruiters. Keep it updated for better matches.'
              : 'A complete profile helps you get better job opportunities and up to 3× higher visibility with employers.'}
          </p>
        </div>

        <div className="mt-6">
          <div className="h-3 w-full overflow-hidden rounded-full bg-amber-100 dark:bg-amber-900/40">
            <div
              className="h-full rounded-full bg-amber-500 transition-all duration-500"
              style={{ width: `${Math.min(100, Math.max(0, completion))}%` }}
            />
          </div>
          <p className="mt-3 text-center text-base font-semibold text-amber-700 dark:text-amber-400 sm:text-sm">
            {completion}% complete
            {completionData ? ` · ${completionData.completed_count}/${completionData.total_fields} fields` : ''}
          </p>
        </div>

        {!isComplete && (
          <div className="mt-6 flex flex-col gap-3 sm:grid sm:grid-cols-2 sm:gap-3">
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
                  className="flex min-h-[72px] items-center gap-4 rounded-xl border border-white bg-white p-5 text-left shadow-sm transition active:scale-[0.99] hover:border-amber-200 hover:shadow-md dark:border-slate-800 dark:bg-slate-900 dark:hover:border-amber-800"
                >
                  <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-amber-50 text-amber-600 dark:bg-amber-900/30">
                    <Icon className="h-6 w-6" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-base font-semibold text-slate-900 dark:text-slate-50">{task.title}</span>
                    <span className="mt-1 block text-sm leading-relaxed text-slate-500">{task.subtitle}</span>
                    {done ? (
                      <span className="mt-2 inline-block text-sm font-medium text-emerald-600">Done</span>
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
