"use client"

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
 LayoutDashboard,
 Users,
 Building2,
 Shield,
 Calendar,
 FileText,
 X,
 Menu,
 LogOut,
 Briefcase,
 Brain,
 Settings,
 type LucideIcon,
} from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import Image from 'next/image'
import { useLoading } from '@/contexts/LoadingContext'
import { adminProfileService } from '@/services/adminProfileService'
import { cn } from '@/lib/utils'
import { useLocale } from '@/contexts/LocaleContext'
import { t } from '@/lib/i18n'
import { SidebarRailHoverCard } from '@/components/dashboard/SidebarRailHoverCard'
interface NavItem {
 label: string
 href: string
 icon: LucideIcon
 description: string
}

interface NavGroup {
 title: string
 items: NavItem[]
}

interface AdminSidebarProps {
 className?: string
}

export function AdminSidebar({ className =''}: AdminSidebarProps) {
 const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
 const [profileData, setProfileData] = useState<any>(null)
 const [imageError, setImageError] = useState(false)
 const pathname = usePathname()
 const { user, logout } = useAuth()
 const { startLoading } = useLoading()
 const { locale } = useLocale()
 const navGroups: NavGroup[] = [
 { title: t(locale,'dashboard.groups.overview'), items: [{ label: t(locale,'dashboard.overview'), href:'/dashboard/admin', icon: LayoutDashboard, description:'Platform health and operations'}] },
 {
 title: t(locale,'dashboard.groups.operations'),
 items: [
 { label:'Users', href:'/dashboard/admin/universities', icon: Users, description:'Student and university controls'},
 { label:'Corporates', href:'/dashboard/admin/corporates', icon: Building2, description:'Employer management'},
 { label:'Jobs', href:'/dashboard/admin/jobs', icon: Briefcase, description:'Listing quality and moderation'},
 { label:'Events', href:'/dashboard/admin/events', icon: Calendar, description:'Program and event management'},
 ],
 },
 {
 title: t(locale,'dashboard.groups.assessments'),
 items: [
 { label:'Assessments', href:'/dashboard/admin/assessments', icon: FileText, description:'Assessment catalog and analytics'},
 { label:'Practice', href:'/dashboard/admin/practice', icon: Brain, description:'Practice ecosystem controls'},
 { label:'Licenses', href:'/dashboard/admin/licenses', icon: Shield, description:'Subscription and entitlements'},
 ],
 },
 {
 title: t(locale,'dashboard.groups.admin'),
 items: [
 { label:'Profile', href:'/dashboard/admin/profile', icon: Users, description:'Personal admin settings'},
 { label:'Platform Settings', href:'/dashboard/admin/profile', icon: Settings, description:'Global platform defaults'},
 ],
 },
 ]
 const desktopNavRef = useRef<HTMLDivElement>(null)
 const allItems = (() => {
 const items = navGroups.flatMap((group) => group.items)
 const seen = new Set<string>()
 return items.filter((item) => {
 if (seen.has(item.href)) return false
 seen.add(item.href)
 return true
 })
 })()

 // Fetch profile data when component mounts
 useEffect(() => {
 const fetchProfile = async () => {
 if (user?.user_type ==='admin') {
 try {
 const data = await adminProfileService.getProfile()
 setProfileData(data)
 } catch (error) {
 console.error('Failed to fetch profile:', error)
 // Set profileData to null on error so it falls back to user object
 setProfileData(null)
 }
 }
 }

 fetchProfile()
 }, [user])

 const toggleMobileMenu = () => {
 setIsMobileMenuOpen(!isMobileMenuOpen)
 }

 const closeMobileMenu = () => {
 setIsMobileMenuOpen(false)
 }

 const handleLogout = () => {
 logout()
 closeMobileMenu()
 }

 useEffect(() => {
 if (!desktopNavRef.current) return
 const activeItem = desktopNavRef.current.querySelector('[data-sidebar-item="active"]')
 if (activeItem instanceof HTMLElement) {
 activeItem.scrollIntoView({
 block:'nearest',
 inline:'nearest',
 behavior:'smooth'})
 }
 }, [pathname])

 // Get display name from profile data
const getDisplayName = () => {
 // Prioritize profile data name
 if (profileData?.name && profileData.name.trim()) {
 return profileData.name
 }
 // Fall back to user name, but only if it's not an email
 if (user?.name && user.name.trim() && !user.name.includes('@')) {
 return user.name
 }
 // If user.name is email or missing, use a default
 return'Admin'}

 // Get display email
const getDisplayEmail = () => {
 return profileData?.email || user?.email ||'admin@example.com'}

 // Get profile picture
const getProfilePicture = () => {
 return profileData?.profile_picture || null
 }

 // Handle profile picture error
const handleImageError = () => {
 setImageError(true)
 }

 const railLinkClass = (isActive: boolean) =>
 cn(
 'flex h-11 w-11 shrink-0 items-center justify-center transition-all',
 isActive
 ?'rounded-none bg-white text-slate-800 shadow-none dark:bg-white dark:text-slate-900'
 :'text-slate-700 hover:text-slate-900 dark:text-emerald-200 dark:hover:text-white',
 )

 const renderMobileRow = (item: NavItem) => {
 const isActive = pathname === item.href
 return (
 <Link
 key={`${item.href}-${item.label}`}
 href={item.href}
 onClick={() => {
 closeMobileMenu()
 if (!isActive) startLoading()
 }}
 className={cn(
 'flex items-center gap-3 rounded-none px-3 py-3 text-sm font-medium transition-colors',
 isActive
 ?'bg-white text-slate-900 shadow-none dark:bg-emerald-900 dark:text-emerald-50'
 :'text-slate-700 hover:bg-slate-100 dark:text-emerald-200 dark:hover:bg-emerald-900',
 )}
 >
 <item.icon className="h-5 w-5 shrink-0" strokeWidth={1.75} />
 <div>
 <div>{item.label}</div>
 <div className="text-xs text-slate-500 dark:text-emerald-400">{item.description}</div>
 </div>
 </Link>
 )
 }

 return (
 <>
 <aside
 className={cn(
 'fixed inset-y-0 left-0 z-40 hidden w-16 flex-col bg-sage dark:bg-emerald-950 lg:flex',
 'rounded-none',
 className,
 )}
 >
 <nav className="flex min-h-0 flex-1 flex-col items-center px-0 py-4">
 <div
 ref={desktopNavRef}
 className="flex min-h-0 w-full flex-1 flex-col items-center gap-3 overflow-y-auto overflow-x-hidden px-2"
 >
 {allItems.map((item) => {
 const isActive = pathname === item.href
 return (
 <SidebarRailHoverCard
 key={`${item.href}-${item.label}`}
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

 <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-sage-deep bg-sage pb-safe dark:border-emerald-800 dark:bg-emerald-950 lg:hidden">
 <div className="grid grid-cols-5 gap-1 px-2 py-2">
 {allItems.slice(0, 4).map((item) => {
 const isActive = pathname === item.href
 const handleClick = () => {
 if (!isActive) startLoading()
 }
 return (
 <Link
 key={item.href}
 href={item.href}
 title={item.label}
 onClick={handleClick}
 className={railLinkClass(isActive)}
 >
 <item.icon className="h-5 w-5" strokeWidth={1.75} />
 </Link>
 )
 })}
 <button
 type="button"
 title={t(locale,'nav.adminNavigation')}
 onClick={toggleMobileMenu}
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
 onClick={closeMobileMenu}
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
 <h2 className="text-base font-semibold text-slate-800 dark:text-emerald-50">{t(locale,'nav.adminNavigation')}</h2>
 <button
 type="button"
 onClick={closeMobileMenu}
 className="flex h-9 w-9 items-center justify-center rounded-none bg-white text-slate-800 shadow-none dark:bg-emerald-900 dark:text-emerald-100"
 >
 <X className="h-5 w-5" strokeWidth={1.75} />
 </button>
 </div>

 <div className="flex-shrink-0 border-b border-slate-200 px-4 py-3 dark:border-emerald-800">
 <div className="flex items-center gap-3">
 <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full border border-slate-300 bg-white dark:border-emerald-700 dark:bg-emerald-900">
 {getProfilePicture() && !imageError ? (
 <Image
 src={getProfilePicture()}
 alt="Profile"
 width={40}
 height={40}
 className="h-full w-full object-cover"
 onError={handleImageError}
 />
 ) : getDisplayName() !=='Admin'? (
 <span className="text-sm font-semibold text-slate-800 dark:text-emerald-100">
 {getDisplayName().charAt(0).toUpperCase()}
 </span>
 ) : (
 <Shield className="h-5 w-5 text-slate-600 dark:text-emerald-300" strokeWidth={1.75} />
 )}
 </div>
 <div className="min-w-0 flex-1">
 <p className="truncate text-sm font-medium text-slate-900 dark:text-emerald-50">{getDisplayName()}</p>
 <p className="truncate text-xs text-slate-600 dark:text-emerald-300">{getDisplayEmail()}</p>
 </div>
 </div>
 </div>

 <nav className="min-h-0 flex-1 space-y-2 overflow-y-auto p-4">{allItems.map((item) => renderMobileRow(item))}</nav>

 <div className="border-t border-slate-200 p-4 dark:border-emerald-800">
 <button
 type="button"
 onClick={handleLogout}
 className="flex w-full items-center justify-center gap-2 rounded-none bg-white py-3 text-sm font-medium text-slate-800 shadow-none dark:bg-emerald-900 dark:text-emerald-50"
 >
 <LogOut className="h-5 w-5" strokeWidth={1.75} />
 <span>{t(locale,'dashboard.labels.logout')}</span>
 </button>
 </div>
 </motion.div>
 </motion.div>
 )}
 </AnimatePresence>
 </>
 )
}
