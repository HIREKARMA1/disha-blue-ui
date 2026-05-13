"use client"

import { useState, useEffect } from 'react'
import { Navbar } from '@/components/ui/navbar'
import { StudentSidebar } from './StudentSidebar'
import { WelcomeMessage } from './WelcomeMessage'
import { useAuth } from '@/hooks/useAuth'
import { apiClient } from '@/lib/api'
import { LoadingOverlay } from './LoadingOverlay'
import Link from 'next/link'
import { DashboardTopbar } from './DashboardTopbar'
import type { StudentProfile } from '@/services/profileService'
import { useSidebarPreviewMode } from '@/hooks/useSidebarPreviewMode'
import {
  Compass,
  UserCircle2,
  FileText,
  MessagesSquare,
  GraduationCap,
  Mic,
  ClipboardList,
  Bot,
  Film,
  type LucideIcon,
} from 'lucide-react'
interface StudentDashboardLayoutProps {
 children?: React.ReactNode
}

interface FeatureCard {
  label: string
  href: string
  description: string
  icon: LucideIcon
}

function StudentDashboardContent({ children }: StudentDashboardLayoutProps) {
 const isSidebarPreview = useSidebarPreviewMode()
 const [studentName, setStudentName] = useState<string>('Student')
 const [studentProfile, setStudentProfile] = useState<StudentProfile | null>(null)
 const { user } = useAuth()
  const featureCards: FeatureCard[] = [
    {
      label: 'AI Interview Session',
      href: '/dashboard/student/career-align',
      description: 'Mock interviews with live AI guidance',
      icon: MessagesSquare,
    },
    {
      label: 'AI Communication Assessments',
      href: '/ai-communication',
      description: 'Practice speaking and communication skills',
      icon: Mic,
    },
    {
      label: 'Build with AI',
      href: '/dashboard/student/resume/ai',
      description: 'Generate and improve your resume with AI',
      icon: Bot,
    },
    {
      label: 'Resume Builder',
      href: '/dashboard/student/resume-builder',
      description: 'Create polished resumes quickly',
      icon: FileText,
    },
    {
      label: 'Courses',
      href: '/dashboard/student/courses',
      description: 'Learn with guided skill-based pathways',
      icon: GraduationCap,
    },
    {
      label: 'Local Jobs',
      href: '/dashboard/discover-jobs',
      description: 'Discover nearby and personalized openings',
      icon: Compass,
    },
    {
      label: 'Applications',
      href: '/dashboard/student/applications',
      description: 'Track all job applications in one place',
      icon: ClipboardList,
    },
    {
      label: 'Video Search',
      href: '/dashboard/student/video-search',
      description: 'Learn through short video explainers',
      icon: Film,
    },
    {
      label: 'Profile',
      href: '/dashboard/student/profile',
      description: 'Manage personal and academic details',
      icon: UserCircle2,
    },
  ]

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
                  <div className="dashboard-overview-card p-4 sm:p-5">
                    <p className="text-xs font-semibold uppercase tracking-[0.14em] text-blue-700 dark:text-blue-300">All features</p>
                    <h3 className="mt-2 font-display text-lg font-semibold text-slate-900 sm:text-xl dark:text-blue-50">Explore every tool</h3>
                    <p className="mt-1 text-sm text-slate-700 dark:text-blue-200">Click any card to open that feature directly.</p>
                    <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
                      {featureCards.map((feature) => (
                        <Link
                          key={feature.href}
                          href={feature.href}
                          className="group min-h-[132px] rounded-xl border border-blue-200/70 bg-blue-100/80 p-4 text-slate-900 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-blue-400 hover:bg-blue-100 active:translate-y-0 active:scale-[0.99] dark:border-blue-800 dark:bg-blue-900/50 dark:text-blue-50 dark:hover:border-blue-500 dark:hover:bg-blue-900/70">
                          <div className="flex items-start gap-3">
                            <span className="mt-0.5 inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-blue-300/80 bg-blue-50 text-blue-800 transition-colors group-hover:border-blue-500 group-hover:text-blue-900 dark:border-blue-700 dark:bg-blue-950/80 dark:text-blue-200 dark:group-hover:border-blue-500 dark:group-hover:text-blue-100">
                              <feature.icon className="h-4.5 w-4.5" strokeWidth={1.9} />
                            </span>
                            <div className="min-w-0">
                              <p className="font-display text-base font-semibold leading-tight text-slate-900 dark:text-blue-50">{feature.label}</p>
                              <p className="mt-1 text-sm leading-relaxed text-slate-700 dark:text-blue-200">{feature.description}</p>
                            </div>
                          </div>
                        </Link>
                      ))}
                    </div>
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
