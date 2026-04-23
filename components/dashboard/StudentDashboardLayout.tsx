"use client"

import { useState, useEffect } from 'react'
import { Navbar } from '@/components/ui/navbar'
import { StudentSidebar } from './StudentSidebar'
import { WelcomeMessage } from './WelcomeMessage'
import { DashboardStats } from './DashboardStats'
import { AnalyticsChart } from './AnalyticsChart'
import { AdvertisementBanner } from './AdvertisementBanner'
import { RecentActivities } from './RecentActivities'
import { RecommendedJobsSection } from './RecommendedJobsSection'
import { useAuth } from '@/hooks/useAuth'
import { apiClient } from '@/lib/api'
import { LoadingOverlay } from './LoadingOverlay'
import Link from 'next/link'
import { DashboardTopbar } from './DashboardTopbar'
import type { StudentProfile } from '@/services/profileService'
import { useSidebarPreviewMode } from '@/hooks/useSidebarPreviewMode'
interface StudentDashboardLayoutProps {
 children?: React.ReactNode
}

function StudentDashboardContent({ children }: StudentDashboardLayoutProps) {
 const isSidebarPreview = useSidebarPreviewMode()
 const [studentName, setStudentName] = useState<string>('Student')
 const [studentProfile, setStudentProfile] = useState<StudentProfile | null>(null)
 const { user } = useAuth()

 // Check student access and fetch profile
 useEffect(() => {
 const checkAccessAndFetchProfile = async () => {
 if (user?.user_type ==='student'&& user?.id) {
 try {
 const profileData = await apiClient.getStudentProfile()
 setStudentProfile(profileData)

 // Debug logging
 console.log('Profile Data:', profileData)
 console.log('has_active_license:', profileData?.has_active_license)

 if (profileData?.name && profileData.name.trim()) {
 setStudentName(profileData.name)
 } else if (user?.name) {
 setStudentName(user.name)
 }

 } catch (error: any) {
 console.error('Failed to fetch student profile:', error)
 // If profile fetch fails completely, use user name if available
 if (user?.name) {
 setStudentName(user.name)
 }
 }
 }
 }

 checkAccessAndFetchProfile()
 }, [user?.id, user?.user_type, isSidebarPreview])

 const refreshProfile = async () => {
 try {
 const profileData = await apiClient.getStudentProfile()
 setStudentProfile(profileData)
 if (profileData?.name && profileData.name.trim()) {
 setStudentName(profileData.name)
 }
 } catch (error) {
 console.error('Failed to refresh student profile:', error)
 }
 }

 const main = (
 <main className="relative min-h-screen dashboard-overview-page px-4 py-6 pb-safe text-slate-900 sm:px-6 lg:px-8 lg:py-8">
 <div className="mx-auto w-full max-w-[1320px]">
 <div className="dashboard-overview-shell space-y-6">
 <DashboardTopbar role="student"/>
 {children ? (
 <>
 <div>{children}</div>
 </>
 ) : (
 <>
 <div className="space-y-6">
 <WelcomeMessage studentName={studentName} />
 <div className="grid grid-cols-1 gap-6 xl:grid-cols-12">
 <div className="space-y-6 xl:col-span-9">
 <DashboardStats />
 <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
 <Link
 href="/dashboard/discover-jobs"className="dashboard-overview-card-interactive p-5">
 <p className="text-xs font-semibold uppercase tracking-wide text-sage-deep">Discover</p>
 <p className="mt-2 font-display text-lg font-semibold text-slate-900">Jobs near you</p>
 <p className="mt-1 text-sm text-slate-600">AI-ranked local openings</p>
 </Link>
 <Link
 href="/dashboard/discover-jobs?saved=1"className="dashboard-overview-card-interactive p-5">
 <p className="text-xs font-semibold uppercase tracking-wide text-sage-deep">Saved</p>
 <p className="mt-2 font-display text-lg font-semibold text-slate-900">Shortlisted jobs</p>
 <p className="mt-1 text-sm text-slate-600">Keep priority roles together</p>
 </Link>
 <Link
 href="/dashboard/student/applications"className="dashboard-overview-card-interactive p-5">
 <p className="text-xs font-semibold uppercase tracking-wide text-sage-deep">Pipeline</p>
 <p className="mt-2 font-display text-lg font-semibold text-slate-900">Applications</p>
 <p className="mt-1 text-sm text-slate-600">Track every stage clearly</p>
 </Link>
 <Link
 href="/dashboard/student/resume-builder"className="dashboard-overview-card-interactive p-5">
 <p className="text-xs font-semibold uppercase tracking-wide text-sage-deep">Assets</p>
 <p className="mt-2 font-display text-lg font-semibold text-slate-900">Resume builder</p>
 <p className="mt-1 text-sm text-slate-600">Stay interview-ready</p>
 </Link>
 </div>
 <div className="grid grid-cols-1 gap-6 lg:grid-cols-7">
 <div className="space-y-6 lg:col-span-5">
 <RecommendedJobsSection />
 <AnalyticsChart />
 <RecentActivities />
 </div>
 <div className="space-y-6 lg:col-span-2">
 <div className="dashboard-overview-card p-5">
 <p className="text-xs font-semibold uppercase tracking-[0.14em] text-sage-deep">Career command center</p>
 <h3 className="mt-2 font-display text-lg font-semibold text-slate-900">Next best actions</h3>
 <ul className="mt-4 space-y-2.5 text-sm text-slate-600">
 <li>Complete profile and upload latest resume</li>
 <li>Prioritize saved roles before deadline</li>
 <li>Run AI communication assessments for shortlisted roles</li>
 <li>Review application feedback weekly</li>
 </ul>
 </div>
 <AdvertisementBanner />
 </div>
 </div>
 </div>
 <aside className="space-y-4 xl:col-span-3">
 <div className="dashboard-overview-card p-5">
 <p className="text-xs font-semibold uppercase tracking-[0.14em] text-sage-deep">Profile strength</p>
 <p className="mt-2 font-display text-2xl font-semibold text-slate-900">Build momentum</p>
 <p className="mt-2 text-sm text-slate-600">Keep your profile and resume polished to improve role match quality.</p>
 <Link href="/dashboard/student/profile"className="mt-4 inline-flex text-sm font-semibold text-emerald-800 hover:text-emerald-950 hover:underline">
 Update profile
 </Link>
 </div>
 <div className="dashboard-overview-card p-5">
 <p className="text-xs font-semibold uppercase tracking-[0.14em] text-sage-deep">Quick tools</p>
 <div className="mt-3 space-y-2">
 <Link href="/dashboard/student/career-align"className="block rounded-xl border border-slate-200/90 bg-white px-3 py-2 text-sm text-slate-800 shadow-sm transition hover:border-sage-deep hover:bg-sage/50 dark:bg-emerald-950/40 dark:hover:bg-emerald-900/60">AI Interview Session</Link>
 <Link href="/ai-communication"className="block rounded-xl border border-slate-200/90 bg-white px-3 py-2 text-sm text-slate-800 shadow-sm transition hover:border-sage-deep hover:bg-sage/50 dark:bg-emerald-950/40 dark:hover:bg-emerald-900/60">AI Communication Assessments</Link>
 <Link href="/dashboard/student/library"className="block rounded-xl border border-slate-200/90 bg-white px-3 py-2 text-sm text-slate-800 shadow-sm transition hover:border-sage-deep hover:bg-sage/50 dark:bg-emerald-950/40 dark:hover:bg-emerald-900/60">Learning Library</Link>
 <Link href="/dashboard/student/video-search"className="block rounded-xl border border-slate-200/90 bg-white px-3 py-2 text-sm text-slate-800 shadow-sm transition hover:border-sage-deep hover:bg-sage/50 dark:bg-emerald-950/40 dark:hover:bg-emerald-900/60">Video Search</Link>
 </div>
 </div>
 </aside>
 </div>
 </div>
 </>
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
 <StudentSidebar />
 <div className="pt-16 lg:pl-16">{main}</div>
 </div>
 )
}

export function StudentDashboardLayout({ children }: StudentDashboardLayoutProps) {
 return (
 <>
 <StudentDashboardContent children={children} />
 <LoadingOverlay />
 </>
 )
}
