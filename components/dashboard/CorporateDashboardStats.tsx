"use client"

import { motion } from 'framer-motion'
import { Briefcase, Users, FileText, Target } from 'lucide-react'
import { cn } from '@/lib/utils'

interface CorporateDashboardStatsProps {
    className?: string
    isLoading?: boolean
    dashboardData?: any
}

export function CorporateDashboardStats({
    className = '',
    isLoading = false,
    dashboardData
}: CorporateDashboardStatsProps) {
    const jobStats = dashboardData?.job_statistics || {}
    const activeJobs = jobStats.active_jobs || 0
    const totalApplications = jobStats.total_applications || 0
    const shortlistedCandidates = jobStats.shortlisted_candidates || 0
    const totalJobsPosted = jobStats.total_jobs_posted || 0

    const statCards = [
        {
            label: 'Active Jobs',
            value: activeJobs.toString(),
            icon: Briefcase,
            accent: 'text-primary',
            iconBg: 'bg-primary/12',
        },
        {
            label: 'Total Applications',
            value: totalApplications.toString(),
            icon: FileText,
            accent: 'text-secondary',
            iconBg: 'bg-secondary/12',
        },
        {
            label: 'Shortlisted',
            value: shortlistedCandidates.toString(),
            icon: Users,
            accent: 'text-primary',
            iconBg: 'bg-primary/10',
        },
        {
            label: 'Jobs Posted',
            value: totalJobsPosted.toString(),
            icon: Target,
            accent: 'text-secondary',
            iconBg: 'bg-secondary/10',
        },
    ]

    if (isLoading) {
        return (
            <div className={cn('grid grid-cols-2 lg:grid-cols-4 gap-4 w-full', className)}>
                {[...Array(4)].map((_, index) => (
                    <div
                        key={index}
                        className="h-28 rounded-2xl border border-border/70 bg-muted/40 animate-pulse"
                    />
                ))}
            </div>
        )
    }

    return (
        <div className={cn('grid grid-cols-2 lg:grid-cols-4 gap-4 w-full', className)}>
            {statCards.map((stat, index) => (
                <motion.div
                    key={stat.label}
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.45, delay: index * 0.06 }}
                    className="w-full"
                >
                    <div
                        className={cn(
                            'group h-full rounded-2xl border border-border/80 bg-card/90 p-5',
                            'shadow-[0_12px_40px_-28px_rgba(0,0,0,0.18)] dark:shadow-[0_12px_40px_-28px_rgba(0,0,0,0.45)]',
                            'transition-all duration-200 hover:border-primary/25 hover:shadow-[0_20px_48px_-32px_hsl(var(--primary)/0.35)]',
                        )}
                    >
                        <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0 flex-1">
                                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-1.5">
                                    {stat.label}
                                </p>
                                <p className="font-display text-3xl font-bold tracking-tight text-foreground tabular-nums">
                                    {stat.value}
                                </p>
                            </div>
                            <div
                                className={cn(
                                    'shrink-0 rounded-xl p-3 transition-transform duration-200 group-hover:scale-105',
                                    stat.iconBg,
                                )}
                            >
                                <stat.icon className={cn('h-6 w-6', stat.accent)} />
                            </div>
                        </div>
                    </div>
                </motion.div>
            ))}
        </div>
    )
}
