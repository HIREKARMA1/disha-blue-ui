"use client"

import { CorporateDashboardLayout } from '@/components/dashboard/CorporateDashboardLayout'
import { corporateHeroClass, corporateSurfaceClass } from '@/components/corporate/corporate-ui'
import { BarChart3 } from 'lucide-react'

export default function CorporateAnalyticsPage() {
 return (
 <CorporateDashboardLayout>
 <div className="space-y-6">
 <div className={corporateHeroClass}>
 <p className="mb-2 text-xs font-semibold uppercase tracking-wider">Insights</p>
 <h1 className="font-display text-2xl font-semibold tracking-tight text-foreground md:text-3xl mb-2">
 Hiring analytics
 </h1>
 <p className="text-muted-foreground text-base max-w-2xl">
 Deeper reports and funnel metrics will land here—same navigation, upgraded shell.
 </p>
 </div>
 <div className={`${corporateSurfaceClass} p-10 text-center`}>
 <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-none-none text-primary">
 <BarChart3 className="h-8 w-8"/>
 </div>
 <p className="text-sm text-muted-foreground max-w-md mx-auto leading-relaxed">
 Analytics views are being connected to your hiring data. Check the dashboard overview for live job and application counts.
 </p>
 </div>
 </div>
 </CorporateDashboardLayout>
 )
}
