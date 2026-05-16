'use client'

import { Pencil } from 'lucide-react'
import { cn } from '@/lib/utils'
import {
  profileCardClass,
  profileCardBodyClass,
  profileCardHeaderClass,
  profileEditBtnClass,
  profileFieldWrapperClass,
  profileLabelClass,
  profileSectionTitleClass,
  profileValueClass,
} from '../profileTheme'

type ProfileSectionCardProps = {
  id?: string
  title: string
  subtitle?: string
  onEdit?: () => void
  editLabel?: string
  className?: string
  children: React.ReactNode
}

export function ProfileSectionCard({
  id,
  title,
  subtitle,
  onEdit,
  editLabel = 'Edit section',
  className,
  children,
}: ProfileSectionCardProps) {
  return (
    <section id={id} className={cn(profileCardClass, className)}>
      <div className={profileCardHeaderClass}>
        <div className="min-w-0 flex-1 pr-2">
          <h2 className={profileSectionTitleClass}>{title}</h2>
          {subtitle ? (
            <p className="mt-1.5 text-sm leading-relaxed text-slate-500 dark:text-slate-400">{subtitle}</p>
          ) : null}
        </div>
        {onEdit ? (
          <button type="button" onClick={onEdit} className={profileEditBtnClass} aria-label={editLabel}>
            <Pencil className="h-4 w-4" strokeWidth={2} />
          </button>
        ) : null}
      </div>
      <div className={profileCardBodyClass}>{children}</div>
    </section>
  )
}

export function ProfileField({ label, value, className }: { label: string; value: React.ReactNode; className?: string }) {
  return (
    <div className={cn(profileFieldWrapperClass, className)}>
      <p className={profileLabelClass}>{label}</p>
      <div className={profileValueClass}>{value}</div>
    </div>
  )
}
