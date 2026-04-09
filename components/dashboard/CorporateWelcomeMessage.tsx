"use client"

import { motion } from 'framer-motion'
import { Building2, Shield, Users, TrendingUp } from 'lucide-react'
import { useEffect, useState } from 'react'
import { getClientLocale, tf, type SupportedLocale } from '@/lib/i18n'
import { corporateHeroClass, corporateChipClass } from '@/components/corporate/corporate-ui'

interface CorporateWelcomeMessageProps {
    className?: string
    companyName?: string
}

export function CorporateWelcomeMessage({
    className = '',
    companyName = 'Company'
}: CorporateWelcomeMessageProps) {
    const [locale, setLocale] = useState<SupportedLocale>('en')
    useEffect(() => {
        setLocale(getClientLocale())
    }, [])

    const currentHour = new Date().getHours()
    let greeting = tf(locale, 'corporate.welcome.greetingMorning', 'Good morning')
    let message = tf(locale, 'corporate.welcome.messageMorning', 'Ready to hire local talent faster with better visibility?')

    if (currentHour >= 12 && currentHour < 17) {
        greeting = tf(locale, 'corporate.welcome.greetingAfternoon', 'Good afternoon')
        message = tf(locale, 'corporate.welcome.messageAfternoon', 'Keep momentum going - new nearby candidates are applying.')
    } else if (currentHour >= 17) {
        greeting = tf(locale, 'corporate.welcome.greetingEvening', 'Good evening')
        message = tf(locale, 'corporate.welcome.messageEvening', 'Great progress today. Review applicants and plan next hiring steps.')
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className={`${corporateHeroClass} ${className}`}
        >
            <div className="flex items-start space-x-4">
                <div className="flex-1 min-w-0">
                    <h1 className="font-display text-2xl font-semibold tracking-tight text-foreground md:text-3xl mb-2">
                        {greeting}, {companyName}
                    </h1>
                    <p className="text-muted-foreground text-base md:text-lg mb-4 max-w-2xl">
                        {message}
                    </p>

                    {/* Corporate Info Tags */}
                    <div className="flex flex-wrap gap-2">
                        <motion.span
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ duration: 0.5, delay: 0.1 }}
                            className={`${corporateChipClass} bg-primary/12 text-primary border-primary/20`}
                        >
                            🎯 {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                        </motion.span>

                        <motion.span
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ duration: 0.5, delay: 0.2 }}
                            className={corporateChipClass}
                        >
                            <Building2 className="w-4 h-4 mr-1" />
                            {tf(locale, 'corporate.welcome.tagWorkspace', 'Employer Workspace')}
                        </motion.span>

                        <motion.span
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ duration: 0.5, delay: 0.3 }}
                            className={`${corporateChipClass} border-secondary/25 bg-secondary/10 text-foreground`}
                        >
                            <Shield className="w-4 h-4 mr-1" />
                            {tf(locale, 'corporate.welcome.tagVerified', 'Verified Employer')}
                        </motion.span>

                        <motion.span
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ duration: 0.5, delay: 0.4 }}
                            className={corporateChipClass}
                        >
                            <Users className="w-4 h-4 mr-1" />
                            {tf(locale, 'corporate.welcome.tagLocalHiring', 'Local Hiring')}
                        </motion.span>

                        <motion.span
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ duration: 0.5, delay: 0.5 }}
                            className={`${corporateChipClass} bg-muted/60`}
                        >
                            <TrendingUp className="w-4 h-4 mr-1" />
                            {tf(locale, 'corporate.welcome.tagRegionalGrowth', 'Regional Growth')}
                        </motion.span>
                    </div>
                </div>
            </div>
        </motion.div>
    )
}


