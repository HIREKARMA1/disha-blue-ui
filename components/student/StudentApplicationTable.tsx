"use client"

import { useState, useEffect } from 'react'
import {
  ChevronUp,
  ChevronDown,
  Eye,
  Calendar,
  Building,
  IndianRupee,
  FileText,
  ClipboardList,
  Briefcase,
  User,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
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
  creator_type?: string
  is_university_created?: boolean
  can_update_status?: boolean
  has_assignment?: boolean
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

const SORT_OPTIONS: { field: string; label: string }[] = [
  { field: 'applied_at', label: 'Applied date' },
  { field: 'job_title', label: 'Job title' },
  { field: 'corporate_name', label: 'Employer' },
  { field: 'status', label: 'Status' },
  { field: 'expected_salary', label: 'Expected salary' },
  { field: 'student_name', label: 'Name' },
]

function statusPill(status: string) {
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
    'inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset'
  switch (status) {
    case 'applied':
      return <span className={cn(base, 'bg-primary-50 text-primary-700 ring-primary-200')}>{label}</span>
    case 'shortlisted':
      return <span className={cn(base, 'bg-violet-50 text-violet-800 ring-violet-200')}>{label}</span>
    case 'selected':
      return <span className={cn(base, 'bg-emerald-50 text-emerald-800 ring-emerald-200')}>{label}</span>
    case 'rejected':
      return <span className={cn(base, 'bg-red-50 text-red-700 ring-red-200')}>{label}</span>
    case 'pending':
      return <span className={cn(base, 'bg-amber-50 text-amber-800 ring-amber-200')}>{label}</span>
    default:
      return <span className={cn(base, 'bg-slate-100 text-slate-700 ring-slate-200')}>{label}</span>
  }
}

function formatDate(dateString: string) {
  try {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  } catch {
    return '—'
  }
}

function formatSalary(salary?: number) {
  if (!salary) return 'Not specified'
  return `₹${salary.toLocaleString('en-IN')}`
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
  onPageChange,
}: StudentApplicationTableProps) {
  const [assignmentModalOpen, setAssignmentModalOpen] = useState(false)
  const [selectedApplication, setSelectedApplication] = useState<ApplicationData | null>(null)
  const [submittedJobModules, setSubmittedJobModules] = useState<Map<string, boolean>>(new Map())
  const [showApplicationDetailsModal, setShowApplicationDetailsModal] = useState(false)
  const [selectedApplicationForDetails, setSelectedApplicationForDetails] = useState<ApplicationData | null>(null)

  useEffect(() => {
    const checkSubmissions = async () => {
      const submittedModulesStr = localStorage.getItem('submitted_practice_modules')
      if (!submittedModulesStr) return

      try {
        const submittedModuleIds = JSON.parse(submittedModulesStr) as string[]
        if (submittedModuleIds.length === 0) return

        const onCampusJobs = applications.filter(
          (app) =>
            (app.creator_type === 'University' || app.is_university_created === true) && app.has_assignment,
        )

        const submissionStatus = new Map<string, boolean>()
        for (const job of onCampusJobs) {
          try {
            const modules = await apiClient.getPracticeModulesByJobId(job.job_id)
            const hasSubmittedModule = modules.some((module: { id: string }) =>
              submittedModuleIds.includes(module.id),
            )
            submissionStatus.set(job.job_id, hasSubmittedModule)
          } catch {
            submissionStatus.set(job.job_id, false)
          }
        }
        setSubmittedJobModules(submissionStatus)
      } catch {
        /* ignore */
      }
    }

    if (applications.length > 0) void checkSubmissions()
  }, [applications])

  const checkExamSubmitted = (application: ApplicationData): boolean => {
    const isOnCampus =
      application.creator_type === 'University' || application.is_university_created === true
    if (!isOnCampus || !application.has_assignment) return false
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

  const SortButton = ({ field, children }: { field: string; children: React.ReactNode }) => (
    <button
      type="button"
      onClick={() => onSort(field)}
      className="inline-flex items-center gap-1 text-xs font-semibold uppercase tracking-wider text-slate-600 transition-colors hover:text-primary-600"
    >
      {children}
      {sortBy === field &&
        (sortOrder === 'asc' ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />)}
    </button>
  )

  const renderActions = (application: ApplicationData, layout: 'row' | 'stack' = 'row') => {
    const wrapClass =
      layout === 'stack'
        ? 'flex w-full flex-col gap-2 sm:flex-row sm:flex-wrap'
        : 'flex flex-wrap items-center justify-center gap-2'

    return (
      <div className={wrapClass}>
        {onStatusUpdate && (
          <>
            {application.creator_type === 'Company' ? (
              <Button
                variant="outline"
                size="sm"
                onClick={() => onStatusUpdate(application)}
                className="h-9 rounded-lg border-slate-200 text-sm font-medium"
              >
                <Eye className="mr-1.5 h-4 w-4" />
                View
              </Button>
            ) : (
              <Button
                variant="outline"
                size="sm"
                onClick={() => onStatusUpdate(application)}
                className="h-9 w-9 rounded-lg border-slate-200 p-0"
                title={
                  application.can_update_status ? 'Update application status' : 'View application details'
                }
              >
                <Eye className="h-4 w-4" />
              </Button>
            )}
          </>
        )}

        {!onStatusUpdate && application.has_assignment && (
          <>
            {(application.creator_type === 'University' || application.is_university_created === true) &&
            checkExamSubmitted(application) &&
            application.status === 'applied' ? (
              <span className="text-xs font-medium text-slate-500">Review in progress</span>
            ) : (application.creator_type === 'University' || application.is_university_created === true) &&
              checkExamSubmitted(application) &&
              application.status !== 'applied' &&
              application.status !== 'selected' ? (
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleViewApplicationDetails(application)}
                className={cn(
                  'h-9 rounded-lg border-slate-200 text-sm font-medium',
                  layout === 'stack' && 'w-full sm:w-auto',
                )}
              >
                <Eye className="mr-1.5 h-4 w-4" />
                View details
              </Button>
            ) : (
              !(
                (application.creator_type === 'University' || application.is_university_created === true) &&
                application.status === 'selected'
              ) && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleViewAssignment(application)}
                  className={cn(
                    'h-9 rounded-lg border-primary-200 bg-primary-50 text-sm font-medium text-primary-700 hover:bg-primary-100',
                    layout === 'stack' && 'w-full sm:w-auto',
                  )}
                >
                  <ClipboardList className="mr-1.5 h-4 w-4" />
                  Assignment
                </Button>
              )
            )}
          </>
        )}

        {!onStatusUpdate && application.status === 'selected' && application.offer_letter_url && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => onViewOfferLetter(application)}
            className={cn(
              'h-9 rounded-lg border-emerald-200 bg-emerald-50 text-sm font-medium text-emerald-800 hover:bg-emerald-100',
              layout === 'stack' && 'w-full sm:w-auto',
            )}
          >
            <Eye className="mr-1.5 h-4 w-4" />
            View offer
          </Button>
        )}

        {!onStatusUpdate &&
          !application.has_assignment &&
          (application.status !== 'selected' || !application.offer_letter_url) && (
            <span className="text-xs font-medium text-slate-500">
              {application.status === 'selected'
                ? 'Offer letter pending'
                : application.status === 'rejected'
                  ? 'Application closed'
                  : `Status: ${application.status}`}
            </span>
          )}
      </div>
    )
  }

  const DetailRow = ({
    label,
    value,
    icon: Icon,
  }: {
    label: string
    value: React.ReactNode
    icon?: React.ComponentType<{ className?: string }>
  }) => (
    <div className="grid grid-cols-[7.5rem_1fr] items-start gap-3 border-b border-slate-100 py-3 last:border-0 dark:border-slate-800">
      <span className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-slate-500">
        {Icon ? <Icon className="h-3.5 w-3.5 shrink-0" aria-hidden /> : null}
        {label}
      </span>
      <span className="min-w-0 text-sm font-medium leading-snug text-slate-900 dark:text-slate-100">{value}</span>
    </div>
  )

  if (loading) {
    return (
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="animate-pulse space-y-3 p-4 lg:p-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-28 rounded-xl bg-slate-100 dark:bg-slate-800" />
          ))}
        </div>
      </div>
    )
  }

  if (applications.length === 0) {
    return (
      <div className="flex flex-col items-center rounded-2xl border border-slate-200 bg-white px-6 py-16 text-center shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary-50 text-primary-600">
          <FileText className="h-7 w-7" />
        </div>
        <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-50">No applications yet</h3>
        <p className="mt-2 max-w-sm text-sm text-slate-600 dark:text-slate-400">
          When you apply to roles, your pipeline appears here with status and employer details.
        </p>
        <Link
          href="/dashboard/discover-jobs"
          className="mt-6 inline-flex h-11 items-center rounded-xl bg-primary-600 px-5 text-sm font-semibold text-white shadow-sm transition hover:bg-primary-700"
        >
          Browse local jobs
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Mobile sort */}
      <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 shadow-sm lg:hidden dark:border-slate-800 dark:bg-slate-900">
        <span className="shrink-0 text-xs font-semibold text-slate-500">Sort by</span>
        <select
          value={sortBy}
          onChange={(e) => onSort(e.target.value)}
          className="h-9 min-w-0 flex-1 rounded-lg border-0 bg-transparent text-sm font-medium text-slate-900 focus:ring-0 dark:text-slate-100"
        >
          {SORT_OPTIONS.map((opt) => (
            <option key={opt.field} value={opt.field}>
              {opt.label}
            </option>
          ))}
        </select>
        <button
          type="button"
          onClick={() => onSort(sortBy)}
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-200"
          aria-label="Toggle sort direction"
        >
          {sortOrder === 'asc' ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </button>
      </div>

      {/* Mobile cards */}
      <ul className="space-y-3 lg:hidden">
        {applications.map((application) => (
          <li
            key={application.id}
            className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900"
          >
            <div className="border-b border-slate-100 bg-slate-50/80 px-4 py-3 dark:border-slate-800 dark:bg-slate-800/50">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Job title</p>
                  <p className="mt-0.5 truncate text-base font-semibold text-slate-900 dark:text-slate-50">
                    {application.job_title || '—'}
                  </p>
                </div>
                {statusPill(application.status)}
              </div>
            </div>

            <div className="px-4">
              <DetailRow
                label="Name"
                icon={User}
                value={application.student_name || '—'}
              />
              <DetailRow
                label="Employer"
                icon={Building}
                value={
                  <span>
                    {application.corporate_name || '—'}
                    {application.creator_type ? (
                      <span className="mt-0.5 block text-xs font-normal text-slate-500">
                        {application.creator_type}
                      </span>
                    ) : null}
                  </span>
                }
              />
              <DetailRow label="Status" value={statusPill(application.status)} />
              <DetailRow
                label="Applied"
                icon={Calendar}
                value={formatDate(application.applied_at)}
              />
              <DetailRow
                label="Salary"
                icon={IndianRupee}
                value={formatSalary(application.expected_salary)}
              />
            </div>

            <div className="border-t border-slate-100 bg-slate-50/50 px-4 py-3 dark:border-slate-800 dark:bg-slate-800/30">
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">Actions</p>
              {renderActions(application, 'stack')}
            </div>
          </li>
        ))}
      </ul>

      {/* Desktop table */}
      <div className="hidden overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm lg:block dark:border-slate-800 dark:bg-slate-900">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[960px] border-collapse text-left">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 dark:border-slate-700 dark:bg-slate-800/80">
                <th className="px-4 py-3.5">
                  <SortButton field="student_name">Name</SortButton>
                </th>
                <th className="px-4 py-3.5">
                  <SortButton field="job_title">Job Title</SortButton>
                </th>
                <th className="px-4 py-3.5">
                  <SortButton field="corporate_name">Employer</SortButton>
                </th>
                <th className="px-4 py-3.5">
                  <SortButton field="status">Status</SortButton>
                </th>
                <th className="px-4 py-3.5">
                  <SortButton field="applied_at">Applied Date</SortButton>
                </th>
                <th className="px-4 py-3.5">
                  <SortButton field="expected_salary">Expected Salary</SortButton>
                </th>
                <th className="px-4 py-3.5 text-center text-xs font-semibold uppercase tracking-wider text-slate-600">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {applications.map((application) => (
                <tr
                  key={application.id}
                  className="transition-colors hover:bg-slate-50/80 dark:hover:bg-slate-800/40"
                >
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary-600 text-sm font-bold text-white">
                        {application.student_name
                          ? application.student_name.charAt(0).toUpperCase()
                          : 'S'}
                      </div>
                      <div className="min-w-0">
                        <p className="truncate font-semibold text-slate-900 dark:text-slate-50">
                          {application.student_name || '—'}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-2">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary-50 text-primary-600">
                        <Briefcase className="h-4 w-4" />
                      </div>
                      <p className="max-w-[12rem] truncate font-medium text-slate-900 dark:text-slate-50">
                        {application.job_title || '—'}
                      </p>
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <p className="font-medium text-slate-900 dark:text-slate-50">
                      {application.corporate_name || '—'}
                    </p>
                    {application.creator_type ? (
                      <p className="text-xs text-slate-500">{application.creator_type}</p>
                    ) : null}
                  </td>
                  <td className="px-4 py-4">{statusPill(application.status)}</td>
                  <td className="whitespace-nowrap px-4 py-4 text-sm text-slate-700 dark:text-slate-300">
                    {formatDate(application.applied_at)}
                  </td>
                  <td className="whitespace-nowrap px-4 py-4 text-sm font-medium text-slate-900 dark:text-slate-100">
                    {formatSalary(application.expected_salary)}
                  </td>
                  <td className="px-4 py-4">{renderActions(application, 'row')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {pagination.total_pages > 1 && (
        <div className="rounded-2xl border border-slate-200 bg-white px-4 py-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Showing {(pagination.page - 1) * pagination.limit + 1}–
              {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total}
            </p>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                className="h-9 rounded-lg border-slate-200"
                onClick={() => onPageChange(pagination.page - 1)}
                disabled={pagination.page <= 1}
              >
                Previous
              </Button>
              <span className="px-2 text-sm font-medium text-slate-700 dark:text-slate-300">
                {pagination.page} / {pagination.total_pages}
              </span>
              <Button
                variant="outline"
                size="sm"
                className="h-9 rounded-lg border-slate-200"
                onClick={() => onPageChange(pagination.page + 1)}
                disabled={pagination.page >= pagination.total_pages}
              >
                Next
              </Button>
            </div>
          </div>
        </div>
      )}

      {selectedApplication && (
        <ViewAssignmentModal
          isOpen={assignmentModalOpen}
          onClose={() => {
            setAssignmentModalOpen(false)
            setSelectedApplication(null)
          }}
          jobId={selectedApplication.job_id}
          jobTitle={selectedApplication.job_title || 'Job'}
          isOnCampus={
            selectedApplication.creator_type === 'University' ||
            selectedApplication.is_university_created === true
          }
        />
      )}

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
