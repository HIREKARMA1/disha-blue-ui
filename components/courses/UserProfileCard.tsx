"use client"

import { ParsedUserProfile } from "@/components/courses/types"

interface UserProfileCardProps {
  profile: ParsedUserProfile | null
}

export function UserProfileCard({ profile }: UserProfileCardProps) {
  if (!profile) return null

  return (
    <div className="dashboard-overview-card p-4">
      <h3 className="text-sm font-semibold uppercase tracking-wide text-sage-deep dark:text-emerald-300">Your profile</h3>
      <div className="mt-3 grid grid-cols-1 gap-2 text-sm text-slate-700 dark:text-emerald-100 sm:grid-cols-2">
        <p>
          <span className="font-semibold">Education:</span> {profile.education}
        </p>
        <p>
          <span className="font-semibold">Goal:</span> {profile.goal}
        </p>
        <p className="sm:col-span-2">
          <span className="font-semibold">Skills:</span> {profile.skills.length ? profile.skills.join(", ") : "Not specified"}
        </p>
        <p className="sm:col-span-2">
          <span className="font-semibold">Intent:</span> {profile.intent}
        </p>
      </div>
    </div>
  )
}
