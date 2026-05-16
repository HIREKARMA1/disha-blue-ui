'use client'

import { Shield, Info } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ProfileSectionCard } from './ProfileSectionCard'
import type { StudentProfile } from '@/services/profileService'

type ProfileIdentityVerificationProps = {
  profile: StudentProfile
  onEdit: () => void
}

const DOCS = [
  {
    key: 'resume',
    title: 'Resume',
    subtitle: 'Upload your latest resume',
    primary: true,
    getUrl: (p: StudentProfile) => p.resume,
  },
  {
    key: 'tenth_certificate',
    title: '10th Certificate',
    subtitle: 'Academic certificate',
    primary: false,
    getUrl: (p: StudentProfile) => p.tenth_certificate,
  },
  {
    key: 'twelfth_certificate',
    title: '12th Certificate',
    subtitle: 'Academic certificate',
    primary: false,
    getUrl: (p: StudentProfile) => p.twelfth_certificate,
  },
  {
    key: 'internship_certificates',
    title: 'Internship Certificates',
    subtitle: 'Optional supporting documents',
    primary: false,
    getUrl: (p: StudentProfile) => p.internship_certificates,
  },
] as const

export function ProfileIdentityVerification({ profile, onEdit }: ProfileIdentityVerificationProps) {
  return (
    <ProfileSectionCard id="profile-section-documents" title="Identity Verification" onEdit={onEdit}>
      <div className="space-y-3">
        {DOCS.map((doc) => {
          const url = doc.getUrl(profile)
          return (
            <div
              key={doc.key}
              className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-3 dark:border-slate-700 dark:bg-slate-800/40"
            >
              <div className="flex min-w-0 items-center gap-3">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-primary-600 shadow-sm dark:bg-slate-900">
                  {doc.primary ? <Shield className="h-5 w-5" /> : <Info className="h-5 w-5 text-slate-500" />}
                </span>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-slate-900 dark:text-slate-50">{doc.title}</p>
                  <p className="text-xs text-slate-500">{doc.subtitle}</p>
                </div>
              </div>
              {url ? (
                <Button
                  type="button"
                  size="sm"
                  className="rounded-lg bg-primary-600 hover:bg-primary-700"
                  onClick={() => window.open(url, '_blank')}
                >
                  View
                </Button>
              ) : (
                <Button
                  type="button"
                  size="sm"
                  variant="secondary"
                  className="rounded-lg"
                  onClick={onEdit}
                >
                  Upload
                </Button>
              )}
            </div>
          )
        })}
      </div>
    </ProfileSectionCard>
  )
}
