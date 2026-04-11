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
} from 'lucide-react'
import { BRANDING } from '@/config/branding'
import { t } from '@/lib/i18n'
import { useLocale } from '@/contexts/LocaleContext'
import { LanguageSwitcher } from '@/components/ui/language-switcher'
import { cn } from '@/lib/utils'

interface NavbarProps {
  variant?: 'default' | 'transparent' | 'solid'
  className?: string
  /** Logo as text, no menu icons, text theme control—home marketing page only. */
  textOnly?: boolean
}

export function Navbar({
  variant = 'default',
  className = "",
  textOnly = false,
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
  /** Full marketing nav + Sign in / Find jobs / Post jobs on every non-dashboard route (home, jobs, auth, about, etc.). */
  const showMarketingAuthCluster = !isDashboardRoute
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

  const fullMarketingNavLinks = [
  { href: '/', label: t(locale, 'nav.home') },
  { href: '/jobs', label: t(locale, 'nav.jobs') },
  { href: '/auth/register?type=student', label: t(locale, 'nav.forStudents') },
  { href: '/auth/register?type=corporate', label: t(locale, 'nav.forEmployers') },
  { href: '/#features', label: t(locale, 'nav.aiTools') },
  { href: '/#about', label: t(locale, 'nav.about') },
  { href: `mailto:${BRANDING.supportEmail}`, label: t(locale, 'nav.contact'), external: true },
  ]

  const navLinks = fullMarketingNavLinks

  const isTransparentVariant = variant === 'transparent'

  const getNavbarClasses = () => {
  if (isTransparentVariant) {
  return (
  'w-full z-50 fixed top-0 left-0 right-0 border-b border-slate-200/90 border-t-[3px] border-t-sage-deep bg-white/92 shadow-[0_4px_24px_-6px_rgba(15,23,42,0.09)] backdrop-blur-md dark:border-emerald-800/65 dark:border-t-emerald-500/85 dark:bg-emerald-950/92 dark:shadow-none'
  )
  }
  return (
  'w-full z-50 fixed top-0 left-0 right-0 border-t-[3px] border-t-sage-deep border-b border-b-sage-deep/90 bg-sage shadow-[0_4px_24px_-6px_rgba(15,23,42,0.06)] dark:border-t-emerald-500/80 dark:border-b-emerald-900/90 dark:bg-emerald-950 dark:shadow-none'
  )
  }

  const marketingNavInnerClass = isTransparentVariant
  ? 'border border-slate-200/90 bg-white/88 shadow-[0_4px_24px_-6px_rgba(15,23,42,0.06)] dark:border-emerald-800/65 dark:bg-emerald-900/40 dark:shadow-none'
  : 'border border-sage-deep/50 bg-white/40 shadow-sm dark:border-emerald-800/60 dark:bg-emerald-900/50'

  const marketingAuthClusterClass = isTransparentVariant
  ? 'border border-slate-200/90 bg-white/90 shadow-[0_4px_24px_-6px_rgba(15,23,42,0.06)] dark:border-emerald-800/65 dark:bg-emerald-900/45 dark:shadow-none'
  : 'border border-sage-deep/50 bg-white/45 shadow-sm dark:border-emerald-800/60 dark:bg-emerald-900/55'

  const marketingNavLinkClass = (href: string) => {
  const active = pathname === href
  if (isTransparentVariant) {
  return cn(
  'rounded-lg px-3 py-1.5 text-sm font-medium transition-colors',
  active
  ? 'bg-sage/25 text-slate-900 shadow-sm dark:bg-emerald-800 dark:text-white'
  : 'text-slate-900 hover:bg-sage/15 hover:text-sage-deep dark:text-emerald-50 dark:hover:bg-emerald-800/65 dark:hover:text-white',
  )
  }
  return cn(
  'rounded-lg px-3 py-1.5 text-sm font-medium transition-colors',
  active
  ? 'bg-white/95 text-slate-900 shadow-sm ring-1 ring-sage-deep/25 dark:bg-emerald-800 dark:text-white dark:ring-emerald-600/50'
  : 'text-slate-900 hover:bg-white/60 hover:text-slate-950 dark:text-emerald-50 dark:hover:bg-emerald-800/70 dark:hover:text-white',
  )
  }

  const mobileNavItemGhostClass = isTransparentVariant
  ? 'text-slate-900 hover:bg-sage/15 hover:text-sage-deep dark:text-emerald-50 dark:hover:bg-emerald-800/60 dark:hover:text-white'
  : 'text-slate-900 hover:bg-white/50 hover:text-slate-950 dark:text-emerald-50 dark:hover:bg-emerald-800/65 dark:hover:text-white'

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
  {textOnly ? (
  <span className="font-display text-lg font-semibold text-slate-900 dark:text-emerald-50">{BRANDING.appName}</span>
  ) : (
  <Image
  src={getLogoSrc()}
  alt={`${BRANDING.appName} logo`}
  width={150}
  height={50}
  className="h-8 w-auto sm:h-10 md:h-12 lg:h-11 object-contain"
  priority
  />
  )}
  </Link>
  </div>

  {/* Loading state */}
  <div className="flex items-center space-x-4">
  {!textOnly && (
  <div className="h-4 w-4 animate-spin rounded-none border-2 border-sage-deep border-t-white dark:border-emerald-700 dark:border-t-emerald-200"></div>
  )}
  <ThemeToggle variant={isTransparentVariant ? 'surface' : 'bar'} labelsOnly={textOnly} />
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
  {textOnly ? (
  <span className="font-display text-lg font-semibold text-slate-900 dark:text-emerald-50">{BRANDING.appName}</span>
  ) : (
  <Image
  src={getLogoSrc()}
  alt={`${BRANDING.appName} logo`}
  width={150}
  height={50}
  className="h-8 w-auto sm:h-10 md:h-12 lg:h-11 object-contain"
  priority
  />
  )}
  </Link>
  </div>

  {/* Desktop Navigation */}
  <div className="hidden min-w-0 flex-1 items-center justify-end gap-4 lg:flex">
  {isDashboardRoute && !isStudentProfileRoute ? (
  <div className="flex flex-1 items-center justify-center">
  <div className="inline-flex items-center gap-2 rounded-2xl border border-sage-deep/50 bg-white/40 px-3 py-1.5 text-xs font-medium text-slate-900 shadow-sm dark:border-emerald-800/65 dark:bg-emerald-900/60 dark:text-emerald-50">
  <span className="rounded-none bg-sage-deep px-2 py-0.5 font-semibold text-white dark:bg-emerald-700 dark:text-white">{dashboardRoleLabel}</span>
  <span className="text-slate-900 dark:text-emerald-50">{dashboardSection}</span>
  </div>
  </div>
  ) : (
  <nav className={cn('flex flex-1 items-center justify-center gap-1 rounded-2xl px-2 py-1', marketingNavInnerClass)}>
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
  className={marketingNavLinkClass(item.href)}
  >
  {item.label}
  </a>
  ) : (
  <Link
  key={item.href}
  href={item.href}
  className={marketingNavLinkClass(item.href)}
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
  <Button className="flex items-center gap-2 bg-white text-slate-900 shadow-sm hover:bg-white/90 dark:bg-emerald-100 dark:text-emerald-950 dark:hover:bg-white">
  {!textOnly &&
  (() => {
  const IconComponent = getUserTypeIcon()
  return <IconComponent className="w-4 h-4" />
  })()}
  <span>{t(locale, 'common.dashboard')}</span>
  </Button>
  </Link>
  )}

  {!isStudentDashboardRoute &&
  user?.user_type !== 'corporate' &&
  user?.user_type !== 'admin' && (
  <Button
  variant="ghost"
  onClick={handleLogout}
  className="flex items-center gap-2 text-red-800 hover:bg-white/45 hover:text-red-950 dark:text-red-300 dark:hover:bg-emerald-900/80 dark:hover:text-red-200"
  >
  {!textOnly && <LogOut className="w-4 h-4" />}
  <span>{t(locale, 'common.logout')}</span>
  </Button>
  )}
  </div>
  ) : (
  <>
  {showMarketingAuthCluster ? (
  <div className={cn('flex items-center gap-2 rounded-2xl px-2 py-1', marketingAuthClusterClass)}>
  <Link href={getAuthLink('/auth/login')} className="text-sm font-semibold text-slate-900 transition-colors hover:text-sage-deep dark:text-emerald-50 dark:hover:text-white">
  {t(locale, 'common.signIn')}
  </Link>
  <Link href="/auth/register?type=student">
  <Button variant="outline" className="h-9 rounded-lg border-2 border-sage-deep/50 bg-white/80 px-4 font-semibold text-slate-900 hover:bg-sage/15 hover:text-slate-950 dark:border-emerald-400/80 dark:bg-emerald-950/40 dark:text-emerald-50 dark:hover:bg-emerald-800/70 dark:hover:text-white">Find Jobs</Button>
  </Link>
  <Link href="/auth/register?type=corporate">
  <Button className="h-9 rounded-lg bg-sage-deep px-4 font-semibold text-white shadow-sm hover:bg-sage-deep/90 dark:bg-emerald-600 dark:text-white dark:hover:bg-emerald-500">Post Jobs</Button>
  </Link>
  </div>
  ) : (
  <div className="flex items-center gap-2">
  <Link href={getAuthLink('/auth/login')}>
  <Button variant="outline" className="border-2 border-slate-800/40 bg-white/90 px-5 font-semibold text-slate-900 hover:bg-white dark:border-emerald-400 dark:bg-emerald-950/30 dark:text-emerald-50 dark:hover:bg-emerald-800 dark:hover:text-white">
  {t(locale, 'common.signIn')}
  </Button>
  </Link>
  <Link href={getAuthLink('/auth/register')}>
  <Button className="bg-white px-5 font-semibold text-slate-900 shadow-sm hover:bg-white/90 dark:bg-emerald-100 dark:text-emerald-950 dark:hover:bg-white">{t(locale, 'common.signUp')}</Button>
  </Link>
  </div>
  )}
  </>
  )}

  {!textOnly && <LanguageSwitcher variant={isTransparentVariant ? 'surface' : 'bar'} />}
  {!isStudentProfileRoute && (
  <ThemeToggle variant={isTransparentVariant ? 'surface' : 'bar'} labelsOnly={textOnly} />
  )}
  </div>
  </div>

  {/* Mobile Menu Button */}
  <div className="ml-auto flex items-center gap-2 lg:hidden">
  {!isStudentProfileRoute && (
  <ThemeToggle variant={isTransparentVariant ? 'surface' : 'bar'} labelsOnly={textOnly} />
  )}
  <Button
  variant="ghost"
  size="sm"
  onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
  className={cn(
  'rounded-lg border px-3 py-2 text-sm font-semibold text-slate-900 hover:bg-white/85 dark:text-emerald-50 dark:hover:bg-emerald-800/80 dark:hover:text-white',
  isTransparentVariant
  ? 'border-slate-200/90 bg-white/75 hover:bg-white dark:border-emerald-800/55 dark:bg-emerald-900/50'
  : 'border-sage-deep/50 bg-white/35 hover:bg-white/55 dark:border-emerald-800/55 dark:bg-emerald-900/55',
  )}
  >
  {textOnly ? (
  isMobileMenuOpen ? 'Close' : 'Menu'
  ) : isMobileMenuOpen ? (
  <X className="w-5 h-5" />
  ) : (
  <Menu className="w-5 h-5" />
  )}
  </Button>
  </div>
  </div>

  {/* Mobile Menu */}
  {isMobileMenuOpen && (
  <div
  className={cn(
  'absolute left-0 right-0 top-full border-t lg:hidden',
  isTransparentVariant
  ? 'border-slate-200/90 bg-white/95 shadow-[0_4px_24px_-6px_rgba(15,23,42,0.09)] backdrop-blur-md dark:border-emerald-800/65 dark:bg-emerald-950/98 dark:shadow-none'
  : 'border-sage-deep/60 bg-sage shadow-none dark:border-emerald-900/80 dark:bg-emerald-950',
  )}
  >
  <div className="flex flex-col space-y-3 p-4">
  <div className="space-y-2">
  {navLinks.map((item) =>
  item.external ? (
  <a key={item.label} href={item.href} onClick={() => setIsMobileMenuOpen(false)}>
  <Button variant="ghost" className={cn('w-full justify-start', mobileNavItemGhostClass)}>{item.label}</Button>
  </a>
  ) : (
  <Link key={item.href} href={item.href} onClick={() => setIsMobileMenuOpen(false)}>
  <Button variant="ghost" className={cn('w-full justify-start', mobileNavItemGhostClass)}>{item.label}</Button>
  </Link>
  )
  )}
  </div>

  {/* Auth Section */}
  {isAuthenticated && user ? (
  <>
  <div className="border-t border-sage-deep/45 pt-2 dark:border-emerald-800/65">
  <Link href={getDashboardPath()} onClick={() => setIsMobileMenuOpen(false)}>
  <Button className="w-full justify-start bg-white font-semibold text-slate-900 shadow-sm hover:bg-white/90 dark:bg-emerald-800 dark:text-white dark:hover:bg-emerald-700">
  {!textOnly &&
  (() => {
  const IconComponent = getUserTypeIcon()
  return <IconComponent className="w-4 h-4 mr-2" />
  })()}
  {t(locale, 'common.dashboard')}
  </Button>
  </Link>
  </div>
  {user?.user_type !== 'corporate' && user?.user_type !== 'admin' && (
  <Button
  variant="ghost"
  onClick={handleLogout}
  className="w-full justify-start font-medium text-red-800 hover:bg-white/45 hover:text-red-950 dark:text-red-300 dark:hover:bg-emerald-900/80 dark:hover:text-red-200"
  >
  {!textOnly && <LogOut className="w-4 h-4 mr-2" />}
  {t(locale, 'common.logout')}
  </Button>
  )}
  </>
  ) : (
  <div className="space-y-3 border-t border-sage-deep/45 pt-2 dark:border-emerald-800/65">
  <Link href={getAuthLink('/auth/login')} onClick={() => setIsMobileMenuOpen(false)}>
  <Button variant="outline" className="w-full justify-center rounded-lg border-2 border-sage-deep/50 bg-white/90 font-semibold text-slate-900 hover:bg-sage/12 dark:border-emerald-400/80 dark:bg-emerald-950/40 dark:text-emerald-50 dark:hover:bg-emerald-800/70 dark:hover:text-white">
  {t(locale, 'common.signIn')}
  </Button>
  </Link>
  {showMarketingAuthCluster ? (
  <>
  <Link href="/auth/register?type=student" onClick={() => setIsMobileMenuOpen(false)}>
  <Button variant="outline" className="w-full justify-center rounded-lg border-2 border-sage-deep/50 bg-white/90 font-semibold text-slate-900 hover:bg-sage/15 dark:border-emerald-400/80 dark:bg-emerald-950/40 dark:text-emerald-50 dark:hover:bg-emerald-800/70 dark:hover:text-white">Find Jobs</Button>
  </Link>
  <Link href="/auth/register?type=corporate" onClick={() => setIsMobileMenuOpen(false)}>
  <Button className="w-full justify-center rounded-lg bg-sage-deep font-semibold text-white shadow-sm hover:bg-sage-deep/90 dark:bg-emerald-600 dark:text-white dark:hover:bg-emerald-500">Post Jobs</Button>
  </Link>
  </>
  ) : (
  <Link href={getAuthLink('/auth/register')} onClick={() => setIsMobileMenuOpen(false)}>
  <Button className="w-full justify-center bg-white font-semibold text-slate-900 shadow-sm hover:bg-white/90 dark:bg-emerald-100 dark:text-emerald-950 dark:hover:bg-white">{t(locale, 'common.signUp')}</Button>
  </Link>
  )}
  </div>
  )}
  {!textOnly && (
  <div className="border-t border-sage-deep/45 pt-2 dark:border-emerald-800/65">
  <label className="mb-2 block text-xs font-medium text-slate-800 dark:text-emerald-100">{t(locale, 'nav.language')}</label>
  <LanguageSwitcher compact variant={isTransparentVariant ? 'surface' : 'bar'} />
  </div>
  )}
  </div>
  </div>
  )}
  </div>
  </nav>
  )
}