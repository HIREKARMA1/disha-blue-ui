"use client"

import { motion } from 'framer-motion'
import { MapPin, Briefcase, Clock, DollarSign, Users, Building, FileText, Calendar, MoreVertical, Edit, Trash2, ToggleLeft, ToggleRight, UserCheck } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { corporateChipClass } from '@/components/corporate/corporate-ui'
import { useState, useEffect, useRef } from 'react'

interface Job {
    id: string
    title: string
    description: string
    requirements?: string
    responsibilities?: string
    job_type: string
    status: string
    location: string | string[]
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
    corporate_id: string
    corporate_name?: string
    is_active: boolean
    can_apply: boolean
    // Additional fields
    number_of_openings?: number
    perks_and_benefits?: string
    eligibility_criteria?: string
    service_agreement_details?: string
    expiration_date?: string
    ctc_with_probation?: string
    ctc_after_probation?: string
    onsite_office?: boolean
    mode_of_work?: string
    state?: string
    district?: string
    city_or_town?: string
    village_or_locality?: string
}

interface CorporateJobCardProps {
    job: Job
    onViewDescription: () => void
    onEdit: () => void
    onDelete: () => void
    onStatusChange: (job: Job, newStatus: string) => void
    onViewAppliedStudents: () => void
    cardIndex?: number
}

export function CorporateJobCard({ job, onViewDescription, onEdit, onDelete, onStatusChange, onViewAppliedStudents, cardIndex: _cardIndex = 0 }: CorporateJobCardProps) {
    const [showDropdown, setShowDropdown] = useState(false)
    const dropdownRef = useRef<HTMLDivElement>(null)

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setShowDropdown(false)
            }
        }

        document.addEventListener('mousedown', handleClickOutside)
        return () => {
            document.removeEventListener('mousedown', handleClickOutside)
        }
    }, [])

    // Safety check - ensure job object is valid
    if (!job || typeof job !== 'object') {
        console.error('Invalid job object:', job)
        return (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-6">
                <p className="text-red-600 dark:text-red-400 text-center">Invalid job data</p>
            </div>
        )
    }

    const formatStructuredLocation = () => {
        const parts = [job.village_or_locality, job.city_or_town, job.district, job.state].filter(Boolean)
        if (parts.length > 0) return parts.join(', ')
        return Array.isArray(job.location) ? job.location.join(', ') : (job.location || '')
    }

    const formatSalary = (currency: string, min?: number, max?: number) => {
        try {
            if (!min && !max) return 'Not specified'
            if (min && max) return `${currency} ${Number(min).toLocaleString()} - ${Number(max).toLocaleString()}`
            if (min) return `${currency} ${Number(min).toLocaleString()}+`
            if (max) return `${currency} Up to ${Number(max).toLocaleString()}`
            return 'Not specified'
        } catch (error) {
            console.error('Error formatting salary:', error, { min, max, currency })
            return 'Not specified'
        }
    }

    const formatExperience = (min?: number, max?: number) => {
        try {
            if (min === undefined && max === undefined) return 'Not specified'
            if (min !== undefined && max !== undefined) return `${Number(min)}-${Number(max)} years`
            if (min !== undefined) return `${Number(min)}+ years`
            if (max !== undefined) return `Up to ${Number(max)} years`
            return 'Not specified'
        } catch (error) {
            console.error('Error formatting experience:', error, { min, max })
            return 'Not specified'
        }
    }

    const formatDate = (dateString: string) => {
        try {
            if (!dateString || typeof dateString !== 'string') {
                return 'Invalid date'
            }
            const date = new Date(dateString)
            if (isNaN(date.getTime())) {
                return 'Invalid date'
            }
            return date.toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric'
            })
        } catch (error) {
            console.error('Error formatting date:', error, dateString)
            return 'Invalid date'
        }
    }

    const getJobTypeColor = (jobType: string) => {
        const colors = {
            full_time: 'bg-primary/12 text-primary border-primary/20',
            part_time: 'bg-secondary/12 text-secondary-foreground border-secondary/25',
            contract: 'bg-muted text-foreground border-border',
            internship: 'bg-primary/8 text-primary border-border',
            freelance: 'bg-muted/80 text-foreground border-border',
        }
        return colors[jobType as keyof typeof colors] || colors.full_time
    }

    const getJobTypeLabel = (jobType: string) => {
        const labels = {
            full_time: 'Full Time',
            part_time: 'Part Time',
            contract: 'Contract',
            internship: 'Internship',
            freelance: 'Freelance'
        }
        return labels[jobType as keyof typeof labels] || jobType
    }

    const getStatusColor = (status: string) => {
        const colors = {
            active: 'bg-emerald-500/12 text-emerald-700 dark:text-emerald-300 border-emerald-500/25',
            inactive: 'bg-amber-500/12 text-amber-800 dark:text-amber-200 border-amber-500/25',
            closed: 'bg-destructive/10 text-destructive border-destructive/20',
            paused: 'bg-muted text-muted-foreground border-border',
        }
        return colors[status as keyof typeof colors] || colors.inactive
    }

    const getStatusLabel = (status: string) => {
        const labels = {
            active: 'Active',
            inactive: 'Inactive',
            closed: 'Closed',
            paused: 'Paused'
        }
        return labels[status as keyof typeof labels] || status
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className={cn(
                'group flex h-full flex-col overflow-hidden rounded-2xl border border-border/80 bg-card/90',
                'shadow-[0_12px_40px_-28px_rgba(0,0,0,0.18)] transition-all duration-300',
                'hover:border-primary/25 hover:shadow-[0_20px_56px_-36px_hsl(var(--primary)/0.35)]',
            )}
        >
            {/* Header */}
            <div className="flex-shrink-0 border-b border-border/60 p-6">
                <div className="flex items-start justify-between mb-3">
                    <div className="flex-1 min-w-0 pr-2">
                        <h3 className="text-lg font-semibold tracking-tight text-foreground group-hover:text-primary transition-colors line-clamp-2">
                            {typeof job.title === 'string' ? job.title : String(job.title || '')}
                        </h3>
                        {job.corporate_name && (
                            <p className="text-sm text-muted-foreground mt-1 flex items-center gap-2">
                                <Building className="w-4 h-4" />
                                {typeof job.corporate_name === 'string' ? job.corporate_name : String(job.corporate_name || '')}
                            </p>
                        )}
                    </div>
                    <div className="flex flex-col items-end gap-2">
                        <div className="flex items-center gap-2">
                            <span className={cn(
                                'rounded-full border px-2.5 py-0.5 text-xs font-medium',
                                getJobTypeColor(typeof job.job_type === 'string' ? job.job_type : String(job.job_type || ''))
                            )}>
                                {getJobTypeLabel(typeof job.job_type === 'string' ? job.job_type : String(job.job_type || ''))}
                            </span>
                            <span className={cn(
                                'rounded-full border px-2.5 py-0.5 text-xs font-medium',
                                getStatusColor(typeof job.status === 'string' ? job.status : String(job.status || ''))
                            )}>
                                {getStatusLabel(typeof job.status === 'string' ? job.status : String(job.status || ''))}
                            </span>
                        </div>

                        {/* 3-dots dropdown menu */}
                        <div className="relative" ref={dropdownRef}>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setShowDropdown(!showDropdown)}
                                className="h-9 w-9 shrink-0 rounded-xl p-0 hover:bg-muted"
                            >
                                <MoreVertical className="w-4 h-4" />
                            </Button>

                            {showDropdown && (
                                <div className="absolute right-0 top-10 z-50 w-52 overflow-hidden rounded-xl border border-border bg-popover shadow-xl">
                                    <div className="py-1">
                                        <button
                                            onClick={() => {
                                                onViewAppliedStudents()
                                                setShowDropdown(false)
                                            }}
                                            className="flex w-full items-center gap-2 px-4 py-2.5 text-left text-sm text-foreground hover:bg-primary/8"
                                        >
                                            <UserCheck className="w-4 h-4" />
                                            View Applied Students
                                        </button>

                                        <button
                                            onClick={() => {
                                                onEdit()
                                                setShowDropdown(false)
                                            }}
                                            className="flex w-full items-center gap-2 px-4 py-2.5 text-left text-sm text-foreground hover:bg-primary/8"
                                        >
                                            <Edit className="w-4 h-4" />
                                            Edit Job
                                        </button>

                                        {/* Specific status options */}
                                        {job.status !== 'active' && (
                                            <button
                                                onClick={() => {
                                                    onStatusChange(job, 'active')
                                                    setShowDropdown(false)
                                                }}
                                                className="flex w-full items-center gap-2 px-4 py-2.5 text-left text-sm text-foreground hover:bg-emerald-500/10"
                                            >
                                                <ToggleRight className="w-4 h-4" />
                                                Set to Active
                                            </button>
                                        )}

                                        {job.status !== 'inactive' && (
                                            <button
                                                onClick={() => {
                                                    onStatusChange(job, 'inactive')
                                                    setShowDropdown(false)
                                                }}
                                                className="flex w-full items-center gap-2 px-4 py-2.5 text-left text-sm text-foreground hover:bg-amber-500/10"
                                            >
                                                <ToggleLeft className="w-4 h-4" />
                                                Set to Inactive
                                            </button>
                                        )}

                                        {job.status !== 'closed' && (
                                            <button
                                                onClick={() => {
                                                    onStatusChange(job, 'closed')
                                                    setShowDropdown(false)
                                                }}
                                                className="flex w-full items-center gap-2 px-4 py-2.5 text-left text-sm text-foreground hover:bg-destructive/10"
                                            >
                                                <ToggleLeft className="w-4 h-4" />
                                                Set to Closed
                                            </button>
                                        )}
                                        <button
                                            onClick={() => {
                                                onDelete()
                                                setShowDropdown(false)
                                            }}
                                            className="flex w-full items-center gap-2 px-4 py-2.5 text-left text-sm text-destructive hover:bg-destructive/10"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                            Delete Job
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Job Meta */}
                <div className="grid grid-cols-2 gap-3 text-sm">
                    <div className="flex items-center gap-2 text-muted-foreground text-sm">
                        <MapPin className="w-4 h-4 shrink-0 text-primary/70" />
                        <span className="truncate">{formatStructuredLocation()}</span>
                        {(() => {
                            // Determine work mode display
                            if (job.mode_of_work) {
                                if (job.mode_of_work === 'hybrid') {
                                    return (
                                        <span className={cn(corporateChipClass, 'shrink-0')}>Hybrid</span>
                                    )
                                } else if (job.mode_of_work === 'onsite') {
                                    return (
                                        <span className={cn(corporateChipClass, 'shrink-0')}>Onsite</span>
                                    )
                                } else if (job.mode_of_work === 'remote') {
                                    return (
                                        <span className={cn(corporateChipClass, 'shrink-0 bg-secondary/10')}>Remote</span>
                                    )
                                }
                            } else {
                                // Fallback for existing jobs
                                if (job.remote_work) {
                                    return (
                                        <span className={cn(corporateChipClass, 'shrink-0 bg-secondary/10')}>Remote</span>
                                    )
                                } else {
                                    return (
                                        <span className={cn(corporateChipClass, 'shrink-0')}>Onsite</span>
                                    )
                                }
                            }
                        })()}
                    </div>

                    <div className="flex items-center gap-2 text-muted-foreground text-sm">
                        <DollarSign className="w-4 h-4 shrink-0 text-primary/70" />
                        <span className="truncate">{formatSalary(job.salary_currency, job.salary_min, job.salary_max)}</span>
                    </div>

                    <div className="flex items-center gap-2 text-muted-foreground text-sm">
                        <Briefcase className="w-4 h-4 shrink-0 text-primary/70" />
                        <span className="truncate">{formatExperience(job.experience_min, job.experience_max)}</span>
                    </div>

                    <div className="flex items-center gap-2 text-muted-foreground text-sm">
                        <Users className="w-4 h-4 shrink-0 text-primary/70" />
                        <span className="truncate">{Number(job.current_applications || 0)}/{Number(job.max_applications || 0)}</span>
                    </div>
                </div>

                {/* Skills */}
                {job.skills_required && Array.isArray(job.skills_required) && job.skills_required.length > 0 && (
                    <div className="mt-4">
                        <div className="flex flex-wrap gap-2">
                            {job.skills_required.slice(0, 3).map((skill, index) => {
                                // Ensure skill is a string
                                const skillText = typeof skill === 'string' ? skill : String(skill || '')
                                return (
                                    <span
                                        key={index}
                                        className={corporateChipClass}
                                    >
                                        {skillText}
                                    </span>
                                )
                            })}
                            {job.skills_required.length > 3 && (
                                <span className={cn(corporateChipClass, 'bg-muted/70')}>
                                    +{job.skills_required.length - 3} more
                                </span>
                            )}
                        </div>
                    </div>
                )}
            </div>

            {/* Content */}
            <div className="flex flex-1 flex-col p-6">
                <p className="text-sm leading-relaxed text-muted-foreground line-clamp-3 mb-4">
                    {typeof job.description === 'string' ? job.description : String(job.description || '')}
                </p>

                {/* Additional Info */}
                <div className="space-y-2 mb-4 flex-1">
                    {job.industry && (
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <Building className="w-3 h-3" />
                            <span>{typeof job.industry === 'string' ? job.industry : String(job.industry || '')}</span>
                        </div>
                    )}

                    {job.application_deadline && (
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <Calendar className="w-3 h-3" />
                            <span>Deadline: {formatDate(job.application_deadline)}</span>
                        </div>
                    )}

                    <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                        <Clock className="w-3 h-3" />
                        <span>Posted {formatDate(job.created_at)}</span>
                    </div>
                </div>

                {/* Action Button - Only View JD */}
                <div className="mt-auto border-t border-border/50 pt-4">
                    <Button
                        onClick={onViewDescription}
                        variant="outline"
                        size="sm"
                        className="w-full gap-2 rounded-xl border-border/80 transition-all duration-200 hover:border-primary/35 hover:bg-primary/5 hover:shadow-sm"
                    >
                        <FileText className="w-4 h-4" />
                        View Job Details
                    </Button>
                </div>
            </div>
        </motion.div>
    )
}