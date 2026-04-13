"use client"

import { motion } from 'framer-motion'
import {
 MapPin,
 Briefcase,
 Clock,
 DollarSign,
 Users,
 Building,
 CheckCircle,
 Calendar,
 X,
 Bookmark,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { MatchScorePieChart } from './MatchScorePieChart'
interface Job {
 id: string
 title: string
 description: string
 requirements?: string
 responsibilities?: string
 job_type: string
 status: string
 location: string | string[]
 state?: string
 district?: string
 city_or_town?: string
 village_or_locality?: string
 remote_work: boolean
 travel_required: boolean
 salary_min?: number
 salary_max?: number
 salary_currency: string
 experience_min?: number
 experience_max?: number
 education_level?: string | string[]
 education_degree?: string | string[]
 education_branch?: string | string[]
 skills_required?: string[]
 application_deadline?: string
 max_applications: number
 current_applications: number
 industry?: string
 selection_process?: string
 campus_drive_date?: string
 views_count: number
 applications_count: number
 created_at: string
 corporate_id?: string | null
 corporate_name?: string
 university_id?: string | null
 company_name?: string
 is_active: boolean
 can_apply: boolean
 application_status?: string
 number_of_openings?: number
 perks_and_benefits?: string
 eligibility_criteria?: string
 service_agreement_details?: string
 expiration_date?: string
 ctc_with_probation?: string
 ctc_after_probation?: string
 onsite_office?: boolean
 mode_of_work?: string
}

interface JobCardProps {
 job: Job
 onViewDescription: () => void
 onApply: () => void
 isApplying?: boolean
 cardIndex?: number
 showMatchScore?: boolean
 matchScore?: number
 /** Local / client-side bookmark (optional) */
 isSaved?: boolean
 onSaveToggle?: () => void
}

export function JobCard({
 job,
 onViewDescription,
 onApply,
 isApplying = false,
 cardIndex = 0,
 showMatchScore = false,
 matchScore,
 isSaved = false,
 onSaveToggle,
}: JobCardProps) {
 const formatStructuredLocation = () => {
 const parts = [job.village_or_locality, job.city_or_town, job.district, job.state].filter(Boolean)
 if (parts.length > 0) return parts.join(',')
 return Array.isArray(job.location) ? job.location.join(',') : job.location ||''}

 if (!job || typeof job !=='object') {
 console.error('Invalid job object:', job)
 return (
 <div className="rounded-none-none border p-6">
 <p className="text-center text-sm text-destructive">Invalid job data</p>
 </div>
 )
 }

 const formatSalary = (currency: string, min?: number, max?: number) => {
 try {
 if (!min && !max) return 'Compensation discussed'
 if (min && max) return `${currency} ${Number(min).toLocaleString()} – ${Number(max).toLocaleString()}`
 if (min) return `${currency} ${Number(min).toLocaleString()}+`
 if (max) return `${currency} Up to ${Number(max).toLocaleString()}`
 return'Compensation discussed'} catch (error) {
 console.error('Error formatting salary:', error, { min, max, currency })
 return'Compensation discussed'}
 }

 const formatExperience = (min?: number, max?: number) => {
 try {
 if (!min && !max) return 'Open level'
 if (min && max) return `${Number(min)}–${Number(max)} yrs`
 if (min) return `${Number(min)}+ yrs`
 if (max) return `Up to ${Number(max)} yrs`
 return'Open level'} catch (error) {
 console.error('Error formatting experience:', error, { min, max })
 return'Open level'}
 }

 const formatDate = (dateString: string) => {
 try {
 if (!dateString || typeof dateString !=='string') {
 return'—'}
 const date = new Date(dateString)
 if (isNaN(date.getTime())) {
 return'—'}
 return date.toLocaleDateString('en-US', {
 year:'numeric',
 month:'short',
 day:'numeric',
 })
 } catch (error) {
 console.error('Error formatting date:', error, dateString)
 return'—'}
 }

 const getJobTypeLabel = (jobType: string) => {
 const labels: Record<string, string> = {
 full_time:'Full-time',
 part_time:'Part-time',
 contract:'Contract',
 internship:'Internship',
 freelance:'Freelance',
 }
 return labels[jobType] || jobType.replace(/_/g,'')
 }

 const workModeLabel = () => {
 if (job.mode_of_work === 'hybrid') return 'Hybrid'
 if (job.mode_of_work === 'onsite') return 'On-site'
 if (job.mode_of_work === 'remote') return 'Remote'
 if (job.remote_work) return 'Remote'
 return 'On-site'
 }

 const isDeadlineNear = () => {
 try {
 if (!job.application_deadline || typeof job.application_deadline !=='string') return false
 const deadline = new Date(job.application_deadline)
 if (isNaN(deadline.getTime())) return false
 const now = new Date()
 const diffDays = Math.ceil((deadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
 return diffDays <= 7 && diffDays > 0
 } catch (error) {
 console.error('Error checking deadline near:', error)
 return false
 }
 }

 const isDeadlineExpired = () => {
 try {
 if (!job.application_deadline || typeof job.application_deadline !=='string') return false
 const deadline = new Date(job.application_deadline)
 if (isNaN(deadline.getTime())) return false
 return deadline < new Date()
 } catch (error) {
 console.error('Error checking deadline expired:', error)
 return false
 }
 }

 const canApply = () => {
 return !job.application_status && !isDeadlineExpired() && job.can_apply
 }

 const isOnCampusJob = () => {
 return !!(job.university_id && !job.corporate_id)
 }

 const employerName = job.corporate_name || job.company_name || ''
 const getApplicationStatusDisplay = (status: string) => {
 switch (status) {
 case'applied':
 return (
 <span className="inline-flex items-center justify-center gap-1 px-2.5 py-1 text-xs font-semibold text-primary">
 <CheckCircle className="h-3 w-3"/>
 Applied
 </span>
 )
 case'shortlisted':
 return (
 <span className="inline-flex items-center justify-center gap-1 px-2.5 py-1 text-xs font-semibold text-secondary">
 <Users className="h-3 w-3"/>
 Shortlisted
 </span>
 )
 case'selected':
 return (
 <span className="inline-flex items-center justify-center gap-1 px-2.5 py-1 text-xs font-semibold text-emerald-700">
 <CheckCircle className="h-3 w-3"/>
 Selected
 </span>
 )
 case'rejected':
 return (
 <span className="inline-flex items-center justify-center gap-1 px-2.5 py-1 text-xs font-semibold text-destructive">
 <X className="h-3 w-3"/>
 Not selected
 </span>
 )
 case'pending':
 return (
 <span className="inline-flex items-center justify-center gap-1 bg-muted px-2.5 py-1 text-xs font-semibold text-muted-foreground">
 <Clock className="h-3 w-3"/>
 Under review
 </span>
 )
 default:
 return null
 }
 }

 const initials = employerName
 ? employerName
 .split(/\s+/)
 .filter(Boolean)
 .slice(0, 2)
 .map((w) => w[0])
 .join('')
 .toUpperCase()
 : 'Co'
 return (
 <motion.article
 initial={{ opacity: 0, y: 12 }}
 animate={{ opacity: 1, y: 0 }}
 transition={{ duration: 0.35, delay: Math.min(cardIndex * 0.04, 0.2) }}
 className={cn('group flex h-full flex-col overflow-hidden rounded-none-none border bg-card transition-all duration-300','',
 )}
 >
 <div className="relative border-b px-5 pb-4 pt-5">
 <div className="flex gap-4">
 <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-none-none text-sm font-bold text-white shadow-md shadow-primary/20">
 {initials.slice(0, 3)}
 </div>
 <div className="min-w-0 flex-1">
 <div className="flex items-start justify-between gap-2">
 <h3 className="font-display text-lg font-semibold leading-snug tracking-tight text-foreground transition-colors group-hover:text-primary">
 {typeof job.title ==='string'? job.title : String(job.title ||'')}
 </h3>
 <div className="flex shrink-0 items-center gap-1">
 {onSaveToggle && (
 <button
 type="button"onClick={(e) => {
 e.stopPropagation()
 onSaveToggle()
 }}
 className={cn('rounded-none-none p-2 transition-colors',
 isSaved
 ?'text-primary':'text-muted-foreground hover:bg-muted hover:text-foreground',
 )}
 aria-label={isSaved ?'Remove saved job':'Save job'}
 >
 <Bookmark className={cn('h-4 w-4', isSaved &&'fill-current')} />
 </button>
 )}
 </div>
 </div>
 {employerName ? (
 <p className="mt-1 flex items-center gap-1.5 text-sm font-medium text-muted-foreground">
 <Building className="h-3.5 w-3.5 shrink-0"/>
 <span className="truncate">{employerName}</span>
 </p>
 ) : null}
 <div className="mt-3 flex flex-wrap items-center gap-2">
 {isOnCampusJob() && (
 <span className="border px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-primary">
 On campus
 </span>
 )}
 <span className="border border-border px-2.5 py-0.5 text-[11px] font-semibold">
 {getJobTypeLabel(typeof job.job_type ==='string'? job.job_type : String(job.job_type ||''))}
 </span>
 <span className="border px-2.5 py-0.5 text-[11px] font-semibold text-secondary">
 {workModeLabel()}
 </span>
 {showMatchScore && matchScore !== undefined && (
 <div className="flex items-center gap-2">
 <MatchScorePieChart score={matchScore} size={36} />
 </div>
 )}
 </div>
 </div>
 </div>
 </div>

 <div className="flex flex-1 flex-col px-5 py-4">
 <div className="grid grid-cols-2 gap-3 text-sm">
 <div className="flex items-start gap-2 text-muted-foreground">
 <MapPin className="mt-0.5 h-4 w-4 shrink-0"/>
 <span className="line-clamp-2 leading-snug">{formatStructuredLocation() ||'Location TBC'}</span>
 </div>
 <div className="flex items-center gap-2 text-muted-foreground">
 <DollarSign className="h-4 w-4 shrink-0"/>
 <span className="truncate font-medium">
 {formatSalary(job.salary_currency, job.salary_min, job.salary_max)}
 </span>
 </div>
 <div className="flex items-center gap-2 text-muted-foreground">
 <Briefcase className="h-4 w-4 shrink-0"/>
 <span>{formatExperience(job.experience_min, job.experience_max)}</span>
 </div>
 <div className="flex items-center gap-2 text-muted-foreground">
 <Users className="h-4 w-4 shrink-0"/>
 <span>
 {Number(job.current_applications || 0)} / {Number(job.max_applications || 0)} applicants
 </span>
 </div>
 </div>

 {job.skills_required && Array.isArray(job.skills_required) && job.skills_required.length > 0 && (
 <div className="mt-4 flex flex-wrap gap-1.5">
 {job.skills_required.slice(0, 4).map((skill, index) => {
 const skillText = typeof skill ==='string'? skill : String(skill ||'')
 return (
 <span
 key={index}
 className="rounded-none-none border px-2 py-0.5 text-[11px] font-medium">
 {skillText}
 </span>
 )
 })}
 {job.skills_required.length > 4 && (
 <span className="rounded-none-none border border-dashed border-border px-2 py-0.5 text-[11px] text-muted-foreground">
 +{job.skills_required.length - 4}
 </span>
 )}
 </div>
 )}

 <p className="mt-4 line-clamp-2 text-sm leading-relaxed text-muted-foreground">
 {typeof job.description ==='string'? job.description : String(job.description ||'')}
 </p>

 <div className="mt-auto space-y-2 pt-4">
 {job.industry && (
 <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
 <Building className="h-3 w-3"/>
 {typeof job.industry ==='string'? job.industry : String(job.industry ||'')}
 </p>
 )}
 <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
 {job.application_deadline && (
 <span className="inline-flex items-center gap-1">
 <Calendar className="h-3 w-3"/>
 Due {formatDate(job.application_deadline)}
 {isDeadlineNear() && (
 <span className="font-semibold text-amber-600"> · Soon</span>
 )}
 {isDeadlineExpired() && (
 <span className="font-semibold text-destructive"> · Closed</span>
 )}
 </span>
 )}
 <span className="inline-flex items-center gap-1">
 <Clock className="h-3 w-3"/>
 Posted {formatDate(job.created_at)}
 </span>
 </div>
 </div>

 {job.application_status && job.application_status !=='none'&& (
 <div className="mt-3 flex justify-center">{getApplicationStatusDisplay(job.application_status)}</div>
 )}

 {isDeadlineExpired() && !job.application_status && (
 <p className="mt-3 text-center text-xs font-medium text-destructive">Applications closed</p>
 )}

 <div className="mt-4 flex gap-2">
 <Button
 type="button"onClick={onViewDescription}
 variant="outline"className="h-10 flex-1 rounded-none-none font-semibold">
 View role
 </Button>
 <Button
 type="button"onClick={onApply}
 disabled={!canApply() || isApplying}
 variant="gradient"className="h-10 flex-1 rounded-none-none font-semibold shadow-md shadow-primary/15">
 {isApplying ? (
 <>
 <span className="mr-2 inline-block h-4 w-4 animate-spin border-2 border-white border-t-transparent"/>
 Applying…
 </>
 ) : (
 <>
 <CheckCircle className="mr-1.5 h-4 w-4"/>
 {job.application_status ==='applied'?'Applied': job.application_status ==='selected'?'Selected': job.application_status ==='rejected'?'Closed': job.application_status ==='shortlisted'?'Shortlisted': job.application_status ==='pending'?'In review': isDeadlineExpired()
 ?'Closed':'Apply'}
 </>
 )}
 </Button>
 </div>
 </div>
 </motion.article>
 )
}
