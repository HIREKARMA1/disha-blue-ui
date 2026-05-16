"use client"

import { useEffect, useState } from 'react'
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
import {
  navMarketingActionsRow,
  navMarketingCtaFind,
  navMarketingCtaHire,
} from '@/components/ui/nav-marketing-styles'
import { STUDENT_SIGNUP_ROUTE } from '@/features/landing/constants'

const HIRE_WORKERS_ROUTE = '/signup/corporate'

interface NavbarProps {
  variant?: 'default' | 'transparent' | 'solid'
  className?: string
  /** Logo as text, no menu icons, text theme control—home marketing page only. */
  textOnly?: boolean
}

interface MarketingJobsUpiActionsProps {
  stacked?: boolean
  onNavigate?: () => void
}

function MarketingJobsUpiActions({ stacked, onNavigate }: MarketingJobsUpiActionsProps) {
  const { locale } = useLocale()

  return (
    <div
      className={cn(
        navMarketingActionsRow,
        stacked && 'w-full flex-col gap-3',
      )}
    >
      <LanguageSwitcher variant="marketing" compact={stacked} />
      <Link href={HIRE_WORKERS_ROUTE} onClick={onNavigate} className={stacked ? 'w-full' : undefined}>
        <span className={cn(navMarketingCtaHire, stacked && 'w-full px-6')}>
          {t(locale, 'nav.hireWorkers')}
        </span>
      </Link>
      <Link href={STUDENT_SIGNUP_ROUTE} onClick={onNavigate} className={stacked ? 'w-full' : undefined}>
        <span className={cn(navMarketingCtaFind, stacked && 'w-full px-6')}>
          {t(locale, 'nav.findJobs')}
        </span>
      </Link>
    </div>
  )
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
  const [hasMounted, setHasMounted] = useState(false)
  const { locale } = useLocale()

  useEffect(() => {
    setHasMounted(true)
  }, [])

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
  const showMobileMarketingMenu = !isDashboardRoute

  const isTransparentVariant = variant === 'transparent'
  const languageSwitcherVariant = isDashboardRoute
    ? isTransparentVariant
      ? 'surface'
      : 'bar'
    : 'marketing'

  const getNavbarClasses = () => {
    if (isDashboardRoute) {
      if (isTransparentVariant) {
        return (
          'w-full z-50 fixed top-0 left-0 right-0 border-b border-slate-200/90 border-t-[3px] border-t-primary-600 bg-white/92 shadow-[0_4px_24px_-6px_rgba(15,23,42,0.09)] backdrop-blur-md dark:border-primary-500/35 dark:border-t-primary-400/80 dark:bg-slate-950/95 dark:shadow-none'
        )
      }
      return (
        'w-full z-50 fixed top-0 left-0 right-0 border-t-[3px] border-t-primary-600 border-b border-b-primary-600/90 bg-primary-50 shadow-[0_4px_24px_-6px_rgba(37,99,235,0.08)] dark:border-t-primary-500/80 dark:border-b-primary-800/90 dark:bg-slate-950 dark:shadow-none'
      )
    }
    return (
      'w-full z-50 fixed top-0 left-0 right-0 border-b border-slate-200/90 bg-white/95 shadow-[0_2px_16px_-6px_rgba(15,23,42,0.08)] backdrop-blur-md'
    )
  }

  const getLogoSrc = () => {
    if (!hasMounted) {
      return BRANDING.logoLight
    }
    const isDark = resolvedTheme === 'dark' || (resolvedTheme === 'system' && theme === 'dark')
    return isDark ? BRANDING.logoDark : BRANDING.logoLight
  }

  const closeMobileMenu = () => setIsMobileMenuOpen(false)

  const authenticatedMarketingActions = (
    <div className="flex flex-wrap items-center justify-end gap-2">
      <Link href={getDashboardPath()}>
        <span className={cn(navMarketingCtaFind, 'gap-1.5 normal-case tracking-normal')}>
          {!textOnly &&
            (() => {
              const IconComponent = getUserTypeIcon()
              return <IconComponent className="h-4 w-4" />
            })()}
          {t(locale, 'common.dashboard')}
        </span>
      </Link>
      {user?.user_type !== 'corporate' && user?.user_type !== 'admin' && (
        <Button
          variant="ghost"
          size="sm"
          onClick={handleLogout}
          className="h-9 rounded-full text-red-700 hover:bg-red-50 hover:text-red-800 sm:h-11"
        >
          {!textOnly && <LogOut className="mr-1.5 h-4 w-4" />}
          {t(locale, 'common.logout')}
        </Button>
      )}
    </div>
  )

  if (isLoading || !hasMounted) {
    return (
      <nav className={`main-navbar ${getNavbarClasses()} ${className}`}>
        <div className="container mx-auto px-4 py-3 sm:px-6">
          <div className="flex items-center justify-between gap-4">
            <Link href="/" className="flex items-center">
              {textOnly ? (
                <span className="font-display text-lg font-semibold text-slate-900">{BRANDING.appName}</span>
              ) : (
                <Image
                  src={getLogoSrc()}
                  alt={`${BRANDING.appName} logo`}
                  width={150}
                  height={50}
                  className="h-8 w-auto object-contain sm:h-10"
                  priority
                />
              )}
            </Link>
            {!isDashboardRoute && !textOnly && (
              <div className="h-9 w-32 animate-pulse rounded-full bg-slate-100" />
            )}
            {isDashboardRoute && !textOnly && (
              <div className="flex shrink-0 items-center gap-2">
                <LanguageSwitcher variant={languageSwitcherVariant} />
                <ThemeToggle variant={isTransparentVariant ? 'surface' : 'bar'} labelsOnly={textOnly} />
              </div>
            )}
          </div>
        </div>
      </nav>
    )
  }

  return (
    <nav className={`main-navbar ${getNavbarClasses()} ${className}`}>
      <div className="container mx-auto px-4 py-3 sm:px-6">
        <div className="flex items-center gap-3 sm:gap-4">
          <Link href={isAuthenticated ? getDashboardPath() : '/'} className="flex shrink-0 items-center">
            {textOnly ? (
              <span className="font-display text-lg font-semibold text-slate-900">{BRANDING.appName}</span>
            ) : (
              <Image
                src={getLogoSrc()}
                alt={`${BRANDING.appName} logo`}
                width={150}
                height={50}
                className="h-8 w-auto object-contain sm:h-10 md:h-11"
                priority
              />
            )}
          </Link>

          {/* Desktop */}
          <div className="hidden min-w-0 flex-1 items-center justify-end gap-3 lg:flex">
            {!isDashboardRoute &&
              (isAuthenticated && user ? (
                <>
                  {!textOnly && <LanguageSwitcher variant="marketing" />}
                  {authenticatedMarketingActions}
                </>
              ) : (
                !textOnly && <MarketingJobsUpiActions />
              ))}
            {isDashboardRoute && !textOnly && (
              <div className="flex shrink-0 items-center gap-2">
                <LanguageSwitcher variant={languageSwitcherVariant} />
                <ThemeToggle variant={isTransparentVariant ? 'surface' : 'bar'} labelsOnly={textOnly} />
              </div>
            )}
          </div>

          {/* Mobile — hamburger opens JobsUPI actions */}
          <div className="ml-auto flex items-center gap-2 lg:hidden">
            {!isDashboardRoute && !textOnly && (
              <>
                {isAuthenticated && user && (
                  <Link href={getDashboardPath()}>
                    <span className={cn(navMarketingCtaFind, 'px-4 text-[10px] sm:text-xs')}>
                      {t(locale, 'common.dashboard')}
                    </span>
                  </Link>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                  className="h-9 shrink-0 rounded-full border border-slate-200 bg-white px-2.5 shadow-sm hover:bg-slate-50 sm:h-10 sm:px-3"
                  aria-label={isMobileMenuOpen ? 'Close menu' : 'Open menu'}
                >
                  {isMobileMenuOpen ? <X className="h-5 w-5 text-slate-700" /> : <Menu className="h-5 w-5 text-slate-700" />}
                </Button>
              </>
            )}
            {isDashboardRoute && !textOnly && (
              <div className="flex shrink-0 items-center gap-2">
                <LanguageSwitcher variant={languageSwitcherVariant} />
                <ThemeToggle variant={isTransparentVariant ? 'surface' : 'bar'} labelsOnly={textOnly} />
              </div>
            )}
          </div>
        </div>

        {showMobileMarketingMenu && isMobileMenuOpen && !isDashboardRoute && (
          <div className="absolute left-0 right-0 top-full border-t border-slate-200/90 bg-white shadow-lg lg:hidden">
            <div className="flex flex-col gap-4 p-4">
              {!textOnly && !isAuthenticated && (
                <MarketingJobsUpiActions stacked onNavigate={closeMobileMenu} />
              )}
              {isAuthenticated && user && (
                <div className="space-y-2">
                  {user?.user_type !== 'corporate' && user?.user_type !== 'admin' && (
                    <Button
                      variant="ghost"
                      onClick={handleLogout}
                      className="w-full justify-center text-red-700 hover:bg-red-50 hover:text-red-800"
                    >
                      {!textOnly && <LogOut className="mr-2 h-4 w-4" />}
                      {t(locale, 'common.logout')}
                    </Button>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}
