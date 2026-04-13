"use client"

import { CorporateDashboardLayout } from '@/components/dashboard/CorporateDashboardLayout'
import { corporateHeroClass, corporateSurfaceClass } from '@/components/corporate/corporate-ui'
import { Search } from 'lucide-react'

export default function CorporateTalentSearchPage() {
 return (
 <CorporateDashboardLayout>
 <div className="space-y-6">
 <div className={corporateHeroClass}>
 <p className="mb-2 text-xs font-semibold uppercase tracking-wider">Discovery</p>
 <h1 className="font-display text-2xl font-semibold tracking-tight text-foreground md:text-3xl mb-2">
 Talent search
 </h1>
 <p className="text-muted-foreground text-base max-w-2xl">
 Proactive search across skills and regions—presented here when the feature is wired to your tenant.
 </p>
 </div>
 <div className={`${corporateSurfaceClass} p-10 text-center`}>
 <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-none-none text-primary">
 <Search className="h-8 w-8"/>
 </div>
 <p className="text-sm text-muted-foreground max-w-md mx-auto leading-relaxed">
 Browse applicants from your job posts in the Applications view; advanced talent search is coming next.
 </p>
 </div>
 </div>
 </CorporateDashboardLayout>
 )
}
