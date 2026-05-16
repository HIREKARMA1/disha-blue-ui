'use client'

import { Star } from 'lucide-react'
import { profileCardClass } from '../profileTheme'

export function ProfileReviewsCard() {
  return (
    <div className={profileCardClass}>
      <div className="border-b border-slate-100 px-5 py-4 dark:border-slate-800">
        <h2 className="text-base font-bold text-slate-900 dark:text-slate-50">Reviews & Ratings</h2>
        <p className="mt-0.5 text-sm text-slate-500">Based on 0 verified reviews</p>
      </div>
      <div className="flex flex-col items-center px-5 py-10 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800">
          <Star className="h-8 w-8 text-slate-300" />
        </div>
        <p className="mt-4 text-base font-semibold text-slate-900 dark:text-slate-50">No Reviews Yet</p>
        <p className="mt-1 text-sm text-slate-500">Based on 0 verified reviews</p>
      </div>
      <div className="mx-5 mb-5 rounded-xl border border-primary-100 bg-primary-50 px-4 py-3 text-center text-sm text-primary-800 dark:border-primary-900 dark:bg-primary-950/40 dark:text-primary-200">
        Complete jobs to start receiving reviews from employers and build your reputation.
      </div>
    </div>
  )
}
