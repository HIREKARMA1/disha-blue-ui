"use client"

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
    ChevronUp,
    ChevronDown,
    Eye,
    Download,
    Calendar,
    Building,
    DollarSign,
    FileText,
    ClipboardList
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { jobsSurfaceClass } from '@/components/jobs/jobs-ui'
import { ViewAssignmentModal } from './ViewAssignmentModal'
import { ViewApplicationDetailsModal } from '@/components/university/ViewApplicationDetailsModal'
import { apiClient } from '@/lib/api'
import Link from 'next/link'

interface ApplicationData {
    id: string
    job_id: string
    student_id: string
    university_id?: string
    status: string
    applied_at: string
    updated_at?: string
    cover_letter?: string
    expected_salary?: number
    availability_date?: string
    corporate_notes?: string
    interview_date?: string
    interview_location?: string
    offer_letter_url?: string
    offer_letter_uploaded_at?: string
    job_title?: string
    student_name?: string
    corporate_name?: string
    creator_type?: string  // NEW: Explicit creator type from backend ("University" or "Company")
    is_university_created?: boolean
    can_update_status?: boolean  // NEW: Whether current university can update this application
    has_assignment?: boolean  // NEW: Whether this job has practice assignments
}

interface StudentApplicationTableProps {
    applications: ApplicationData[]
    loading: boolean
    sortBy: string
    sortOrder: 'asc' | 'desc'
    onSort: (field: string) => void
    onViewOfferLetter: (application: ApplicationData) => void
    onDownloadOfferLetter: (application: ApplicationData) => void
    onStatusUpdate?: (application: ApplicationData) => void
    pagination: {
        page: number
        limit: number
        total: number
        total_pages: number
    }
    onPageChange: (page: number) => void
}

export function StudentApplicationTable({
    applications,
    loading,
    sortBy,
    sortOrder,
    onSort,
    onViewOfferLetter,
    onStatusUpdate,
    pagination,
    onPageChange
}: StudentApplicationTableProps) {
    const [hoveredRow, setHoveredRow] = useState<string | null>(null)
    const [assignmentModalOpen, setAssignmentModalOpen] = useState(false)
    const [selectedApplication, setSelectedApplication] = useState<ApplicationData | null>(null)
    const [submittedJobModules, setSubmittedJobModules] = useState<Map<string, boolean>>(new Map())
    const [showApplicationDetailsModal, setShowApplicationDetailsModal] = useState(false)
    const [selectedApplicationForDetails, setSelectedApplicationForDetails] = useState<ApplicationData | null>(null)

    // Fetch modules for on-campus jobs and check submission status
    useEffect(() => {
        const checkSubmissions = async () => {
            // Get submitted modules from localStorage
            const submittedModulesStr = localStorage.getItem('submitted_practice_modules')
            if (!submittedModulesStr) {
                return
            }

            try {
                const submittedModuleIds = JSON.parse(submittedModulesStr) as string[]
                if (submittedModuleIds.length === 0) {
                    return
                }

                // Find all on-campus jobs with assignments
                const onCampusJobs = applications.filter(
                    app => (app.creator_type === "University" || app.is_university_created === true) && app.has_assignment
                )

                // Check each job's modules
                const submissionStatus = new Map<string, boolean>()
                for (const job of onCampusJobs) {
                    try {
                        // Fetch modules for this job
                        const modules = await apiClient.getPracticeModulesByJobId(job.job_id)
                        
                        // Check if any module for this job is submitted
                        const hasSubmittedModule = modules.some((module: any) => 
                            submittedModuleIds.includes(module.id)
                        )
                        
                        submissionStatus.set(job.job_id, hasSubmittedModule)
                    } catch (error) {
                        console.error(`Error checking modules for job ${job.job_id}:`, error)
                        submissionStatus.set(job.job_id, false)
                    }
                }

                setSubmittedJobModules(submissionStatus)
            } catch (error) {
                console.error('Error checking submitted modules:', error)
            }
        }

        if (applications.length > 0) {
            checkSubmissions()
        }
    }, [applications])

    // Check if exam is submitted for on-campus jobs
    const checkExamSubmitted = (application: ApplicationData): boolean => {
        // Only check for on-campus features (university-created jobs)
        const isOnCampus = application.creator_type === "University" || application.is_university_created === true
        
        if (!isOnCampus || !application.has_assignment) {
            return false
        }

        // Check cached submission status
        return submittedJobModules.get(application.job_id) || false
    }

    const handleViewAssignment = (application: ApplicationData) => {
        setSelectedApplication(application)
        setAssignmentModalOpen(true)
    }

    const handleViewApplicationDetails = (application: ApplicationData) => {
        setSelectedApplicationForDetails(application)
        setShowApplicationDetailsModal(true)
    }

    const statusPill = (status: string) => {
        const label =
            status === 'applied'
                ? 'Applied'
                : status === 'pending'
                  ? 'Under review'
                  : status === 'shortlisted'
                    ? 'Shortlisted'
                    : status === 'selected'
                      ? 'Offer'
                      : status === 'rejected'
                        ? 'Closed'
                        : status.charAt(0).toUpperCase() + status.slice(1)
        const base =
            'inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset'
        switch (status) {
            case 'applied':
                return <span className={cn(base, 'bg-primary/10 text-primary ring-primary/20')}>{label}</span>
            case 'shortlisted':
                return <span className={cn(base, 'bg-secondary/10 text-secondary ring-secondary/25')}>{label}</span>
            case 'selected':
                return <span className={cn(base, 'bg-emerald-500/10 text-emerald-700 ring-emerald-500/25 dark:text-emerald-400')}>{label}</span>
            case 'rejected':
                return <span className={cn(base, 'bg-destructive/10 text-destructive ring-destructive/20')}>{label}</span>
            case 'pending':
                return <span className={cn(base, 'bg-amber-500/10 text-amber-800 ring-amber-500/25 dark:text-amber-300')}>{label}</span>
            default:
                return <span className={cn(base, 'bg-muted text-muted-foreground ring-border')}>{label}</span>
        }
    }

    const formatDate = (dateString: string) => {
        try {
            return new Date(dateString).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric'
            })
        } catch {
            return 'Invalid Date'
        }
    }

    const formatSalary = (salary?: number) => {
        if (!salary) return 'Not specified'
        return `₹${salary.toLocaleString()}`
    }

    const SortButton = ({ field, children }: { field: string; children: React.ReactNode }) => (
        <button
            type="button"
            onClick={() => onSort(field)}
            className="flex items-center gap-1 text-sm font-semibold text-foreground/80 transition-colors hover:text-primary"
        >
            {children}
            {sortBy === field && (
                sortOrder === 'asc' ?
                    <ChevronUp className="w-4 h-4" /> :
                    <ChevronDown className="w-4 h-4" />
            )}
        </button>
    )

    if (loading) {
        return (
            <div className={cn(jobsSurfaceClass, 'p-6')}>
                <div className="animate-pulse space-y-4">
                    {[...Array(6)].map((_, i) => (
                        <div key={i} className="h-14 rounded-xl bg-muted/80" />
                    ))}
                </div>
            </div>
        )
    }

    if (applications.length === 0) {
        return (
            <div className={cn(jobsSurfaceClass, 'flex flex-col items-center px-6 py-16 text-center')}>
                <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/15 to-secondary/15">
                    <FileText className="h-8 w-8 text-primary" />
                </div>
                <h3 className="font-display text-xl font-bold text-foreground">No applications yet</h3>
                <p className="mt-2 max-w-md text-sm text-muted-foreground">
                    When you apply to roles, your pipeline shows up here with status and employer context.
                </p>
                <Link
                    href="/dashboard/student/jobs"
                    className="mt-6 inline-flex items-center rounded-xl bg-gradient-to-r from-primary-500 to-secondary-500 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-primary/20 transition hover:brightness-105"
                >
                    Browse opportunities
                </Link>
            </div>
        )
    }

    return (
        <div className={cn(jobsSurfaceClass, 'overflow-hidden')}>
            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead className="border-b border-border/80 bg-muted/30">
                        <tr>
                            <th className="px-6 py-4 text-left">
                                <SortButton field="student_name">Name</SortButton>
                            </th>
                            <th className="px-6 py-4 text-left">
                                <SortButton field="job_title">Job Title</SortButton>
                            </th>
                            <th className="px-6 py-4 text-left">
                                <SortButton field="corporate_name">Employer</SortButton>
                            </th>
                            <th className="px-6 py-4 text-left">
                                <SortButton field="status">Status</SortButton>
                            </th>
                            <th className="px-6 py-4 text-left">
                                <SortButton field="applied_at">Applied Date</SortButton>
                            </th>
                            <th className="px-6 py-4 text-left">
                                <SortButton field="expected_salary">Expected Salary</SortButton>
                            </th>
                            <th className="px-6 py-4 text-center">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border/70">
                        {applications.map((application) => (
                            <motion.tr
                                key={application.id}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className={cn(
                                    'transition-colors hover:bg-muted/40',
                                    hoveredRow === application.id && 'bg-muted/30',
                                )}
                                onMouseEnter={() => setHoveredRow(application.id)}
                                onMouseLeave={() => setHoveredRow(null)}
                            >
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-3">
                                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-primary-500 to-secondary-500 text-sm font-bold text-white shadow-md shadow-primary/20">
                                            {application.student_name ? application.student_name.charAt(0).toUpperCase() : 'S'}
                                        </div>
                                        <div>
                                            <p className="font-semibold text-foreground">
                                                {application.student_name || 'N/A'}
                                            </p>
                                            <p className="text-xs text-muted-foreground">
                                                Student ID: {application.student_id.slice(0, 8)}...
                                            </p>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-3">
                                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
                                            <FileText className="h-5 w-5 text-primary" />
                                        </div>
                                        <div>
                                            <p className="font-semibold text-foreground">
                                                {application.job_title || 'N/A'}
                                            </p>
                                            <p className="text-xs text-muted-foreground">
                                                Job ID: {application.job_id.slice(0, 8)}...
                                            </p>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="flex items-start gap-2">
                                        <Building className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                                        <div>
                                            <p className="font-medium text-foreground">
                                                {application.corporate_name || 'N/A'}
                                            </p>
                                            <p className="text-xs text-muted-foreground">
                                                {application.creator_type || 'N/A'}
                                            </p>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="flex flex-wrap items-center gap-2">{statusPill(application.status)}</div>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-2">
                                        <Calendar className="h-4 w-4 text-muted-foreground" />
                                        <span className="text-sm text-foreground">
                                            {formatDate(application.applied_at)}
                                        </span>
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-2">
                                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                                        <span className="text-sm text-foreground">
                                            {formatSalary(application.expected_salary)}
                                        </span>
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="flex items-center justify-center gap-2">
                                        {/* University/Corporate View - Status Update Actions */}
                                        {onStatusUpdate && (
                                            <>
                                                {/* Corporate applications - Show "View" button */}
                                                {application.creator_type === "Company" ? (
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => onStatusUpdate(application)}
                                                        className="flex items-center gap-1"
                                                        title="View Application Details"
                                                    >
                                                        <Eye className="w-4 h-4" />
                                                        <span>View</span>
                                                    </Button>
                                                ) : (
                                                    /* University applications - Show only eye icon */
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => onStatusUpdate(application)}
                                                        className="flex items-center gap-1"
                                                        title={application.can_update_status ? "Update Application Status" : "View Application Details"}
                                                    >
                                                        <Eye className="w-4 h-4" />
                                                    </Button>
                                                )}
                                            </>
                                        )}
                                        
                                        {/* Student View - View Assignment Button (if job has assignments) */}
                                        {!onStatusUpdate && application.has_assignment && (
                                            <>
                                                {/* For on-campus features: show "coming soon" ONLY if exam is submitted AND status is still "applied" (university hasn't updated yet) */}
                                                {(application.creator_type === "University" || application.is_university_created === true) && 
                                                 checkExamSubmitted(application) && 
                                                 application.status === 'applied' ? (
                                                    <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 text-sm">
                                                        <span className="text-xs">Coming Soon</span>
                                                    </div>
                                                ) : /* For on-campus features: show eye icon if exam is submitted AND status has been updated (shortlisted, etc.) BUT NOT selected */
                                                (application.creator_type === "University" || application.is_university_created === true) && 
                                                 checkExamSubmitted(application) && 
                                                 application.status !== 'applied' && 
                                                 application.status !== 'selected' ? (
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => handleViewApplicationDetails(application)}
                                                        className="flex items-center gap-1"
                                                        title="View Application Details"
                                                    >
                                                        <Eye className="w-4 h-4" />
                                                        <span className="hidden sm:inline">View Details</span>
                                                    </Button>
                                                ) : (
                                                    /* For regular jobs OR on-campus jobs without special conditions: show View Assignment button */
                                                    /* Only hide View Assignment for on-campus jobs when status is selected */
                                                    !((application.creator_type === "University" || application.is_university_created === true) && application.status === 'selected') && (
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            onClick={() => handleViewAssignment(application)}
                                                            className="flex items-center gap-1 text-primary-600 hover:text-primary-700 border-primary-600 hover:border-primary-700"
                                                            title="View Practice Assignment"
                                                        >
                                                            <ClipboardList className="w-4 h-4" />
                                                            <span className="hidden sm:inline">View Assignment</span>
                                                        </Button>
                                                    )
                                                )}
                                            </>
                                        )}

                                        {/* Student View - View Offer Letter (only for selected applications with offer letter) */}
                                        {!onStatusUpdate && application.status === 'selected' && application.offer_letter_url && (
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => onViewOfferLetter(application)}
                                                className="flex items-center gap-1 text-green-600 hover:text-green-700 border-green-600 hover:border-green-700"
                                                title="View Offer Letter"
                                            >
                                                <Eye className="w-4 h-4" />
                                                <span className="hidden sm:inline">View Offer</span>
                                            </Button>
                                        )}



                                        {/* Student View - No offer letter available yet */}
                                        {!onStatusUpdate && !application.has_assignment && (application.status !== 'selected' || !application.offer_letter_url) && (
                                            <div className="flex items-center gap-2 text-gray-400 dark:text-gray-500 text-sm">
                                                {application.status === 'selected' ? (
                                                    <span className="text-xs">Offer letter pending</span>
                                                ) : application.status === 'rejected' ? (
                                                    <span className="text-xs text-red-500">Application rejected</span>
                                                ) : (
                                                    <span className="text-xs">Application {application.status}</span>
                                                )}
                                            </div>
                                        )}
                     
                                    </div>
                                </td>
                            </motion.tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Pagination */}
            {pagination.total_pages > 1 && (
                <div className="border-t border-border/80 px-6 py-4">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <div className="text-sm text-muted-foreground">
                            Showing {((pagination.page - 1) * pagination.limit) + 1} to {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} applications
                        </div>
                        <div className="flex items-center gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => onPageChange(pagination.page - 1)}
                                disabled={pagination.page <= 1}
                            >
                                Previous
                            </Button>
                            <span className="text-sm font-medium text-foreground">
                                Page {pagination.page} of {pagination.total_pages}
                            </span>
                            <Button
                                variant="outline"
                                size="sm"
                                className="rounded-xl"
                                onClick={() => onPageChange(pagination.page + 1)}
                                disabled={pagination.page >= pagination.total_pages}
                            >
                                Next
                            </Button>
                        </div>
                    </div>
                </div>
            )}

            {/* View Assignment Modal */}
            {selectedApplication && (
                <ViewAssignmentModal
                    isOpen={assignmentModalOpen}
                    onClose={() => {
                        setAssignmentModalOpen(false)
                        setSelectedApplication(null)
                    }}
                    jobId={selectedApplication.job_id}
                    jobTitle={selectedApplication.job_title || 'Job'}
                    isOnCampus={selectedApplication.creator_type === "University" || selectedApplication.is_university_created === true}
                />
            )}

            {/* View Application Details Modal */}
            <ViewApplicationDetailsModal
                isOpen={showApplicationDetailsModal}
                onClose={() => {
                    setShowApplicationDetailsModal(false)
                    setSelectedApplicationForDetails(null)
                }}
                application={selectedApplicationForDetails}
            />
        </div>
    )
}
