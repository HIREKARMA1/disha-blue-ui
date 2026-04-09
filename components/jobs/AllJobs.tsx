"use client"

import { useState, useEffect } from 'react'
import { Search, Loader2, ChevronLeft, ChevronRight, X, Bookmark, SlidersHorizontal } from 'lucide-react'
import { cn } from '@/lib/utils'
import {
    jobsHeroClass,
    jobsSurfaceClass,
    jobsLabelClass,
    jobsSelectClassName,
    loadSavedJobIds,
    toggleSavedJobId,
    jobsFilterBackdropClass,
    jobsFilterDrawerClass,
    jobsFilterPanelClass,
} from '@/components/jobs/jobs-ui'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { JobCard } from '@/components/dashboard/JobCard'
import { ApplicationModal } from '@/components/dashboard/ApplicationModal'
import { JobDescriptionModal } from '@/components/dashboard/JobDescriptionModal'
import { apiClient } from '@/lib/api'
import { toast } from 'react-hot-toast'
import { useRouter } from 'next/navigation'
import { profileService, type ProfileCompletionResponse } from '@/services/profileService'

// Types (reusing from student/jobs/page.tsx logic)
export interface Job {
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
    pincode?: string
    remote_work: boolean
    travel_required: boolean
    salary_min?: number
    salary_max?: number
    salary_currency: string
    experience_min?: number
    experience_max?: number
    education_level?: string | string[]
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
    education_degree?: string | string[]
    education_branch?: string | string[]
    company_name?: string
    company_logo?: string
    company_website?: string
    company_address?: string
    company_size?: string
    company_type?: string
    company_founded?: number
    company_description?: string
    contact_person?: string
    contact_designation?: string
}

interface JobSearchResponse {
    jobs: Job[]
    total_count: number
    page: number
    limit: number
    total_pages: number
    has_next: boolean
    has_prev: boolean
}

export function AllJobs() {
    const router = useRouter()
    const [jobs, setJobs] = useState<Job[]>([])
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState('')
    const [pagination, setPagination] = useState({
        page: 1,
        limit: 12,
        total: 0,
        total_pages: 0
    })

    // Application state
    const [selectedJob, setSelectedJob] = useState<Job | null>(null)
    const [showApplicationModal, setShowApplicationModal] = useState(false)
    const [isApplying, setIsApplying] = useState(false)
    const [applyingJobId, setApplyingJobId] = useState<string | null>(null)

    // Description Modal state
    const [viewJob, setViewJob] = useState<Job | null>(null)

    // User state
    const [isLoggedIn, setIsLoggedIn] = useState(false)
    const [profileCompletion, setProfileCompletion] = useState<ProfileCompletionResponse | null>(null)
    const [studentProfile, setStudentProfile] = useState<{ degree?: string; branch?: string } | null>(null)

    const [savedJobIds, setSavedJobIds] = useState<string[]>([])
    const [savedOnly, setSavedOnly] = useState(false)

    // Filter state
    const [showFilters, setShowFilters] = useState(false)
    const [jobStatusFilter, setJobStatusFilter] = useState<'all' | 'open' | 'closed'>('all')
    const [datePostedFilter, setDatePostedFilter] = useState<'all' | '24h' | '7d' | '15d' | '30d'>('all')
    const [filters, setFilters] = useState({
        location: '',
        state: '',
        district: '',
        city_or_town: '',
        village_or_locality: '',
        pincode: '',
        industry: '',
        job_type: '',
        remote_work: '',
        experience_min: '',
        experience_max: '',
        salary_min: '',
        salary_max: ''
    })

    const handleFilterChange = (key: string, value: string) => {
        setFilters(prev => ({ ...prev, [key]: value }))
    }

    const clearFilters = () => {
        setFilters({
            location: '',
            state: '',
            district: '',
            city_or_town: '',
            village_or_locality: '',
            pincode: '',
            industry: '',
            job_type: '',
            remote_work: '',
            experience_min: '',
            experience_max: '',
            salary_min: '',
            salary_max: ''
        })
        setSearchTerm('')
        setJobStatusFilter('all')
        setDatePostedFilter('all')
        fetchJobs(1)
    }

    useEffect(() => {
        setSavedJobIds(loadSavedJobIds())
    }, [])

    const refreshSavedJobs = () => setSavedJobIds(loadSavedJobIds())

    const handleSaveToggleForJob = (jobId: string) => {
        toggleSavedJobId(jobId)
        refreshSavedJobs()
    }

    useEffect(() => {
        // Check login status on mount
        const checkLoginStatus = async () => {
            const token = apiClient.getAccessToken()
            if (token) {
                setIsLoggedIn(true)
                try {
                    const profile = await profileService.getProfile()
                    setStudentProfile({
                        degree: profile.degree,
                        branch: profile.branch
                    })
                    const completion = await profileService.getProfileCompletion()
                    setProfileCompletion(completion)
                } catch (error) {
                    // console.error('Error fetching profile:', error)
                    // Silent fail if not logged in or token invalid (let component continue)
                }
            }
        }
        checkLoginStatus()
    }, [])

    useEffect(() => {
        fetchJobs(pagination.page)
    }, [pagination.page]) // Refetch on page change

    useEffect(() => {
        // Refetch when job status filter changes
        fetchJobs(1)
    }, [jobStatusFilter])

    useEffect(() => {
        // Refetch when date posted filter changes
        fetchJobs(1)
    }, [datePostedFilter])

    // Search debounce could be added here, simplified for now
    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault()
        setPagination(prev => ({ ...prev, page: 1 }))
        fetchJobs(1)
    }

    const fetchJobs = async (page = 1) => {
        try {
            setLoading(true)
            // Use apiClient to fetch public jobs
            // Note: The backend route /jobs/ is assumed to be public or handled by interceptor if token exists.
            const params = new URLSearchParams()
            params.set('page', String(page))
            params.set('limit', String(pagination.limit))

            // Sort by created_at descending (most recent first)
            params.set('sort_by', 'created_at')
            params.set('sort_order', 'desc')

            if (searchTerm) params.set('keyword', searchTerm)

            // Add other filters
            Object.entries(filters).forEach(([key, value]) => {
                if (value) params.set(key, value)
            })

            // Note: jobStatusFilter 'open'/'closed' logic might need backend support or frontend filtering
            // For now, let's assume 'status' param if supported, or filter client side.
            // But since pagination is server-side, it's best to send to backend.
            // If backend doesn't support 'status' filter for public jobs yet, we might see mixed results.
            // The user requested UI filter, we should try to support it. 
            // If the PublicJobService supports status filtering (it filters Active by default), logic might need tweak if 'closed' is requested.
            // However, public job listing usually only implies OPEN/ACTIVE jobs.
            // If user wants to see 'closed' jobs publicly... that's unusual.
            // Let's stick to standard filters for now and maybe ignore 'all'|'open'|'closed' for public API 
            // unless we know backend supports it. The `PublicJobService` filters `JobStatus.ACTIVE`.
            // So we can only show active jobs.
            // If the dropdown is strictly required to FUNCTION, we'd need backend changes to allow querying non-active jobs publicly?
            // "Open Jobs" (Active) is default. "Closed Jobs" ... probably shouldn't be shown publicly.
            // I'll leave the dropdown in UI as requested but it might effectively be decorative if only Active jobs are returned.

            // Using direct get because we need to handle the response specific cleaning logic
            // Use the PUBLIC endpoint which bypasses university filtering
            const response = await apiClient.client.get(`/public/jobs/?${params}`)
            const data: JobSearchResponse = response.data

            // --- CLEANING LOGIC START (Copied from student/jobs/page.tsx for consistency) ---
            const deepCleanObject = (obj: any): any => {
                if (obj === null || obj === undefined) return obj
                if (typeof obj !== 'object') return obj
                if (Array.isArray(obj)) return obj.map(deepCleanObject)
                if ('type' in obj && 'loc' in obj && 'msg' in obj) return null
                const cleaned: any = {}
                for (const [key, value] of Object.entries(obj)) {
                    if (value && typeof value === 'object' && 'type' in value && 'loc' in value && 'msg' in value) {
                        cleaned[key] = null
                    } else if (value && typeof value === 'object') {
                        cleaned[key] = deepCleanObject(value)
                    } else {
                        cleaned[key] = value
                    }
                }
                return cleaned
            }

            const cleanedData = deepCleanObject(data)
            let validatedJobs = (cleanedData.jobs || []).map((job: any) => ({
                ...job,
                // Ensure primitive types
                title: String(job.title || ''),
                description: String(job.description || ''),
                job_type: String(job.job_type || ''),
                status: String(job.status || ''),
                location: String(job.location || ''),
                remote_work: Boolean(job.remote_work),
                travel_required: Boolean(job.travel_required),
                salary_currency: String(job.salary_currency || 'INR'),
                created_at: String(job.created_at || ''),
                is_active: Boolean(job.is_active),
                can_apply: Boolean(job.can_apply),
                // Map other necessary fields... simplified for brevity but essential ones included
                salary_min: job.salary_min ? Number(job.salary_min) : undefined,
                salary_max: job.salary_max ? Number(job.salary_max) : undefined,
                experience_min: job.experience_min ? Number(job.experience_min) : undefined,
                experience_max: job.experience_max ? Number(job.experience_max) : undefined,
                skills_required: Array.isArray(job.skills_required) ? job.skills_required.map(String) : [],
                application_deadline: job.application_deadline ? String(job.application_deadline) : undefined,
                max_applications: Number(job.max_applications || 0),
                current_applications: Number(job.current_applications || 0),
                industry: job.industry ? String(job.industry) : undefined,
                corporate_name: job.corporate_name ? String(job.corporate_name) : undefined,
                company_name: job.company_name ? String(job.company_name) : undefined,
            }))
            // --- CLEANING LOGIC END ---

            // Apply client-side status filtering
            let filteredByStatus = validatedJobs
            if (jobStatusFilter === 'open') {
                // Open jobs: can_apply is true and application_deadline hasn't passed
                filteredByStatus = validatedJobs.filter((job: Job) => {
                    const isOpen = job.can_apply && job.is_active
                    // Check if deadline hasn't passed
                    if (job.application_deadline) {
                        const deadline = new Date(job.application_deadline)
                        const now = new Date()
                        return isOpen && deadline > now
                    }
                    return isOpen
                })
            } else if (jobStatusFilter === 'closed') {
                // Closed jobs: can_apply is false OR deadline has passed
                filteredByStatus = validatedJobs.filter((job: Job) => {
                    if (!job.can_apply || !job.is_active) return true
                    if (job.application_deadline) {
                        const deadline = new Date(job.application_deadline)
                        const now = new Date()
                        return deadline <= now
                    }
                    return false
                })
            }
            // 'all' shows everything (no filter)

            // Apply date posted filter
            let filteredByDate = filteredByStatus
            if (datePostedFilter !== 'all') {
                const now = new Date()
                const filterHours = {
                    '24h': 24,
                    '7d': 24 * 7,
                    '15d': 24 * 15,
                    '30d': 24 * 30
                }[datePostedFilter] || 0

                filteredByDate = filteredByStatus.filter((job: Job) => {
                    if (!job.created_at) return false
                    const jobDate = new Date(job.created_at)
                    const hoursDiff = (now.getTime() - jobDate.getTime()) / (1000 * 60 * 60)
                    return hoursDiff <= filterHours
                })
            }

            // Sort jobs by created_at (most recent first)
            const sortedJobs = filteredByDate.sort((a: Job, b: Job) => {
                const dateA = a.created_at ? new Date(a.created_at).getTime() : 0
                const dateB = b.created_at ? new Date(b.created_at).getTime() : 0
                return dateB - dateA // Descending order
            })

            setJobs(sortedJobs)
            setPagination({
                page: data.page || 1,
                limit: data.limit || 12,
                total: data.total_count || 0,
                total_pages: data.total_pages || 1
            })
        } catch (error) {
            console.error('Error fetching jobs:', error)
            toast.error('Failed to load jobs')
            setJobs([])
        } finally {
            setLoading(false)
        }
    }

    const handleApplyClick = (job: Job) => {
        // 1. Check Login
        if (!isLoggedIn) {
            const returnUrl = encodeURIComponent('/jobs')
            router.push(`/auth/login?redirect=${returnUrl}`)
            return
        }

        // 2. Check Role (Implicitly handled by profile check) & Eligibility
        if (!studentProfile) {
            // If they are logged in but profile fetch failed or not a student
            // This might happen if user is corporate or university.
            // We could check user role from token but for now let's lenient check or re-fetch?
            // Assuming strict student apply.
        }

        if (profileCompletion && profileCompletion.completion_percentage < 75) {
            toast.error('Profile completion must be at least 75% to apply.')
            return
        }

        if (!job.can_apply) {
            toast.error('Applications are closed for this job.')
            return
        }

        setSelectedJob(job)
        setShowApplicationModal(true)
    }

    const handleApplySubmit = async (data: any) => {
        if (!selectedJob) return

        try {
            setIsApplying(true)
            setApplyingJobId(selectedJob.id)

            await apiClient.applyForJob(selectedJob.id, {
                job_id: selectedJob.id,
                cover_letter: data.cover_letter,
                expected_salary: data.expected_salary ? Number(data.expected_salary) : null,
                availability_date: data.availability_date
            })

            toast.success('Application submitted successfully!')
            setShowApplicationModal(false)

            // Update the job status immediately in the local state
            setJobs(prevJobs => prevJobs.map(job =>
                job.id === selectedJob.id
                    ? { ...job, application_status: 'applied', can_apply: false }
                    : job
            ))

            // Also refetch to ensure data consistency
            fetchJobs(pagination.page)
        } catch (error: any) {
            console.error('Application error:', error)
            let errorMessage = 'Failed to submit application'
            const detail = error.response?.data?.detail

            if (typeof detail === 'string') {
                errorMessage = detail
            } else if (Array.isArray(detail)) {
                // Handle array of errors (FastAPI standard validation error)
                errorMessage = detail.map((err: any) => err.msg || JSON.stringify(err)).join(', ')
            } else if (typeof detail === 'object' && detail !== null) {
                // Handle single object error
                errorMessage = detail.msg || JSON.stringify(detail)
            }

            toast.error(errorMessage)
        } finally {
            setIsApplying(false)
            setApplyingJobId(null)
        }
    }

    const displayedJobs = savedOnly ? jobs.filter((j) => savedJobIds.includes(j.id)) : jobs

    const filterFieldsGrid = (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            <div>
                <label className={jobsLabelClass}>Legacy location</label>
                <Input
                    placeholder="City, state"
                    value={filters.location}
                    onChange={(e) => handleFilterChange('location', e.target.value)}
                    className="rounded-xl"
                />
            </div>
            <div>
                <label className={jobsLabelClass}>State</label>
                <Input
                    value={filters.state}
                    onChange={(e) => handleFilterChange('state', e.target.value)}
                    placeholder="State"
                    className="rounded-xl"
                />
            </div>
            <div>
                <label className={jobsLabelClass}>District</label>
                <Input
                    value={filters.district}
                    onChange={(e) => handleFilterChange('district', e.target.value)}
                    placeholder="District"
                    className="rounded-xl"
                />
            </div>
            <div>
                <label className={jobsLabelClass}>City / town</label>
                <Input
                    value={filters.city_or_town}
                    onChange={(e) => handleFilterChange('city_or_town', e.target.value)}
                    placeholder="City / town"
                    className="rounded-xl"
                />
            </div>
            <div>
                <label className={jobsLabelClass}>Village / locality</label>
                <Input
                    value={filters.village_or_locality}
                    onChange={(e) => handleFilterChange('village_or_locality', e.target.value)}
                    placeholder="Locality"
                    className="rounded-xl"
                />
            </div>
            <div>
                <label className={jobsLabelClass}>Pincode</label>
                <Input
                    value={filters.pincode}
                    onChange={(e) => handleFilterChange('pincode', e.target.value)}
                    placeholder="Pincode"
                    className="rounded-xl"
                />
            </div>
            <div>
                <label className={jobsLabelClass}>Industry</label>
                <select
                    value={filters.industry}
                    onChange={(e) => handleFilterChange('industry', e.target.value)}
                    className={jobsSelectClassName()}
                >
                    <option value="">All industries</option>
                    <option value="Technology">Technology</option>
                    <option value="Finance">Finance</option>
                    <option value="Healthcare">Healthcare</option>
                    <option value="Education">Education</option>
                    <option value="Manufacturing">Manufacturing</option>
                    <option value="Retail">Retail</option>
                    <option value="Consulting">Consulting</option>
                </select>
            </div>
            <div>
                <label className={jobsLabelClass}>Job type</label>
                <select
                    value={filters.job_type}
                    onChange={(e) => handleFilterChange('job_type', e.target.value)}
                    className={jobsSelectClassName()}
                >
                    <option value="">All types</option>
                    <option value="full_time">Full Time</option>
                    <option value="part_time">Part Time</option>
                    <option value="contract">Contract</option>
                    <option value="internship">Internship</option>
                    <option value="freelance">Freelance</option>
                </select>
            </div>
            <div>
                <label className={jobsLabelClass}>Remote work</label>
                <select
                    value={filters.remote_work}
                    onChange={(e) => handleFilterChange('remote_work', e.target.value)}
                    className={jobsSelectClassName()}
                >
                    <option value="">All</option>
                    <option value="true">Remote only</option>
                    <option value="false">On-site only</option>
                </select>
            </div>
            <div>
                <label className={jobsLabelClass}>Min experience (years)</label>
                <Input
                    type="number"
                    placeholder="0"
                    value={filters.experience_min}
                    onChange={(e) => handleFilterChange('experience_min', e.target.value)}
                    className="rounded-xl"
                />
            </div>
            <div>
                <label className={jobsLabelClass}>Max experience (years)</label>
                <Input
                    type="number"
                    placeholder="10"
                    value={filters.experience_max}
                    onChange={(e) => handleFilterChange('experience_max', e.target.value)}
                    className="rounded-xl"
                />
            </div>
            <div>
                <label className={jobsLabelClass}>Min salary (INR)</label>
                <Input
                    type="number"
                    placeholder="300000"
                    value={filters.salary_min}
                    onChange={(e) => handleFilterChange('salary_min', e.target.value)}
                    className="rounded-xl"
                />
            </div>
            <div>
                <label className={jobsLabelClass}>Max salary (INR)</label>
                <Input
                    type="number"
                    placeholder="2000000"
                    value={filters.salary_max}
                    onChange={(e) => handleFilterChange('salary_max', e.target.value)}
                    className="rounded-xl"
                />
            </div>
            <div className="flex flex-col gap-2 sm:col-span-2 lg:col-span-3 xl:col-span-4 sm:flex-row sm:items-center">
                <Button
                    type="button"
                    variant="gradient"
                    className="h-11 rounded-xl px-6 font-semibold shadow-md shadow-primary/15"
                    onClick={(e) => {
                        handleSearch(e)
                        setShowFilters(false)
                    }}
                >
                    Apply filters
                </Button>
                <Button type="button" variant="outline" className="h-11 rounded-xl font-semibold" onClick={clearFilters}>
                    Clear all
                </Button>
            </div>
        </div>
    )

    return (
        <div className="w-full">
            <div className={cn(jobsHeroClass, 'mb-6')}>
                <div className="relative z-[1] max-w-3xl">
                    <p className="font-display text-xs font-semibold uppercase tracking-[0.2em] text-primary">Discover</p>
                    <h1 className="font-display mt-3 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                        Roles worth your attention
                    </h1>
                    <p className="mt-3 max-w-xl text-pretty text-base leading-relaxed text-muted-foreground">
                        Search startups and teams hiring near you—filter by place, work mode, and role type without the
                        legacy job-board noise.
                    </p>
                    <div className="mt-5 flex flex-wrap gap-2">
                        <span className="rounded-full border border-border/80 bg-background/60 px-3 py-1 text-xs font-semibold text-foreground/90 backdrop-blur-sm">
                            {new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                        </span>
                        {savedJobIds.length > 0 && (
                            <button
                                type="button"
                                onClick={() => setSavedOnly((s) => !s)}
                                className={cn(
                                    'inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold transition-colors',
                                    savedOnly
                                        ? 'border-primary bg-primary/10 text-primary'
                                        : 'border-border bg-background/60 text-foreground/80 hover:border-primary/40',
                                )}
                            >
                                <Bookmark className={cn('h-3.5 w-3.5', savedOnly && 'fill-current')} />
                                Saved ({savedJobIds.length})
                            </button>
                        )}
                    </div>
                </div>
            </div>

            <div className={cn(jobsSurfaceClass, 'sticky top-20 z-30 mb-6 p-4 sm:p-5')}>
                <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
                    <div className="relative min-w-0 flex-1">
                        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                            type="search"
                            placeholder="Role, skill, company, location…"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSearch(e)}
                            className="h-11 rounded-xl pl-10"
                        />
                    </div>
                    <div className="flex flex-wrap gap-2">
                        <Button
                            type="button"
                            variant="outline"
                            className="h-11 rounded-xl font-semibold lg:inline-flex"
                            onClick={() => setShowFilters(!showFilters)}
                        >
                            <SlidersHorizontal className="mr-2 h-4 w-4" />
                            Filters
                        </Button>
                        <div className="relative min-w-[9rem] flex-1 sm:flex-initial">
                            <select
                                value={jobStatusFilter}
                                onChange={(e) => {
                                    const newFilter = e.target.value as 'all' | 'open' | 'closed'
                                    setJobStatusFilter(newFilter)
                                }}
                                className={jobsSelectClassName('h-11')}
                            >
                                <option value="all">All listings</option>
                                <option value="open">Open</option>
                                <option value="closed">Closed</option>
                            </select>
                        </div>
                        <div className="relative min-w-[10rem] flex-1 sm:flex-initial">
                            <select
                                value={datePostedFilter}
                                onChange={(e) => {
                                    const newFilter = e.target.value as 'all' | '24h' | '7d' | '15d' | '30d'
                                    setDatePostedFilter(newFilter)
                                }}
                                className={jobsSelectClassName('h-11')}
                            >
                                <option value="all">Any post date</option>
                                <option value="24h">Last 24 hours</option>
                                <option value="7d">Last 7 days</option>
                                <option value="15d">Last 15 days</option>
                                <option value="30d">Last 30 days</option>
                            </select>
                        </div>
                        <Button
                            type="button"
                            variant="gradient"
                            className="h-11 shrink-0 rounded-xl px-5 font-semibold shadow-md shadow-primary/15"
                            onClick={(e) => handleSearch(e)}
                        >
                            Search
                        </Button>
                    </div>
                </div>

                {showFilters && (
                    <div className="mt-4 hidden border-t border-border/60 pt-5 lg:block">{filterFieldsGrid}</div>
                )}
            </div>

            {showFilters && (
                <div className={jobsFilterDrawerClass}>
                    <button
                        type="button"
                        className={jobsFilterBackdropClass}
                        onClick={() => setShowFilters(false)}
                        aria-label="Close filters"
                    />
                    <div className={jobsFilterPanelClass}>
                        <div className="mb-4 flex items-center justify-between">
                            <p className="font-display text-lg font-semibold text-foreground">Filters</p>
                            <button
                                type="button"
                                className="rounded-lg p-2 text-muted-foreground hover:bg-muted"
                                onClick={() => setShowFilters(false)}
                                aria-label="Close"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>
                        {filterFieldsGrid}
                    </div>
                </div>
            )}

            <div className="mb-4 flex flex-wrap items-center justify-between gap-2 text-sm text-muted-foreground">
                <span>
                    {loading ? (
                        <span className="inline-flex items-center gap-2">
                            <Loader2 className="h-4 w-4 animate-spin text-primary" />
                            Loading…
                        </span>
                    ) : (
                        <>
                            <span className="font-semibold text-foreground">{displayedJobs.length}</span> roles
                            {savedOnly && savedJobIds.length === 0 && ' · Save jobs from cards to see them here'}
                        </>
                    )}
                </span>
                {pagination.total_pages > 0 && (
                    <span>
                        Page {pagination.page} of {pagination.total_pages}
                    </span>
                )}
            </div>

            {loading ? (
                <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {[...Array(8)].map((_, i) => (
                        <div
                            key={i}
                            className="animate-pulse rounded-2xl border border-border/60 bg-card p-5 shadow-sm"
                        >
                            <div className="flex gap-3">
                                <div className="h-12 w-12 rounded-xl bg-muted" />
                                <div className="flex-1 space-y-2">
                                    <div className="h-4 w-3/4 rounded bg-muted" />
                                    <div className="h-3 w-1/2 rounded bg-muted" />
                                </div>
                            </div>
                            <div className="mt-4 space-y-2">
                                <div className="h-3 rounded bg-muted" />
                                <div className="h-3 w-5/6 rounded bg-muted" />
                            </div>
                            <div className="mt-6 h-10 rounded-xl bg-muted" />
                        </div>
                    ))}
                </div>
            ) : displayedJobs.length === 0 ? (
                <div
                    className={cn(
                        jobsSurfaceClass,
                        'flex flex-col items-center justify-center gap-4 px-6 py-16 text-center',
                    )}
                >
                    <p className="font-display text-xl font-semibold text-foreground">
                        {jobs.length === 0
                            ? 'No roles match yet'
                            : savedOnly
                              ? 'No saved roles in this view'
                              : 'No roles match yet'}
                    </p>
                    <p className="max-w-md text-sm text-muted-foreground">
                        {jobs.length === 0
                            ? 'Try widening your search, clearing filters, or checking back soon.'
                            : savedOnly
                              ? 'Bookmark roles from the cards to build your shortlist, or turn off the saved filter.'
                              : 'Adjust filters or search keywords to see more results.'}
                    </p>
                    <div className="flex flex-wrap justify-center gap-2">
                        {savedOnly && (
                            <Button type="button" variant="outline" className="rounded-xl" onClick={() => setSavedOnly(false)}>
                                Show all roles
                            </Button>
                        )}
                        <Button
                            type="button"
                            variant="gradient"
                            className="rounded-xl shadow-md shadow-primary/15"
                            onClick={() => {
                                setSavedOnly(false)
                                clearFilters()
                            }}
                        >
                            Reset search
                        </Button>
                    </div>
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {displayedJobs.map((job, index) => (
                        <JobCard
                            key={job.id}
                            job={job}
                            cardIndex={index}
                            onViewDescription={() => setViewJob(job)}
                            onApply={() => handleApplyClick(job)}
                            isApplying={applyingJobId === job.id}
                            isSaved={savedJobIds.includes(job.id)}
                            onSaveToggle={() => handleSaveToggleForJob(job.id)}
                        />
                    ))}
                </div>
            )}

            {/* Pagination */}
            {pagination.total_pages > 1 && !savedOnly && (
                <div className="mt-10 flex justify-center pb-8">
                    <div
                        className={cn(
                            jobsSurfaceClass,
                            'flex items-center gap-1 p-2',
                        )}
                    >
                        <Button
                            variant="outline"
                            size="icon"
                            className="h-10 w-10 rounded-xl border-border/80"
                            disabled={pagination.page === 1}
                            onClick={() => setPagination((prev) => ({ ...prev, page: prev.page - 1 }))}
                        >
                            <ChevronLeft className="h-4 w-4" />
                        </Button>

                        <div className="flex items-center gap-1 px-1">
                            {(() => {
                                const totalPages = pagination.total_pages
                                const currentPage = pagination.page

                                const renderPageButton = (pageNum: number) => (
                                    <Button
                                        key={pageNum}
                                        variant={currentPage === pageNum ? 'default' : 'outline'}
                                        className={cn(
                                            'h-10 min-w-[2.5rem] rounded-xl px-2 font-semibold transition-all',
                                            currentPage === pageNum
                                                ? 'border-primary bg-primary text-primary-foreground shadow-md shadow-primary/20'
                                                : 'border-transparent text-muted-foreground hover:bg-muted',
                                        )}
                                        onClick={() => setPagination((prev) => ({ ...prev, page: pageNum }))}
                                    >
                                        {pageNum}
                                    </Button>
                                )

                                const pages = []

                                if (totalPages <= 7) {
                                    for (let i = 1; i <= totalPages; i++) {
                                        pages.push(renderPageButton(i))
                                    }
                                } else {
                                    // Always show first page
                                    pages.push(renderPageButton(1))

                                    if (currentPage > 3) {
                                        pages.push(
                                            <span key="ellipsis-start" className="px-1 text-muted-foreground">
                                                …
                                            </span>,
                                        )
                                    }

                                    // Calculate range
                                    let start = Math.max(2, currentPage - 1)
                                    let end = Math.min(totalPages - 1, currentPage + 1)

                                    if (currentPage <= 3) {
                                        start = 2
                                        end = 4
                                    } else if (currentPage >= totalPages - 2) {
                                        start = totalPages - 3
                                        end = totalPages - 1
                                    }

                                    for (let i = start; i <= end; i++) {
                                        pages.push(renderPageButton(i))
                                    }

                                    if (currentPage < totalPages - 2) {
                                        pages.push(
                                            <span key="ellipsis-end" className="px-1 text-muted-foreground">
                                                …
                                            </span>,
                                        )
                                    }

                                    // Always show last page
                                    pages.push(renderPageButton(totalPages))
                                }
                                return pages
                            })()}
                        </div>

                        <Button
                            variant="outline"
                            size="icon"
                            className="h-10 w-10 rounded-xl border-border/80"
                            disabled={pagination.page === pagination.total_pages}
                            onClick={() => setPagination((prev) => ({ ...prev, page: prev.page + 1 }))}
                        >
                            <ChevronRight className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
            )}

            {/* Modals */}
            {showApplicationModal && selectedJob && (
                <ApplicationModal
                    job={selectedJob}
                    isApplying={isApplying}
                    onClose={() => setShowApplicationModal(false)}
                    onSubmit={handleApplySubmit}
                />
            )}

            {viewJob && (
                <JobDescriptionModal
                    job={viewJob}
                    onClose={() => setViewJob(null)}
                    onApply={() => {
                        setViewJob(null)
                        handleApplyClick(viewJob)
                    }}
                    applicationStatus={viewJob.application_status}
                />
            )}
        </div>
    )
}
