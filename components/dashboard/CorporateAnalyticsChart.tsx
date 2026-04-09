"use client"

import { motion } from 'framer-motion'
import { BarChart3, TrendingUp, Users, Briefcase, Clock } from 'lucide-react'
import { corporateSurfaceClass } from '@/components/corporate/corporate-ui'
import { cn } from '@/lib/utils'

interface CorporateAnalyticsChartProps {
    className?: string
}

export function CorporateAnalyticsChart({ className = '' }: CorporateAnalyticsChartProps) {
    // Mock data for now - will be replaced with actual API data
    const mockData = {
        applicationsOverTime: [
            { month: 'Jan', applications: 45 },
            { month: 'Feb', applications: 52 },
            { month: 'Mar', applications: 38 },
            { month: 'Apr', applications: 67 },
            { month: 'May', applications: 43 },
            { month: 'Jun', applications: 58 }
        ],
        topPositions: [
            { position: 'Software Engineer', applications: 89 },
            { position: 'Data Scientist', applications: 67 },
            { position: 'Product Manager', applications: 45 },
            { position: 'UX Designer', applications: 34 }
        ]
    }

    const maxApplications = Math.max(...mockData.applicationsOverTime.map(d => d.applications))

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className={cn(corporateSurfaceClass, 'p-6 relative', className)}
        >
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-6">
                <div className="flex items-center space-x-3">
                    <div className="rounded-xl bg-primary/12 p-2.5">
                        <BarChart3 className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                        <h3 className="text-lg font-semibold tracking-tight text-foreground">
                            Hiring Analytics
                        </h3>
                        <p className="text-sm text-muted-foreground">
                            Application trends and insights
                        </p>
                    </div>
                </div>
                <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                    <TrendingUp className="w-4 h-4" />
                    <span>+12% this month</span>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 blur-sm pointer-events-none">
                {/* Applications Over Time Chart */}
                <div>
                    <h4 className="text-sm font-semibold text-foreground mb-4">
                        Applications Over Time
                    </h4>
                    <div className="space-y-3">
                        {mockData.applicationsOverTime.map((data, index) => (
                            <motion.div
                                key={data.month}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ duration: 0.6, delay: index * 0.1 }}
                                className="flex items-center space-x-3"
                            >
                                <div className="w-8 text-xs font-medium text-muted-foreground">
                                    {data.month}
                                </div>
                                <div className="flex-1 bg-muted rounded-full h-2">
                                    <motion.div
                                        initial={{ width: 0 }}
                                        animate={{ width: `${(data.applications / maxApplications) * 100}%` }}
                                        transition={{ duration: 1, delay: index * 0.1 }}
                                        className="bg-gradient-to-r from-primary-500 to-secondary-500 h-2 rounded-full"
                                    />
                                </div>
                                <div className="w-8 text-xs font-medium text-foreground text-right tabular-nums">
                                    {data.applications}
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>

                {/* Top Positions */}
                <div>
                    <h4 className="text-sm font-semibold text-foreground mb-4">
                        Top Positions by Applications
                    </h4>
                    <div className="space-y-3">
                        {mockData.topPositions.map((position, index) => (
                            <motion.div
                                key={position.position}
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ duration: 0.6, delay: index * 0.1 }}
                                className="flex items-center justify-between rounded-xl border border-border/60 bg-muted/20 p-3 transition-colors hover:bg-muted/35"
                            >
                                <div className="flex items-center space-x-3 min-w-0">
                                    <div className="rounded-lg bg-secondary/12 p-1.5 shrink-0">
                                        <Briefcase className="w-4 h-4 text-secondary" />
                                    </div>
                                    <span className="text-sm font-medium text-foreground truncate">
                                        {position.position}
                                    </span>
                                </div>
                                <div className="flex items-center space-x-2 shrink-0">
                                    <Users className="w-4 h-4 text-muted-foreground" />
                                    <span className="text-sm font-medium text-muted-foreground tabular-nums">
                                        {position.applications}
                                    </span>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Coming Soon Overlay */}
            <div className="absolute inset-0 flex items-center justify-center rounded-2xl bg-card/85 backdrop-blur-md">
                <div className="text-center px-4">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/15 mb-4">
                        <Clock className="w-8 h-8 text-primary" />
                    </div>
                    <h3 className="text-lg font-semibold text-foreground mb-2">
                        Coming Soon
                    </h3>
                    <p className="text-sm text-muted-foreground max-w-xs mx-auto">
                        Hiring Analytics functionality is under development. Stay tuned for comprehensive insights!
                    </p>
                </div>
            </div>
        </motion.div>
    )
}


