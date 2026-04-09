"use client"

import { motion } from 'framer-motion'
import {
    Search,
    Filter
} from 'lucide-react'

interface CorporateManagementHeaderProps {
    totalCorporates: number
    activeCorporates: number
    archivedCorporates: number
    searchTerm: string
    onSearchChange: (value: string) => void
    filterStatus: string
    onFilterChange: (value: string) => void
    includeArchived: boolean
    onIncludeArchivedChange: (value: boolean) => void
}

export function CorporateManagementHeader({
    totalCorporates,
    activeCorporates,
    archivedCorporates,
    searchTerm,
    onSearchChange,
    filterStatus,
    onFilterChange,
    includeArchived,
    onIncludeArchivedChange
}: CorporateManagementHeaderProps) {
    return (
        <div className="space-y-4">
            <div className="rounded-2xl border border-border bg-card/80 p-5 shadow-soft">
                <div className="mb-4 grid gap-3 sm:grid-cols-3">
                    <div className="rounded-xl border border-border/70 bg-background/80 px-3 py-2">
                        <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">Total</p>
                        <p className="mt-1 text-lg font-semibold text-foreground">{totalCorporates}</p>
                    </div>
                    <div className="rounded-xl border border-border/70 bg-background/80 px-3 py-2">
                        <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">Active</p>
                        <p className="mt-1 text-lg font-semibold text-foreground">{activeCorporates}</p>
                    </div>
                    <div className="rounded-xl border border-border/70 bg-background/80 px-3 py-2">
                        <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">Archived</p>
                        <p className="mt-1 text-lg font-semibold text-foreground">{archivedCorporates}</p>
                    </div>
                </div>
                <div className="flex flex-col gap-3 sm:flex-row">
                    <div className="flex-1 relative">
                        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <input
                            type="text"
                            placeholder="Search employers by company, email, or location..."
                            value={searchTerm}
                            onChange={(e) => onSearchChange(e.target.value)}
                            className="h-11 w-full rounded-xl border border-border bg-background pl-10 pr-4 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30"
                        />
                    </div>
                    <div className="relative sm:w-[210px]">
                        <Filter className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <select
                            value={filterStatus}
                            onChange={(e) => onFilterChange(e.target.value)}
                            className="h-11 w-full appearance-none rounded-xl border border-border bg-background pl-10 pr-8 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30"
                        >
                            <option value="all">All Statuses</option>
                            <option value="verified">Verified</option>
                            <option value="unverified">Unverified</option>
                            <option value="active">Active</option>
                            <option value="inactive">Inactive</option>
                        </select>
                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-muted-foreground">
                            <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" /></svg>
                        </div>
                    </div>
                    <div className="relative sm:w-[210px]">
                        <Filter className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <select
                            value={includeArchived ? 'archived' : 'active'}
                            onChange={(e) => onIncludeArchivedChange(e.target.value === 'archived')}
                            className="h-11 w-full appearance-none rounded-xl border border-border bg-background pl-10 pr-8 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30"
                        >
                            <option value="active">Active Employers</option>
                            <option value="archived">Archived Employers</option>
                        </select>
                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-muted-foreground">
                            <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" /></svg>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

