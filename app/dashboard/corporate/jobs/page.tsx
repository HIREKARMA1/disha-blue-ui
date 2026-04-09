"use client"

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Search, Filter, Plus, Briefcase } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { CorporateDashboardLayout } from '@/components/dashboard/CorporateDashboardLayout'
import { CorporateJobCard } from '@/components/dashboard/CorporateJobCard'
import { CreateJobModal } from '@/components/dashboard/CreateJobModal'
import { EditJobModal } from '@/components/dashboard/EditJobModal'
import { DeleteConfirmationModal } from '@/components/dashboard/DeleteConfirmationModal'
import { JobDescriptionModal } from '@/components/dashboard/JobDescriptionModal'
import { CorporateAppliedStudentsModal } from '@/components/corporate/CorporateAppliedStudentsModal'
import { apiClient } from '@/lib/api'
import { toast } from 'react-hot-toast'
import { getClientLocale, tf, type SupportedLocale } from '@/lib/i18n'
import { corporateHeroClass, corporateSurfaceClass, corporateLabelClass } from '@/components/corporate/corporate-ui'
import { cn } from '@/lib/utils'

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
    onsite_office?: boolean
    mode_of_work?: string
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
}

export default function CorporateJobsPage() {
    const [locale, setLocale] = useState<SupportedLocale>('en')
    useEffect(() => {
        setLocale(getClientLocale())
    }, [])

    const [jobs, setJobs] = useState<Job[]>([])
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState('')
    const [filters, setFilters] = useState({
        status: '',
        job_type: '',
        industry: '',
        state: '',
        district: ''
    })
    const [selectedJob, setSelectedJob] = useState<Job | null>(null)
    const [editingJob, setEditingJob] = useState<Job | null>(null)
    const [showEditModal, setShowEditModal] = useState(false)
    const [showCreateModal, setShowCreateModal] = useState(false)
    const [showJobModal, setShowJobModal] = useState(false)
    const [showFilters, setShowFilters] = useState(false)
    const [showDeleteModal, setShowDeleteModal] = useState(false)
    const [jobToDelete, setJobToDelete] = useState<Job | null>(null)
    const [isDeleting, setIsDeleting] = useState(false)
    const [showAppliedStudentsModal, setShowAppliedStudentsModal] = useState(false)
    const [selectedJobForStudents, setSelectedJobForStudents] = useState<Job | null>(null)
    const [pagination, setPagination] = useState({
        page: 1,
        limit: 9,
        total: 0,
        total_pages: 0
    })
    const activeFilterCount = Object.values(filters).filter(Boolean).length + (searchTerm ? 1 : 0)

    // Fetch corporate jobs
    const fetchJobs = async () => {
        try {
            setLoading(true)
            const response = await apiClient.getCorporateJobs()
            console.log('🔍 Jobs fetched from API:', response)
            if (response.length > 0) {
                console.log('First job data:', response[0])
                console.log('First job job_type:', response[0].job_type)
            }
            setJobs(response)
            setPagination(prev => ({
                ...prev,
                total: response.length,
                total_pages: Math.ceil(response.length / prev.limit)
            }))
        } catch (error: any) {
            console.error('Failed to fetch jobs:', error)
            toast.error('Failed to load jobs. Please try again.')
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchJobs()
    }, [])

    // Filter jobs based on search and filters
    const filteredJobs = jobs.filter(job => {
        const locationString = Array.isArray(job.location) ? job.location.join(' ') : job.location
        const structuredLocation = [job.village_or_locality, job.city_or_town, job.district, job.state].filter(Boolean).join(' ')
        const matchesSearch = job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            job.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
            locationString.toLowerCase().includes(searchTerm.toLowerCase()) ||
            structuredLocation.toLowerCase().includes(searchTerm.toLowerCase())

        const matchesStatus = !filters.status || job.status === filters.status
        const matchesJobType = !filters.job_type || job.job_type === filters.job_type
        const matchesIndustry = !filters.industry || job.industry?.toLowerCase().includes(filters.industry.toLowerCase())
        const matchesState = !filters.state || (job.state || '').toLowerCase().includes(filters.state.toLowerCase())
        const matchesDistrict = !filters.district || (job.district || '').toLowerCase().includes(filters.district.toLowerCase())

        return matchesSearch && matchesStatus && matchesJobType && matchesIndustry && matchesState && matchesDistrict
    })

    // Apply pagination to filtered jobs
    const paginatedJobs = filteredJobs.slice(
        (pagination.page - 1) * pagination.limit,
        pagination.page * pagination.limit
    )

    // Update pagination when filters change
    useEffect(() => {
        const totalPages = Math.ceil(filteredJobs.length / pagination.limit)
        setPagination(prev => ({
            ...prev,
            total: filteredJobs.length,
            total_pages: totalPages,
            page: prev.page > totalPages ? 1 : prev.page
        }))
    }, [filteredJobs.length, pagination.limit])

    const handleCreateJob = () => {
        setShowCreateModal(true)
    }

    const handleJobCreated = () => {
        fetchJobs() // Refresh the jobs list
    }

    const handleJobUpdated = () => {
        fetchJobs() // Refresh the jobs list
    }

    const handleViewJob = (job: Job) => {
        setSelectedJob(job)
        setShowJobModal(true)
    }

    const handleEditJob = (job: Job) => {
        console.log('🔍 handleEditJob called with job:', job)
        console.log('Job type in handleEditJob:', job.job_type)
        setEditingJob(job)
        setShowEditModal(true)
    }

    const handleDeleteJob = (job: Job) => {
        setJobToDelete(job)
        setShowDeleteModal(true)
    }

    const handleViewAppliedStudents = (job: Job) => {
        setSelectedJobForStudents(job)
        setShowAppliedStudentsModal(true)
    }

    const confirmDeleteJob = async () => {
        if (!jobToDelete) return

        setIsDeleting(true)
        try {
            await apiClient.deleteJob(jobToDelete.id)
            toast.success('Job deleted successfully!')
            fetchJobs() // Refresh the jobs list
            setShowDeleteModal(false)
            setJobToDelete(null)
        } catch (error: any) {
            console.error('Failed to delete job:', error)
            toast.error('Failed to delete job. Please try again.')
        } finally {
            setIsDeleting(false)
        }
    }

    const handleStatusChange = async (job: Job, newStatus: string) => {
        try {
            await apiClient.changeJobStatus(job.id, newStatus)

            const statusMessages = {
                active: 'activated',
                inactive: 'deactivated',
                closed: 'closed'
            }

            const message = statusMessages[newStatus as keyof typeof statusMessages] || 'updated'
            toast.success(`Job ${message} successfully!`)
            fetchJobs() // Refresh the jobs list
        } catch (error: any) {
            console.error('Failed to change job status:', error)
            toast.error('Failed to change job status. Please try again.')
        }
    }

    const clearFilters = () => {
        setSearchTerm('')
        setFilters({
            status: '',
            job_type: '',
            industry: '',
            state: '',
            district: ''
        })
    }

    return (
        <CorporateDashboardLayout>
            <div className="space-y-6 main-content">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.45 }}
                    className={corporateHeroClass}
                >
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                        <div className="min-w-0 flex-1">
                            <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-primary/80">Job posts</p>
                            <h1 className="font-display text-2xl font-semibold tracking-tight text-foreground md:text-3xl mb-2">
                                {tf(locale, 'corporate.jobs.title', 'Your hiring posts')}
                            </h1>
                            <p className="text-muted-foreground text-base max-w-2xl">
                                Create, publish, and manage roles with an ATS-style workspace—clear status, applicants, and actions in one place.
                            </p>
                        </div>
                        <div className="flex flex-wrap gap-2 shrink-0">
                            <span className="inline-flex items-center rounded-full border border-border/80 bg-background/70 px-3 py-1 text-xs font-medium backdrop-blur-sm">
                                {new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                            </span>
                        </div>
                    </div>
                </motion.div>

                {/* Search and Filters */}
                <div className={cn(corporateSurfaceClass, 'p-5 sm:p-6 relative overflow-visible layout-stable')}>
                    {/* Search Bar */}
                    <div className="flex flex-col lg:flex-row gap-4 mb-4">
                        <div className="flex-1">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                                <Input
                                    type="text"
                                    placeholder={tf(locale, 'corporate.jobs.searchPlaceholder', 'Search by title, skill, or district/state...')}
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="pl-10"
                                />
                            </div>
                        </div>

                        <div className="flex items-center gap-3">
                            <Button
                                onClick={handleCreateJob}
                                className="bg-gradient-to-r from-primary-500 to-secondary-500 hover:from-primary-600 hover:to-secondary-600 text-white shadow-lg hover:shadow-xl transition-all duration-200"
                            >
                                <Plus className="w-4 h-4 mr-2" />
                                Create Job
                            </Button>

                            <Button
                                variant="outline"
                                onClick={() => setShowFilters(!showFilters)}
                                className="flex items-center gap-2"
                            >
                                <Filter className="w-4 h-4" />
                                Filters
                            </Button>
                        </div>
                    </div>
                    {!loading && (
                        <div className="text-xs font-medium text-muted-foreground mt-2">
                            {activeFilterCount > 0 ? `${activeFilterCount} ${tf(locale, 'corporate.jobs.activeFiltersSuffix', 'active search/filter criteria')}` : tf(locale, 'common.noFiltersApplied', 'No filters applied')}
                        </div>
                    )}

                    {/* Advanced Filters */}
                    {showFilters && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-border/80 relative"
                        >
                            <div>
                                <label className={corporateLabelClass}>
                                    Status
                                </label>
                                <Select value={filters.status || "all"} onValueChange={(value) => setFilters(prev => ({ ...prev, status: value === "all" ? "" : value }))}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="All Status" />
                                    </SelectTrigger>
                                    <SelectContent sideOffset={4} className="z-[60] w-[var(--radix-select-trigger-width)] max-h-[var(--radix-select-content-available-height)]">
                                        <SelectItem value="all">All Status</SelectItem>
                                        <SelectItem value="active">Active</SelectItem>
                                        <SelectItem value="inactive">Inactive</SelectItem>
                                        <SelectItem value="closed">Closed</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div>
                                <label className={corporateLabelClass}>
                                    Job Type
                                </label>
                                <Select value={filters.job_type || "all"} onValueChange={(value) => setFilters(prev => ({ ...prev, job_type: value === "all" ? "" : value }))}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="All Types" />
                                    </SelectTrigger>
                                    <SelectContent sideOffset={4} className="z-[60] w-[var(--radix-select-trigger-width)] max-h-[var(--radix-select-content-available-height)]">
                                        <SelectItem value="all">All Types</SelectItem>
                                        <SelectItem value="full_time">Full Time</SelectItem>
                                        <SelectItem value="part_time">Part Time</SelectItem>
                                        <SelectItem value="contract">Contract</SelectItem>
                                        <SelectItem value="internship">Internship</SelectItem>
                                        <SelectItem value="freelance">Freelance</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div>
                                <label className={corporateLabelClass}>
                                    Industry
                                </label>
                                <Input
                                    placeholder="e.g., Technology, Finance"
                                    value={filters.industry}
                                    onChange={(e) => setFilters(prev => ({ ...prev, industry: e.target.value }))}
                                />
                            </div>
                            <div>
                                <label className={corporateLabelClass}>State</label>
                                <Input placeholder="State" value={filters.state} onChange={(e) => setFilters(prev => ({ ...prev, state: e.target.value }))} />
                            </div>
                            <div>
                                <label className={corporateLabelClass}>District</label>
                                <Input placeholder="District" value={filters.district} onChange={(e) => setFilters(prev => ({ ...prev, district: e.target.value }))} />
                            </div>
                        </motion.div>
                    )}

                    {/* Clear Filters */}
                    {(searchTerm || filters.status || filters.job_type || filters.industry || filters.state || filters.district) && (
                        <div className="flex justify-end mt-4">
                            <Button variant="ghost" size="sm" onClick={clearFilters}>
                                Clear Filters
                            </Button>
                        </div>
                    )}
                </div>

                {/* Results Summary */}
                <div className={cn(corporateSurfaceClass, 'p-4 mb-6')}>
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                        <div className="text-sm text-muted-foreground">
                            {loading ? (
                                <span className="flex items-center gap-2">
                                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-primary border-t-transparent"></div>
                                    Loading jobs…
                                </span>
                            ) : (
                                <span>
                                    <span className="font-semibold text-foreground tabular-nums">
                                        {((pagination.page - 1) * pagination.limit) + 1}
                                        –
                                        {Math.min(pagination.page * pagination.limit, pagination.total)}
                                    </span>
                                    <span className="text-muted-foreground"> of </span>
                                    <span className="font-semibold text-foreground tabular-nums">{pagination.total}</span>
                                    <span className="text-muted-foreground"> roles</span>
                                </span>
                            )}
                        </div>
                        {pagination.total > 0 && (
                            <div className="text-xs font-medium text-muted-foreground tabular-nums">
                                Page {pagination.page} / {pagination.total_pages} · {pagination.limit} per page
                            </div>
                        )}
                    </div>
                </div>

                {/* Jobs Grid */}
                {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[...Array(6)].map((_, index) => (
                            <div key={index} className={cn(corporateSurfaceClass, 'p-6 animate-pulse')}>
                                <div className="h-6 bg-muted rounded-lg mb-4"></div>
                                <div className="h-4 bg-muted rounded-lg mb-2"></div>
                                <div className="h-4 bg-muted rounded-lg mb-4"></div>
                                <div className="h-10 bg-muted rounded-xl"></div>
                            </div>
                        ))}
                    </div>
                ) : filteredJobs.length > 0 ? (
                    <>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                            {paginatedJobs.map((job, index) => (
                                <CorporateJobCard
                                    key={job.id}
                                    job={job}
                                    onViewDescription={() => handleViewJob(job)}
                                    onEdit={() => handleEditJob(job)}
                                    onDelete={() => handleDeleteJob(job)}
                                    onStatusChange={handleStatusChange}
                                    onViewAppliedStudents={() => handleViewAppliedStudents(job)}
                                    cardIndex={index}
                                />
                            ))}
                        </div>

                        {/* Simple Pagination */}
                        {pagination.total_pages > 1 && (
                            <div className="mt-8 flex items-center justify-center">
                                <div className={cn(corporateSurfaceClass, 'p-3')}>
                                    <div className="flex items-center gap-2">
                                        {/* Previous Button */}
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                                            disabled={pagination.page <= 1}
                                            className="px-3 py-2 border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 transition-all duration-200 hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            ←
                                        </Button>

                                        {/* Page Numbers */}
                                        <div className="flex items-center gap-1">
                                            {[...Array(pagination.total_pages)].map((_, i) => {
                                                const pageNum = i + 1
                                                const isCurrentPage = pageNum === pagination.page
                                                const isNearCurrent = Math.abs(pageNum - pagination.page) <= 1
                                                const isFirstOrLast = pageNum === 1 || pageNum === pagination.total_pages

                                                if (isFirstOrLast || isNearCurrent) {
                                                    return (
                                                        <Button
                                                            key={pageNum}
                                                            variant={isCurrentPage ? "default" : "outline"}
                                                            size="sm"
                                                            onClick={() => setPagination(prev => ({ ...prev, page: pageNum }))}
                                                            className={`min-w-[32px] h-8 ${isCurrentPage
                                                                ? 'bg-primary-500 hover:bg-primary-600 text-white shadow-md'
                                                                : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 transition-all duration-200 hover:shadow-md'
                                                                }`}
                                                        >
                                                            {pageNum}
                                                        </Button>
                                                    )
                                                } else if (pageNum === pagination.page - 2 || pageNum === pagination.page + 2) {
                                                    return <span key={pageNum} className="px-2 text-primary-400 dark:text-primary-300">...</span>
                                                }
                                                return null
                                            })}
                                        </div>

                                        {/* Next Button */}
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                                            disabled={pagination.page >= pagination.total_pages}
                                            className="px-3 py-2 border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 transition-all duration-200 hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            →
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </>
                ) : (
                    <div className={cn(corporateSurfaceClass, 'py-14 px-6 text-center')}>
                        <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                            <Briefcase className="h-10 w-10" />
                        </div>
                        <h3 className="text-lg font-semibold text-foreground mb-2">
                            {searchTerm || filters.status || filters.job_type || filters.industry
                                ? 'No matching jobs found'
                                : 'No local jobs posted yet'
                            }
                        </h3>
                        <p className="text-sm text-muted-foreground mb-6 max-w-md mx-auto leading-relaxed">
                            {searchTerm || filters.status || filters.job_type || filters.industry
                                ? 'Try widening your filters (state/district/job type) to find more results.'
                                : 'Create your first local hiring post to start receiving applications.'
                            }
                        </p>
                        {!searchTerm && !filters.status && !filters.job_type && !filters.industry && !filters.state && !filters.district && (
                            <Button onClick={handleCreateJob} className="rounded-xl bg-gradient-to-r from-primary to-secondary text-primary-foreground shadow-md hover:opacity-95">
                                <Plus className="w-4 h-4 mr-2" />
                                Post your first job
                            </Button>
                        )}

                    </div>
                )}
            </div>

            {/* Modals */}
            <CreateJobModal
                isOpen={showCreateModal}
                onClose={() => setShowCreateModal(false)}
                onJobCreated={handleJobCreated}
            />

            <EditJobModal
                isOpen={showEditModal}
                onClose={() => {
                    setShowEditModal(false)
                    setEditingJob(null)
                }}
                onJobUpdated={handleJobUpdated}
                job={editingJob}
            />

            <DeleteConfirmationModal
                isOpen={showDeleteModal}
                onClose={() => {
                    setShowDeleteModal(false)
                    setJobToDelete(null)
                }}
                onConfirm={confirmDeleteJob}
                jobTitle={jobToDelete?.title || ''}
                isDeleting={isDeleting}
            />

            {selectedJob && (
                <JobDescriptionModal
                    job={selectedJob}
                    onClose={() => {
                        setShowJobModal(false)
                        setSelectedJob(null)
                    }}
                    onApply={() => { }} // Not applicable for corporate view
                    isApplying={false}
                    showApplyButton={false} // Hide apply button in corporate context
                />
            )}

            <CorporateAppliedStudentsModal
                isOpen={showAppliedStudentsModal}
                onClose={() => {
                    setShowAppliedStudentsModal(false)
                    setSelectedJobForStudents(null)
                }}
                job={selectedJobForStudents}
            />
        </CorporateDashboardLayout>
    )
}
