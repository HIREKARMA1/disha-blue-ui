"use client"

import { motion } from 'framer-motion'
import { Search, Filter, FileText, Users, CheckCircle, XCircle, Clock, UserCheck } from 'lucide-react'
import { cn } from '@/lib/utils'
import {
  corporateHeroClass,
  corporateSurfaceClass,
  corporateSelectClassName,
} from '@/components/corporate/corporate-ui'

interface ApplicationManagementHeaderProps {
  totalApplications: number
  pendingApplications: number
  shortlistedApplications: number
  selectedApplications: number
  rejectedApplications: number
  searchTerm: string
  onSearchChange: (term: string) => void
  filterStatus: string
  onFilterChange: (status: string) => void
}

export function ApplicationManagementHeader({
  totalApplications,
  pendingApplications,
  shortlistedApplications,
  selectedApplications,
  rejectedApplications,
  searchTerm,
  onSearchChange,
  filterStatus,
  onFilterChange
}: ApplicationManagementHeaderProps) {
  const statusOptions = [
  { value: 'all', label: 'All', sub: 'Applications', count: totalApplications },
  { value: 'applied', label: 'Applied', sub: 'New', count: pendingApplications },
  { value: 'shortlisted', label: 'Shortlisted', sub: 'Pipeline', count: shortlistedApplications },
  { value: 'selected', label: 'Selected', sub: 'Offers', count: selectedApplications },
  { value: 'rejected', label: 'Rejected', sub: 'Closed', count: rejectedApplications },
  ]

  const getStatusIcon = (status: string) => {
  switch (status) {
  case 'applied':
  return <Clock className="h-5 w-5" />
  case 'shortlisted':
  return <UserCheck className="h-5 w-5" />
  case 'selected':
  return <CheckCircle className="h-5 w-5" />
  case 'rejected':
  return <XCircle className="h-5 w-5" />
  default:
  return <FileText className="h-5 w-5" />
  }
  }

  return (
  <div className="space-y-6">
  <motion.div
  initial={{ opacity: 0, y: 16 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.45 }}
  className={corporateHeroClass}
  >
  <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
  <div className="min-w-0 flex-1">
  <p className="text-xs font-semibold uppercase tracking-wider text-primary/80 mb-2">
  Hiring pipeline
  </p>
  <h1 className="font-display text-2xl font-semibold tracking-tight text-foreground md:text-3xl mb-2">
  Candidate applications
  </h1>
  <p className="text-muted-foreground text-base max-w-2xl">
  Review applicants, update stage, and move roles forward—structured like a modern ATS.
  </p>
  </div>
  <div className="flex shrink-0 flex-wrap gap-2">
  <span className="inline-flex items-center rounded-full border border-border/80 bg-background/60 px-3 py-1 text-xs font-medium text-foreground backdrop-blur-sm">
  {new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
  </span>
  <span className="inline-flex items-center rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
  {totalApplications} total
  </span>
  </div>
  </div>
  </motion.div>

  <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-5">
  {statusOptions.map((option, index) => {
  const active = filterStatus === option.value
  return (
  <motion.div
  key={option.value}
  initial={{ opacity: 0, y: 12 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.4, delay: index * 0.04 }}
  className="w-full"
  >
  <button
  type="button"
  onClick={() => onFilterChange(option.value)}
  className={cn(
  'group w-full rounded-2xl border p-4 text-left transition-all duration-200',
  'border-border/80 bg-card/90 shadow-sm hover:border-primary/25 hover:shadow-md',
  active &&
  'ring-2 ring-primary/35 border-primary/30 shadow-[0_16px_48px_-28px_hsl(var(--primary)/0.4)]',
  )}
  >
  <div className="flex items-start justify-between gap-2">
  <div className="min-w-0">
  <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
  {option.sub}
  </p>
  <p className="truncate text-sm font-semibold text-foreground">{option.label}</p>
  <p className="mt-1 font-display text-2xl font-bold tabular-nums text-foreground">
  {option.count}
  </p>
  </div>
  <div
  className={cn(
  'rounded-xl p-2.5 transition-transform duration-200 group-hover:scale-105',
  active ? 'bg-primary/15 text-primary' : 'bg-muted/50 text-muted-foreground',
  )}
  >
  {getStatusIcon(option.value)}
  </div>
  </div>
  </button>
  </motion.div>
  )
  })}
  </div>

  <div className={cn(corporateSurfaceClass, 'p-5')}>
  <div className="flex flex-col gap-3 sm:flex-row">
  <div className="relative min-w-0 flex-1">
  <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground pointer-events-none" />
  <input
  type="text"
  placeholder="Search by name, job title, or email…"
  value={searchTerm}
  onChange={(e) => onSearchChange(e.target.value)}
  className="h-11 w-full rounded-xl border border-input bg-background pl-10 pr-4 text-sm text-foreground shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
  />
  </div>
  <div className="relative sm:w-64 shrink-0">
  <Filter className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground pointer-events-none z-[1]" />
  <select
  value={filterStatus}
  onChange={(e) => onFilterChange(e.target.value)}
  className={corporateSelectClassName('pl-10')}
  >
  {statusOptions.map((option) => (
  <option key={option.value} value={option.value}>
  {option.label} · {option.count}
  </option>
  ))}
  </select>
  </div>
  </div>
  </div>
  </div>
  )
}
