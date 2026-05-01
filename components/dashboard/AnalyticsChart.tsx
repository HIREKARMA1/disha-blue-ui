"use client"

import { motion } from 'framer-motion'
import { TrendingUp, TrendingDown, BarChart3, PieChart, Target, Users, Briefcase, AlertCircle } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { dashboardService, type DashboardStats } from '@/services/dashboardService'
import { DASHBOARD_CHART_COLORS } from '@/config/theme'
import { dashboardSolidSurfaceClass } from '@/components/dashboard/dashboard-ui'
import { cn } from '@/lib/utils'
interface AnalyticsChartProps {
 className?: string
}

interface PieChartData {
 label: string
 value: number
 color: string
 percentage: number
}

export function AnalyticsChart({ className =''}: AnalyticsChartProps) {
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

 setError(error.message ||'Unable to fetch analytics data. Please try again later.')
 } finally {
 setLoading(false)
 }
 }

 fetchStats()
 }, [router])

 const { totalJobs, appliedJobs, selected, rejected } = stats

 const applicationRate = totalJobs > 0 ? ((appliedJobs / totalJobs) * 100).toFixed(1) :'0.0'
const selectionRate = appliedJobs > 0 ? ((selected / appliedJobs) * 100).toFixed(1) :'0.0'// Calculate total for pie chart
const totalForPie = totalJobs + appliedJobs + selected + rejected

 const pieChartData: PieChartData[] = [
 { label:'Total Jobs', value: totalJobs, color: DASHBOARD_CHART_COLORS.neutral, percentage: 100 },
 { label:'Applied Jobs', value: appliedJobs, color: DASHBOARD_CHART_COLORS.secondary, percentage: totalJobs > 0 ? (appliedJobs / totalJobs) * 100 : 0 },
 { label:'Selected', value: selected, color: DASHBOARD_CHART_COLORS.primary, percentage: totalJobs > 0 ? (selected / totalJobs) * 100 : 0 },
 { label:'Rejected', value: rejected, color: DASHBOARD_CHART_COLORS.danger, percentage: totalJobs > 0 ? (rejected / totalJobs) * 100 : 0 }
 ]

 if (loading) {
 return (
 <div className={cn(dashboardSolidSurfaceClass, 'p-6', className)}>
 <div className="animate-pulse space-y-6">
 <div className="h-6 bg-gray-200 rounded-none w-1/3"></div>
 <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
 {[...Array(4)].map((_, index) => (
 <div key={index} className="h-20 bg-gray-200 rounded-none"></div>
 ))}
 </div>
 <div className="grid grid-cols-2 gap-4">
 {[...Array(2)].map((_, index) => (
 <div key={index} className="h-24 bg-gray-200 rounded-none"></div>
 ))}
 </div>
 <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
 {[...Array(2)].map((_, index) => (
 <div key={index} className="h-64 bg-gray-200 rounded-none"></div>
 ))}
 </div>
 </div>
 </div>
 )
 }

 if (error) {
 return (
 <div className={cn(dashboardSolidSurfaceClass, 'p-6', className)}>
 <div className="text-center">
 <AlertCircle className="w-8 h-8 text-gray-400 mx-auto mb-3"/>
 <h3 className="text-lg font-medium text-gray-900 mb-2">
 Unable to Load Analytics Data
 </h3>
 <p className="text-gray-600">
 Please refresh the page to try again.
 </p>
 </div>
 </div>
 )
 }

 return (
 <div className={cn(dashboardSolidSurfaceClass, 'p-6', className)}>
 <div className="flex items-center justify-between mb-6">
 <h2 className="text-xl font-semibold text-gray-900">
 Job Application Analytics
 </h2>
 <div className="flex items-center space-x-2">
 <BarChart3 className="w-5 h-5 text-gray-400"/>
 <PieChart className="w-5 h-5 text-gray-400"/>
 </div>
 </div>

 {/* Conversion Rates */}
 <div className="grid grid-cols-2 gap-4 mb-6">
 <div className="bg-gray-100 rounded-xl p-4">
 <div className="flex items-center space-x-2 mb-2">
 <TrendingUp className="w-4 h-4 text-gray-500"/>
 <span className="text-sm font-medium text-gray-700">Application Rate</span>
 </div>
 <p className="text-lg font-bold text-gray-600">{applicationRate}%</p>
 <div className="w-full bg-gray-300 h-2 mt-2">
 <div className="bg-gray-500 h-2"style={{ width: `${applicationRate}%` }}></div>
 </div>
 <p className="text-xs text-gray-500 mt-1">
 {appliedJobs} out of {totalJobs} jobs applied
 </p>
 </div>
 <div className="bg-blue-50 rounded-xl p-4">
 <div className="flex items-center space-x-2 mb-2">
 <TrendingUp className="w-4 h-4 text-blue-500"/>
 <span className="text-sm font-medium text-blue-700">Selection Rate</span>
 </div>
 <p className="text-lg font-bold text-blue-600">{selectionRate}%</p>
 <div className="w-full bg-blue-200 h-2 mt-2">
 <div className="bg-blue-500 h-2"style={{ width: `${selectionRate}%` }}></div>
 </div>
 <p className="text-xs text-gray-500 mt-1">
 {selected} out of {appliedJobs} applications selected
 </p>
 </div>
 </div>

 {/* Charts Grid */}
 <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
 {/* Enhanced Bar Chart */}
 <div className="space-y-4">
 <h3 className="font-semibold text-gray-900 text-lg">Job Application Overview</h3>

 {/* Simple Horizontal Bar Chart */}
 <div className="space-y-4">
 {/* Total Jobs */}
 <div className="space-y-2">
 <div className="flex justify-between items-center">
 <span className="text-sm font-medium text-gray-700">Total Jobs</span>
 <span className="text-sm font-bold text-gray-600">{totalJobs}</span>
 </div>
 <div className="w-full bg-gray-200 h-3">
 <div
 className="bg-gray-500 h-3 transition-all duration-500"style={{ width:'100%'}}
 ></div>
 </div>
 </div>

 {/* Applied Jobs */}
 <div className="space-y-2">
 <div className="flex justify-between items-center">
 <span className="text-sm font-medium text-gray-700">Applied Jobs</span>
 <span className="text-sm font-bold text-blue-600">{appliedJobs}</span>
 </div>
 <div className="w-full bg-gray-200 h-3">
 <div
 className="bg-blue-500 h-3 transition-all duration-500"style={{ width: totalJobs > 0 ? `${(appliedJobs / totalJobs) * 100}%` :'0%'}}
 ></div>
 </div>
 </div>

 {/* Selected */}
 <div className="space-y-2">
 <div className="flex justify-between items-center">
 <span className="text-sm font-medium text-gray-700">Selected</span>
 <span className="text-sm font-bold text-blue-700">{selected}</span>
 </div>
 <div className="w-full bg-gray-200 h-3">
 <div
 className="bg-blue-700 h-3 transition-all duration-500"style={{ width: totalJobs > 0 ? `${(selected / totalJobs) * 100}%` :'0%'}}
 ></div>
 </div>
 </div>

 {/* Rejected */}
 <div className="space-y-2">
 <div className="flex justify-between items-center">
 <span className="text-sm font-medium text-gray-700">Rejected</span>
 <span className="text-sm font-bold text-red-600">{rejected}</span>
 </div>
 <div className="w-full bg-gray-200 h-3">
 <div
 className="bg-red-500 h-3 transition-all duration-500"style={{ width: totalJobs > 0 ? `${(rejected / totalJobs) * 100}%` :'0%'}}
 ></div>
 </div>
 </div>
 </div>

 {/* Legend */}
 <div className="bg-gray-50 rounded-xl p-3 mt-4">
 <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 text-sm text-gray-600">
 <div className="flex items-center space-x-2 justify-center sm:justify-start">
 <div className="w-3 h-3 bg-gray-500 rounded-none flex-shrink-0"></div>
 <span className="text-xs sm:text-sm truncate">Total Jobs</span>
 </div>
 <div className="flex items-center space-x-2 justify-center sm:justify-start">
 <div className="w-3 h-3 bg-blue-500 rounded-none flex-shrink-0"></div>
 <span className="text-xs sm:text-sm truncate">Applied</span>
 </div>
 <div className="flex items-center space-x-2 justify-center sm:justify-start">
 <div className="w-3 h-3 bg-blue-700 rounded-none flex-shrink-0"></div>
 <span className="text-xs sm:text-sm truncate">Selected</span>
 </div>
 <div className="flex items-center space-x-2 justify-center sm:justify-start">
 <div className="w-3 h-3 bg-red-500 rounded-none flex-shrink-0"></div>
 <span className="text-xs sm:text-sm truncate">Rejected</span>
 </div>
 </div>
 </div>
 </div>

 {/* Enhanced Pie Chart */}
 <div className="space-y-4">
 <h3 className="font-semibold text-gray-900 text-lg">Job Application Overview</h3>
 <div className="flex items-center justify-center h-52">
 <div className="relative w-44 h-44">
 <svg className="w-full h-full transform -rotate-90">
 {pieChartData.map((item, index) => {
 const total = pieChartData.reduce((sum, d) => sum + d.value, 0)
 const percentage = total > 0 ? (item.value / total) * 100 : 0
 const circumference = 2 * Math.PI * 75 // radius = 75
const strokeDasharray = circumference
 const strokeDashoffset = circumference - (percentage / 100) * circumference

 return (
 <circle
 key={item.label}
 cx="88"cy="88"r="75"fill="none"stroke={item.color}
 strokeWidth="20"strokeDasharray={strokeDasharray}
 strokeDashoffset={strokeDashoffset}
 className="transition-all duration-1000 ease-out"/>
 )
 })}
 </svg>
 <div className="absolute inset-0 flex items-center justify-center">
 <div className="text-center">
 <div className="text-3xl font-bold text-gray-900">{totalForPie}</div>
 <div className="text-sm text-gray-500">Total</div>
 </div>
 </div>
 </div>
 </div>
 <div className="grid grid-cols-2 gap-3 text-sm">
 {pieChartData.map((item) => (
 <div key={item.label} className="flex items-center space-x-2">
 <div className="w-3 h-3"style={{ backgroundColor: item.color }}></div>
 <span className="text-gray-600">{item.label}</span>
 <span className="font-medium text-gray-900">{item.value}</span>
 </div>
 ))}
 </div>
 </div>
 </div>
 </div>
 )
}
