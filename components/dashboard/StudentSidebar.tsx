"use client"

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
 Compass,
 LayoutDashboard,
 UserCircle2,
 FileText,
MessagesSquare,
 Library,
 X,
 Menu,
 LogOut,
 Mic,
 ClipboardList,
Bot,
 Sparkles,
 type LucideIcon,
} from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { apiClient } from '@/lib/api'
import { useLoading } from '@/contexts/LoadingContext'
import { cn } from '@/lib/utils'
import { useLocale } from '@/contexts/LocaleContext'
import { t } from '@/lib/i18n'
import { SidebarRailHoverCard } from '@/components/dashboard/SidebarRailHoverCard'

interface NavItem {
 label: string
 href: string
 icon: LucideIcon
 description: string
aliases?: string[]
}

interface NavGroup {
 title: string
 items: NavItem[]
}

interface StudentSidebarProps {
 className?: string
}

export function StudentSidebar({ className =''}: StudentSidebarProps) {
 const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
 const [profileData, setProfileData] = useState<any>(null)
 const pathname = usePathname()
 const { user, logout } = useAuth()
 const { startLoading } = useLoading()
 const { locale } = useLocale()
 const navGroups: NavGroup[] = [
 {
title: 'Overview',
items: [
{ label: 'Dashboard', href:'/dashboard/student', icon: LayoutDashboard, description:'Your career control center'},
{
label:'Local Jobs',
href:'/dashboard/discover-jobs',
aliases: ['/dashboard/student/jobs'],
icon: Compass,
description:'Local and personalized roles',
},
],
 },
 {
 title: t(locale,'dashboard.groups.jobs'),
 items: [
 { label:'Applications', href:'/dashboard/student/applications', icon: ClipboardList, description:'Track your pipeline status'},
 ],
 },
 {
 title: t(locale,'dashboard.groups.careerTools'),
 items: [
 { label:'Resume Builder', href:'/dashboard/student/resume-builder', icon: FileText, description:'Craft and iterate quickly'},
 { label:'Build with AI', href:'/dashboard/student/resume/ai', icon: Bot, description:'Generate resume using AI'},
 { label:'AI Interview Session', href:'/dashboard/student/career-align', icon: MessagesSquare, description:'Mock interview with live AI coach'},
 { label:'AI Communication Assessments', href:'/ai-communication', icon: Mic, description:'Voice-based communication coaching'},
 { label:'Video Search', href:'/dashboard/student/video-search', icon: Sparkles, description:'Learn from short explainers'},
 { label:'Library', href:'/dashboard/student/library', icon: Library, description:'Career resources and docs'},
 ],
 },
 {
 title: t(locale,'dashboard.groups.account'),
 items: [
 { label:'Profile', href:'/dashboard/student/profile', icon: UserCircle2, description:'Personal details and identity'},
 ],
 },
 ]
 const allItems = navGroups.flatMap((group) => group.items)

 useEffect(() => {
 const fetchProfile = async () => {
 if (user?.user_type ==='student') {
 try {
 const data = await apiClient.getStudentProfile()
 setProfileData(data)
 } catch (error) {
 console.error('Failed to fetch profile:', error)
 }
 }
 }
 fetchProfile()
 }, [user])

 const getDisplayName = () => profileData?.name?.trim() || user?.name ||'Student'
 const getDisplayEmail = () => profileData?.email || user?.email ||'student@university.edu'

 const railLinkClass = (isActive: boolean) =>
 cn(
 'flex h-11 w-11 shrink-0 items-center justify-center transition-all hover:-translate-y-0.5',
 isActive
 ?'rounded-none bg-white text-slate-800 shadow-none dark:bg-white dark:text-slate-900'
 :'text-slate-700 hover:text-slate-900 dark:text-emerald-200 dark:hover:text-white',
 )

 const isItemActive = (item: NavItem) => {
 if (pathname === item.href) return true
 if (item.aliases?.includes(pathname || '')) return true
 return false
 }

 const renderMobileRow = (item: NavItem) => {
const isActive = isItemActive(item)
 return (
 <Link
 key={item.href}
 href={item.href}
 onClick={() => {
 if (!isActive) startLoading()
 setIsMobileMenuOpen(false)
 }}
 className={cn(
 'flex items-center gap-3 rounded-none px-3 py-3 text-sm font-medium transition-colors',
 isActive
 ?'bg-white text-slate-900 shadow-none dark:bg-emerald-900 dark:text-emerald-50'
 :'text-slate-700 hover:bg-slate-100 dark:text-emerald-200 dark:hover:bg-emerald-900',
 )}
 >
 <item.icon className="h-5 w-5 shrink-0" strokeWidth={1.75} />
 <span>{item.label}</span>
 </Link>
 )
 }

 const handleLogout = () => {
 logout()
 setIsMobileMenuOpen(false)
 }

 return (
 <>
 {/* Desktop: slim sage icon rail (reference UI) */}
 <aside
 className={cn(
'student-sidebar fixed inset-y-0 left-0 z-40 hidden w-16 flex-col bg-sage pt-16 dark:bg-emerald-950 lg:flex',
 'rounded-none',
 className,
 )}
 >
 <nav className="flex min-h-0 flex-1 flex-col items-center px-0 py-4">
 <div className="flex min-h-0 w-full flex-1 flex-col items-center gap-3 overflow-y-auto overflow-x-hidden px-2">
 {allItems.map((item) => {
const isActive = isItemActive(item)
 return (
 <SidebarRailHoverCard
 key={item.href}
 item={item}
 isActive={isActive}
 dataSidebarItem={isActive ?'active':'inactive'}
 railLinkClassName={railLinkClass(isActive)}
 onNavigate={() => !isActive && startLoading()}
 />
 )
 })}
 </div>
 <button
 type="button"
 title={t(locale,'dashboard.labels.logout')}
 onClick={handleLogout}
 className="mt-3 flex h-11 w-11 shrink-0 items-center justify-center text-slate-700 transition-colors hover:text-slate-900 dark:text-emerald-200 dark:hover:text-white"
 >
 <LogOut className="h-5 w-5" strokeWidth={1.75} />
 </button>
 </nav>
 </aside>

 {/* Mobile bottom bar */}
 <div className="student-mobile-nav fixed bottom-0 left-0 right-0 z-50 border-t border-sage-deep bg-sage pb-safe dark:border-emerald-800 dark:bg-emerald-950 lg:hidden">
 <div className="grid grid-cols-5 gap-1 px-2 py-2">
 {allItems.slice(0, 4).map((item) => {
const isActive = isItemActive(item)
 return (
 <Link
 key={item.href}
 href={item.href}
 title={item.label}
 onClick={() => !isActive && startLoading()}
 className={railLinkClass(isActive)}
 >
 <item.icon className="h-5 w-5" strokeWidth={1.75} />
 </Link>
 )
 })}
 <button
 type="button"
 title={t(locale,'nav.studentNavigation')}
 onClick={() => setIsMobileMenuOpen(true)}
 className="flex h-11 w-full items-center justify-center text-slate-700 dark:text-emerald-200"
 >
 <Menu className="h-5 w-5" strokeWidth={1.75} />
 </button>
 </div>
 </div>

 <AnimatePresence>
 {isMobileMenuOpen && (
 <motion.div
 initial={{ opacity: 0 }}
 animate={{ opacity: 1 }}
 exit={{ opacity: 0 }}
 className="fixed inset-0 z-50 bg-slate-900 lg:hidden"
 onClick={() => setIsMobileMenuOpen(false)}
 >
 <motion.div
 initial={{ x:'100%'}}
 animate={{ x: 0 }}
 exit={{ x:'100%'}}
 transition={{ type:'spring', damping: 28, stiffness: 280 }}
 className="absolute right-0 top-0 flex h-full w-[min(100%,20rem)] flex-col bg-sage-canvas dark:bg-emerald-950"
 onClick={(e) => e.stopPropagation()}
 >
 <div className="flex items-center justify-between border-b border-slate-200 bg-sage px-4 py-4 dark:border-emerald-800 dark:bg-emerald-950">
 <h2 className="text-base font-semibold text-slate-800 dark:text-emerald-50">{t(locale,'nav.studentNavigation')}</h2>
 <button
 type="button"
 onClick={() => setIsMobileMenuOpen(false)}
 className="flex h-9 w-9 items-center justify-center rounded-none bg-white text-slate-800 shadow-none dark:bg-emerald-900 dark:text-emerald-100"
 >
 <X className="h-5 w-5" strokeWidth={1.75} />
 </button>
 </div>

 <div className="border-b border-slate-200 px-4 py-3 dark:border-emerald-800">
 <p className="truncate text-sm font-semibold text-slate-900 dark:text-emerald-50">{getDisplayName()}</p>
 <p className="truncate text-xs text-slate-600 dark:text-emerald-300">{getDisplayEmail()}</p>
 </div>

 <nav className="min-h-0 flex-1 space-y-2 overflow-y-auto p-4">{allItems.map((item) => renderMobileRow(item))}</nav>

 <div className="border-t border-slate-200 p-4 dark:border-emerald-800">
 <button
 type="button"
 onClick={handleLogout}
 className="flex w-full items-center justify-center gap-2 rounded-none bg-white py-3 text-sm font-medium text-slate-800 shadow-none dark:bg-emerald-900 dark:text-emerald-50"
 >
 <LogOut className="h-5 w-5" strokeWidth={1.75} />
 {t(locale,'dashboard.labels.logout')}
 </button>
 </div>
 </motion.div>
 </motion.div>
 )}
 </AnimatePresence>
 </>
 )
}
