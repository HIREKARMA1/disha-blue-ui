"use client"// DEPRECATED LEGACY SURFACE:
// Kept only until final legacy-university retirement is completed.
import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
 LayoutDashboard,
 User,
 Users,
 Briefcase,
 FileText,
 X,
 Menu,
 LogOut,
 Brain,
 Award,
 type LucideIcon,
} from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { apiClient } from '@/lib/api'
import Image from 'next/image'
import { useLoading } from '@/contexts/LoadingContext'
import { cn } from '@/lib/utils'
import { SidebarRailHoverCard } from '@/components/dashboard/SidebarRailHoverCard'
interface NavItem {
 label: string
 href: string
 icon: LucideIcon
 description?: string
 color?: string
}

const navItems: NavItem[] = [
 {
 label:'Dashboard',
 href:'/dashboard/university',
 icon: LayoutDashboard,
 description:'Overview and analytics',
 color:''},
 {
 label:'Profile',
 href:'/dashboard/university/profile',
 icon: User,
 description:'University information & settings',
 color:''},
 {
 label:'Students',
 href:'/dashboard/university/students',
 icon: Users,
 description:'Manage student profiles',
 color:''},
 {
 label:'Jobs',
 href:'/dashboard/university/jobs',
 icon: Briefcase,
 description:'Browse and manage job opportunities',
 color:''},
 // TODO: Uncomment when practice module bugs are fixed
 {
 label:'Practice Tests',
 href:'/dashboard/university/practice',
 icon: Brain,
 description:'Manage practice tests & questions',
 color:''},
 {
 label:'Applications',
 href:'/dashboard/university/applications',
 icon: FileText,
 description:'Track student applications',
 color:''},
 {
 label:'Licenses',
 href:'/dashboard/university/licenses',
 icon: Award,
 description:'View your licenses',
 color:''}
]

interface UniversitySidebarProps {
 className?: string
}

export function UniversitySidebar({ className =''}: UniversitySidebarProps) {
 const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
 const [profileData, setProfileData] = useState<any>(null)
 const [isLoadingProfile, setIsLoadingProfile] = useState(false)
 const [imageError, setImageError] = useState(false)
 const pathname = usePathname()
 const { user, logout } = useAuth()
 const { startLoading } = useLoading()
 const desktopNavRef = useRef<HTMLDivElement>(null)

 // Fetch profile data when component mounts
 useEffect(() => {
 const fetchProfile = async () => {
 // Debug: Check what's in localStorage
const userData = localStorage.getItem('user_data')
 const token = localStorage.getItem('access_token')
 console.log('LocalStorage user_data:', userData)
 console.log('LocalStorage token:', token ?'exists':'missing')

 if ((user?.user_type as unknown as string) ==='university') {
 setIsLoadingProfile(true)
 try {
 const data = await apiClient.getUniversityProfile()
 console.log('University profile data:', data)

 // Map the API response to ensure we have the right field names
const mappedData = {
 ...data,
 name: data.name || data.university_name || user?.name ||'University Name',
 university_name: data.name || user?.name ||'University Name',
 email: data.email || user?.email ||'university@example.edu'}
 console.log('Mapped profile data:', mappedData)
 setProfileData(mappedData)
 } catch (error) {
 console.error('Failed to fetch profile:', error)
 // Don't set fallback data, let it remain null
 } finally {
 setIsLoadingProfile(false)
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
 console.log('Profile data for name:', profileData)
 console.log('User data for name:', user)
 return profileData?.name || profileData?.university_name || user?.name ||'Loading...'}

 // Get display email
const getDisplayEmail = () => {
 return profileData?.email || user?.email ||'Loading...'}

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
 key={item.href}
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
 {item.description && (
 <div className="text-xs text-slate-500 dark:text-emerald-400">{item.description}</div>
 )}
 </div>
 </Link>
 )
 }

 return (
 <>
 <aside
 className={cn(
 'fixed left-0 top-16 z-40 hidden h-[calc(100vh-4rem)] w-16 flex-col bg-sage dark:bg-emerald-950 lg:flex',
 'rounded-none',
 className,
 )}
 >
 <nav className="flex min-h-0 flex-1 flex-col items-center px-0 py-4">
 <div
 ref={desktopNavRef}
 className="flex min-h-0 w-full flex-1 flex-col items-center gap-3 overflow-y-auto overflow-x-hidden px-2"
 >
 {navItems.map((item) => {
 const isActive = pathname === item.href
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
 title="Logout"
 onClick={handleLogout}
 className="mt-3 flex h-11 w-11 shrink-0 items-center justify-center text-slate-700 transition-colors hover:text-slate-900 dark:text-emerald-200 dark:hover:text-white"
 >
 <LogOut className="h-5 w-5" strokeWidth={1.75} />
 </button>
 </nav>
 </aside>

 <div
 className="fixed bottom-0 left-0 right-0 z-50 border-t border-sage-deep bg-sage pb-safe dark:border-emerald-800 dark:bg-emerald-950 lg:hidden"
 style={{ touchAction:'none'}}
 >
 <div className="grid grid-cols-5 gap-1 px-2 py-2">
 {navItems.slice(0, 4).map((item) => {
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
 title="Menu"
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
 <div className="flex flex-shrink-0 items-center justify-between border-b border-slate-200 bg-sage px-4 py-4 dark:border-emerald-800 dark:bg-emerald-950">
 <h2 className="text-base font-semibold text-slate-800 dark:text-emerald-50">Menu</h2>
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
 ) : getDisplayName() !=='University Name'? (
 <span className="text-sm font-semibold text-slate-800 dark:text-emerald-100">
 {getDisplayName().charAt(0).toUpperCase()}
 </span>
 ) : (
 <User className="h-5 w-5 text-slate-600 dark:text-emerald-300" strokeWidth={1.75} />
 )}
 </div>
 <div className="min-w-0 flex-1">
 <p className="truncate text-sm font-medium text-slate-900 dark:text-emerald-50">{getDisplayName()}</p>
 <p className="truncate text-xs text-slate-600 dark:text-emerald-300">{getDisplayEmail()}</p>
 </div>
 </div>
 </div>

 <nav className="min-h-0 flex-1 space-y-2 overflow-y-auto p-4">{navItems.map((item) => renderMobileRow(item))}</nav>

 <div className="border-t border-slate-200 p-4 dark:border-emerald-800">
 <button
 type="button"
 onClick={handleLogout}
 className="flex w-full items-center justify-center gap-2 rounded-none bg-white py-3 text-sm font-medium text-slate-800 shadow-none dark:bg-emerald-900 dark:text-emerald-50"
 >
 <LogOut className="h-5 w-5" strokeWidth={1.75} />
 <span>Logout</span>
 </button>
 </div>
 </motion.div>
 </motion.div>
 )}
 </AnimatePresence>
 </>
 )
}






