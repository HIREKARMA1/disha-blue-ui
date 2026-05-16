'use client'

import { Briefcase, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { CollegeInfoDisplay } from '@/components/dashboard/CollegeInfoDisplay'
import { ProfileSectionCard, ProfileField } from './components/ProfileSectionCard'
import { ProfileIdentityVerification } from './components/ProfileIdentityVerification'
import { profileCardClass } from './profileTheme'
import { cn } from '@/lib/utils'
import type { StudentProfile, ProfileUpdateData } from '@/services/profileService'
import type { ProfileSection } from './types'

type SectionProps = {
  profile: StudentProfile
  editing: string | null
  setEditing: (id: string | null) => void
  saving: boolean
  onSave: (sectionId: string, formData: ProfileUpdateData, options?: { showSuccessToast?: boolean }) => void
  ProfileSectionForm: React.ComponentType<{
    section: ProfileSection
    profile: StudentProfile
    onSave: (formData: ProfileUpdateData, options?: { showSuccessToast?: boolean }) => void
    saving: boolean
    onCancel: () => void
  }>
  sectionDefs: Record<string, ProfileSection>
}

const na = (v?: string | null) => (v?.trim() ? v : 'N/A')

function formatDob(dob?: string) {
  if (!dob) return 'N/A'
  try {
    return new Date(dob).toLocaleDateString('en-IN')
  } catch {
    return dob
  }
}

function formatAddress(profile: StudentProfile) {
  const parts = [profile.city, profile.state, profile.country].filter(Boolean)
  return parts.length ? parts.join(', ') : 'N/A'
}

function formatRoles(profile: StudentProfile) {
  if (!profile.job_roles_of_interest?.trim()) return 'N/A'
  return profile.job_roles_of_interest
    .split(/[,;]/)
    .map((r) => r.trim())
    .filter(Boolean)
    .join(', ')
}

export function ProfilePersonalInfoSection({
  profile,
  editing,
  setEditing,
  saving,
  onSave,
  ProfileSectionForm,
  sectionDefs,
}: SectionProps) {
  const section = sectionDefs.basic
  return (
    <ProfileSectionCard
      id="profile-section-basic"
      title="Personal Info"
      onEdit={() => setEditing('basic')}
    >
      {editing === 'basic' ? (
        <ProfileSectionForm
          section={section}
          profile={profile}
          onSave={(formData, options) => onSave('basic', formData, options)}
          saving={saving}
          onCancel={() => setEditing(null)}
        />
      ) : (
        <>
          <ProfileField label="Full Name" value={profile.name || 'N/A'} />
          <ProfileField label="Date of Birth" value={formatDob(profile.dob)} />
          <ProfileField
            label="Gender"
            value={profile.gender ? profile.gender.charAt(0).toUpperCase() + profile.gender.slice(1) : 'N/A'}
          />
          <ProfileField label="Phone" value={profile.phone || 'N/A'} />
          <ProfileField label="Email" value={profile.email || 'N/A'} />
          <ProfileField label="Street Address" value={formatAddress(profile)} />
          <div className="border-t border-slate-100 pt-3 dark:border-slate-800">
            <ProfileField label="Total Work Experience" value={profile.internship_experience ? 'Experienced' : 'Fresher'} />
          </div>
        </>
      )}
    </ProfileSectionCard>
  )
}

export function ProfileQualificationSection({
  profile,
  editing,
  setEditing,
  saving,
  onSave,
  ProfileSectionForm,
  sectionDefs,
}: SectionProps) {
  const section = sectionDefs.academic
  return (
    <ProfileSectionCard
      id="profile-section-academic"
      title="Qualification"
      onEdit={() => setEditing('academic')}
    >
      {editing === 'academic' ? (
        <ProfileSectionForm
          section={section}
          profile={profile}
          onSave={(formData, options) => onSave('academic', formData, options)}
          saving={saving}
          onCancel={() => setEditing(null)}
        />
      ) : (
        <div className="grid grid-cols-1 gap-0 sm:grid-cols-2 sm:gap-x-4">
          <ProfileField label="Highest Education" value={profile.degree || profile.twelfth_stream || 'N/A'} />
          <ProfileField label="Degree" value={na(profile.degree)} />
          <ProfileField label="Institution" value={na(profile.institution)} />
          <ProfileField label="Year of Passing" value={profile.graduation_year ? String(profile.graduation_year) : 'N/A'} />
          <ProfileField label="Branch" value={na(profile.branch)} className="sm:col-span-2" />
          <div className="sm:col-span-2 border-t border-slate-100 pt-2 dark:border-slate-800">
            <CollegeInfoDisplay profile={profile} />
          </div>
          {profile.twelfth_grade_percentage ? (
            <ProfileField label="Class XII" value={`${profile.twelfth_grade_percentage}%`} />
          ) : null}
          {profile.tenth_grade_percentage ? (
            <ProfileField label="Class X" value={`${profile.tenth_grade_percentage}%`} />
          ) : null}
        </div>
      )}
    </ProfileSectionCard>
  )
}

export function ProfileJobPreferencesSection({
  profile,
  editing,
  setEditing,
  saving,
  onSave,
  ProfileSectionForm,
  sectionDefs,
}: SectionProps) {
  const section = sectionDefs.skills
  const roles = formatRoles(profile)
  return (
    <ProfileSectionCard
      id="profile-section-skills-prefs"
      title="Job Preferences"
      onEdit={() => setEditing('skills')}
    >
      {editing === 'skills' ? (
        <ProfileSectionForm
          section={section}
          profile={profile}
          onSave={(formData, options) => onSave('skills', formData, options)}
          saving={saving}
          onCancel={() => setEditing(null)}
        />
      ) : (
        <>
          <div className="border-b border-slate-100 pb-5 dark:border-slate-800">
            <p className="text-sm font-medium text-slate-500">Preferred Roles</p>
            <div className="mt-3 flex flex-wrap gap-2.5">
              {roles === 'N/A' ? (
                <span className="text-base font-semibold text-slate-900 dark:text-slate-50">N/A</span>
              ) : (
                roles.split(',').map((role) => (
                  <span
                    key={role}
                    className="rounded-xl bg-slate-100 px-3.5 py-2 text-sm font-semibold text-slate-800 dark:bg-slate-800 dark:text-slate-200"
                  >
                    {role.trim()}
                  </span>
                ))
              )}
            </div>
          </div>
          <ProfileField
            label="Preferred Job Location"
            value={
              [profile.preferred_job_city, profile.preferred_job_state, profile.location_preferences]
                .filter(Boolean)
                .join(', ') || 'N/A'
            }
          />
          <ProfileField label="Availability Status" value={profile.preferred_job_remote || 'N/A'} />
          <ProfileField label="Available From" value="Immediate" />
          <ProfileField
            label="Willing to Relocate"
            value={profile.open_to_relocation === true ? 'Yes' : profile.open_to_relocation === false ? 'No' : 'N/A'}
          />
        </>
      )}
    </ProfileSectionCard>
  )
}

export function ProfileSkillsLanguagesSection({
  profile,
  editing,
  setEditing,
  saving,
  onSave,
  ProfileSectionForm,
  sectionDefs,
}: SectionProps) {
  const section = sectionDefs.skills
  return (
    <ProfileSectionCard
      id="profile-section-skills"
      title="Skills & Languages"
      onEdit={() => setEditing('skills')}
    >
      {editing === 'skills' ? (
        <ProfileSectionForm
          section={section}
          profile={profile}
          onSave={(formData, options) => onSave('skills', formData, options)}
          saving={saving}
          onCancel={() => setEditing(null)}
        />
      ) : (
        <>
          <ProfileField label="What do you know? (Your Skills)" value={na(profile.technical_skills)} />
          <ProfileField label="Soft Skills" value={na(profile.soft_skills)} />
          <ProfileField label="Certifications" value={na(profile.certifications)} />
          <ProfileField label="Which languages do you know?" value="N/A" />
        </>
      )}
    </ProfileSectionCard>
  )
}

export function ProfileWorkExperienceSection({
  profile,
  editing,
  setEditing,
  saving,
  onSave,
  ProfileSectionForm,
  sectionDefs,
}: SectionProps) {
  const section = sectionDefs.experience
  const hasExperience =
    Boolean(profile.internship_experience) ||
    Boolean(profile.project_details) ||
    Boolean(profile.extracurricular_activities)

  return (
    <ProfileSectionCard
      id="profile-section-experience"
      title="Work Experience"
      className={cn(!hasExperience && !editing && 'border-dashed')}
      onEdit={() => setEditing('experience')}
    >
      {editing === 'experience' ? (
        <ProfileSectionForm
          section={section}
          profile={profile}
          onSave={(formData, options) => onSave('experience', formData, options)}
          saving={saving}
          onCancel={() => setEditing(null)}
        />
      ) : hasExperience ? (
        <>
          {profile.internship_experience ? (
            <ProfileField label="Internship Experience" value={profile.internship_experience} />
          ) : null}
          {profile.project_details ? <ProfileField label="Projects" value={profile.project_details} /> : null}
          {profile.extracurricular_activities ? (
            <ProfileField label="Extracurricular" value={profile.extracurricular_activities} />
          ) : null}
        </>
      ) : (
        <div className="flex flex-col items-center py-6 text-center sm:py-8">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800">
            <Briefcase className="h-9 w-9 text-slate-300" />
          </div>
          <p className="mt-5 text-lg font-semibold text-slate-900 dark:text-slate-50">No Work Experience Added</p>
          <p className="mt-2 max-w-sm px-2 text-base leading-relaxed text-slate-500 sm:text-sm">
            Showcase your professional experience to increase your chances of getting hired.
          </p>
          <Button
            type="button"
            size="lg"
            className="mt-6 h-12 w-full max-w-xs rounded-xl bg-primary-600 text-base hover:bg-primary-700 sm:w-auto sm:min-w-[220px]"
            onClick={() => setEditing('experience')}
          >
            <Plus className="mr-2 h-5 w-5" />
            Add Work Experience
          </Button>
        </div>
      )}
    </ProfileSectionCard>
  )
}

export function ProfileDocumentsSection({
  profile,
  editing,
  setEditing,
  saving,
  onSave,
  ProfileSectionForm,
  sectionDefs,
}: SectionProps) {
  const section = sectionDefs.documents
  if (editing === 'documents') {
    return (
      <ProfileSectionCard id="profile-section-documents" title="Documents & Certificates" onEdit={() => setEditing('documents')}>
        <ProfileSectionForm
          section={section}
          profile={profile}
          onSave={(formData, options) => onSave('documents', formData, options)}
          saving={saving}
          onCancel={() => setEditing(null)}
        />
      </ProfileSectionCard>
    )
  }
  return <ProfileIdentityVerification profile={profile} onEdit={() => setEditing('documents')} />
}

export function ProfileSocialSection({
  profile,
  editing,
  setEditing,
  saving,
  onSave,
  ProfileSectionForm,
  sectionDefs,
}: SectionProps) {
  const section = sectionDefs.social
  return (
    <ProfileSectionCard id="profile-section-social" title="Social Profiles" onEdit={() => setEditing('social')}>
      {editing === 'social' ? (
        <ProfileSectionForm
          section={section}
          profile={profile}
          onSave={(formData, options) => onSave('social', formData, options)}
          saving={saving}
          onCancel={() => setEditing(null)}
        />
      ) : (
        <>
          <ProfileField
            label="LinkedIn"
            value={
              profile.linkedin_profile ? (
                <a href={profile.linkedin_profile} target="_blank" rel="noopener noreferrer" className="text-primary-600 underline">
                  {profile.linkedin_profile}
                </a>
              ) : (
                'N/A'
              )
            }
          />
          <ProfileField
            label="GitHub"
            value={
              profile.github_profile ? (
                <a href={profile.github_profile} target="_blank" rel="noopener noreferrer" className="text-primary-600 underline">
                  {profile.github_profile}
                </a>
              ) : (
                'N/A'
              )
            }
          />
          <ProfileField
            label="Personal Website"
            value={
              profile.personal_website ? (
                <a href={profile.personal_website} target="_blank" rel="noopener noreferrer" className="text-primary-600 underline">
                  {profile.personal_website}
                </a>
              ) : (
                'N/A'
              )
            }
          />
        </>
      )}
    </ProfileSectionCard>
  )
}
