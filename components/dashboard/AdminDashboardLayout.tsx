"use client"

import { useState, useEffect } from 'react'
import { Navbar } from '@/components/ui/navbar'
import { AdminSidebar } from './AdminSidebar'
import { AdminWelcomeMessage } from './AdminWelcomeMessage'
import { AdminDashboardStats } from './AdminDashboardStats'
import { AdminAnalyticsChart } from './AdminAnalyticsChart'
import { AdvertisementBanner } from './AdvertisementBanner'
import { AdminRecentActivities } from './AdminRecentActivities'
import { useAuth } from '@/hooks/useAuth'
import { apiClient } from '@/lib/api'
import { LoadingOverlay } from './LoadingOverlay'
import { AdminDashboardData } from '@/types/admin'
import { DashboardTopbar } from './DashboardTopbar'
import { useSidebarPreviewMode } from '@/hooks/useSidebarPreviewMode'
interface AdminDashboardLayoutProps {
 children?: React.ReactNode
}

function AdminDashboardContent({ children }: AdminDashboardLayoutProps) {
 const isSidebarPreview = useSidebarPreviewMode()
 const [dashboardData, setDashboardData] = useState<AdminDashboardData | null>(null)
 const [isLoading, setIsLoading] = useState(true)
 const [error, setError] = useState<string | null>(null)
 const { user } = useAuth()

 // Fetch dashboard data when component mounts
 useEffect(() => {
 const fetchDashboardData = async () => {
 if (user?.user_type ==='admin') {
 setIsLoading(true)
 try {
 // TODO: Replace with actual admin dashboard API call
 // 
const data = await (apiClient as any).getAdminDashboard?.()
 // setDashboardData(data)

 // Mock data for now
 setDashboardData({
 total_users: 1250,
 total_corporates: 45,
 total_students: 980,
 total_universities: 25,
 total_jobs: 320,
 total_applications: 1250,
 active_jobs: 280,
 pending_approvals: 15,
 recent_activities: [],
 monthly_stats: {
 sessions: 4500,
 unique_users: 1200,
 avg_session_duration: 8.5,
 page_views: 12500
 },
 top_industries: [],
 top_locations: [],
 analytics: {
 real_time_metrics: [],
 kpis: [],
 alerts: []
 }
 })
 } catch (error) {
 console.error('Failed to fetch dashboard data:', error)
 setError('Failed to load dashboard data')
 } finally {
 setIsLoading(false)
 }
 }
 }

 fetchDashboardData()
 }, [user?.id, user?.user_type, user?.name])

 const main = (
 <main className="min-h-screen dashboard-overview-page px-4 py-6 pb-safe text-slate-900 sm:px-6 lg:px-8 lg:py-8">
 <div className="mx-auto w-full max-w-[1320px]">
 <div className="dashboard-overview-shell space-y-6">
 <DashboardTopbar role="admin"/>
 {children ? (
 children
 ) : (
 <div className="space-y-6">
 {/* Loading State */}
 {isLoading && (
 <div className="flex items-center justify-center py-12">
 <div className="h-12 w-12 animate-spin rounded-full border-2 border-blue-600 border-t-transparent"></div>
 </div>
 )}

 {/* Error State */}
 {error && !isLoading && (
 <div className="rounded-2xl border border-red-200 bg-red-50 p-6 shadow-sm">
 <h3 className="mb-2 text-lg font-medium text-red-800">
 Error Loading Dashboard
 </h3>
 <p className="text-red-700">{error}</p>
 </div>
 )}

 {/* Dashboard Content */}
 {dashboardData && !isLoading && (
 <>
 <AdminWelcomeMessage
 adminInfo={dashboardData}
 />

 <AdminDashboardStats
 userStats={{
 total_users: dashboardData.total_users,
 total_corporates: dashboardData.total_corporates,
 total_students: dashboardData.total_students,
 total_universities: dashboardData.total_universities
 }}
 jobStats={{
 total_jobs: dashboardData.total_jobs,
 total_applications: dashboardData.total_applications,
 active_jobs: dashboardData.active_jobs,
 pending_approvals: dashboardData.pending_approvals
 }}
 isLoading={isLoading}
 />

 <div className="xl:grid-cols-10 grid grid-cols-1 gap-6">
 <div className="xl:col-span-7 space-y-6">
 <AdminAnalyticsChart
 userStats={{
 total_users: dashboardData.total_users,
 total_corporates: dashboardData.total_corporates,
 total_students: dashboardData.total_students,
 total_universities: dashboardData.total_universities
 }}
 jobStats={{
 total_jobs: dashboardData.total_jobs,
 total_applications: dashboardData.total_applications,
 active_jobs: dashboardData.active_jobs,
 pending_approvals: dashboardData.pending_approvals
 }}
 />
 <AdminRecentActivities
 activities={dashboardData.recent_activities}
 />
 </div>
 <div className="xl:col-span-3 space-y-6">
 <AdvertisementBanner />
 </div>
 </div>
 </>
 )}
 </div>
 )}
 </div>
 </div>
 </main>
 )

 if (isSidebarPreview) {
 return (
 <div className="dashboard-flat min-h-screen bg-white text-slate-900" data-sidebar-preview>
 {main}
 </div>
 )
 }

 return (
 <div className="dashboard-flat min-h-screen bg-white text-slate-900">
 <Navbar />
 <AdminSidebar />
 <div className="pt-16 lg:pl-16">{main}</div>
 </div>
 )
}

export function AdminDashboardLayout({ children }: AdminDashboardLayoutProps) {
 return (
 <>
 <AdminDashboardContent children={children} />
 <LoadingOverlay />
 </>
 )
}
