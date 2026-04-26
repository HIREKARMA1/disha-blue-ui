"use client"

import { motion } from 'framer-motion'
import { ArrowRight, Star, TrendingUp, BookOpen, Calendar, Users, Award, Target, Clock } from 'lucide-react'
import Link from 'next/link'
import toast from 'react-hot-toast'

interface AdvertisementBannerProps {
 className?: string
}

export function AdvertisementBanner({ className =''}: AdvertisementBannerProps) {
 const handleComingSoon = (featureName: string) => {
 toast.success(`${featureName} - Coming Soon!`)
 }

 const advertisements = [
 {
 id: 1,
 title:" Resume Workshop",
 subtitle:"Learn to create a standout resume",
 description:"Join our expert-led workshop and get your resume reviewed by industry professionals.",
 cta:"Register Now",
 href:"/dashboard/student/resume-builder",
 bgColor:"",
 icon: BookOpen,
 date:"Mar 25, 2024",
 participants:"45 students"},
 {
 id: 2,
 title:" Career Fair 2024",
 subtitle:"Connect with top companies",
 description:"Meet recruiters from Google, Microsoft, Amazon and 50+ other companies.",
 cta:"Learn More",
 href:"/dashboard/student/events",
 bgColor:"",
 icon: TrendingUp,
 date:"Apr 15, 2024",
 participants:"200+ companies"}
 ]

 const quickActions = [
 {
 title:"Update Profile",
 description:"Keep your profile current",
 icon: Users,
 href:"/dashboard/student/profile",
 color:"bg-blue-100 text-blue-700"},
 {
 title:"Skill Assessment",
 description:"Test your technical skills",
 icon: Target,
 href:"/dashboard/student/skills",
 color:"bg-blue-100 text-blue-700"},
 {
 title:"Interview Prep",
 description:"Practice common questions",
 icon: Award,
 href:"/dashboard/student/interview-prep",
 color:"bg-purple-100 text-purple-700"}
 ]

 return (
 <div className={`space-y-6 ${className}`}>
 {/* Featured Advertisements */}
 <div className="space-y-4 relative">
 <h3 className="text-lg font-semibold text-gray-900 mb-4">Upcoming Events</h3>
 <div className="space-y-4 blur-sm pointer-events-none">
 {advertisements.map((ad, index) => (
 <motion.div
 key={ad.id}
 initial={{ opacity: 0, x: -20 }}
 animate={{ opacity: 1, x: 0 }}
 transition={{ duration: 0.6, delay: index * 0.1 }}
 >
 <Link href={ad.href} className="block group">
 <div className={`rounded-2xl border border-slate-200/90 bg-white p-6 text-slate-900 shadow-[0_4px_24px_-6px_rgba(15,23,42,0.08)] transition-colors duration-200 hover:border-blue-600/70 dark:border-blue-800/65 dark:bg-blue-900/35 dark:shadow-none`}>
 <div className="flex items-start justify-between mb-4">
 <div className="flex items-center space-x-2">
 <Star className="h-4 w-4 text-blue-600"/>
 <span className="text-sm font-medium text-blue-600">Featured</span>
 </div>
 <div className="text-right text-xs text-slate-600">
 <div className="flex items-center space-x-1">
 <Calendar className="w-3 h-3"/>
 <span>{ad.date}</span>
 </div>
 <div className="flex items-center space-x-1 mt-1">
 <Users className="w-3 h-3"/>
 <span>{ad.participants}</span>
 </div>
 </div>
 </div>

 <h3 className="mb-2 text-xl font-bold text-slate-900">{ad.title}</h3>
 <p className="mb-2 font-medium text-slate-700">{ad.subtitle}</p>
 <p className="mb-4 text-sm leading-relaxed text-slate-600">{ad.description}</p>

 <div className="flex items-center justify-between">
 <div className="inline-flex items-center space-x-2 px-4 py-2 transition-colors duration-200">
 <span className="text-sm font-semibold">{ad.cta}</span>
 <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-200"/>
 </div>
 <div className="w-16 h-16 flex items-center justify-center">
 <ad.icon className="h-8 w-8 text-blue-600"/>
 </div>
 </div>
 </div>
 </Link>
 </motion.div>
 ))}
 </div>

 {/* Coming Soon Overlay for Upcoming Events */}
 <div className="absolute inset-0 flex items-center justify-center rounded-2xl">
 <div className="text-center">
 <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-100 mb-4">
 <Clock className="w-8 h-8 text-primary-600"/>
 </div>
 <h3 className="text-lg font-semibold text-gray-900 mb-2">
 Coming Soon
 </h3>
 <p className="text-sm text-gray-600 max-w-xs">
 Upcoming Events functionality is under development. Stay tuned for exciting updates!
 </p>
 </div>
 </div>
 </div>

 {/* Quick Actions */}
 {/* <div className="space-y-4">
 <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
 <div className="space-y-3">
 {quickActions.map((action, index) => (
 <motion.div
 key={action.title}
 initial={{ opacity: 0, y: 20 }}
 animate={{ opacity: 1, y: 0 }}
 transition={{ duration: 0.6, delay: index * 0.1 }}
 >
 {action.title ==="Skill Assessment"|| action.title ==="Interview Prep"? (
 <div
 onClick={() => handleComingSoon(action.title)}
 className="block group cursor-pointer">
 <div className="p-4 rounded-xl border border-gray-200 hover:border-gray-300 transition-all duration-200 hover:shadow-md bg-white">
 <div className="flex items-center space-x-3">
 <div className={`p-2 rounded-xl ${action.color}`}>
 <action.icon className="w-5 h-5"/>
 </div>
 <div className="flex-1">
 <h4 className="font-semibold text-gray-900 text-sm group-hover:text-primary-600 transition-colors">
 {action.title}
 </h4>
 <p className="text-xs text-gray-600 mt-1">
 {action.description}
 </p>
 </div>
 <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-primary-500 group-hover:translate-x-1 transition-all duration-200"/>
 </div>
 </div>
 </div>
 ) : (
 <Link href={action.href} className="block group">
 <div className="p-4 rounded-xl border border-gray-200 hover:border-gray-300 transition-all duration-200 hover:shadow-md bg-white">
 <div className="flex items-center space-x-3">
 <div className={`p-2 rounded-xl ${action.color}`}>
 <action.icon className="w-5 h-5"/>
 </div>
 <div className="flex-1">
 <h4 className="font-semibold text-gray-900 text-sm group-hover:text-primary-600 transition-colors">
 {action.title}
 </h4>
 <p className="text-xs text-gray-600 mt-1">
 {action.description}
 </p>
 </div>
 <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-primary-500 group-hover:translate-x-1 transition-all duration-200"/>
 </div>
 </div>
 </Link>
 )}
 </motion.div>
 ))}
 </div>
 </div> */}

 {/* Stats Summary */}
 {/* <div className="space-y-4">
 <h3 className="text-lg font-semibold text-gray-900 mb-4">Your Progress</h3>
 <div className="grid grid-cols-2 gap-3">
 <div className="rounded-xl p-4 text-center">
 <div className="text-2xl font-bold text-blue-600">85%</div>
 <div className="text-xs text-blue-700">Profile Complete</div>
 </div>
 <div className="rounded-xl p-4 text-center">
 <div className="text-2xl font-bold text-blue-600">12</div>
 <div className="text-xs text-blue-700">Active Applications</div>
 </div>
 </div>
 </div> */}
 </div>
 )
}
