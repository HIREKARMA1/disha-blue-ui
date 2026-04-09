"use client"

import { useState, useEffect } from 'react'
import { Navbar } from '@/components/ui/navbar'
import { CorporateSidebar } from './CorporateSidebar'
import { CorporateWelcomeMessage } from './CorporateWelcomeMessage'
import { CorporateDashboardStats } from './CorporateDashboardStats'
import { CorporateAnalyticsChart } from './CorporateAnalyticsChart'
import { AdvertisementBanner } from './AdvertisementBanner'
import { CorporateRecentActivities } from './CorporateRecentActivities'
import { useAuth } from '@/hooks/useAuth'
import { apiClient } from '@/lib/api'
import { LoadingOverlay } from './LoadingOverlay'
import { DashboardTopbar } from './DashboardTopbar'
import Link from 'next/link'

interface CorporateDashboardLayoutProps {
    children?: React.ReactNode
}

export function CorporateDashboardContent({ children }: CorporateDashboardLayoutProps) {
    const [dashboardData, setDashboardData] = useState<any>(null)
    const [corporateProfile, setCorporateProfile] = useState<any>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const { user } = useAuth()

    // Fetch corporate dashboard data and profile
    useEffect(() => {
        const fetchDashboardData = async () => {
            if (user?.user_type === 'corporate') {
                try {
                    setIsLoading(true)
                    // Fetch dashboard data and profile in parallel
                    const [dashboardDataResult, profileData] = await Promise.all([
                        apiClient.getCorporateDashboard(),
                        apiClient.getCorporateProfile()
                    ])
                    console.log('🎯 Corporate Dashboard Data:', dashboardDataResult)
                    console.log('🎯 Corporate Profile Data:', profileData)
                    setDashboardData(dashboardDataResult)
                    setCorporateProfile(profileData)
                    setError(null)
                } catch (error) {
                    console.error('Failed to fetch corporate dashboard data:', error)
                    setError('Failed to load dashboard data')
                    setDashboardData(null)
                    setCorporateProfile(null)
                } finally {
                    setIsLoading(false)
                }
            }
        }

        fetchDashboardData()
    }, [user?.id, user?.user_type, user?.name])

    return (
        <div className="min-h-screen bg-gradient-to-b from-muted/35 via-background to-background dark:from-background dark:via-background">
            <Navbar />
            <CorporateSidebar />
            <div className="pt-16 lg:pl-[19rem]">
                <main className="min-h-screen px-4 py-6 pb-safe sm:px-6 lg:px-8 lg:py-8">
                    <div className="mx-auto w-full max-w-[1320px]">
                        <DashboardTopbar role="corporate" />
                        {children ? (
                            children
                        ) : (
                            <div className="space-y-6">
                            {/* Loading State */}
                            {isLoading && (
                                <div className="space-y-6">
                                    <div className="h-36 rounded-2xl bg-muted/50 animate-pulse border border-border/60" />
                                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                                        {[...Array(4)].map((_, i) => (
                                            <div
                                                key={i}
                                                className="h-28 rounded-2xl bg-muted/50 animate-pulse border border-border/60"
                                            />
                                        ))}
                                    </div>
                                    <div className="grid grid-cols-1 xl:grid-cols-10 gap-6">
                                        <div className="xl:col-span-7 h-72 rounded-2xl bg-muted/50 animate-pulse border border-border/60" />
                                        <div className="xl:col-span-3 h-56 rounded-2xl bg-muted/50 animate-pulse border border-border/60" />
                                    </div>
                                </div>
                            )}

                            {/* Error State */}
                            {error && !isLoading && (
                                <div className="rounded-2xl border border-destructive/25 bg-destructive/5 p-6 shadow-sm">
                                    <h3 className="text-lg font-semibold text-destructive mb-2">
                                        Error Loading Dashboard
                                    </h3>
                                    <p className="text-sm text-muted-foreground">{error}</p>
                                </div>
                            )}

                            {/* Dashboard Content */}
                            {!isLoading && (
                                <>
                                    <CorporateWelcomeMessage companyName={corporateProfile?.company_name || corporateProfile?.name || 'Company'} />
                                    <div className="grid grid-cols-1 gap-6 xl:grid-cols-12">
                                        <div className="space-y-6 xl:col-span-9">
                                            <CorporateDashboardStats dashboardData={dashboardData} isLoading={isLoading} />
                                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                                                <Link href="/dashboard/corporate/jobs" className="rounded-2xl border border-border bg-card p-5 shadow-soft transition-all hover:-translate-y-0.5 hover:border-primary/25 hover:shadow-medium">
                                                    <p className="text-xs font-semibold uppercase tracking-wide text-secondary">Jobs</p>
                                                    <p className="mt-2 font-display text-lg font-semibold text-foreground">Manage postings</p>
                                                    <p className="mt-1 text-sm text-muted-foreground">Open, close, and optimize roles</p>
                                                </Link>
                                                <Link href="/dashboard/corporate/applications" className="rounded-2xl border border-border bg-card p-5 shadow-soft transition-all hover:-translate-y-0.5 hover:border-primary/25 hover:shadow-medium">
                                                    <p className="text-xs font-semibold uppercase tracking-wide text-secondary">Pipeline</p>
                                                    <p className="mt-2 font-display text-lg font-semibold text-foreground">Applications</p>
                                                    <p className="mt-1 text-sm text-muted-foreground">Review and progress candidates</p>
                                                </Link>
                                                <Link href="/dashboard/corporate/candidates" className="rounded-2xl border border-border bg-card p-5 shadow-soft transition-all hover:-translate-y-0.5 hover:border-primary/25 hover:shadow-medium">
                                                    <p className="text-xs font-semibold uppercase tracking-wide text-secondary">Candidates</p>
                                                    <p className="mt-2 font-display text-lg font-semibold text-foreground">Talent workspace</p>
                                                    <p className="mt-1 text-sm text-muted-foreground">Shortlist high-fit applicants</p>
                                                </Link>
                                                <Link href="/dashboard/corporate/analytics" className="rounded-2xl border border-border bg-card p-5 shadow-soft transition-all hover:-translate-y-0.5 hover:border-primary/25 hover:shadow-medium">
                                                    <p className="text-xs font-semibold uppercase tracking-wide text-secondary">Insights</p>
                                                    <p className="mt-2 font-display text-lg font-semibold text-foreground">Hiring analytics</p>
                                                    <p className="mt-1 text-sm text-muted-foreground">Track funnel performance</p>
                                                </Link>
                                            </div>
                                            <div className="grid grid-cols-1 gap-6 lg:grid-cols-7">
                                                <div className="space-y-6 lg:col-span-5">
                                                    <CorporateAnalyticsChart />
                                                    <CorporateRecentActivities />
                                                </div>
                                                <div className="space-y-6 lg:col-span-2">
                                                    <div className="rounded-2xl border border-border bg-card/85 p-5 shadow-soft">
                                                        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-primary">Hiring operations</p>
                                                        <h3 className="mt-2 font-display text-lg font-semibold text-foreground">Pending actions</h3>
                                                        <ul className="mt-4 space-y-2.5 text-sm text-muted-foreground">
                                                            <li>Review fresh applicants by role fit</li>
                                                            <li>Schedule next interview batches</li>
                                                            <li>Update status to keep pipeline clean</li>
                                                            <li>Publish priority openings publicly</li>
                                                        </ul>
                                                    </div>
                                                    <AdvertisementBanner />
                                                </div>
                                            </div>
                                        </div>
                                        <aside className="space-y-4 xl:col-span-3">
                                            <div className="rounded-2xl border border-border bg-card p-5 shadow-soft">
                                                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-primary">Recruiter focus</p>
                                                <p className="mt-2 font-display text-2xl font-semibold text-foreground">ATS command panel</p>
                                                <p className="mt-2 text-sm text-muted-foreground">Stay on top of interviews, shortlists, and offer-readiness across openings.</p>
                                            </div>
                                            <div className="rounded-2xl border border-border bg-card p-5 shadow-soft">
                                                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-secondary">Quick actions</p>
                                                <div className="mt-3 space-y-2">
                                                    <Link href="/dashboard/corporate/jobs" className="block rounded-lg border border-border/70 px-3 py-2 text-sm text-foreground transition hover:bg-muted/50">Create or edit jobs</Link>
                                                    <Link href="/dashboard/corporate/applications" className="block rounded-lg border border-border/70 px-3 py-2 text-sm text-foreground transition hover:bg-muted/50">Manage application stages</Link>
                                                    <Link href="/dashboard/corporate/interviews" className="block rounded-lg border border-border/70 px-3 py-2 text-sm text-foreground transition hover:bg-muted/50">Plan interview slots</Link>
                                                    <Link href="/dashboard/corporate/profile" className="block rounded-lg border border-border/70 px-3 py-2 text-sm text-foreground transition hover:bg-muted/50">Update company profile</Link>
                                                </div>
                                            </div>
                                        </aside>
                                    </div>
                                </>
                            )}
                            </div>
                        )}
                    </div>
                </main>
            </div>
        </div>
    )
}

export function CorporateDashboardLayout({ children }: CorporateDashboardLayoutProps) {
    return (
        <>
            <CorporateDashboardContent children={children} />
            <LoadingOverlay />
        </>
    )
}

