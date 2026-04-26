"use client"

import { useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useTheme } from 'next-themes'
import { Mail, Phone, MapPin } from 'lucide-react'
import { BRANDING } from '@/config/branding'
import { SupportedLocale, getClientLocale, t } from '@/lib/i18n'

interface FooterProps {
  /** Text-only brand and contact—no logo image or icons (home marketing page). */
  plainText?: boolean
  /** Keep logo image; show contact lines with text labels only (no Mail/Phone/MapPin icons). */
  hideIcons?: boolean
}

export function Footer({ plainText = false, hideIcons = false }: FooterProps) {
  const { theme, resolvedTheme } = useTheme()
  const [locale, setLocale] = useState<SupportedLocale>('en')

  useEffect(() => {
  setLocale(getClientLocale())
  }, [])

  const getLogoSrc = () => {
  const isDark = resolvedTheme === 'dark' || (resolvedTheme === 'system' && theme === 'dark')
  return isDark ? BRANDING.logoDark : BRANDING.logoLight
  }

  return (
  <footer className="border-t border-slate-200 bg-white pt-16 pb-10 dark:border-blue-900 dark:bg-blue-950">
  <div className="container mx-auto px-4 py-2 sm:px-6 lg:px-10">
  <div className="mb-14 grid grid-cols-1 gap-12 md:grid-cols-2 md:gap-10 lg:grid-cols-4 lg:gap-14">
  {/* Brand Section */}
  <div className="flex flex-col items-center space-y-5 px-2 text-center md:items-start md:px-0 md:text-left">
  <Link href="/" className="inline-block">
  {plainText ? (
  <span className="font-display text-xl font-semibold text-slate-900 dark:text-blue-50">{BRANDING.appName}</span>
  ) : (
  <Image
  src={getLogoSrc()}
  alt={`${BRANDING.appName} logo`}
  width={150}
  height={50}
  className="h-10 w-auto object-contain"
  />
  )}
  </Link>
  <p className="text-sm leading-relaxed text-slate-600 dark:text-blue-200/85">
  {BRANDING.appName} is an AI-informed hiring and career platform for teams and talent who want
  modern pipelines—not legacy job boards.
  </p>
  <p className="text-sm leading-relaxed text-slate-600 dark:text-blue-200/85">
  Hyperlocal discovery, structured roles, and recruiter-grade workflows in one product.
  </p>
  </div>

  {/* Quick Links */}
  <div className="flex flex-col items-center px-2 text-center md:items-start md:px-0 md:text-left">
  <h3 className="mb-5 text-lg font-semibold text-slate-900 dark:text-blue-50">{t(locale, 'footer.quickLinks')}</h3>
  <ul className="flex flex-col items-center space-y-4 md:items-start">
  <li>
  <Link href="/" className="text-sm text-slate-600 transition-colors hover:text-blue-600 dark:text-blue-300 dark:hover:text-white">
  {t(locale, 'nav.home')}
  </Link>
  </li>
  <li>
  <Link href="/jobs" className="text-sm text-slate-600 transition-colors hover:text-blue-600 dark:text-blue-300 dark:hover:text-white">
  {t(locale, 'nav.jobs')}
  </Link>
  </li>
  <li>
  <Link href="/#features" className="text-sm text-slate-600 transition-colors hover:text-blue-600 dark:text-blue-300 dark:hover:text-white">
  Features
  </Link>
  </li>
  <li>
  <Link href="/auth/login" className="text-sm text-slate-600 transition-colors hover:text-blue-600 dark:text-blue-300 dark:hover:text-white">
  {t(locale, 'common.signIn')}
  </Link>
  </li>
  <li>
  <Link href="/signup/step-1" className="text-sm text-slate-600 transition-colors hover:text-blue-600 dark:text-blue-300 dark:hover:text-white">
  {t(locale, 'common.signUp')}
  </Link>
  </li>
  </ul>
  </div>

  {/* Role Links */}
  <div className="flex flex-col items-center px-2 text-center md:items-start md:px-0 md:text-left">
  <h3 className="mb-5 text-lg font-semibold text-slate-900 dark:text-blue-50">{t(locale, 'footer.roleLinks')}</h3>
  <ul className="flex flex-col items-center space-y-4 md:items-start">
  <li>
  <Link href="/signup/step-1" className="text-sm text-slate-600 transition-colors hover:text-blue-600 dark:text-blue-300 dark:hover:text-white">Find Jobs</Link>
  </li>
  <li>
  <Link href="/signup/step-1" className="text-sm text-slate-600 transition-colors hover:text-blue-600 dark:text-blue-300 dark:hover:text-white">Post Jobs</Link>
  </li>
  <li>
  <Link href="/#roles" className="text-sm text-slate-600 transition-colors hover:text-blue-600 dark:text-blue-300 dark:hover:text-white">For Students</Link>
  </li>
  <li>
  <Link href="/#roles" className="text-sm text-slate-600 transition-colors hover:text-blue-600 dark:text-blue-300 dark:hover:text-white">For Employers</Link>
  </li>
  </ul>
  </div>

  {/* Contact Info */}
  <div className="flex flex-col items-center px-2 text-center md:items-start md:px-0 md:text-left">
  <h3 className="mb-5 text-lg font-semibold text-slate-900 dark:text-blue-50">{t(locale, 'footer.contact')}</h3>
  <ul className="flex flex-col items-center space-y-4 md:items-start">
  <li className="flex items-center justify-center text-sm text-slate-600 dark:text-blue-200/85 md:justify-start">
  {plainText || hideIcons ? (
  <span><span className="font-medium text-slate-800 dark:text-blue-100">Email: </span>{BRANDING.supportEmail}</span>
  ) : (
  <>
  <Mail className="mr-3 h-5 w-5 shrink-0 text-blue-600 dark:text-blue-300" />
  <span>{BRANDING.supportEmail}</span>
  </>
  )}
  </li>
  <li className="flex items-center justify-center text-sm text-slate-600 dark:text-blue-200/85 md:justify-start">
  {plainText || hideIcons ? (
  <span><span className="font-medium text-slate-800 dark:text-blue-100">Phone: </span>+91 00000 00000</span>
  ) : (
  <>
  <Phone className="mr-3 h-5 w-5 shrink-0 text-blue-600 dark:text-blue-300" />
  <span>+91 00000 00000</span>
  </>
  )}
  </li>
  <li className="flex items-center justify-center text-sm text-slate-600 dark:text-blue-200/85 md:justify-start">
  {plainText || hideIcons ? (
  <span className="text-center md:text-left"><span className="font-medium text-slate-800 dark:text-blue-100">Location: </span>Regional operations across districts and cities in India.</span>
  ) : (
  <>
  <MapPin className="mr-3 h-5 w-5 shrink-0 text-blue-600 dark:text-blue-300" />
  <span className="text-center md:text-left">Regional operations across districts and cities in India.</span>
  </>
  )}
  </li>
  </ul>
  </div>
  </div>

  <div className="flex flex-col items-center justify-between gap-6 border-t border-slate-200 px-2 pb-2 pt-8 dark:border-blue-900 md:flex-row md:px-0">
  <p className="text-center text-sm text-slate-600 dark:text-blue-300 md:text-left">
  © {new Date().getFullYear()} {BRANDING.appName}. All rights reserved.
  </p>
  <div className="flex flex-wrap justify-center gap-5 md:justify-start">
  <a href="#" className="text-sm text-slate-600 transition-colors hover:text-blue-600 dark:text-blue-300 dark:hover:text-white">
  Privacy Policy
  </a>
  <a href="#" className="text-sm text-slate-600 transition-colors hover:text-blue-600 dark:text-blue-300 dark:hover:text-white">
  Terms of Service
  </a>
  <span className="text-sm text-slate-500 dark:text-blue-400">{BRANDING.appName}</span>
  </div>
  </div>
  </div>
  </footer>
  )
}
