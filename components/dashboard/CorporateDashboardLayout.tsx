"use client"

import { useState, useEffect } from 'react'
import Link from 'next/link'
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
import { useSidebarPreviewMode } from '@/hooks/useSidebarPreviewMode'

interface CorporateDashboardLayoutProps {
  children?: React.ReactNode
}

export function CorporateDashboardContent({ children }: CorporateDashboardLayoutProps) {
  const isSidebarPreview = useSidebarPreviewMode()
  const [dashboardData, setDashboardData] = useState<any>(null)
  const [corporateProfile, setCorporateProfile] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { user } = useAuth()

  useEffect(() => {
  const fetchDashboardData = async () => {
  if (user?.user_type === 'corporate') {
  try {
  setIsLoading(true)
  const [dashboardDataResult, profileData] = await Promise.all([
  apiClient.getCorporateDashboard(),
  apiClient.getCorporateProfile(),
  ])
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

  const main = (
  <main className="min-h-screen dashboard-overview-page px-3 py-4 pb-24 text-slate-900 sm:px-6 sm:py-6 lg:px-8 lg:py-8 lg:pb-safe">
  <div className="mx-auto w-full min-w-0 max-w-[1320px]">
  <div className="dashboard-overview-shell min-w-0 space-y-6">
  <DashboardTopbar role="corporate" />
  {children ? (
  <div className="min-w-0">{children}</div>
  ) : (
  <div className="space-y-6">
  {isLoading && (
  <div className="space-y-6">
  <div className="h-36 animate-pulse rounded-2xl border border-slate-200/90 bg-white shadow-[0_4px_24px_-6px_rgba(15,23,42,0.07)]" />
  <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
  {[...Array(4)].map((_, i) => (
  <div
  key={i}
  className="h-28 animate-pulse rounded-2xl border border-slate-200/90 bg-white shadow-[0_4px_24px_-6px_rgba(15,23,42,0.07)]"
  />
  ))}
  </div>
  <div className="grid grid-cols-1 gap-6 xl:grid-cols-10">
  <div className="h-72 animate-pulse rounded-2xl border border-slate-200/90 bg-white shadow-[0_4px_24px_-6px_rgba(15,23,42,0.07)] xl:col-span-7" />
  <div className="h-56 animate-pulse rounded-2xl border border-slate-200/90 bg-white shadow-[0_4px_24px_-6px_rgba(15,23,42,0.07)] xl:col-span-3" />
  </div>
  </div>
  )}

  {error && !isLoading && (
  <div className="rounded-2xl border border-red-200 bg-red-50 p-6 shadow-sm">
  <h3 className="mb-2 text-lg font-semibold text-red-800">Error Loading Dashboard</h3>
  <p className="text-sm text-red-700">{error}</p>
  </div>
  )}

  {!isLoading && (
  <>
  <CorporateWelcomeMessage
  companyName={corporateProfile?.company_name || corporateProfile?.name || 'Company'}
  />
  <div className="grid grid-cols-1 gap-6 xl:grid-cols-12">
  <div className="space-y-6 xl:col-span-9">
  <CorporateDashboardStats dashboardData={dashboardData} isLoading={isLoading} />
  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
  <Link href="/dashboard/corporate/jobs" className="dashboard-overview-card-interactive p-5">
  <p className="text-xs font-semibold uppercase tracking-wide text-blue-600">Jobs</p>
  <p className="mt-2 font-display text-lg font-semibold text-slate-900">Manage postings</p>
  <p className="mt-1 text-sm text-slate-600">Open, close, and optimize roles</p>
  </Link>
  <Link href="/dashboard/corporate/applications" className="dashboard-overview-card-interactive p-5">
  <p className="text-xs font-semibold uppercase tracking-wide text-blue-600">Pipeline</p>
  <p className="mt-2 font-display text-lg font-semibold text-slate-900">Applications</p>
  <p className="mt-1 text-sm text-slate-600">Review and progress candidates</p>
  </Link>
  <Link href="/dashboard/corporate/candidates" className="dashboard-overview-card-interactive p-5">
  <p className="text-xs font-semibold uppercase tracking-wide text-blue-600">Candidates</p>
  <p className="mt-2 font-display text-lg font-semibold text-slate-900">Talent workspace</p>
  <p className="mt-1 text-sm text-slate-600">Shortlist high-fit applicants</p>
  </Link>
  <Link href="/dashboard/corporate/analytics" className="dashboard-overview-card-interactive p-5">
  <p className="text-xs font-semibold uppercase tracking-wide text-blue-600">Insights</p>
  <p className="mt-2 font-display text-lg font-semibold text-slate-900">Hiring analytics</p>
  <p className="mt-1 text-sm text-slate-600">Track funnel performance</p>
  </Link>
  </div>
  <div className="grid grid-cols-1 gap-6 lg:grid-cols-7">
  <div className="space-y-6 lg:col-span-5">
  <CorporateAnalyticsChart />
  <CorporateRecentActivities />
  </div>
  <div className="space-y-6 lg:col-span-2">
  <div className="dashboard-overview-card p-5">
  <p className="text-xs font-semibold uppercase tracking-[0.14em] text-blue-600">Hiring operations</p>
  <h3 className="mt-2 font-display text-lg font-semibold text-slate-900">Pending actions</h3>
  <ul className="mt-4 space-y-2.5 text-sm text-slate-600">
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
  <div className="dashboard-overview-card p-5">
  <p className="text-xs font-semibold uppercase tracking-[0.14em] text-blue-600">Recruiter focus</p>
  <p className="mt-2 font-display text-2xl font-semibold text-slate-900">ATS command panel</p>
  <p className="mt-2 text-sm text-slate-600">Stay on top of interviews, shortlists, and offer-readiness across openings.</p>
  </div>
  <div className="dashboard-overview-card p-5">
  <p className="text-xs font-semibold uppercase tracking-[0.14em] text-blue-600">Quick actions</p>
  <div className="mt-3 space-y-2">
  <Link href="/dashboard/corporate/jobs" className="block rounded-xl border border-slate-200/90 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm transition hover:border-blue-600 hover:bg-blue-50/50 dark:bg-blue-950/40 dark:hover:bg-blue-900/60">Create or edit jobs</Link>
  <Link href="/dashboard/corporate/applications" className="block rounded-xl border border-slate-200/90 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm transition hover:border-blue-600 hover:bg-blue-50/50 dark:bg-blue-950/40 dark:hover:bg-blue-900/60">Manage application stages</Link>
  <Link href="/dashboard/corporate/interviews" className="block rounded-xl border border-slate-200/90 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm transition hover:border-blue-600 hover:bg-blue-50/50 dark:bg-blue-950/40 dark:hover:bg-blue-900/60">Plan interview slots</Link>
  <Link href="/dashboard/corporate/profile" className="block rounded-xl border border-slate-200/90 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm transition hover:border-blue-600 hover:bg-blue-50/50 dark:bg-blue-950/40 dark:hover:bg-blue-900/60">Update company profile</Link>
  </div>
  </div>
  </aside>
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
  <CorporateSidebar />
  <div className="pt-16 lg:pl-16">{main}</div>
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

