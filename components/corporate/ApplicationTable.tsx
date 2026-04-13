"use client"

import { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import { corporateSurfaceClass } from '@/components/corporate/corporate-ui'
import { cn } from '@/lib/utils'
import {
  User,
  Calendar,
  DollarSign,
  FileText,
  Eye,
  ChevronUp,
  ChevronDown,
  ChevronsUpDown,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react'
import { ApplicationData } from '@/app/dashboard/corporate/applications/page'

interface ApplicationTableProps {
  applications: ApplicationData[]
  isLoading: boolean
  error: string | null
  onStatusUpdate: (application: ApplicationData) => void
  onOfferLetterUpload: (application: ApplicationData) => void
  onRetry: () => void
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
}

type SortField = 'student_name' | 'job_title' | 'applied_at' | 'expected_salary' | 'status'
type SortDirection = 'asc' | 'desc' | null

export function ApplicationTable({
  applications,
  isLoading,
  error,
  onStatusUpdate,
  onOfferLetterUpload,
  onRetry,
  currentPage,
  totalPages,
  onPageChange
}: ApplicationTableProps) {
  const [sortField, setSortField] = useState<SortField | null>('applied_at')
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc')

  const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-US', {
  year: 'numeric',
  month: 'short',
  day: 'numeric'
  })
  }

  const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  maximumFractionDigits: 0
  }).format(amount)
  }

  const getStatusColor = (status: string) => {
  switch (status) {
  case 'applied':
  return 'border border-primary/25 bg-primary/10 text-primary'
  case 'shortlisted':
  return 'border border-secondary/30 bg-secondary/10 text-secondary-foreground'
  case 'selected':
  return 'border border-emerald-500/25 bg-emerald-500/10 text-emerald-800 dark:text-emerald-200'
  case 'rejected':
  return 'border border-destructive/25 bg-destructive/10 text-destructive'
  case 'withdrawn':
  return 'border border-border bg-muted text-muted-foreground'
  case 'pending':
  return 'border border-primary/20 bg-muted/80 text-foreground'
  default:
  return 'border border-border bg-muted text-muted-foreground'
  }
  }

  const getStatusLabel = (status: string) => {
  switch (status) {
  case 'applied':
  return 'Applied'
  case 'shortlisted':
  return 'Shortlisted'
  case 'selected':
  return 'Selected'
  case 'rejected':
  return 'Rejected'
  case 'withdrawn':
  return 'Withdrawn'
  case 'pending':
  return 'Pending'
  default:
  return status
  }
  }

  const handleSort = (field: SortField) => {
  if (sortField === field) {
  setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
  } else {
  setSortField(field)
  setSortDirection('asc')
  }
  }

  const getSortIcon = (field: SortField) => {
  if (sortField !== field) {
  return <ChevronsUpDown className="w-4 h-4 text-muted-foreground/70" />
  }
  if (sortDirection === 'asc') {
  return <ChevronUp className="w-4 h-4 text-primary" />
  }
  return <ChevronDown className="w-4 h-4 text-primary" />
  }

  const sortedApplications = useMemo(() => {
  if (!sortField) return applications

  return [...applications].sort((a, b) => {
  let aValue: any
  let bValue: any

  switch (sortField) {
  case 'student_name':
  aValue = a.student_name.toLowerCase()
  bValue = b.student_name.toLowerCase()
  break
  case 'job_title':
  aValue = a.job_title.toLowerCase()
  bValue = b.job_title.toLowerCase()
  break
  case 'applied_at':
  aValue = new Date(a.applied_at)
  bValue = new Date(b.applied_at)
  break
  case 'expected_salary':
  aValue = a.expected_salary || 0
  bValue = b.expected_salary || 0
  break
  case 'status':
  aValue = a.status
  bValue = b.status
  break
  default:
  return 0
  }

  if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1
  if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1
  return 0
  })
  }, [applications, sortField, sortDirection])

  if (isLoading) {
  return (
  <div className={cn(corporateSurfaceClass, 'p-8')}>
  <div className="space-y-4">
  <div className="h-10 max-w-md rounded-xl bg-muted/60 animate-pulse" />
  {[...Array(6)].map((_, i) => (
  <div key={i} className="h-14 rounded-xl bg-muted/40 animate-pulse" />
  ))}
  </div>
  </div>
  )
  }

  if (error) {
  return (
  <div className={cn(corporateSurfaceClass, 'p-10')}>
  <div className="text-center max-w-md mx-auto">
  <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-destructive/10 text-destructive">
  <FileText className="h-7 w-7" />
  </div>
  <h3 className="text-lg font-semibold text-foreground mb-2">
  Error loading applications
  </h3>
  <p className="text-sm text-muted-foreground mb-6">{error}</p>
  <button
  type="button"
  onClick={onRetry}
  className="rounded-xl bg-gradient-to-r from-primary to-secondary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-md transition hover:opacity-95"
  >
  Try again
  </button>
  </div>
  </div>
  )
  }

  if (applications.length === 0) {
  return (
  <div className={cn(corporateSurfaceClass, 'p-12')}>
  <div className="text-center max-w-md mx-auto">
  <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-2xl bg-primary/10 text-primary">
  <FileText className="h-10 w-10 opacity-90" />
  </div>
  <h3 className="text-lg font-semibold text-foreground mb-2">
  No applications in this view
  </h3>
  <p className="text-sm text-muted-foreground leading-relaxed">
  Adjust stage filters or search to see candidates. New applicants appear here as soon as they apply.
  </p>
  </div>
  </div>
  )
  }

  return (
  <div className={cn(corporateSurfaceClass, 'overflow-hidden p-0')}>
  {/* Table */}
  <div className="overflow-x-auto">
  <table className="w-full min-w-[720px]">
  <thead className="border-b border-border bg-muted/35">
  <tr>
  {/* Candidate Info */}
  <th className="px-5 py-3.5 text-left first:pl-6">
  <button
  type="button"
  onClick={() => handleSort('student_name')}
  className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground hover:text-primary transition-colors"
  >
  Candidate
  {getSortIcon('student_name')}
  </button>
  </th>

  {/* Job Title */}
  <th className="px-5 py-3.5 text-left">
  <button
  type="button"
  onClick={() => handleSort('job_title')}
  className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground hover:text-primary transition-colors"
  >
  Role
  {getSortIcon('job_title')}
  </button>
  </th>

  {/* Status */}
  <th className="px-5 py-3.5 text-left">
  <button
  type="button"
  onClick={() => handleSort('status')}
  className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground hover:text-primary transition-colors"
  >
  Stage
  {getSortIcon('status')}
  </button>
  </th>

  {/* Applied Date */}
  <th className="px-5 py-3.5 text-left">
  <button
  type="button"
  onClick={() => handleSort('applied_at')}
  className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground hover:text-primary transition-colors"
  >
  Applied
  {getSortIcon('applied_at')}
  </button>
  </th>

  {/* Expected Salary */}
  <th className="px-5 py-3.5 text-left">
  <button
  type="button"
  onClick={() => handleSort('expected_salary')}
  className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground hover:text-primary transition-colors"
  >
  Salary
  {getSortIcon('expected_salary')}
  </button>
  </th>

  {/* Actions */}
  <th className="px-5 py-3.5 pr-6 text-right">
  <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
  Actions
  </span>
  </th>
  </tr>
  </thead>

  <tbody className="divide-y divide-border bg-card/50">
  {sortedApplications.map((application, index) => (
  <motion.tr
  key={application.id}
  initial={{ opacity: 0, y: 12 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.25, delay: index * 0.03 }}
  className="transition-colors hover:bg-muted/40"
  >
  {/* Student Info */}
  <td className="whitespace-nowrap px-5 py-4 pl-6">
  <div className="flex items-center gap-3">
  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-primary/20 to-secondary/20 ring-2 ring-background">
  <User className="h-5 w-5 text-primary" />
  </div>
  <div className="min-w-0">
  <div className="truncate text-sm font-semibold text-foreground">
  {application.student_name}
  </div>
  <div className="truncate text-xs text-muted-foreground">
  {application.student_email}
  </div>
  </div>
  </div>
  </td>

  {/* Job Title */}
  <td className="px-5 py-4">
  <div className="text-sm font-medium text-foreground line-clamp-2 max-w-[200px] sm:max-w-xs">
  {application.job_title}
  </div>
  </td>

  {/* Status */}
  <td className="whitespace-nowrap px-5 py-4">
  <span
  className={cn(
  'inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold',
  getStatusColor(application.status),
  )}
  >
  {getStatusLabel(application.status)}
  </span>
  </td>

  {/* Applied Date */}
  <td className="whitespace-nowrap px-5 py-4">
  <div className="flex items-center text-sm text-foreground">
  <Calendar className="mr-2 h-4 w-4 text-muted-foreground" />
  {formatDate(application.applied_at)}
  </div>
  </td>

  {/* Expected Salary */}
  <td className="whitespace-nowrap px-5 py-4">
  <div className="flex items-center text-sm text-foreground">
  <DollarSign className="mr-2 h-4 w-4 text-muted-foreground" />
  {application.expected_salary ? formatCurrency(application.expected_salary) : '—'}
  </div>
  </td>

  {/* Actions */}
  <td className="whitespace-nowrap px-5 py-4 pr-6 text-right text-sm font-medium">
  <div className="flex items-center justify-end gap-2">
  <button
  type="button"
  onClick={() => onStatusUpdate(application)}
  className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-border/80 bg-background text-primary transition hover:border-primary/30 hover:bg-primary/5"
  title="Review & update stage"
  >
  <Eye className="h-4 w-4" />
  </button>
  </div>
  </td>
  </motion.tr>
  ))}
  </tbody>
  </table>
  </div>

  {/* Pagination */}
  {totalPages > 1 && (
  <div className="border-t border-border bg-muted/25 px-5 py-4">
  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
  <div className="text-sm text-muted-foreground">
  Page <span className="font-semibold text-foreground">{currentPage}</span> of{' '}
  <span className="tabular-nums">{totalPages}</span>
  </div>
  <div className="flex items-center gap-2">
  <button
  type="button"
  onClick={() => onPageChange(currentPage - 1)}
  disabled={currentPage === 1}
  className="rounded-xl border border-border bg-background p-2.5 text-foreground transition hover:bg-muted disabled:cursor-not-allowed disabled:opacity-50"
  >
  <ChevronLeft className="h-4 w-4" />
  </button>

  <span className="min-w-[2.5rem] rounded-lg bg-background px-3 py-2 text-center text-sm font-semibold tabular-nums">
  {currentPage}
  </span>

  <button
  type="button"
  onClick={() => onPageChange(currentPage + 1)}
  disabled={currentPage === totalPages}
  className="rounded-xl border border-border bg-background p-2.5 text-foreground transition hover:bg-muted disabled:cursor-not-allowed disabled:opacity-50"
  >
  <ChevronRight className="h-4 w-4" />
  </button>
  </div>
  </div>
  </div>
  )}
  </div>
  )
}
