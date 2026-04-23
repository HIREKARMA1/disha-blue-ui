"use client"

import { motion } from 'framer-motion'
import {
 Users,
 Briefcase,
 Building,
 CheckCircle
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { StudentStatistics, JobStatistics } from '@/types/university'
interface StatCard {
 label: string
 value: string
 icon: React.ComponentType<{ className?: string }>
 accent: string
}

interface UniversityDashboardStatsProps {
 studentStats?: StudentStatistics
 jobStats?: JobStatistics
 className?: string
 isLoading?: boolean
}

export function UniversityDashboardStats({
 studentStats,
 jobStats,
 className ='',
 isLoading = false
}: UniversityDashboardStatsProps) {
 const formatNumber = (num: number) => {
 return new Intl.NumberFormat('en-US').format(num)
 }

 const statCards: StatCard[] = [
 {
 label:'Total Students',
 value: formatNumber(studentStats?.total_students || 0),
 icon: Users,
 accent:'text-emerald-800'},
 {
 label:'Selected Students',
 value: formatNumber(studentStats?.placed_students || 0),
 icon: CheckCircle,
 accent:'text-sage-deep'},
 {
 label:'Active Jobs',
 value: formatNumber(jobStats?.total_jobs_approved || 0),
 icon: Briefcase,
 accent:'text-emerald-800'},
 {
 label:'Total Jobs',
 value: formatNumber((jobStats?.total_jobs_approved || 0) + (jobStats?.pending_approvals || 0)),
 icon: Building,
 accent:'text-slate-600'}
 ]

 return (
 <div className={`grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-4 w-full ${className}`}>
 {statCards.map((stat, index) => (
 <motion.div
 key={stat.label}
 initial={{ opacity: 0, y: 20 }}
 animate={{ opacity: 1, y: 0 }}
 transition={{ duration: 0.6, delay: index * 0.1 }}
 className="w-full">
 <div className="group block w-full">
 <div
 className={cn(
 'w-full dashboard-overview-card-interactive p-5',
 )}
 >
 <div className="flex items-center justify-between">
 <div className="min-w-0 flex-1">
 <p className="mb-1 text-sm font-medium text-slate-600">
 {stat.label}
 </p>
 <p className="text-2xl font-bold tabular-nums text-slate-900 transition-transform duration-200 group-hover:scale-105">
 {isLoading ? (
 <div className="h-8 w-16 animate-pulse rounded-lg bg-slate-200"></div>
 ) : (
 stat.value
 )}
 </p>
 </div>
 <div className="shrink-0 rounded-2xl border border-slate-200 bg-sage p-3 shadow-sm transition-transform duration-200 group-hover:scale-110">
 <stat.icon className={cn('h-6 w-6', stat.accent)} />
 </div>
 </div>
 </div>
 </div>
 </motion.div>
 ))}
 </div>
 )
}
