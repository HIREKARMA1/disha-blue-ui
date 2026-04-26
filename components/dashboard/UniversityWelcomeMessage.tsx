"use client"

import { motion } from 'framer-motion'
import { GraduationCap, Shield, Users, TrendingUp } from 'lucide-react'
import { UniversityInfo } from '@/types/university'
interface UniversityWelcomeMessageProps {
 className?: string
 universityInfo?: UniversityInfo
}

export function UniversityWelcomeMessage({
 className ='',
 universityInfo
}: UniversityWelcomeMessageProps) {
 const currentHour = new Date().getHours()
 let greeting = 'Good morning'
 let message = 'Ready to manage placements and student opportunities?'
 if (currentHour >= 12 && currentHour < 17) {
 greeting = 'Good afternoon'
 message = 'Keep up the excellent work in student placement management!'
 } else if (currentHour >= 17) {
 greeting = 'Good evening'
 message = 'Great progress today! Let\'s continue building student success.'
 }

 return (
 <motion.div
 initial={{ opacity: 0, y: 20 }}
 animate={{ opacity: 1, y: 0 }}
 transition={{ duration: 0.6 }}
 className={`dashboard-overview-card p-6 transition-colors hover:border-blue-600/70 ${className}`}
 >
 <div className="flex items-start space-x-4">
 <div className="min-w-0 flex-1">
 <h1 className="mb-2 text-2xl font-semibold text-slate-900 md:text-3xl">
 {greeting}, {universityInfo?.university_name ||'University'}!
 </h1>
 <p className="mb-3 text-lg text-slate-600">
 {message}
 </p>

 {/* University Info Tags */}
 <div className="flex flex-wrap gap-2">
 <motion.span
 initial={{ scale: 0.8, opacity: 0 }}
 animate={{ scale: 1, opacity: 1 }}
 transition={{ duration: 0.5, delay: 0.1 }}
 className="inline-flex items-center rounded-full border border-slate-200/90 bg-blue-50 px-3 py-1 text-sm text-slate-800 shadow-sm">
  {new Date().toLocaleDateString('en-US', { weekday:'long', month:'long', day:'numeric'})}
 </motion.span>

 <motion.span
 initial={{ scale: 0.8, opacity: 0 }}
 animate={{ scale: 1, opacity: 1 }}
 transition={{ duration: 0.5, delay: 0.2 }}
 className="inline-flex items-center rounded-full border border-slate-200/90 bg-blue-50 px-3 py-1 text-sm text-slate-800 shadow-sm">
 <GraduationCap className="mr-1 h-4 w-4 text-blue-600"/>
 {universityInfo?.institute_type ? universityInfo.institute_type.charAt(0).toUpperCase() + universityInfo.institute_type.slice(1) :'University'}
 </motion.span>

 {universityInfo?.verified && (
 <motion.span
 initial={{ scale: 0.8, opacity: 0 }}
 animate={{ scale: 1, opacity: 1 }}
 transition={{ duration: 0.5, delay: 0.3 }}
 className="inline-flex items-center rounded-full border border-slate-200/90 bg-blue-50 px-3 py-1 text-sm text-slate-800 shadow-sm">
 <Shield className="mr-1 h-4 w-4 text-blue-600"/>
 Verified
 </motion.span>
 )}

 {universityInfo?.total_students && (
 <motion.span
 initial={{ scale: 0.8, opacity: 0 }}
 animate={{ scale: 1, opacity: 1 }}
 transition={{ duration: 0.5, delay: 0.4 }}
 className="inline-flex items-center rounded-full border border-slate-200/90 bg-blue-50 px-3 py-1 text-sm text-slate-800 shadow-sm">
 <Users className="mr-1 h-4 w-4 text-blue-600"/>
 {universityInfo.total_students.toLocaleString()} Students
 </motion.span>
 )}

 <motion.span
 initial={{ scale: 0.8, opacity: 0 }}
 animate={{ scale: 1, opacity: 1 }}
 transition={{ duration: 0.5, delay: 0.5 }}
 className="inline-flex items-center rounded-full border border-slate-200/90 bg-blue-50 px-3 py-1 text-sm text-slate-800 shadow-sm">
 <TrendingUp className="mr-1 h-4 w-4 text-blue-600"/>
 Placement Hub
 </motion.span>
 </div>
 </div>
 </div>
 </motion.div>
 )
}
