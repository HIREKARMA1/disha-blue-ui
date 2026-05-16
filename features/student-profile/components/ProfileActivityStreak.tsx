'use client'

import { Activity, Calendar } from 'lucide-react'
import { profileCardClass, profileCardHeaderClass, profileSectionTitleClass } from '../profileTheme'
import { cn } from '@/lib/utils'

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

export function ProfileActivityStreak() {
  const today = new Date()
  const week = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(today)
    d.setDate(today.getDate() - today.getDay() + i)
    return d
  })

  return (
    <section className={profileCardClass}>
      <div className={cn(profileCardHeaderClass, 'flex-col items-stretch gap-4 sm:flex-row sm:items-center')}>
        <div className="flex items-center gap-2.5">
          <Activity className="h-5 w-5 text-primary-600" />
          <h2 className={profileSectionTitleClass}>Activity Streak</h2>
        </div>
        <div className="flex flex-wrap gap-2.5">
          <span className="inline-flex min-h-[40px] items-center gap-1.5 rounded-full bg-emerald-50 px-4 py-2 text-sm font-semibold text-emerald-700 ring-1 ring-emerald-200">
            Streak: 0 Days
          </span>
          <button
            type="button"
            className="inline-flex min-h-[40px] items-center gap-1.5 rounded-full bg-amber-50 px-4 py-2 text-sm font-semibold text-amber-800 ring-1 ring-amber-200 active:scale-[0.98]"
          >
            <Calendar className="h-4 w-4" />
            View Streak
          </button>
        </div>
      </div>

      <div className="overflow-x-auto px-5 pb-6 pt-2 [-webkit-overflow-scrolling:touch] sm:overflow-visible sm:px-6 sm:pb-6">
        <div className="flex min-w-max gap-3 snap-x snap-mandatory sm:grid sm:min-w-0 sm:grid-cols-7 sm:gap-2">
          {week.map((date, i) => {
            const isToday = date.toDateString() === today.toDateString()
            return (
              <div
                key={DAYS[i]}
                className="flex w-[52px] shrink-0 snap-center flex-col items-center gap-2.5 sm:w-auto"
              >
                <div
                  className={cn(
                    'flex h-12 w-full min-w-[44px] items-center justify-center rounded-xl sm:h-12',
                    isToday ? 'bg-amber-500 shadow-sm' : 'bg-slate-100 dark:bg-slate-800',
                  )}
                />
                <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">{DAYS[i]}</span>
                <span className="text-xs tabular-nums text-slate-400">{date.getDate()}</span>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
