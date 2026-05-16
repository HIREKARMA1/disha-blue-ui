'use client'

import { Star } from 'lucide-react'
import {
  profileCardClass,
  profileCardBodyClass,
  profileCardHeaderClass,
  profileSectionTitleClass,
} from '../profileTheme'

export function ProfileReviewsCard() {
  return (
    <section className={profileCardClass}>
      <div className={profileCardHeaderClass}>
        <div>
          <h2 className={profileSectionTitleClass}>Reviews & Ratings</h2>
          <p className="mt-1.5 text-sm leading-relaxed text-slate-500">Based on 0 verified reviews</p>
        </div>
      </div>
      <div className={profileCardBodyClass}>
        <div className="flex flex-col items-center py-6 text-center sm:py-8">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800">
            <Star className="h-9 w-9 text-slate-300" />
          </div>
          <p className="mt-5 text-lg font-semibold text-slate-900 dark:text-slate-50">No Reviews Yet</p>
          <p className="mt-2 text-base text-slate-500 sm:text-sm">Based on 0 verified reviews</p>
        </div>
        <div className="rounded-xl border border-primary-100 bg-primary-50 px-5 py-4 text-center text-base leading-relaxed text-primary-800 dark:border-primary-900 dark:bg-primary-950/40 dark:text-primary-200 sm:text-sm">
          Complete jobs to start receiving reviews from employers and build your reputation.
        </div>
      </div>
    </section>
  )
}
