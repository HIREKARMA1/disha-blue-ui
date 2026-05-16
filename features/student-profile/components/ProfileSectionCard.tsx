'use client'

import { Pencil } from 'lucide-react'
import { cn } from '@/lib/utils'
import { profileCardClass, profileCardBodyClass, profileCardHeaderClass, profileEditBtnClass } from '../profileTheme'

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
        <div className="min-w-0">
          <h2 className="text-base font-bold text-slate-900 dark:text-slate-50">{title}</h2>
          {subtitle ? <p className="mt-0.5 text-sm text-slate-500 dark:text-slate-400">{subtitle}</p> : null}
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
    <div className={cn('border-b border-slate-100 py-3 last:border-0 dark:border-slate-800', className)}>
      <p className="text-xs font-medium text-slate-500 dark:text-slate-400">{label}</p>
      <div className="mt-1 text-sm font-semibold text-slate-900 dark:text-slate-50">{value}</div>
    </div>
  )
}
