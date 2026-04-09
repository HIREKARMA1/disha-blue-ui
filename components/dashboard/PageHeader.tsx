"use client"

import { motion } from 'framer-motion'
import { CalendarDays } from 'lucide-react'
import { cn } from '@/lib/utils'

interface PageHeaderProps {
    title: string
    description: string
    dateText?: string
    tags?: { icon?: React.ElementType; text: string; colorClass: string }[]
}

export function PageHeader({
    title,
    description,
    dateText,
    tags
}: PageHeaderProps) {
    return (
        <motion.section
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35 }}
            className="rounded-2xl border border-border/80 bg-gradient-to-br from-primary/[0.08] via-card to-secondary/[0.08] p-6 shadow-sm"
        >
            <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                    <h1 className="font-display text-2xl md:text-3xl font-semibold tracking-tight text-foreground">
                        {title}
                    </h1>
                </div>
            </div>

            <p className="text-muted-foreground text-sm md:text-base mb-4 max-w-2xl">
                {description}
            </p>

            <div className="flex flex-wrap gap-3">
                {dateText && (
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border border-primary/20 bg-primary/10 text-primary">
                        <CalendarDays className="w-4 h-4 mr-1" />
                        {dateText}
                    </span>
                )}
                {tags && tags.map((tag, index) => (
                    <span key={index} className={cn('inline-flex items-center rounded-full px-3 py-1 text-xs font-medium border', tag.colorClass)}>
                        {tag.icon && <tag.icon className="w-4 h-4 mr-1" />}
                        {tag.text}
                    </span>
                ))}
            </div>
        </motion.section>
    )
}
