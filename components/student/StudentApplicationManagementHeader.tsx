"use client"

import { motion } from 'framer-motion'
import { Search, Filter, FileText, Users, CheckCircle, XCircle, Clock, UserCheck, Download } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
interface StudentApplicationManagementHeaderProps {
  totalApplications: number
  appliedApplications: number
  shortlistedApplications: number
  selectedApplications: number
  rejectedApplications: number
  pendingApplications: number
  searchTerm: string
  onSearchChange: (term: string) => void
  filterStatus: string
  onFilterChange: (status: string) => void
  companyOptions?: string[]
  selectedCompany?: string
  onCompanyChange?: (company: string) => void
  jobOptions?: { id: string; title: string }[]
  selectedJobId?: string
  onJobChange?: (jobId: string) => void
  onExport?: () => void
}

export function StudentApplicationManagementHeader({
  totalApplications,
  appliedApplications,
  shortlistedApplications,
  selectedApplications,
  rejectedApplications,
  pendingApplications,
  searchTerm,
  onSearchChange,
  filterStatus,
  onFilterChange,
  companyOptions,
  selectedCompany,
  onCompanyChange,
  jobOptions,
  selectedJobId,
  onJobChange,
  onExport
}: StudentApplicationManagementHeaderProps) {
  const statusOptions = [
  { value: 'all', label: 'All Applications', count: totalApplications },
  { value: 'applied', label: 'Applied', count: appliedApplications },
  { value: 'shortlisted', label: 'Shortlisted', count: shortlistedApplications },
  { value: 'selected', label: 'Selected', count: selectedApplications },
  { value: 'rejected', label: 'Rejected', count: rejectedApplications },
  { value: 'pending', label: 'Pending', count: pendingApplications },
  ]

  const getStatusIcon = (status: string) => {
  switch (status) {
  case 'applied':
  return <Clock className="w-6 h-6" />
  case 'shortlisted':
  return <UserCheck className="w-6 h-6" />
  case 'selected':
  return <CheckCircle className="w-6 h-6" />
  case 'rejected':
  return <XCircle className="w-6 h-6" />
  case 'pending':
  return <Clock className="w-6 h-6" />
  default:
  return <FileText className="w-6 h-6" />
  }
  }

  const getStatusCardStyle = (status: string) => {
  switch (status) {
  case 'applied':
  return { color: 'text-primary', ring: 'ring-primary/15', bg: 'bg-primary/5' }
  case 'shortlisted':
  return { color: 'text-secondary', ring: 'ring-secondary/20', bg: 'bg-secondary/10' }
  case 'selected':
  return { color: 'text-emerald-600 dark:text-emerald-400', ring: 'ring-emerald-500/20', bg: 'bg-emerald-500/10' }
  case 'rejected':
  return { color: 'text-destructive', ring: 'ring-destructive/15', bg: 'bg-destructive/5' }
  case 'pending':
  return { color: 'text-amber-600 dark:text-amber-400', ring: 'ring-amber-500/20', bg: 'bg-amber-500/10' }
  default:
  return { color: 'text-muted-foreground', ring: 'ring-border', bg: 'bg-muted/40' }
  }
  }

  return (
  <div className="space-y-6">
  <motion.div
  initial={{ opacity: 0, y: 16 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.45 }}
  className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6 dark:border-slate-800 dark:bg-slate-900"
  >
  <p className="font-display text-xs font-semibold uppercase tracking-[0.2em] text-primary">Pipeline</p>
  <h1 className="font-display mt-3 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
  Applications
  </h1>
  <p className="mt-3 max-w-2xl text-pretty text-base text-muted-foreground">
  A single place to see where you stand with each employer—status, deadlines, and next actions.
  </p>
  <div className="mt-4 inline-flex items-center rounded-full border border-border/80 bg-background/60 px-3 py-1 text-xs font-medium text-foreground/90">
  {new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
  </div>
  </motion.div>

  <div className="-mx-1 flex gap-3 overflow-x-auto px-1 pb-1 snap-x snap-mandatory scrollbar-hide lg:mx-0 lg:grid lg:grid-cols-6 lg:gap-3 lg:overflow-visible lg:pb-0">
  {statusOptions.map((option, index) => {
  const style = getStatusCardStyle(option.value)
  return (
  <motion.div
  key={option.value}
  initial={{ opacity: 0, y: 12 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.4, delay: index * 0.05 }}
  className="w-[8.5rem] shrink-0 snap-start lg:w-full"
  >
  <button
  type="button"
  onClick={() => onFilterChange(option.value)}
  className={cn(
  'group flex h-full w-full flex-col rounded-xl border border-slate-200 bg-white p-3.5 text-left shadow-sm transition-all hover:border-primary-300 hover:shadow-md dark:border-slate-700 dark:bg-slate-900',
  filterStatus === option.value && 'border-primary-500 ring-2 ring-primary-500/20',
  )}
  >
  <div className="flex items-start justify-between gap-2">
  <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
  {option.label}
  </p>
  <span
  className={cn(
  'rounded-lg p-2 ring-1 transition-transform group-hover:scale-105',
  style.ring,
  style.bg,
  )}
  >
  <span className={style.color}>{getStatusIcon(option.value)}</span>
  </span>
  </div>
  <p className="mt-2 text-xl font-bold tabular-nums text-slate-900 dark:text-slate-50">
  {option.count}
  </p>
  </button>
  </motion.div>
  )
  })}
  </div>

  <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5 dark:border-slate-800 dark:bg-slate-900">
  <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
  <div className="relative min-w-0 flex-1">
  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
  <input
  type="search"
  placeholder="Job title, company, status…"
  value={searchTerm}
  onChange={(e) => onSearchChange(e.target.value)}
  className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-4 text-sm font-medium text-slate-900 placeholder:text-slate-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500/30 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
  />
  </div>

  <div className="relative min-w-0 lg:w-64">
  <Filter className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
  <select
  value={filterStatus}
  onChange={(e) => onFilterChange(e.target.value)}
  className="h-11 w-full appearance-none rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-3 text-sm font-medium text-slate-900 shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500/30 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
  >
  {statusOptions.map((option) => (
  <option key={option.value} value={option.value}>
  {option.label} ({option.count})
  </option>
  ))}
  </select>
  </div>

  {/* Company Filter (optional, for university view) */}
  {companyOptions && companyOptions.length > 0 && onCompanyChange && (
  <div className="relative min-w-0 lg:w-64">
  <Users className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
  <select
  value={selectedCompany || 'all'}
  onChange={(e) => onCompanyChange(e.target.value)}
  className="h-11 w-full appearance-none rounded-xl border border-input bg-background pl-10 pr-3 text-sm font-medium shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
  >
  <option value="all">All Companies</option>
  {companyOptions.map((name) => (
  <option key={name} value={name}>
  {name}
  </option>
  ))}
  </select>
  </div>
  )}

  {/* Job Filter (optional, for university view) */}
  {jobOptions && jobOptions.length > 0 && onJobChange && (
  <div className="relative min-w-0 lg:w-64">
  <FileText className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
  <select
  value={selectedJobId || 'all'}
  onChange={(e) => onJobChange(e.target.value)}
  className="h-11 w-full appearance-none rounded-xl border border-input bg-background pl-10 pr-3 text-sm font-medium shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
  >
  <option value="all">All Jobs</option>
  {jobOptions.map((job) => (
  <option key={job.id} value={job.id}>
  {job.title}
  </option>
  ))}
  </select>
  </div>
  )}

  {onExport && (
  <div className="flex items-center lg:shrink-0">
  <Button
  type="button"
  variant="gradient"
  onClick={onExport}
  className="h-11 w-full rounded-xl font-semibold shadow-md shadow-primary/15 sm:w-auto"
  >
  <Download className="w-4 h-4 mr-2" />
  <span>Export CSV</span>
  </Button>
  </div>
  )}
  </div>
  </div>
  </div>
  )
}
