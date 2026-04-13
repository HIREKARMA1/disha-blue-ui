"use client"

import { motion } from 'framer-motion'
import { Users, Building2, GraduationCap, Briefcase, FileText, CheckCircle, Clock, AlertTriangle } from 'lucide-react'
import { AdminUserStats, AdminJobStats } from '@/types/admin'
interface AdminDashboardStatsProps {
 userStats: AdminUserStats
 jobStats: AdminJobStats
 isLoading: boolean
}

export function AdminDashboardStats({ userStats, jobStats, isLoading }: AdminDashboardStatsProps) {
 const stats = [
 {
 title:'Total Users',
 value: userStats.total_users,
 icon: Users,
 iconColor:'text-emerald-800',
 change:'+12%',
 changeType:'positive'as const
 },
 {
 title:'Students',
 value: userStats.total_students,
 icon: GraduationCap,
 iconColor:'text-emerald-800',
 change:'+8%',
 changeType:'positive'as const
 },
 {
 title:'Universities',
 value: userStats.total_universities,
 icon: Building2,
 iconColor:'text-sage-deep',
 change:'+5%',
 changeType:'positive'as const
 },
 {
 title:'Corporates',
 value: userStats.total_corporates,
 icon: Briefcase,
 iconColor:'text-sage-deep',
 change:'+15%',
 changeType:'positive'as const
 },
 {
 title:'Active Jobs',
 value: jobStats.active_jobs,
 icon: CheckCircle,
 iconColor:'text-emerald-800',
 change:'+22%',
 changeType:'positive'as const
 },
 {
 title:'Applications',
 value: jobStats.total_applications,
 icon: FileText,
 iconColor:'text-sage-deep',
 change:'+18%',
 changeType:'positive'as const
 },
 {
 title:'Pending Approvals',
 value: jobStats.pending_approvals,
 icon: Clock,
 iconColor:'text-sage-deep',
 change:'-3%',
 changeType:'negative'as const
 },
 {
 title:'System Alerts',
 value: 2,
 icon: AlertTriangle,
 iconColor:'text-amber-700',
 change:'+1',
 changeType:'negative'as const
 }
 ]

 if (isLoading) {
 return (
 <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
 {Array.from({ length: 8 }).map((_, index) => (
 <div key={index} className="animate-pulse rounded-2xl border border-slate-200/90 bg-white p-6 shadow-[0_4px_24px_-6px_rgba(15,23,42,0.07)]">
 <div className="mb-4 flex items-center justify-between">
 <div className="h-12 w-12 rounded-2xl bg-slate-200"></div>
 <div className="h-4 w-16 rounded-lg bg-slate-200"></div>
 </div>
 <div className="space-y-2">
 <div className="h-6 w-20 rounded-lg bg-slate-200"></div>
 <div className="h-4 w-16 rounded-lg bg-slate-200"></div>
 </div>
 </div>
 ))}
 </div>
 )
 }

 return (
 <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
 {stats.map((stat, index) => (
 <motion.div
 key={stat.title}
 initial={{ opacity: 0, y: 20 }}
 animate={{ opacity: 1, y: 0 }}
 transition={{ duration: 0.6, delay: index * 0.1 }}
 className="dashboard-overview-card-interactive p-6">
 <div className="mb-4 flex items-center justify-between">
 <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-slate-200 bg-sage shadow-sm">
 <stat.icon className={`h-6 w-6 ${stat.iconColor}`} />
 </div>
 <div className="rounded-full border border-slate-200 bg-sage px-2 py-1 text-xs text-slate-800 shadow-sm">
 {stat.change}
 </div>
 </div>

 <div className="space-y-1">
 <h3 className="text-base font-semibold text-slate-900">
 {stat.value.toLocaleString()}
 </h3>
 <p className="text-sm text-slate-600">
 {stat.title}
 </p>
 </div>
 </motion.div>
 ))}
 </div>
 )
}
