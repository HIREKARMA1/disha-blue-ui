"use client"

import { motion } from 'framer-motion'
import { Shield, Calendar, Clock } from 'lucide-react'
import { AdminDashboardData } from '@/types/admin'
import { useEffect, useState } from 'react'
import { getClientLocale, tf, type SupportedLocale } from '@/lib/i18n'
interface AdminWelcomeMessageProps {
 adminInfo: AdminDashboardData
}

export function AdminWelcomeMessage({ adminInfo }: AdminWelcomeMessageProps) {
 const [locale, setLocale] = useState<SupportedLocale>('en')
 useEffect(() => {
 setLocale(getClientLocale())
 }, [])

 const currentHour = new Date().getHours()
 const getGreeting = () => {
 if (currentHour < 12) return tf(locale,'admin.welcome.greetingMorning','Good Morning')
 if (currentHour < 17) return tf(locale,'admin.welcome.greetingAfternoon','Good Afternoon')
 return tf(locale,'admin.welcome.greetingEvening','Good Evening')
 }

 const getCurrentDate = () => {
 return new Date().toLocaleDateString('en-US', {
 weekday:'long',
 year:'numeric',
 month:'long',
 day:'numeric'})
 }

 return (
 <motion.div
 initial={{ opacity: 0, y: 20 }}
 animate={{ opacity: 1, y: 0 }}
 transition={{ duration: 0.6 }}
 className="dashboard-overview-card p-6 transition-colors hover:border-sage-deep/70">
 <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
 <div className="flex-1 space-y-4">
 <div className="flex items-center space-x-3">
 <div className="flex h-12 w-12 items-center justify-center rounded-none border border-slate-200 bg-sage">
 <Shield className="h-6 w-6 text-sage-deep"/>
 </div>
 <div>
 <h1 className="text-2xl font-semibold text-slate-900">
 {getGreeting()}, Admin!
 </h1>
 <p className="text-sm text-slate-600">
 {tf(locale,'admin.welcome.subtitle','Manage your hyper-local opportunity ecosystem')}
 </p>
 </div>
 </div>

 <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
 <div className="dashboard-overview-card p-5">
 <div className="mb-2 flex items-center space-x-2">
 <Calendar className="h-4 w-4 text-sage-deep"/>
 <span className="text-sm text-slate-600">{tf(locale,'admin.welcome.today','Today')}</span>
 </div>
 <p className="text-base font-medium text-slate-900">{getCurrentDate()}</p>
 </div>

 <div className="dashboard-overview-card p-5">
 <div className="mb-2 flex items-center space-x-2">
 <Clock className="h-4 w-4 text-sage-deep"/>
 <span className="text-sm text-slate-600">{tf(locale,'admin.welcome.systemStatus','System Status')}</span>
 </div>
 <p className="text-base font-medium text-slate-900">{tf(locale,'admin.welcome.operational','Operational')}</p>
 </div>
 </div>
 </div>

 <div className="lg:ml-8">
 <div className="rounded-2xl border border-slate-200 bg-sage p-6 text-center shadow-[0_4px_24px_-6px_rgba(15,23,42,0.08)] dark:border-emerald-800 dark:bg-emerald-900/40">
 <h3 className="mb-4 text-lg font-medium text-slate-900">{tf(locale,'admin.welcome.snapshot','Snapshot')}</h3>
 <div className="grid grid-cols-2 gap-4">
 <div>
 <p className="text-base font-semibold text-emerald-900">{adminInfo.total_users.toLocaleString()}</p>
 <p className="text-sm text-slate-600">{tf(locale,'admin.welcome.totalUsers','Total Users')}</p>
 </div>
 <div>
 <p className="text-base font-semibold text-emerald-900">{adminInfo.total_jobs.toLocaleString()}</p>
 <p className="text-sm text-slate-600">{tf(locale,'admin.welcome.jobs','Jobs')}</p>
 </div>
 </div>
 </div>
 </div>
 </div>
 </motion.div>
 )
}
