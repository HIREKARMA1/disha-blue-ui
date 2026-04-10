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
import { RecommendationOnboardingCard } from './RecommendationOnboardingCard'
import { getRecommendationReadiness } from '@/lib/recommendationReadiness'
import type { StudentProfile } from '@/services/profileService'

interface StudentDashboardLayoutProps {
    children?: React.ReactNode
}

function StudentDashboardContent({ children }: StudentDashboardLayoutProps) {
    const [studentName, setStudentName] = useState<string>('Student')
    const [studentProfile, setStudentProfile] = useState<StudentProfile | null>(null)
    const [showOnboardingModal, setShowOnboardingModal] = useState(false)
    const { user } = useAuth()

    // Check student access and fetch profile
    useEffect(() => {
        const checkAccessAndFetchProfile = async () => {
            if (user?.user_type === 'student' && user?.id) {
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

                    const readiness = getRecommendationReadiness(profileData)
                    const hasSeenPrompt = localStorage.getItem('ai_pref_onboarding_seen') === '1'
                    if (!hasSeenPrompt && !readiness.isReady) {
                        setShowOnboardingModal(true)
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
    }, [user?.id, user?.user_type])

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

    const handleDismissOnboarding = () => {
        localStorage.setItem('ai_pref_onboarding_seen', '1')
        setShowOnboardingModal(false)
    }

    const readiness = getRecommendationReadiness(studentProfile)

    return (
        <div className="min-h-screen bg-gradient-to-b from-muted/35 via-background to-background dark:from-background dark:via-background">
            <Navbar />
            <StudentSidebar />
            <div className="pt-16 lg:pl-[19rem]">
                <main className="relative min-h-screen px-4 py-6 pb-safe sm:px-6 lg:px-8 lg:py-8">
                    <div className="mx-auto w-full max-w-[1320px]">
                <DashboardTopbar role="student" />
                {!readiness.isReady && (
                    <div className="mb-6">
                        <RecommendationOnboardingCard profile={studentProfile} onSaved={refreshProfile} />
                    </div>
                )}
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
                                                href="/dashboard/student/jobs"
                                                className="rounded-2xl border border-border bg-card p-5 shadow-soft transition-all hover:-translate-y-0.5 hover:border-primary/25 hover:shadow-medium"
                                            >
                                                <p className="text-xs font-semibold uppercase tracking-wide text-secondary">Discover</p>
                                                <p className="mt-2 font-display text-lg font-semibold text-foreground">Jobs near you</p>
                                                <p className="mt-1 text-sm text-muted-foreground">AI-ranked local openings</p>
                                            </Link>
                                            <Link
                                                href="/dashboard/student/jobs?saved=1"
                                                className="rounded-2xl border border-border bg-card p-5 shadow-soft transition-all hover:-translate-y-0.5 hover:border-primary/25 hover:shadow-medium"
                                            >
                                                <p className="text-xs font-semibold uppercase tracking-wide text-secondary">Saved</p>
                                                <p className="mt-2 font-display text-lg font-semibold text-foreground">Shortlisted jobs</p>
                                                <p className="mt-1 text-sm text-muted-foreground">Keep priority roles together</p>
                                            </Link>
                                            <Link
                                                href="/dashboard/student/applications"
                                                className="rounded-2xl border border-border bg-card p-5 shadow-soft transition-all hover:-translate-y-0.5 hover:border-primary/25 hover:shadow-medium"
                                            >
                                                <p className="text-xs font-semibold uppercase tracking-wide text-secondary">Pipeline</p>
                                                <p className="mt-2 font-display text-lg font-semibold text-foreground">Applications</p>
                                                <p className="mt-1 text-sm text-muted-foreground">Track every stage clearly</p>
                                            </Link>
                                            <Link
                                                href="/dashboard/student/resume-builder"
                                                className="rounded-2xl border border-border bg-card p-5 shadow-soft transition-all hover:-translate-y-0.5 hover:border-primary/25 hover:shadow-medium"
                                            >
                                                <p className="text-xs font-semibold uppercase tracking-wide text-secondary">Assets</p>
                                                <p className="mt-2 font-display text-lg font-semibold text-foreground">Resume builder</p>
                                                <p className="mt-1 text-sm text-muted-foreground">Stay interview-ready</p>
                                            </Link>
                                        </div>
                                        <div className="grid grid-cols-1 gap-6 lg:grid-cols-7">
                                            <div className="space-y-6 lg:col-span-5">
                                                <RecommendedJobsSection />
                                                <AnalyticsChart />
                                                <RecentActivities />
                                            </div>
                                            <div className="space-y-6 lg:col-span-2">
                                                <div className="rounded-2xl border border-border bg-card/85 p-5 shadow-soft">
                                                    <p className="text-xs font-semibold uppercase tracking-[0.14em] text-primary">Career command center</p>
                                                    <h3 className="mt-2 font-display text-lg font-semibold text-foreground">Next best actions</h3>
                                                    <ul className="mt-4 space-y-2.5 text-sm text-muted-foreground">
                                                        <li>Complete profile and upload latest resume</li>
                                                        <li>Prioritize saved roles before deadline</li>
                                                        <li>Practice mock tests for shortlisted roles</li>
                                                        <li>Review application feedback weekly</li>
                                                    </ul>
                                                </div>
                                                <AdvertisementBanner />
                                            </div>
                                        </div>
                                    </div>
                                    <aside className="space-y-4 xl:col-span-3">
                                        <div className="rounded-2xl border border-border bg-card p-5 shadow-soft">
                                            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-primary">Profile strength</p>
                                            <p className="mt-2 font-display text-2xl font-semibold text-foreground">Build momentum</p>
                                            <p className="mt-2 text-sm text-muted-foreground">Keep your profile and resume polished to improve role match quality.</p>
                                            <Link href="/dashboard/student/profile" className="mt-4 inline-flex text-sm font-semibold text-primary hover:underline">
                                                Update profile
                                            </Link>
                                        </div>
                                        <div className="rounded-2xl border border-border bg-card p-5 shadow-soft">
                                            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-secondary">Quick tools</p>
                                            <div className="mt-3 space-y-2">
                                                <Link href="/dashboard/student/career-align" className="block rounded-lg border border-border/70 px-3 py-2 text-sm text-foreground transition hover:bg-muted/50">Career Align</Link>
                                                <Link href="/dashboard/student/practice" className="block rounded-lg border border-border/70 px-3 py-2 text-sm text-foreground transition hover:bg-muted/50">Practice Arena</Link>
                                                <Link href="/dashboard/student/library" className="block rounded-lg border border-border/70 px-3 py-2 text-sm text-foreground transition hover:bg-muted/50">Learning Library</Link>
                                                <Link href="/dashboard/student/video-search" className="block rounded-lg border border-border/70 px-3 py-2 text-sm text-foreground transition hover:bg-muted/50">Video Search</Link>
                                            </div>
                                        </div>
                                    </aside>
                                </div>
                            </div>
                    </>
                )}
                    </div>
                </main>
            </div>
            {showOnboardingModal && (
                <RecommendationOnboardingCard
                    profile={studentProfile}
                    showAsModal
                    onSaved={async () => {
                        localStorage.setItem('ai_pref_onboarding_seen', '1')
                        await refreshProfile()
                    }}
                    onDismiss={handleDismissOnboarding}
                />
            )}
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
