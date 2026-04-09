"use client"

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
    LayoutDashboard,
    Briefcase,
    Users,
    FileText,
    X,
    Menu,
    LogOut,
    Building2,
    Search,
    Calendar,
    BarChart3
} from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { apiClient } from '@/lib/api'
import Image from 'next/image'
import { useLoading } from '@/contexts/LoadingContext'
import { cn } from '@/lib/utils'
import { useLocale } from '@/contexts/LocaleContext'
import { t } from '@/lib/i18n'

interface NavItem {
    label: string
    href: string
    icon: React.ComponentType<{ className?: string }>
    description: string
}

interface NavGroup {
    title: string
    items: NavItem[]
}

interface CorporateSidebarProps {
    className?: string
}

export function CorporateSidebar({ className = '' }: CorporateSidebarProps) {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
    const [profileData, setProfileData] = useState<any>(null)
    const [imageError, setImageError] = useState(false)
    const pathname = usePathname()
    const { user, logout } = useAuth()
    const { startLoading } = useLoading()
    const { locale } = useLocale()
    const navGroups: NavGroup[] = [
        {
            title: t(locale, 'dashboard.groups.overview'),
            items: [{ label: t(locale, 'common.dashboard'), href: '/dashboard/corporate', icon: LayoutDashboard, description: 'Hiring performance snapshot' }],
        },
        {
            title: t(locale, 'dashboard.groups.hiring'),
            items: [
                { label: 'Jobs', href: '/dashboard/corporate/jobs', icon: Briefcase, description: 'Create and manage postings' },
                { label: 'Applications', href: '/dashboard/corporate/applications', icon: FileText, description: 'Review applicants and stages' },
                { label: 'Candidates', href: '/dashboard/corporate/candidates', icon: Users, description: 'Central candidate workspace' },
                { label: 'Talent Search', href: '/dashboard/corporate/talent-search', icon: Search, description: 'Explore candidate supply' },
            ],
        },
        {
            title: t(locale, 'dashboard.groups.insights'),
            items: [
                { label: 'Interviews', href: '/dashboard/corporate/interviews', icon: Calendar, description: 'Scheduling and interview flow' },
                { label: 'Analytics', href: '/dashboard/corporate/analytics', icon: BarChart3, description: 'Role and funnel metrics' },
            ],
        },
        {
            title: t(locale, 'dashboard.groups.company'),
            items: [
                { label: 'Company Profile', href: '/dashboard/corporate/profile', icon: Building2, description: 'Brand and employer details' },
            ],
        },
    ]
    const allItems = navGroups.flatMap((group) => group.items)

    // Fetch profile data when component mounts
    useEffect(() => {
        const fetchProfile = async () => {
            if (user?.user_type === 'corporate') {
                try {
                    // TODO: Replace with actual corporate profile API call
                    const data = await apiClient.getCorporateProfile()
                    setProfileData(data)
                } catch (error) {
                    console.error('Failed to fetch profile:', error)
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

    // Get display name from profile data
    const getDisplayName = () => {
        return profileData?.name || user?.name || 'Employer Name'
    }

    // Get display email
    const getDisplayEmail = () => {
        return profileData?.email || user?.email || 'employer@company.com'
    }

    // Get profile picture
    const getProfilePicture = () => {
        return profileData?.profile_picture || null
    }

    // Handle profile picture error
    const handleImageError = () => {
        setImageError(true)
    }

    return (
        <>
            <aside className={`fixed inset-y-0 left-0 z-40 hidden w-[19rem] flex-col border-r border-border/70 bg-background/92 backdrop-blur-xl lg:flex ${className}`}>
                {/* User Profile Section */}
                <div className="border-b border-border/70 bg-gradient-to-br from-primary/10 via-background to-secondary/10 p-5">
                    <div className="flex items-center space-x-4">
                        <div className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-full border border-border bg-card">
                            {getProfilePicture() && !imageError ? (
                                <Image
                                    src={getProfilePicture()}
                                    alt="Company Logo"
                                    width={48}
                                    height={48}
                                    className="w-full h-full object-cover"
                                    onError={handleImageError}
                                />
                            ) : getDisplayName() !== 'Employer Name' ? (
                                <span className="text-foreground font-semibold text-lg">
                                    {getDisplayName().charAt(0).toUpperCase()}
                                </span>
                            ) : (
                                <Building2 className="w-6 h-6 text-muted-foreground" />
                            )}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-foreground truncate">
                                {getDisplayName()}
                            </p>
                            <p className="text-xs text-muted-foreground truncate">
                                {getDisplayEmail()}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Navigation */}
                <nav className="flex-1 overflow-y-auto p-4">
                    {navGroups.map((group) => (
                        <div key={group.title} className="mb-5 rounded-2xl border border-border/60 bg-card/55 p-2">
                            <p className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">{group.title}</p>
                            <div className="space-y-1.5">
                                {group.items.map((item) => {
                                    const isActive = pathname === item.href
                                    return (
                                        <Link
                                            key={item.href}
                                            href={item.href}
                                            onClick={() => !isActive && startLoading()}
                                            data-sidebar-item={isActive ? 'active' : 'inactive'}
                                            className={cn(
                                                'group flex items-start gap-3 rounded-xl border px-3 py-2.5 transition-all',
                                                isActive
                                                    ? 'border-primary/30 bg-primary/10 text-primary shadow-sm'
                                                    : 'border-transparent text-muted-foreground hover:border-border/80 hover:bg-muted/40 hover:text-foreground',
                                            )}
                                        >
                                            <div className={cn('rounded-lg p-1.5', isActive ? 'bg-primary/15' : 'bg-muted')}>
                                                <item.icon className="h-4 w-4" />
                                            </div>
                                            <div className="min-w-0 flex-1">
                                                <div className="text-sm font-medium">{item.label}</div>
                                                <div className={cn('mt-0.5 text-[11px]', isActive ? 'text-primary/90' : 'text-muted-foreground')}>
                                                    {item.description}
                                                </div>
                                            </div>
                                        </Link>
                                    )
                                })}
                            </div>
                        </div>
                    ))}
                </nav>

                {/* Logout Section */}
                <div className="border-t border-border/70 p-4">
                    <div className="mb-3 rounded-xl border border-border/70 bg-card/70 px-3 py-2">
                        <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">{t(locale, 'dashboard.labels.recruiterAccount')}</p>
                        <p className="mt-1 truncate text-xs text-foreground">{getDisplayEmail()}</p>
                    </div>
                    <button
                        onClick={handleLogout}
                        className="flex w-full items-center rounded-xl border border-destructive/20 bg-destructive/5 px-4 py-2.5 text-sm font-medium text-destructive transition-all hover:bg-destructive/10"
                    >
                        <div className="mr-3 rounded-lg bg-destructive/15 p-2">
                            <LogOut className="w-5 h-5" />
                        </div>
                        <span>{t(locale, 'dashboard.labels.logout')}</span>
                    </button>
                </div>
            </aside>

            {/* Mobile Bottom Navigation */}
            <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-border/70 bg-background/95 pb-safe shadow-[0_-10px_30px_rgba(0,0,0,0.08)] backdrop-blur-xl lg:hidden">
                <div className="grid grid-cols-5 gap-1 px-2 py-2">
                    {allItems.slice(0, 4).map((item) => {
                        const isActive = pathname === item.href

                        const handleClick = () => {
                            if (!isActive) {
                                startLoading()
                            }
                        }

                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                onClick={handleClick}
                                className={cn('flex items-center justify-center rounded-xl p-2.5 transition-all', isActive ? 'bg-primary/12 text-primary' : 'text-muted-foreground hover:bg-muted/50')}
                            >
                                <item.icon className="w-5 h-5 sm:w-6 sm:h-6" />
                            </Link>
                        )
                    })}
                    <button
                        onClick={toggleMobileMenu}
                        className="flex items-center justify-center rounded-xl p-2.5 text-muted-foreground transition-all hover:bg-muted/50"
                    >
                        <Menu className="w-5 h-5 sm:w-6 sm:h-6" />
                    </button>
                </div>
            </div>

            {/* Mobile Menu Overlay */}
            <AnimatePresence>
                {isMobileMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 bg-background/70 backdrop-blur-sm lg:hidden"
                        onClick={closeMobileMenu}
                    >
                        <motion.div
                            initial={{ x: '100%' }}
                            animate={{ x: 0 }}
                            exit={{ x: '100%' }}
                            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                            className="absolute right-0 top-0 flex h-full w-80 flex-col border-l border-border bg-background/95 shadow-xl backdrop-blur-xl"
                            onClick={(e) => e.stopPropagation()}
                        >
                            {/* Header */}
                            <div className="flex items-center justify-between border-b border-border p-5">
                                <h2 className="text-base font-semibold text-foreground">
                                    {t(locale, 'nav.recruiterNavigation')}
                                </h2>
                                <button
                                    onClick={closeMobileMenu}
                                    className="rounded-lg p-2 transition hover:bg-muted"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            {/* User Profile in Mobile */}
                            <div className="p-4 border-b border-border flex-shrink-0">
                                <div className="flex items-center space-x-3">
                                    <div className="w-10 h-10 bg-gradient-to-r from-primary to-secondary rounded-full flex items-center justify-center overflow-hidden">
                                        {getProfilePicture() && !imageError ? (
                                            <Image
                                                src={getProfilePicture()}
                                                alt="Company Logo"
                                                width={40}
                                                height={40}
                                                className="w-full h-full object-cover"
                                                onError={handleImageError}
                                            />
                                        ) : getDisplayName() !== 'Employer Name' ? (
                                            <span className="text-white font-semibold text-sm">
                                                {getDisplayName().charAt(0).toUpperCase()}
                                            </span>
                                        ) : (
                                            <Building2 className="w-5 h-5 text-white" />
                                        )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium text-foreground truncate">
                                            {getDisplayName()}
                                        </p>
                                        <p className="text-xs text-muted-foreground truncate">
                                            {getDisplayEmail()}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Navigation - Scrollable */}
                            <nav className="flex-1 overflow-y-auto p-4 space-y-2 min-h-0">
                                {allItems.map((item) => {
                                    const isActive = pathname === item.href

                                    const handleClick = () => {
                                        closeMobileMenu()
                                        if (!isActive) {
                                            startLoading()
                                        }
                                    }

                                    return (
                                        <Link
                                            key={item.href}
                                            href={item.href}
                                            onClick={handleClick}
                                            className={cn(
                                                'flex items-start gap-3 rounded-xl border px-3 py-2.5 text-sm transition-all',
                                                isActive
                                                    ? 'border-primary/30 bg-primary/10 text-primary'
                                                    : 'border-transparent text-muted-foreground hover:border-border/80 hover:bg-muted/40 hover:text-foreground',
                                            )}
                                        >
                                            <item.icon className="h-4 w-4 mt-0.5" />
                                            <div>
                                                <div className="font-medium">{item.label}</div>
                                                <div className={cn('text-xs mt-0.5', isActive ? 'text-primary/90' : 'text-muted-foreground')}>{item.description}</div>
                                            </div>
                                        </Link>
                                    )
                                })}
                            </nav>

                            {/* Logout in Mobile */}
                            <div className="p-4 border-t border-border flex-shrink-0">
                                <button onClick={handleLogout} className="w-full flex items-center rounded-xl border border-destructive/20 bg-destructive/5 px-3 py-3 text-sm font-medium text-destructive hover:bg-destructive/10 transition-all duration-200">
                                    <LogOut className="w-5 h-5 mr-3" />
                                    <span>{t(locale, 'dashboard.labels.logout')}</span>
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    )
}
