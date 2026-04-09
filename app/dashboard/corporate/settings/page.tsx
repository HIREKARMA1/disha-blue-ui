"use client"

import { CorporateDashboardLayout } from '@/components/dashboard/CorporateDashboardLayout'
import { corporateHeroClass, corporateSurfaceClass } from '@/components/corporate/corporate-ui'
import { Settings } from 'lucide-react'

export default function CorporateSettingsPage() {
    return (
        <CorporateDashboardLayout>
            <div className="space-y-6">
                <div className={corporateHeroClass}>
                    <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-primary/80">Workspace</p>
                    <h1 className="font-display text-2xl font-semibold tracking-tight text-foreground md:text-3xl mb-2">
                        Employer settings
                    </h1>
                    <p className="text-muted-foreground text-base max-w-2xl">
                        Account and workspace preferences will live here alongside your hiring tools.
                    </p>
                </div>
                <div className={`${corporateSurfaceClass} p-10 text-center`}>
                    <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-muted text-muted-foreground">
                        <Settings className="h-8 w-8" />
                    </div>
                    <p className="text-sm text-muted-foreground max-w-md mx-auto leading-relaxed">
                        Settings panels are being expanded. Profile and verification details are available under Employer profile in the sidebar.
                    </p>
                </div>
            </div>
        </CorporateDashboardLayout>
    )
}
