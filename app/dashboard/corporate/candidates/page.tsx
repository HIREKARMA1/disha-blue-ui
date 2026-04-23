"use client"

import { CorporateDashboardLayout } from '@/components/dashboard/CorporateDashboardLayout'
import { corporateHeroClass, corporateSurfaceClass } from '@/components/corporate/corporate-ui'
import { Users } from 'lucide-react'
import Link from 'next/link'
import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export default function CorporateCandidatesPage() {
 return (
 <CorporateDashboardLayout>
 <div className="space-y-6">
 <div className={corporateHeroClass}>
 <p className="mb-2 text-xs font-semibold uppercase tracking-wider">Pipeline</p>
 <h1 className="font-display text-2xl font-semibold tracking-tight text-foreground md:text-3xl mb-2">
 Candidates
 </h1>
 <p className="text-muted-foreground text-base max-w-2xl">
 A single place to browse everyone interested in your company—today, start from applications on each job.
 </p>
 </div>
 <div className={`${corporateSurfaceClass} p-10 text-center`}>
 <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-none-none text-primary">
 <Users className="h-8 w-8"/>
 </div>
 <p className="text-sm text-muted-foreground max-w-md mx-auto leading-relaxed mb-6">
 Open any job card and choose &ldquo;View applied students&rdquo;, or go to Applications for the full ATS-style table.
 </p>
 <Link
 href="/dashboard/corporate/applications"className={cn(
 buttonVariants({ variant:'gradient'}),'rounded-none-none shadow-md hover:opacity-95',
 )}
 >
 Go to applications
 </Link>
 </div>
 </div>
 </CorporateDashboardLayout>
 )
}
