"use client"

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
    Compass,
    LayoutDashboard,
    UserCircle2,
    FileText,
    Target,
    Library,
    X,
    Menu,
    LogOut,
    Brain,
    ClipboardList,
    Sparkles,
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

interface StudentSidebarProps {
    className?: string
}

export function StudentSidebar({ className = '' }: StudentSidebarProps) {
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
            items: [{ label: t(locale, 'common.dashboard'), href: '/dashboard/student', icon: LayoutDashboard, description: 'Your career control center' }],
        },
        {
            title: t(locale, 'dashboard.groups.jobs'),
            items: [
                { label: 'Discover Jobs', href: '/dashboard/student/jobs', icon: Compass, description: 'Local and personalized roles' },
                { label: 'Applications', href: '/dashboard/student/applications', icon: ClipboardList, description: 'Track your pipeline status' },
            ],
        },
        {
            title: t(locale, 'dashboard.groups.careerTools'),
            items: [
                { label: 'Resume Builder', href: '/dashboard/student/resume-builder', icon: FileText, description: 'Craft and iterate quickly' },
                { label: 'Build with AI ✨', href: '/dashboard/student/resume/ai', icon: Sparkles, description: 'Voice, text, and file-powered resume' },
                { label: 'Career Align', href: '/dashboard/student/career-align', icon: Target, description: 'Get role-fit guidance' },
                { label: 'Practice', href: '/dashboard/student/practice', icon: Brain, description: 'Mock tests and assessments' },
                { label: 'Video Search', href: '/dashboard/student/video-search', icon: Sparkles, description: 'Learn from short explainers' },
                { label: 'Library', href: '/dashboard/student/library', icon: Library, description: 'Career resources and docs' },
            ],
        },
        {
            title: t(locale, 'dashboard.groups.account'),
            items: [
                { label: 'Profile', href: '/dashboard/student/profile', icon: UserCircle2, description: 'Personal details and identity' },
            ],
        },
    ]
    const allItems = navGroups.flatMap((group) => group.items)

    useEffect(() => {
        const fetchProfile = async () => {
            if (user?.user_type === 'student') {
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

    const getDisplayName = () => profileData?.name?.trim() || user?.name || 'Student'
    const getDisplayEmail = () => profileData?.email || user?.email || 'student@university.edu'
    const getProfilePicture = () => profileData?.profile_picture || null

    const renderNavItem = (item: NavItem, mobile = false) => {
        const isActive = pathname === item.href
        return (
            <Link
                key={item.href}
                href={item.href}
                onClick={() => {
                    if (!isActive) startLoading()
                    if (mobile) setIsMobileMenuOpen(false)
                }}
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
    }

    const handleLogout = () => {
        logout()
        setIsMobileMenuOpen(false)
    }

    return (
        <>
            <aside className={cn('fixed inset-y-0 left-0 z-40 hidden w-[19rem] flex-col border-r border-border/70 bg-background/92 backdrop-blur-xl lg:flex', className)}>
                <div className="border-b border-border/70 bg-gradient-to-br from-primary/10 via-background to-secondary/10 p-5">
                    <div className="flex items-center gap-4">
                        <div className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-full border border-border bg-card">
                            {getProfilePicture() && !imageError ? (
                                <Image
                                    src={getProfilePicture()}
                                    alt="Profile"
                                    width={48}
                                    height={48}
                                    className="h-full w-full object-cover"
                                    onError={() => setImageError(true)}
                                />
                            ) : (
                                <span className="text-lg font-semibold text-foreground">{getDisplayName().charAt(0).toUpperCase()}</span>
                            )}
                        </div>
                        <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-semibold text-foreground">{getDisplayName()}</p>
                            <p className="truncate text-xs text-muted-foreground">{getDisplayEmail()}</p>
                        </div>
                    </div>
                </div>

                <nav className="flex-1 overflow-y-auto p-4">
                    {navGroups.map((group) => (
                        <div key={group.title} className="mb-5 rounded-2xl border border-border/60 bg-card/55 p-2">
                            <p className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">{group.title}</p>
                            <div className="space-y-1.5">{group.items.map((item) => renderNavItem(item))}</div>
                        </div>
                    ))}
                </nav>

                <div className="border-t border-border/70 p-4">
                    <div className="mb-3 rounded-xl border border-border/70 bg-card/70 px-3 py-2">
                        <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">{t(locale, 'dashboard.labels.studentAccount')}</p>
                        <p className="mt-1 truncate text-xs text-foreground">{getDisplayEmail()}</p>
                    </div>
                    <button
                        onClick={handleLogout}
                        className="flex w-full items-center rounded-xl border border-destructive/20 bg-destructive/5 px-4 py-2.5 text-sm font-medium text-destructive transition-all hover:bg-destructive/10"
                    >
                        <span className="mr-3 rounded-lg bg-destructive/15 p-2">
                            <LogOut className="h-5 w-5" />
                        </span>
                        {t(locale, 'dashboard.labels.logout')}
                    </button>
                </div>
            </aside>

            <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-border/70 bg-background/95 pb-safe shadow-[0_-10px_30px_rgba(0,0,0,0.08)] backdrop-blur-xl lg:hidden">
                <div className="grid grid-cols-5 gap-1 px-2 py-2">
                    {allItems.slice(0, 4).map((item) => {
                        const isActive = pathname === item.href
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                onClick={() => !isActive && startLoading()}
                                className={cn('flex items-center justify-center rounded-xl p-2.5 transition-all', isActive ? 'bg-primary/12 text-primary' : 'text-muted-foreground hover:bg-muted/50')}
                            >
                                <item.icon className="h-5 w-5" />
                            </Link>
                        )
                    })}
                    <button onClick={() => setIsMobileMenuOpen(true)} className="flex items-center justify-center rounded-xl p-2.5 text-muted-foreground transition-all hover:bg-muted/50">
                        <Menu className="h-5 w-5" />
                    </button>
                </div>
            </div>

            <AnimatePresence>
                {isMobileMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 bg-background/70 backdrop-blur-sm lg:hidden"
                        onClick={() => setIsMobileMenuOpen(false)}
                    >
                        <motion.div
                            initial={{ x: '100%' }}
                            animate={{ x: 0 }}
                            exit={{ x: '100%' }}
                            transition={{ type: 'spring', damping: 25, stiffness: 220 }}
                            className="absolute right-0 top-0 flex h-full w-80 flex-col border-l border-border bg-background/95 shadow-xl backdrop-blur-xl"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="flex items-center justify-between border-b border-border p-5">
                                <h2 className="text-base font-semibold text-foreground">{t(locale, 'nav.studentNavigation')}</h2>
                                <button onClick={() => setIsMobileMenuOpen(false)} className="rounded-lg p-2 transition hover:bg-muted">
                                    <X className="h-5 w-5" />
                                </button>
                            </div>

                            <div className="border-b border-border p-4">
                                <p className="truncate text-sm font-semibold text-foreground">{getDisplayName()}</p>
                                <p className="truncate text-xs text-muted-foreground">{getDisplayEmail()}</p>
                            </div>

                            <nav className="flex-1 space-y-2 overflow-y-auto p-4">{allItems.map((item) => renderNavItem(item, true))}</nav>

                            <div className="border-t border-border p-4">
                                <button
                                    onClick={handleLogout}
                                    className="flex w-full items-center rounded-xl border border-destructive/20 bg-destructive/5 px-3 py-3 text-sm font-medium text-destructive hover:bg-destructive/10"
                                >
                                    <LogOut className="mr-3 h-5 w-5" />
                                    {t(locale, 'dashboard.labels.logout')}
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    )
}
