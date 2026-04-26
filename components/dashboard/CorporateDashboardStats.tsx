"use client"

import { motion } from 'framer-motion'
import { Briefcase, Users, FileText, Target } from 'lucide-react'
import { cn } from '@/lib/utils'
interface CorporateDashboardStatsProps {
 className?: string
 isLoading?: boolean
 dashboardData?: any
}

export function CorporateDashboardStats({
 className ='',
 isLoading = false,
 dashboardData
}: CorporateDashboardStatsProps) {
 const jobStats = dashboardData?.job_statistics || {}
 const activeJobs = jobStats.active_jobs || 0
 const totalApplications = jobStats.total_applications || 0
 const shortlistedCandidates = jobStats.shortlisted_candidates || 0
 const totalJobsPosted = jobStats.total_jobs_posted || 0

 const statCards = [
 {
 label:'Active Jobs',
 value: activeJobs.toString(),
 icon: Briefcase,
 accent:'text-blue-800',
 iconBg:'',
 },
 {
 label:'Total Applications',
 value: totalApplications.toString(),
 icon: FileText,
 accent:'text-slate-600',
 iconBg:'',
 },
 {
 label:'Shortlisted',
 value: shortlistedCandidates.toString(),
 icon: Users,
 accent:'text-blue-800',
 iconBg:'',
 },
 {
 label:'Jobs Posted',
 value: totalJobsPosted.toString(),
 icon: Target,
 accent:'text-slate-600',
 iconBg:'',
 },
 ]

 if (isLoading) {
 return (
 <div className={cn('grid grid-cols-2 lg:grid-cols-4 gap-4 w-full', className)}>
 {[...Array(4)].map((_, index) => (
 <div
 key={index}
 className="h-28 animate-pulse rounded-2xl border border-slate-200/90 bg-white shadow-[0_4px_24px_-6px_rgba(15,23,42,0.07)]"/>
 ))}
 </div>
 )
 }

 return (
 <div className={cn('grid grid-cols-2 lg:grid-cols-4 gap-4 w-full', className)}>
 {statCards.map((stat, index) => (
 <motion.div
 key={stat.label}
 initial={{ opacity: 0, y: 16 }}
 animate={{ opacity: 1, y: 0 }}
 transition={{ duration: 0.45, delay: index * 0.06 }}
 className="w-full">
 <div
 className={cn('group h-full dashboard-overview-card-interactive p-5',
 )}
 >
 <div className="flex items-start justify-between gap-3">
 <div className="min-w-0 flex-1">
 <p className="mb-1.5 text-sm text-slate-600">
 {stat.label}
 </p>
 <p className="text-base font-semibold tabular-nums text-slate-900">
 {stat.value}
 </p>
 </div>
 <div
 className={cn('shrink-0 rounded-2xl border border-slate-200 bg-blue-50 p-3 shadow-sm',
 stat.iconBg,
 )}
 >
 <stat.icon className={cn('h-6 w-6', stat.accent)} />
 </div>
 </div>
 </div>
 </motion.div>
 ))}
 </div>
 )
}
