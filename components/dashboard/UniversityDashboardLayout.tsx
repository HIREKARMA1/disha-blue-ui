"use client"// DEPRECATED LEGACY SURFACE:
// University dashboard components are retained only for compatibility migration.
import { useState, useEffect } from 'react'
import { usePathname } from 'next/navigation'
import { Navbar } from '@/components/ui/navbar'
import { UniversitySidebar } from './UniversitySidebar'
import { UniversityWelcomeMessage } from './UniversityWelcomeMessage'
import { UniversityDashboardStats } from './UniversityDashboardStats'
import { UniversityAnalyticsChart } from './UniversityAnalyticsChart'
import { AdvertisementBanner } from './AdvertisementBanner'
import { UniversityRecentActivities } from './UniversityRecentActivities'
import { UniversityLockScreen } from './UniversityLockScreen'
import { useAuth } from '@/hooks/useAuth'
import { apiClient } from '@/lib/api'
import { LoadingOverlay } from './LoadingOverlay'
import { UniversityDashboardData } from '@/types/university'
import { useSidebarPreviewMode } from '@/hooks/useSidebarPreviewMode'
interface UniversityDashboardLayoutProps {
 children?: React.ReactNode
}

function UniversityDashboardContent({ children }: UniversityDashboardLayoutProps) {
 const isSidebarPreview = useSidebarPreviewMode()
 const [dashboardData, setDashboardData] = useState<UniversityDashboardData | null>(null)
 const [isLoading, setIsLoading] = useState(true)
 const [error, setError] = useState<string | null>(null)
 const [universityStatus, setUniversityStatus] = useState<string | null>(null)
 const [universityName, setUniversityName] = useState<string>('')
 const [universityEmail, setUniversityEmail] = useState<string>('')
 const { user } = useAuth()
 const pathname = usePathname()

 // Fetch university profile to check status
 useEffect(() => {
 const fetchUniversityProfile = async () => {
 if ((user?.user_type as unknown as string) ==='university') {
 try {
 const profile = await apiClient.getUniversityProfile()
 setUniversityStatus(profile.status ||'active')
 setUniversityName(profile.university_name || profile.name ||'')
 setUniversityEmail(profile.email ||'')
 } catch (error) {
 console.error('Failed to fetch university profile:', error)
 // Default to active if we can't fetch profile
 setUniversityStatus('active')
 }
 }
 }

 fetchUniversityProfile()
 }, [user?.user_type])

 // Fetch university dashboard data
 useEffect(() => {
 const fetchDashboardData = async () => {
 if ((user?.user_type as unknown as string) ==='university') {
 try {
 setIsLoading(true)
 const data = await apiClient.getUniversityDashboard()
 console.log(' University Dashboard Data:', data)
 setDashboardData(data)
 setError(null)
 } catch (error) {
 console.error('Failed to fetch university dashboard data:', error)
 setError('Failed to load dashboard data')
 // Don't set fallback data - only show real data from backend
 setDashboardData(null)
 } finally {
 setIsLoading(false)
 }
 }
 }

 fetchDashboardData()
 }, [user?.id, user?.user_type, user?.name])

 const isLocked = universityStatus ==='inactive'|| universityStatus ==='pending'
const isAllowedPage = pathname ==='/dashboard/university/profile'|| pathname ==='/dashboard/university/licenses'
const shouldLock = isLocked && !isAllowedPage

 const main = (
 <main className={`relative min-h-screen dashboard-overview-page px-4 py-6 pb-safe text-slate-900 sm:px-6 lg:px-8 lg:py-8 ${shouldLock ?'pointer-events-none':''}`}>
 <div className="mx-auto w-full max-w-[1320px]">
 <div className="dashboard-overview-shell space-y-6">
 {children ? (
 <>
 <div className={shouldLock ?'opacity-40':''}>
 {children}
 </div>
 {shouldLock && (
 <UniversityLockScreen
 isOpen={shouldLock}
 universityName={universityName}
 email={universityEmail}
 />
 )}
 </>
 ) : (
 <>
 <div className={`space-y-6 ${shouldLock ?'opacity-40':''}`}>
 {isLoading && (
 <div className="flex items-center justify-center py-12">
 <div className="h-12 w-12 animate-spin rounded-full border-2 border-sage-deep border-t-transparent"></div>
 </div>
 )}

 {error && !isLoading && (
 <div className="rounded-2xl border border-red-200 bg-red-50 p-6 shadow-sm">
 <h3 className="mb-2 text-lg font-medium text-red-800">
 Error Loading Dashboard
 </h3>
 <p className="text-red-700">{error}</p>
 </div>
 )}

 {dashboardData && !isLoading && (
 <>
 <UniversityWelcomeMessage
 universityInfo={dashboardData.university_info}
 />

 <UniversityDashboardStats
 studentStats={dashboardData.student_statistics}
 jobStats={dashboardData.job_statistics}
 isLoading={isLoading}
 />

 <div className="xl:grid-cols-10 grid grid-cols-1 gap-6">
 <div className="xl:col-span-7 space-y-6">
 <UniversityAnalyticsChart
 studentStats={dashboardData.student_statistics}
 jobStats={dashboardData.job_statistics}
 />
 <UniversityRecentActivities
 activities={dashboardData.recent_activity}
 />
 </div>
 <div className="xl:col-span-3 space-y-6">
 <AdvertisementBanner />
 </div>
 </div>
 </>
 )}
 </div>
 {shouldLock && (
 <UniversityLockScreen
 isOpen={shouldLock}
 universityName={universityName}
 email={universityEmail}
 />
 )}
 </>
 )}
 </div>
 </div>
 </main>
 )

 if (isSidebarPreview) {
 return (
 <div className="min-h-screen bg-white text-slate-900" data-sidebar-preview>
 {main}
 </div>
 )
 }

 return (
 <div className="min-h-screen bg-white text-slate-900">
 <Navbar />
 <UniversitySidebar />
 <div className="pt-16 lg:pl-16">
 {main}
 </div>
 </div>
 )
}

export function UniversityDashboardLayout({ children }: UniversityDashboardLayoutProps) {
 return (
 <>
 <UniversityDashboardContent children={children} />
 <LoadingOverlay />
 </>
 )
}
