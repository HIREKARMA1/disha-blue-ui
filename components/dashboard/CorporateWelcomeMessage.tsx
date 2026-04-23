"use client"

import { motion } from 'framer-motion'
import { Building2, Shield, Users, TrendingUp } from 'lucide-react'
import { useEffect, useState } from 'react'
import { getClientLocale, tf, type SupportedLocale } from '@/lib/i18n'
interface CorporateWelcomeMessageProps {
 className?: string
 companyName?: string
}

export function CorporateWelcomeMessage({
 className ='',
 companyName ='Company'}: CorporateWelcomeMessageProps) {
 const [locale, setLocale] = useState<SupportedLocale>('en')
 useEffect(() => {
 setLocale(getClientLocale())
 }, [])

 const currentHour = new Date().getHours()
 let greeting = tf(locale,'corporate.welcome.greetingMorning','Good morning')
 let message = tf(locale,'corporate.welcome.messageMorning','Ready to hire local talent faster with better visibility?')

 if (currentHour >= 12 && currentHour < 17) {
 greeting = tf(locale,'corporate.welcome.greetingAfternoon','Good afternoon')
 message = tf(locale,'corporate.welcome.messageAfternoon','Keep momentum going - new nearby candidates are applying.')
 } else if (currentHour >= 17) {
 greeting = tf(locale,'corporate.welcome.greetingEvening','Good evening')
 message = tf(locale,'corporate.welcome.messageEvening','Great progress today. Review applicants and plan next hiring steps.')
 }

 return (
 <motion.div
 initial={{ opacity: 0, y: 20 }}
 animate={{ opacity: 1, y: 0 }}
 transition={{ duration: 0.6 }}
 className={`dashboard-overview-card p-6 transition-colors hover:border-sage-deep/70 ${className}`}
 >
 <div className="space-y-4">
 <div className="min-w-0 space-y-4">
 <h1 className="text-2xl font-semibold text-slate-900">
 {greeting}, {companyName}
 </h1>
 <p className="max-w-2xl text-base text-slate-600">
 {message}
 </p>

 {/* Corporate Info Tags */}
 <div className="flex flex-wrap gap-2">
 <motion.span
 initial={{ scale: 0.8, opacity: 0 }}
 animate={{ scale: 1, opacity: 1 }}
 transition={{ duration: 0.5, delay: 0.1 }}
 className="inline-flex items-center rounded-full border border-slate-200/90 bg-sage px-3 py-1 text-sm text-slate-800 shadow-sm">
  {new Date().toLocaleDateString('en-US', { weekday:'long', month:'long', day:'numeric'})}
 </motion.span>

 <motion.span
 initial={{ scale: 0.8, opacity: 0 }}
 animate={{ scale: 1, opacity: 1 }}
 transition={{ duration: 0.5, delay: 0.2 }}
 className="inline-flex items-center rounded-full border border-slate-200/90 bg-sage px-3 py-1 text-sm text-slate-800 shadow-sm">
 <Building2 className="mr-1 h-4 w-4 text-sage-deep"/>
 {tf(locale,'corporate.welcome.tagWorkspace','Employer Workspace')}
 </motion.span>

 <motion.span
 initial={{ scale: 0.8, opacity: 0 }}
 animate={{ scale: 1, opacity: 1 }}
 transition={{ duration: 0.5, delay: 0.3 }}
 className="inline-flex items-center rounded-full border border-slate-200/90 bg-sage px-3 py-1 text-sm text-slate-800 shadow-sm">
 <Shield className="mr-1 h-4 w-4 text-sage-deep"/>
 {tf(locale,'corporate.welcome.tagVerified','Verified Employer')}
 </motion.span>

 <motion.span
 initial={{ scale: 0.8, opacity: 0 }}
 animate={{ scale: 1, opacity: 1 }}
 transition={{ duration: 0.5, delay: 0.4 }}
 className="inline-flex items-center rounded-full border border-slate-200/90 bg-sage px-3 py-1 text-sm text-slate-800 shadow-sm">
 <Users className="mr-1 h-4 w-4 text-sage-deep"/>
 {tf(locale,'corporate.welcome.tagLocalHiring','Local Hiring')}
 </motion.span>

 <motion.span
 initial={{ scale: 0.8, opacity: 0 }}
 animate={{ scale: 1, opacity: 1 }}
 transition={{ duration: 0.5, delay: 0.5 }}
 className="inline-flex items-center rounded-full border border-slate-200/90 bg-sage px-3 py-1 text-sm text-slate-800 shadow-sm">
 <TrendingUp className="mr-1 h-4 w-4 text-sage-deep"/>
 {tf(locale,'corporate.welcome.tagRegionalGrowth','Regional Growth')}
 </motion.span>
 </div>
 </div>
 </div>
 </motion.div>
 )
}


