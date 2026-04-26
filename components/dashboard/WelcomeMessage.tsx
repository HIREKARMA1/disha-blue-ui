"use client"

import { motion } from 'framer-motion'
import { Sun, Coffee, Rocket } from 'lucide-react'
import { useEffect, useState } from 'react'
import { getClientLocale, tf, type SupportedLocale } from '@/lib/i18n'
interface WelcomeMessageProps {
 className?: string
 studentName?: string
}

export function WelcomeMessage({ className ='', studentName ='Student'}: WelcomeMessageProps) {
 const [locale, setLocale] = useState<SupportedLocale>('en')
 useEffect(() => {
 setLocale(getClientLocale())
 }, [])

 const currentHour = new Date().getHours()
 let greeting = tf(locale,'student.welcome.greetingMorning','Good morning')
 let icon = Sun
 let message = tf(locale,'student.welcome.messageMorning','Ready to explore nearby jobs and local opportunities today?')

 if (currentHour >= 12 && currentHour < 17) {
 greeting = tf(locale,'student.welcome.greetingAfternoon','Good afternoon')
 icon = Coffee
 message = tf(locale,'student.welcome.messageAfternoon','Keep going - fresh local jobs are being posted near you.')
 } else if (currentHour >= 17) {
 greeting = tf(locale,'student.welcome.greetingEvening','Good evening')
 icon = Rocket
 message = tf(locale,'student.welcome.messageEvening','Great effort today. Review applications and plan your next move.')
 }

 return (
 <motion.div
 initial={{ opacity: 0, y: 20 }}
 animate={{ opacity: 1, y: 0 }}
 transition={{ duration: 0.6 }}
 className={`dashboard-overview-card p-6 transition-colors hover:border-blue-600/70 ${className}`}
 >
 <div className="space-y-4">
 <div className="min-w-0 space-y-4">
 <h1 className="text-2xl font-semibold text-slate-900">
 {greeting}, {studentName}!
 </h1>
 <p className="text-base text-slate-600">
 {message}
 </p>
 <div className="flex flex-wrap gap-2">
 <span className="inline-flex items-center rounded-full border border-slate-200/90 bg-blue-50 px-3 py-1 text-sm text-slate-800 shadow-sm">
  {new Date().toLocaleDateString('en-US', { weekday:'long', month:'long', day:'numeric'})}
 </span>
 <span className="inline-flex items-center rounded-full border border-slate-200/90 bg-blue-50 px-3 py-1 text-sm text-slate-800 shadow-sm">
  {tf(locale,'student.welcome.tagLocalOpportunities','Local Opportunities')}
 </span>
 <span className="inline-flex items-center rounded-full border border-slate-200/90 bg-blue-50 px-3 py-1 text-sm text-slate-800 shadow-sm">
  {tf(locale,'student.welcome.tagNearbyHiring','Nearby Hiring')}
 </span>
 </div>
 </div>
 </div>
 </motion.div>
 )
}
