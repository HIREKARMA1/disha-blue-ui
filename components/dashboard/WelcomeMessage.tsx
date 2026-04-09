"use client"

import { motion } from 'framer-motion'
import { Sun, Coffee, Rocket } from 'lucide-react'
import { useEffect, useState } from 'react'
import { getClientLocale, tf, type SupportedLocale } from '@/lib/i18n'

interface WelcomeMessageProps {
    className?: string
    studentName?: string
}

export function WelcomeMessage({ className = '', studentName = 'Student' }: WelcomeMessageProps) {
    const [locale, setLocale] = useState<SupportedLocale>('en')
    useEffect(() => {
        setLocale(getClientLocale())
    }, [])

    const currentHour = new Date().getHours()
    let greeting = tf(locale, 'student.welcome.greetingMorning', 'Good morning')
    let icon = Sun
    let message = tf(locale, 'student.welcome.messageMorning', 'Ready to explore nearby jobs and local opportunities today?')

    if (currentHour >= 12 && currentHour < 17) {
        greeting = tf(locale, 'student.welcome.greetingAfternoon', 'Good afternoon')
        icon = Coffee
        message = tf(locale, 'student.welcome.messageAfternoon', 'Keep going - fresh local jobs are being posted near you.')
    } else if (currentHour >= 17) {
        greeting = tf(locale, 'student.welcome.greetingEvening', 'Good evening')
        icon = Rocket
        message = tf(locale, 'student.welcome.messageEvening', 'Great effort today. Review applications and plan your next move.')
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className={`bg-gradient-to-r from-primary-50 to-secondary-50 dark:from-primary-900/20 dark:to-secondary-900/20 rounded-2xl p-6 border border-border shadow-soft ${className}`}
        >
            <div className="flex items-start space-x-4">
                {/* <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-primary-500 rounded-xl flex items-center justify-center">
                        <icon className="w-6 h-6 text-white" />
                    </div>
                </div> */}
                <div className="flex-1 min-w-0">
                    <h1 className="font-display text-2xl font-semibold text-foreground md:text-3xl mb-2">
                        {greeting}, {studentName}! 👋
                    </h1>
                    <p className="text-muted-foreground text-lg mb-3">
                        {message}
                    </p>
                    <div className="flex flex-wrap gap-2">
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-primary-100 dark:bg-primary-900/30 text-primary-800 dark:text-primary-200">
                            🎯 {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                        </span>
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-success/15 text-success">
                            📍 {tf(locale, 'student.welcome.tagLocalOpportunities', 'Local Opportunities')}
                        </span>
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-info/15 text-info">
                            🚀 {tf(locale, 'student.welcome.tagNearbyHiring', 'Nearby Hiring')}
                        </span>
                    </div>
                </div>
            </div>
        </motion.div>
    )
}
