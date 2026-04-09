"use client"

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useTheme } from 'next-themes'
import { usePathname } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { Button } from '@/components/ui/button'
import { ThemeToggle } from '@/components/ui/theme-toggle'
import {
    Menu,
    X,
    User,
    Building2,
    Shield,
    LogOut,
    Briefcase
} from 'lucide-react'
import { BRANDING } from '@/config/branding'
import { t } from '@/lib/i18n'
import { useLocale } from '@/contexts/LocaleContext'
import { LanguageSwitcher } from '@/components/ui/language-switcher'

interface NavbarProps {
    variant?: 'default' | 'transparent' | 'solid'
    className?: string
}

export function Navbar({
    variant = 'default',
    className = ""
}: NavbarProps) {
    const { user, isAuthenticated, isLoading, logout } = useAuth()
    const { theme, resolvedTheme } = useTheme()
    const pathname = usePathname()
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
    const { locale } = useLocale()

    // Helper function to get auth links with redirect
    const getAuthLink = (basePath: string) => {
        // Don't add redirect for auth pages themselves
        if (pathname?.startsWith('/auth/') || pathname === '/') {
            return basePath
        }
        return `${basePath}?redirect=${encodeURIComponent(pathname || '')}`
    }

    const handleLogout = () => {
        logout()
        setIsMobileMenuOpen(false)
    }

    const getDashboardPath = () => {
        if (!user) return '/dashboard'
        return `/dashboard/${user.user_type}`
    }

    const getUserTypeIcon = () => {
        switch (user?.user_type) {
            case 'student':
                return User
            case 'corporate':
                return Building2
            case 'admin':
                return Shield
            default:
                return Shield
        }
    }

    const isDashboardRoute = pathname?.startsWith('/dashboard')
    const isStudentDashboardRoute = pathname?.startsWith('/dashboard/student')
    const isStudentProfileRoute = pathname?.startsWith('/dashboard/student/profile')
    const isPublicMarketingRoute = !isDashboardRoute && !pathname?.startsWith('/auth')
    const dashboardSegments = (pathname || '').split('/').filter(Boolean)
    const dashboardSection = dashboardSegments[2]
        ? dashboardSegments[2].replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
        : 'Overview'
    const dashboardRoleLabel =
        user?.user_type === 'student'
            ? 'Student'
            : user?.user_type === 'corporate'
                ? 'Recruiter'
                : user?.user_type === 'admin'
                    ? 'Admin'
                    : 'Workspace'

    const navLinks = isPublicMarketingRoute
        ? [
            { href: '/', label: 'Home' },
            { href: '/jobs', label: 'Jobs' },
            { href: '/auth/register?type=student', label: 'For Students' },
            { href: '/auth/register?type=corporate', label: 'For Employers' },
            { href: '/#features', label: 'AI Tools' },
            { href: '/#about', label: 'About' },
            { href: `mailto:${BRANDING.supportEmail}`, label: 'Contact', external: true },
        ]
        : [
            { href: '/', label: t(locale, 'nav.home') },
            { href: '/jobs', label: t(locale, 'nav.jobs') },
            { href: '/auth/register?type=student', label: t(locale, 'nav.forStudents') },
            { href: '/auth/register?type=corporate', label: t(locale, 'nav.forEmployers') },
            { href: '/#about', label: t(locale, 'nav.about') },
            { href: `mailto:${BRANDING.supportEmail}`, label: t(locale, 'nav.contact'), external: true },
        ]

    const getNavbarClasses = () => {
        const baseClasses = "w-full z-50 transition-all duration-300 fixed top-0 left-0 right-0"

        switch (variant) {
            case 'transparent':
                return `${baseClasses} bg-background/95 backdrop-blur-md shadow-soft border-b border-border/70`
            case 'solid':
                return `${baseClasses} bg-background shadow-medium border-b border-border`
            default:
                return `${baseClasses} bg-background/95 backdrop-blur-md shadow-soft border-b border-border/70`
        }
    }

    const getLogoSrc = () => {
        const isDark = resolvedTheme === 'dark' || (resolvedTheme === 'system' && theme === 'dark')
        return isDark ? BRANDING.logoDark : BRANDING.logoLight
    }

    if (isLoading) {
        return (
            <nav className={`main-navbar ${getNavbarClasses()} ${className}`}>
                <div className="container mx-auto px-4 py-4">
                    <div className="flex items-center justify-between">
                        {/* Logo */}
                        <div className="flex items-center">
                            <Link href="/auth/login" className="flex items-center">
                                <Image
                                    src={getLogoSrc()}
                                    alt={`${BRANDING.appName} logo`}
                                    width={150}
                                    height={50}
                                    className="h-8 w-auto sm:h-10 md:h-12 lg:h-11 object-contain"
                                    priority
                                />
                            </Link>
                        </div>

                        {/* Loading state */}
                        <div className="flex items-center space-x-4">
                            <div className="w-4 h-4 border-2 border-border border-t-primary rounded-full animate-spin"></div>
                            <ThemeToggle />
                        </div>
                    </div>
                </div>
            </nav>
        )
    }

    return (
        <nav className={`main-navbar ${getNavbarClasses()} ${className}`}>
            <div className="container mx-auto px-4 py-3 sm:px-6">
                <div className="flex items-center gap-4 lg:gap-6">
                    {/* Logo */}
                    <div className="flex shrink-0 items-center gap-2 sm:gap-3 md:gap-4">
                        <Link href={isAuthenticated ? getDashboardPath() : "/"} className="flex items-center">
                            <Image
                                src={getLogoSrc()}
                                alt={`${BRANDING.appName} logo`}
                                width={150}
                                height={50}
                                className="h-8 w-auto sm:h-10 md:h-12 lg:h-11 object-contain"
                                priority
                            />
                        </Link>
                    </div>

                    {/* Desktop Navigation */}
                    <div className="hidden min-w-0 flex-1 items-center justify-end gap-4 lg:flex">
                        {isDashboardRoute && !isStudentProfileRoute ? (
                            <div className="flex flex-1 items-center justify-center">
                                <div className="inline-flex items-center gap-2 rounded-full border border-border/70 bg-muted/30 px-3 py-1.5 text-xs font-medium text-muted-foreground">
                                    <span className="rounded-full bg-primary/12 px-2 py-0.5 text-primary">{dashboardRoleLabel}</span>
                                    <span>{dashboardSection}</span>
                                </div>
                            </div>
                        ) : (
                        <nav className="flex flex-1 items-center justify-center gap-2 rounded-full border border-border/70 bg-muted/30 px-3 py-1.5">
                        {/* About Dropdown */}
                        {/* <div className="relative group">
                            <Button
                                variant="ghost"
                                className="flex items-center space-x-1 text-gray-700 dark:text-gray-300 hover:text-primary-500 dark:hover:text-primary-400"
                                onMouseEnter={() => handleDropdownEnter('about')}
                                onMouseLeave={() => handleDropdownLeave('about')}
                            >
                                <span>About</span>
                                <ChevronDown className="w-4 h-4" />
                            </Button>

                            {isAboutOpen && (
                                <div
                                    className="absolute top-full left-0 mt-1 w-64 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-2 z-50"
                                    onMouseEnter={() => handleDropdownEnter('about')}
                                    onMouseLeave={() => handleDropdownLeave('about')}
                                >
                                    <Link href="/about/why-hirekarma" className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-primary-500 dark:hover:text-primary-400">
                                        <div className="flex items-center space-x-2">
                                            <Target className="w-4 h-4" />
                                            <span>Why HireKarma</span>
                                        </div>
                                    </Link>
                                    <Link href="/about/mission-vision" className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-primary-500 dark:hover:text-primary-400">
                                        <div className="flex items-center space-x-2">
                                            <Eye className="w-4 h-4" />
                                            <span>Mission & Vision</span>
                                        </div>
                                    </Link>
                                </div>
                            )}
                        </div> */}

                        {/* Solutions Dropdown */}
                        {/* <div className="relative group">
                            <Button
                                variant="ghost"
                                className="flex items-center space-x-1 text-gray-700 dark:text-gray-300 hover:text-primary-500 dark:hover:text-primary-400"
                                onMouseEnter={() => handleDropdownEnter('solutions')}
                                onMouseLeave={() => handleDropdownLeave('solutions')}
                            >
                                <span>Solutions</span>
                                <ChevronDown className="w-4 h-4" />
                            </Button>

                            {isSolutionsOpen && (
                                <div
                                    className="absolute top-full left-0 mt-1 w-72 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-2 z-50"
                                    onMouseEnter={() => handleDropdownEnter('solutions')}
                                    onMouseLeave={() => handleDropdownLeave('solutions')}
                                >
                                    <Link href="/solutions/campus-placement" className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-primary-500 dark:hover:text-primary-400">
                                        <div className="flex items-center space-x-2">
                                            <Cap className="w-4 h-4" />
                                            <div>
                                                <div className="font-medium">Campus Placement</div>
                                                <div className="text-xs text-gray-500 dark:text-gray-400">Hire the best from top colleges</div>
                                            </div>
                                        </div>
                                    </Link>
                                    <Link href="/solutions/skill-development" className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-primary-500 dark:hover:text-primary-400">
                                        <div className="flex items-center space-x-2">
                                            <BookOpen className="w-4 h-4" />
                                            <div>
                                                <div className="font-medium">Skill Development</div>
                                                <div className="text-xs text-gray-500 dark:text-gray-400">Upskilling talent with job-ready skills</div>
                                            </div>
                                        </div>
                                    </Link>
                                    <Link href="/solutions/lateral-hiring" className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-primary-500 dark:hover:text-primary-400">
                                        <div className="flex items-center space-x-2">
                                            <Users className="w-4 h-4" />
                                            <div>
                                                <div className="font-medium">Lateral Hiring</div>
                                                <div className="text-xs text-gray-500 dark:text-gray-400">Hire experienced talent with ease</div>
                                            </div>
                                        </div>
                                    </Link>
                                    <Link href="/solutions/general-staffing" className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-primary-500 dark:hover:text-primary-400">
                                        <div className="flex items-center space-x-2">
                                            <Wrench className="w-4 h-4" />
                                            <div>
                                                <div className="font-medium">General Staffing</div>
                                                <div className="text-xs text-gray-500 dark:text-gray-400">On-demand staffing for all business needs</div>
                                            </div>
                                        </div>
                                    </Link>
                                </div>
                            )}
                        </div> */}

                        {/* Resources Dropdown */}
                        {/* <div className="relative group">
                            <Button
                                variant="ghost"
                                className="flex items-center space-x-1 text-gray-700 dark:text-gray-300 hover:text-primary-500 dark:hover:text-primary-400"
                                onMouseEnter={() => handleDropdownEnter('resources')}
                                onMouseLeave={() => handleDropdownLeave('resources')}
                            >
                                <span>Resources</span>
                                <ChevronDown className="w-4 h-4" />
                            </Button>

                            {isResourcesOpen && (
                                <div
                                    className="absolute top-full left-0 mt-1 w-64 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-2 z-50"
                                    onMouseEnter={() => handleDropdownEnter('resources')}
                                    onMouseLeave={() => handleDropdownLeave('resources')}
                                >
                                    <Link href="/resources/moments-corner" className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-primary-500 dark:hover:text-primary-400">
                                        <div className="flex items-center space-x-2">
                                            <Calendar className="w-4 h-4" />
                                            <span>Moments Corner</span>
                                        </div>
                                    </Link>
                                    <Link href="/resources/insights" className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-primary-500 dark:hover:text-primary-400">
                                        <div className="flex items-center space-x-2">
                                            <BarChart3 className="w-4 h-4" />
                                            <span>Insights</span>
                                        </div>
                                    </Link>
                                </div>
                            )}
                        </div> */}

                        {navLinks.map((item) =>
                            item.external ? (
                                <a
                                    key={item.label}
                                    href={item.href}
                                    className={`rounded-full px-3 py-1.5 text-sm font-medium transition-colors ${pathname === item.href ? 'bg-background text-foreground shadow-soft' : 'text-muted-foreground hover:text-foreground'}`}
                                >
                                    {item.label}
                                </a>
                            ) : (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    className={`rounded-full px-3 py-1.5 text-sm font-medium transition-colors ${pathname === item.href ? 'bg-background text-foreground shadow-soft' : 'text-muted-foreground hover:text-foreground'}`}
                                >
                                    {item.label}
                                </Link>
                            )
                        )}
                        </nav>
                        )}

                        <div className="flex shrink-0 items-center gap-2">
                        {/* Auth Buttons */}
                        {isAuthenticated && user ? (
                            <div className="flex items-center gap-2">
                                {!isDashboardRoute && (
                                    <Link href={getDashboardPath()}>
                                        <Button className="flex items-center gap-2">
                                            {(() => {
                                                const IconComponent = getUserTypeIcon()
                                                return <IconComponent className="w-4 h-4" />
                                            })()}
                                            <span>{t(locale, 'common.dashboard')}</span>
                                        </Button>
                                    </Link>
                                )}

                                {!isStudentDashboardRoute && user?.user_type !== 'corporate' && (
                                    <Button
                                        variant="ghost"
                                        onClick={handleLogout}
                                        className="flex items-center gap-2 text-destructive hover:bg-destructive/10 hover:text-destructive"
                                    >
                                        <LogOut className="w-4 h-4" />
                                        <span>{t(locale, 'common.logout')}</span>
                                    </Button>
                                )}
                            </div>
                        ) : (
                            <>
                                {isPublicMarketingRoute ? (
                                    <div className="flex items-center gap-2 rounded-full border border-border/80 bg-card/80 px-2 py-1 shadow-soft">
                                        <Link href={getAuthLink('/auth/login')} className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground">
                                            {t(locale, 'common.signIn')}
                                        </Link>
                                        <Link href="/auth/register?type=student">
                                            <Button variant="outline" className="h-9 rounded-full border-2 px-4">Find Jobs</Button>
                                        </Link>
                                        <Link href="/auth/register?type=corporate">
                                            <Button className="h-9 rounded-full bg-gradient-to-r from-primary to-secondary px-4 text-primary-foreground">Post Jobs</Button>
                                        </Link>
                                    </div>
                                ) : (
                                    <div className="flex items-center gap-2">
                                        <Link href={getAuthLink('/auth/login')}>
                                            <Button variant="outline" className="border-2 px-5">
                                                {t(locale, 'common.signIn')}
                                            </Button>
                                        </Link>
                                        <Link href={getAuthLink('/auth/register')}>
                                            <Button className="px-5">{t(locale, 'common.signUp')}</Button>
                                        </Link>
                                    </div>
                                )}
                            </>
                        )}

                        <LanguageSwitcher />
                        {!isStudentProfileRoute && <ThemeToggle />}
                        </div>
                    </div>

                    {/* Mobile Menu Button */}
                    <div className="ml-auto flex items-center gap-2 lg:hidden">
                        {!isStudentProfileRoute && <ThemeToggle />}
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                            className="rounded-full border border-border/70 bg-card/80 p-2"
                        >
                            {isMobileMenuOpen ? (
                                <X className="w-5 h-5" />
                            ) : (
                                <Menu className="w-5 h-5" />
                            )}
                        </Button>
                    </div>
                </div>

                {/* Mobile Menu */}
                {isMobileMenuOpen && (
                    <div className="absolute left-0 right-0 top-full border-t border-border bg-background/95 shadow-medium backdrop-blur-xl lg:hidden">
                        <div className="flex flex-col space-y-3 p-4">
                            <div className="space-y-2">
                                {navLinks.map((item) =>
                                    item.external ? (
                                        <a key={item.label} href={item.href} onClick={() => setIsMobileMenuOpen(false)}>
                                            <Button variant="ghost" className="w-full justify-start">{item.label}</Button>
                                        </a>
                                    ) : (
                                        <Link key={item.href} href={item.href} onClick={() => setIsMobileMenuOpen(false)}>
                                            <Button variant="ghost" className="w-full justify-start">{item.label}</Button>
                                        </Link>
                                    )
                                )}
                            </div>

                            {/* Auth Section */}
                            {isAuthenticated && user ? (
                                <>
                                    <div className="pt-2 border-t border-border">
                                        <Link href={getDashboardPath()} onClick={() => setIsMobileMenuOpen(false)}>
                                            <Button className="w-full justify-start">
                                                {(() => {
                                                    const IconComponent = getUserTypeIcon()
                                                    return <IconComponent className="w-4 h-4 mr-2" />
                                                })()}
                                                {t(locale, 'common.dashboard')}
                                            </Button>
                                        </Link>
                                    </div>
                                    {user?.user_type !== 'corporate' && (
                                        <Button
                                            variant="ghost"
                                            onClick={handleLogout}
                                            className="w-full justify-start text-destructive hover:text-destructive hover:bg-destructive/10"
                                        >
                                            <LogOut className="w-4 h-4 mr-2" />
                                            {t(locale, 'common.logout')}
                                        </Button>
                                    )}
                                </>
                            ) : (
                                <div className="space-y-3 border-t border-border pt-2">
                                    <Link href={getAuthLink('/auth/login')} onClick={() => setIsMobileMenuOpen(false)}>
                                        <Button variant="outline" className="w-full justify-center border-2">
                                            {t(locale, 'common.signIn')}
                                        </Button>
                                    </Link>
                                    {isPublicMarketingRoute ? (
                                        <>
                                            <Link href="/auth/register?type=student" onClick={() => setIsMobileMenuOpen(false)}>
                                                <Button variant="outline" className="w-full justify-center border-2">Find Jobs</Button>
                                            </Link>
                                            <Link href="/auth/register?type=corporate" onClick={() => setIsMobileMenuOpen(false)}>
                                                <Button className="w-full justify-center">Post Jobs</Button>
                                            </Link>
                                        </>
                                    ) : (
                                        <Link href={getAuthLink('/auth/register')} onClick={() => setIsMobileMenuOpen(false)}>
                                            <Button className="w-full justify-center">{t(locale, 'common.signUp')}</Button>
                                        </Link>
                                    )}
                                </div>
                            )}
                            <div className="pt-2 border-t border-border">
                                <label className="block text-xs text-muted-foreground mb-2">{t(locale, 'nav.language')}</label>
                                <LanguageSwitcher compact />
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </nav>
    )
}