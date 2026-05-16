'use client'

import { ProfileBreadcrumb } from './components/ProfileBreadcrumb'
import { ProfileHeroCard } from './components/ProfileHeroCard'
import { ProfileCompletionJobsUpi } from './components/ProfileCompletionJobsUpi'
import { ProfileActivityStreak } from './components/ProfileActivityStreak'
import { ProfileReviewsCard } from './components/ProfileReviewsCard'
import { profilePageBg } from './profileTheme'
import type { StudentProfile, ProfileCompletionResponse } from '@/services/profileService'

export type StudentProfilePageLayoutProps = {
  profile: StudentProfile
  applicationsCount: number
  completionPercent: number
  profileCompletion?: ProfileCompletionResponse | null
  onScrollToSection: (sectionId: string) => void
  onEditPhoto: () => void
  onEditName: () => void
  personalInfo: React.ReactNode
  qualification: React.ReactNode
  jobPreferences: React.ReactNode
  skillsLanguages: React.ReactNode
  workExperience: React.ReactNode
  documents: React.ReactNode
  social: React.ReactNode
}

export function StudentProfilePageLayout({
  profile,
  applicationsCount,
  completionPercent,
  profileCompletion,
  onScrollToSection,
  onEditPhoto,
  onEditName,
  personalInfo,
  qualification,
  jobPreferences,
  skillsLanguages,
  workExperience,
  documents,
  social,
}: StudentProfilePageLayoutProps) {
  return (
    <div className={profilePageBg}>
      <div className="mx-auto w-full max-w-6xl space-y-4 px-4 py-4 pb-8 sm:space-y-5 sm:px-6 sm:py-6">
        <ProfileBreadcrumb />

        <ProfileHeroCard
          profile={profile}
          applicationsCount={applicationsCount}
          completionPercent={completionPercent}
          onEditPhoto={onEditPhoto}
          onEditName={onEditName}
        />

        <ProfileCompletionJobsUpi
          profile={profile}
          completion={completionPercent}
          completionData={profileCompletion ?? undefined}
          onAction={onScrollToSection}
        />

        <div className="flex flex-col gap-4 lg:grid lg:grid-cols-3 lg:gap-5">
          <div className="order-1 flex flex-col gap-4 lg:order-2 lg:col-span-1">
            {personalInfo}
            {qualification}
            {jobPreferences}
            {skillsLanguages}
            {documents}
            {social}
          </div>

          <div className="order-2 flex flex-col gap-4 lg:order-1 lg:col-span-2">
            {workExperience}
            <ProfileActivityStreak />
            <ProfileReviewsCard />
          </div>
        </div>
      </div>
    </div>
  )
}
