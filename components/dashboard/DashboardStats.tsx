"use client"

import { motion } from 'framer-motion'
import {
 Briefcase,
 FileText,
 CheckCircle,
 XCircle,
 TrendingUp,
 Calendar,
 MapPin,
 Building2,
 AlertCircle
} from 'lucide-react'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { dashboardService, type DashboardStats } from '@/services/dashboardService'
interface StatCard {
 label: string
 value: string
 icon: React.ComponentType<{ className?: string }>
 color: string
 bgColor: string
}

interface DashboardStatsProps {
 className?: string
}

export function DashboardStats({ className =''}: DashboardStatsProps) {
 const [stats, setStats] = useState<DashboardStats>({
 totalJobs: 0,
 appliedJobs: 0,
 selected: 0,
 rejected: 0
 })
 const [loading, setLoading] = useState(true)
 const [error, setError] = useState<string | null>(null)
 const router = useRouter()

 useEffect(() => {
 const fetchStats = async () => {
 try {
 setLoading(true)
 setError(null)
 const dashboardStats = await dashboardService.getDashboardStats()
 setStats(dashboardStats)
 } catch (error: any) {
 console.error('Failed to fetch dashboard stats:', error)

 // Handle authentication errors
 if (error.message.includes('not authenticated') || error.message.includes('Authentication failed')) {
 // Redirect to login
 router.push('/auth/login')
 return
 }

 setError(error.message ||'Unable to fetch data. Please try again later.')
 } finally {
 setLoading(false)
 }
 }

 fetchStats()
 }, [router])

 const statCards: StatCard[] = [
 {
 label:'Total Jobs',
 value: stats.totalJobs.toString(),
 icon: Briefcase,
 color:'text-emerald-800',
 bgColor:'bg-white'},
 {
 label:'Applied Jobs',
 value: stats.appliedJobs.toString(),
 icon: FileText,
 color:'text-emerald-800',
 bgColor:'bg-white'},
 {
 label:'Selected',
 value: stats.selected.toString(),
 icon: CheckCircle,
 color:'text-emerald-800',
 bgColor:'bg-white'},
 {
 label:'Rejected',
 value: stats.rejected.toString(),
 icon: XCircle,
 color:'text-slate-500',
 bgColor:'bg-white'}
 ]

 if (loading) {
 return (
 <div className={`grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-4 w-full ${className}`}>
 {[...Array(4)].map((_, index) => (
 <div key={index} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm animate-pulse dark:border-emerald-800 dark:bg-emerald-900/40">
 <div className="mb-3 h-8 rounded-lg bg-slate-200 dark:bg-emerald-800"></div>
 <div className="h-4 rounded-lg bg-slate-200 dark:bg-emerald-800"></div>
 </div>
 ))}
 </div>
 )
 }

 if (error) {
 return (
 <div className={`w-full ${className}`}>
 <div className="dashboard-overview-card p-6">
 <div className="text-center">
 <AlertCircle className="mx-auto mb-3 h-8 w-8 text-sage-deep"/>
 <h3 className="mb-2 text-lg font-medium text-slate-900">
 Unable to Load Dashboard Data
 </h3>
 <p className="text-sm text-slate-600">
 Please refresh the page to try again.
 </p>
 </div>
 </div>
 </div>
 )
 }

 return (
 <div className={`grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-4 w-full ${className}`}>
 {statCards.map((stat, index) => (
 <motion.div
 key={stat.label}
 initial={{ opacity: 0, y: 20 }}
 animate={{ opacity: 1, y: 0 }}
 transition={{ duration: 0.6, delay: index * 0.1 }}
 className="w-full">
 <div className={`group w-full dashboard-overview-card-interactive p-5 ${stat.bgColor}`}>
 <div className="flex items-start justify-between gap-3">
 <div className="flex-1">
 <p className="mb-1 text-sm text-slate-600">
 {stat.label}
 </p>
 <p className="text-base font-semibold text-slate-900">
 {stat.value}
 </p>
 </div>
 <div className="rounded-2xl border border-slate-200 bg-sage p-3 shadow-sm">
 <stat.icon className={`h-6 w-6 ${stat.color}`} />
 </div>
 </div>
 </div>
 </motion.div>
 ))}
 </div>
 )
}