"use client"

import { useId, useMemo, useState } from 'react'
import { Sparkles, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { profileService, type StudentProfile } from '@/services/profileService'
import { getRecommendationReadiness } from '@/lib/recommendationReadiness'
import { cn } from '@/lib/utils'
import toast from 'react-hot-toast'

interface Props {
 profile: StudentProfile | null
 onSaved?: () => Promise<void> | void
 onDismiss?: () => void
 showAsModal?: boolean
}

export function RecommendationOnboardingCard({ profile, onSaved, onDismiss, showAsModal = false }: Props) {
 const formUid = useId().replace(/:/g,'')
 const fid = (key: string) => `rec-onboard-${formUid}-${key}`

 const readiness = useMemo(() => getRecommendationReadiness(profile), [profile])
 const [saving, setSaving] = useState(false)
 const [form, setForm] = useState({
 preferred_job_city: profile?.preferred_job_city ||'',
 preferred_job_district: profile?.preferred_job_district ||'',
 preferred_job_state: profile?.preferred_job_state ||'',
 preferred_job_remote: Boolean(profile?.preferred_job_remote),
 open_to_relocation: Boolean(profile?.open_to_relocation),
 job_roles_of_interest: profile?.job_roles_of_interest ||'',
 technical_skills: profile?.technical_skills ||'',
 })

 const save = async () => {
 try {
 setSaving(true)
 await profileService.updateProfile({
 preferred_job_city: form.preferred_job_city || undefined,
 preferred_job_district: form.preferred_job_district || undefined,
 preferred_job_state: form.preferred_job_state || undefined,
 preferred_job_remote: form.preferred_job_remote,
 open_to_relocation: form.open_to_relocation,
 job_roles_of_interest: form.job_roles_of_interest || undefined,
 technical_skills: form.technical_skills || undefined,
 location_preferences:
 [form.preferred_job_city, form.preferred_job_district, form.preferred_job_state].filter(Boolean).join(',') || undefined,
 })
 toast.success('Preferences saved. AI matches are now smarter.')
 if (onSaved) await onSaved()
 if (onDismiss) onDismiss()
 } catch (error: any) {
 toast.error(error?.message ||'Failed to save job preferences')
 } finally {
 setSaving(false)
 }
 }

 const content = (
 <div className="rounded-none border border-slate-200 bg-white p-5 shadow-none">
 <div className="flex items-start justify-between gap-4">
 <div>
 <p className="text-xs font-semibold uppercase tracking-[0.14em] text-primary">Set up your AI job preferences</p>
 <h3 className="mt-1 font-display text-xl font-semibold text-foreground">Improve your AI matches</h3>
 <p className="text-sm text-muted-foreground">
 Help us personalize better recommendations with your location, skills, and role interests.
 </p>
 </div>
 {onDismiss && (
 <button
 type="button"className="rounded-xl p-2 text-muted-foreground hover:bg-muted"onClick={onDismiss}
 aria-label="Close">
 <X className="h-4 w-4"/>
 </button>
 )}
 </div>

 <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
 <span className="px-2.5 py-1 font-semibold text-primary">AI Match Readiness: {readiness.score}%</span>
 {readiness.missing.map((item) => (
 <span key={item} className="border border-slate-200 bg-white px-2.5 py-1 text-slate-600">
 Missing: {item}
 </span>
 ))}
 </div>

 <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-3">
 <div className="space-y-1">
 <label htmlFor={fid('preferred_job_city')} className="text-xs font-medium text-muted-foreground">
 Preferred city
 </label>
 <Input
 id={fid('preferred_job_city')}
 name="preferred_job_city"value={form.preferred_job_city}
 onChange={(e) => setForm((p) => ({ ...p, preferred_job_city: e.target.value }))}
 placeholder="Preferred city"/>
 </div>
 <div className="space-y-1">
 <label htmlFor={fid('preferred_job_district')} className="text-xs font-medium text-muted-foreground">
 Preferred district
 </label>
 <Input
 id={fid('preferred_job_district')}
 name="preferred_job_district"value={form.preferred_job_district}
 onChange={(e) => setForm((p) => ({ ...p, preferred_job_district: e.target.value }))}
 placeholder="Preferred district"/>
 </div>
 <div className="space-y-1">
 <label htmlFor={fid('preferred_job_state')} className="text-xs font-medium text-muted-foreground">
 Preferred state
 </label>
 <Input
 id={fid('preferred_job_state')}
 name="preferred_job_state"value={form.preferred_job_state}
 onChange={(e) => setForm((p) => ({ ...p, preferred_job_state: e.target.value }))}
 placeholder="Preferred state"/>
 </div>
 </div>

 <div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-2">
 <div className="space-y-1">
 <label htmlFor={fid('job_roles_of_interest')} className="text-xs font-medium text-muted-foreground">
 Preferred roles
 </label>
 <Input
 id={fid('job_roles_of_interest')}
 name="job_roles_of_interest"value={form.job_roles_of_interest}
 onChange={(e) => setForm((p) => ({ ...p, job_roles_of_interest: e.target.value }))}
 placeholder="Preferred roles (e.g. Frontend Developer)"/>
 </div>
 <div className="space-y-1">
 <label htmlFor={fid('technical_skills')} className="text-xs font-medium text-muted-foreground">
 Top skills
 </label>
 <Input
 id={fid('technical_skills')}
 name="technical_skills"value={form.technical_skills}
 onChange={(e) => setForm((p) => ({ ...p, technical_skills: e.target.value }))}
 placeholder="Top skills (e.g. React, JavaScript, SQL)"/>
 </div>
 </div>

 <div className="mt-3 flex flex-wrap gap-3">
 <label htmlFor={fid('preferred_job_remote')} className="inline-flex items-center gap-2 rounded-none border border-slate-200 bg-white px-3 py-2 text-sm">
 <input
 id={fid('preferred_job_remote')}
 name="preferred_job_remote"
type="checkbox"checked={form.preferred_job_remote}
 onChange={(e) => setForm((p) => ({ ...p, preferred_job_remote: e.target.checked }))}
 />
 Remote preference
 </label>
 <label htmlFor={fid('open_to_relocation')} className="inline-flex items-center gap-2 rounded-none border border-slate-200 bg-white px-3 py-2 text-sm">
 <input
 id={fid('open_to_relocation')}
 name="open_to_relocation"
type="checkbox"checked={form.open_to_relocation}
 onChange={(e) => setForm((p) => ({ ...p, open_to_relocation: e.target.checked }))}
 />
 Open to relocation
 </label>
 </div>

 <div className="mt-4 flex flex-wrap gap-2">
 <Button onClick={save} variant="gradient"className="rounded-xl"disabled={saving}>
 <Sparkles className="mr-2 h-4 w-4"/>
 {saving ?'Saving...':'Save preferences'}
 </Button>
 {onDismiss && (
 <Button onClick={onDismiss} variant="outline"className="rounded-xl">
 Skip for now
 </Button>
 )}
 </div>

 <div className="mt-3 text-xs text-muted-foreground">
 Tip: add your latest resume in profile to unlock even stronger AI matching signals.
 </div>
 </div>
 )

 if (!showAsModal) return content

 return (
 <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
 <div className={cn('w-full max-w-3xl')}>{content}</div>
 </div>
 )
}
