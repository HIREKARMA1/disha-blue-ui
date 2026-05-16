'use client'

import { Activity, Calendar } from 'lucide-react'
import { profileCardClass } from '../profileTheme'

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

export function ProfileActivityStreak() {
  const today = new Date()
  const week = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(today)
    d.setDate(today.getDate() - today.getDay() + i)
    return d
  })

  return (
    <div className={profileCardClass}>
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 px-5 py-4 dark:border-slate-800">
        <div className="flex items-center gap-2">
          <Activity className="h-5 w-5 text-primary-600" />
          <h2 className="text-base font-bold text-slate-900 dark:text-slate-50">Activity Streak</h2>
        </div>
        <div className="flex flex-wrap gap-2">
          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700 ring-1 ring-emerald-200">
            Streak: 0 Days
          </span>
          <button
            type="button"
            className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-800 ring-1 ring-amber-200"
          >
            <Calendar className="h-3.5 w-3.5" />
            View Streak
          </button>
        </div>
      </div>
      <div className="px-5 py-5">
        <div className="grid grid-cols-7 gap-2">
          {week.map((date, i) => {
            const isToday = date.toDateString() === today.toDateString()
            const active = isToday
            return (
              <div key={DAYS[i]} className="flex flex-col items-center gap-2">
                <div
                  className={
                    active
                      ? 'flex h-10 w-full items-center justify-center rounded-xl bg-amber-500 sm:h-12'
                      : 'flex h-10 w-full items-center justify-center rounded-xl bg-slate-100 sm:h-12 dark:bg-slate-800'
                  }
                />
                <span className="text-[10px] font-semibold text-slate-600 sm:text-xs">{DAYS[i]}</span>
                <span className="text-[10px] text-slate-400">{date.getDate()}</span>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
