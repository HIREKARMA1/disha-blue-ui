"use client"

import { useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useTheme } from 'next-themes'
import { Mail, Phone, MapPin } from 'lucide-react'
import { BRANDING } from '@/config/branding'
import { SupportedLocale, getClientLocale, t } from '@/lib/i18n'

export function Footer() {
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
        <footer className="border-t border-border bg-card pt-16 pb-10">
            <div className="container mx-auto px-4 py-2 sm:px-6 lg:px-10">
                <div className="mb-14 grid grid-cols-1 gap-12 md:grid-cols-2 md:gap-10 lg:grid-cols-4 lg:gap-14">
                    {/* Brand Section */}
                    <div className="flex flex-col items-center space-y-5 px-2 text-center md:items-start md:px-0 md:text-left">
                        <Link href="/" className="inline-block">
                            <Image
                                src={getLogoSrc()}
                                alt={`${BRANDING.appName} logo`}
                                width={150}
                                height={50}
                                className="h-10 w-auto object-contain"
                            />
                        </Link>
                        <p className="text-sm leading-relaxed text-muted-foreground">
                            {BRANDING.appName} is an AI-informed hiring and career platform for teams and talent who want
                            modern pipelines—not legacy job boards.
                        </p>
                        <p className="text-sm leading-relaxed text-muted-foreground">
                            Hyperlocal discovery, structured roles, and recruiter-grade workflows in one product.
                        </p>
                    </div>

                    {/* Quick Links */}
                    <div className="flex flex-col items-center px-2 text-center md:items-start md:px-0 md:text-left">
                        <h3 className="mb-5 text-lg font-semibold text-foreground">{t(locale, 'footer.quickLinks')}</h3>
                        <ul className="flex flex-col items-center space-y-4 md:items-start">
                            <li>
                                <Link href="/" className="text-muted-foreground hover:text-primary text-sm transition-colors">
                                    {t(locale, 'nav.home')}
                                </Link>
                            </li>
                            <li>
                                <Link href="/jobs" className="text-muted-foreground hover:text-primary text-sm transition-colors">
                                    {t(locale, 'nav.jobs')}
                                </Link>
                            </li>
                            <li>
                                <Link href="/#features" className="text-muted-foreground hover:text-primary text-sm transition-colors">
                                    Features
                                </Link>
                            </li>
                            <li>
                                <Link href="/auth/login" className="text-muted-foreground hover:text-primary text-sm transition-colors">
                                    {t(locale, 'common.signIn')}
                                </Link>
                            </li>
                            <li>
                                <Link href="/auth/register" className="text-muted-foreground hover:text-primary text-sm transition-colors">
                                    {t(locale, 'common.signUp')}
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Role Links */}
                    <div className="flex flex-col items-center px-2 text-center md:items-start md:px-0 md:text-left">
                        <h3 className="mb-5 text-lg font-semibold text-foreground">{t(locale, 'footer.roleLinks')}</h3>
                        <ul className="flex flex-col items-center space-y-4 md:items-start">
                            <li>
                                <Link href="/auth/register?type=student" className="text-muted-foreground hover:text-primary text-sm transition-colors">Find Jobs</Link>
                            </li>
                            <li>
                                <Link href="/auth/register?type=corporate" className="text-muted-foreground hover:text-primary text-sm transition-colors">Post Jobs</Link>
                            </li>
                            <li>
                                <Link href="/#roles" className="text-muted-foreground hover:text-primary text-sm transition-colors">For Students</Link>
                            </li>
                            <li>
                                <Link href="/#roles" className="text-muted-foreground hover:text-primary text-sm transition-colors">For Employers</Link>
                            </li>
                        </ul>
                    </div>

                    {/* Contact Info */}
                    <div className="flex flex-col items-center px-2 text-center md:items-start md:px-0 md:text-left">
                        <h3 className="mb-5 text-lg font-semibold text-foreground">{t(locale, 'footer.contact')}</h3>
                        <ul className="flex flex-col items-center space-y-4 md:items-start">
                            <li className="flex items-center justify-center space-x-3 text-sm text-muted-foreground md:justify-start">
                                <Mail className="w-5 h-5 text-primary-500 shrink-0" />
                                <span>{BRANDING.supportEmail}</span>
                            </li>
                            <li className="flex items-center justify-center space-x-3 text-sm text-muted-foreground md:justify-start">
                                <Phone className="w-5 h-5 text-primary-500 shrink-0" />
                                <span>+91 00000 00000</span>
                            </li>
                            <li className="flex items-center justify-center space-x-3 text-sm text-muted-foreground md:justify-start">
                                <MapPin className="w-5 h-5 text-primary-500 shrink-0" />
                                <span className="text-center md:text-left">Regional operations across districts and cities in India.</span>
                            </li>
                        </ul>
                    </div>
                </div>

                <div className="flex flex-col items-center justify-between gap-6 border-t border-border px-2 pt-8 pb-2 md:flex-row md:px-0">
                    <p className="text-center text-sm text-muted-foreground md:text-left">
                        © {new Date().getFullYear()} {BRANDING.appName}. All rights reserved.
                    </p>
                    <div className="flex flex-wrap justify-center gap-5 md:justify-start">
                        <a href="#" className="text-muted-foreground hover:text-primary text-sm transition-colors">
                            Privacy Policy
                        </a>
                        <a href="#" className="text-muted-foreground hover:text-primary text-sm transition-colors">
                            Terms of Service
                        </a>
                        <span className="text-muted-foreground text-sm">{BRANDING.appName}</span>
                    </div>
                </div>
            </div>
        </footer>
    )
}
