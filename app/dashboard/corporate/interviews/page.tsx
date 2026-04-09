"use client"

import { CorporateDashboardLayout } from '@/components/dashboard/CorporateDashboardLayout'
import { corporateHeroClass, corporateSurfaceClass } from '@/components/corporate/corporate-ui'
import { CalendarClock } from 'lucide-react'

export default function CorporateInterviewsPage() {
    return (
        <CorporateDashboardLayout>
            <div className="space-y-6">
                <div className={corporateHeroClass}>
                    <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-primary/80">Coordination</p>
                    <h1 className="font-display text-2xl font-semibold tracking-tight text-foreground md:text-3xl mb-2">
                        Interviews
                    </h1>
                    <p className="text-muted-foreground text-base max-w-2xl">
                        Schedule and track conversations with candidates—this area will align with your pipeline stages.
                    </p>
                </div>
                <div className={`${corporateSurfaceClass} p-10 text-center`}>
                    <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-secondary/15 text-secondary-foreground">
                        <CalendarClock className="h-8 w-8" />
                    </div>
                    <p className="text-sm text-muted-foreground max-w-md mx-auto leading-relaxed">
                        Interview scheduling tools are on the roadmap. Use application status updates to capture interview date and location today.
                    </p>
                </div>
            </div>
        </CorporateDashboardLayout>
    )
}
