"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { useTheme } from "next-themes"
import { ArrowUp, Facebook, Instagram, Linkedin } from "lucide-react"
import type { FooterSocialNetwork } from "@/config/footer"
import { cn } from "@/lib/utils"
import { BRANDING } from "@/config/branding"
import {
  FOOTER_ADDRESS,
  FOOTER_CITIES,
  FOOTER_EMAIL,
  FOOTER_LEGAL_NAME,
  FOOTER_LOCATION,
  FOOTER_POPULAR_SEARCHES,
  FOOTER_QUICK_LINKS,
  FOOTER_SOCIAL,
  FOOTER_SUPPORT_PHONE,
  FOOTER_SUPPORT_PHONE_TEL,
  jobsUrlWithKeyword,
  jobsUrlWithLocation,
} from "@/config/footer"
import { t } from "@/lib/i18n"
import { useLocale } from "@/contexts/LocaleContext"

interface FooterProps {
  plainText?: boolean
  hideIcons?: boolean
}

function FooterColumn({
  title,
  children,
  className,
}: {
  title: string
  children: React.ReactNode
  className?: string
}) {
  return (
    <div className={cn("min-w-0", className)}>
      <h3 className="mb-4 text-sm font-bold text-[#0a0e1a] dark:text-white">{title}</h3>
      {children}
    </div>
  )
}

function FooterLinkList({
  items,
}: {
  items: readonly { label: string; href: string }[]
}) {
  return (
    <ul className="space-y-3">
      {items.map((item) => (
        <li key={item.label}>
          <Link
            href={item.href}
            className="text-sm text-[#5c6b7a] transition-colors hover:text-primary-600 dark:text-blue-200/80 dark:hover:text-primary-400"
          >
            {item.label}
          </Link>
        </li>
      ))}
    </ul>
  )
}

function FooterSocialIcon({ network }: { network: FooterSocialNetwork }) {
  const className = "h-4 w-4 text-[#0a0e1a] dark:text-blue-100"
  switch (network) {
    case "linkedin":
      return <Linkedin className={className} aria-hidden />
    case "facebook":
      return <Facebook className={className} aria-hidden />
    case "instagram":
      return <Instagram className={className} aria-hidden />
    case "x":
      return (
        <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden>
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
        </svg>
      )
  }
}

function ScrollToTopButton() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 320)
    onScroll()
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  if (!visible) return null

  return (
    <button
      type="button"
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      className="fixed bottom-24 right-4 z-40 flex h-11 w-11 items-center justify-center rounded-full bg-primary-600 text-white shadow-lg shadow-primary-600/30 transition hover:bg-primary-700 active:scale-95 sm:bottom-8 sm:right-6"
      aria-label="Scroll to top"
    >
      <ArrowUp className="h-5 w-5" strokeWidth={2.5} />
    </button>
  )
}

export function Footer({ plainText = false }: FooterProps) {
  const { theme, resolvedTheme } = useTheme()
  const { locale } = useLocale()
  const year = new Date().getFullYear()

  const logoSrc =
    resolvedTheme === "dark" || (resolvedTheme === "system" && theme === "dark")
      ? BRANDING.logoDark
      : BRANDING.logoLight

  const popularLinks = FOOTER_POPULAR_SEARCHES.map((item) => ({
    label: item.label,
    href: jobsUrlWithKeyword(item.query),
  }))

  const cityLinks = FOOTER_CITIES.map((city) => ({
    label: `Jobs in ${city}`,
    href: jobsUrlWithLocation(city),
  }))

  const quickLinks = [...FOOTER_QUICK_LINKS]

  return (
    <>
      <footer className="border-t border-[#e8edf5] bg-white pt-12 pb-8 dark:border-blue-900/60 dark:bg-slate-950">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {/* Desktop: 6 columns · Mobile: stacked */}
          <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-6 lg:gap-8 xl:gap-10">
            {/* Brand + address */}
            <div className="lg:col-span-1">
              <Link href="/" className="inline-block">
                {plainText ? (
                  <span className="text-xl font-bold text-primary-600">{BRANDING.appName}</span>
                ) : (
                  <Image
                    src={logoSrc}
                    alt={`${BRANDING.appName} logo`}
                    width={140}
                    height={44}
                    className="h-9 w-auto object-contain"
                  />
                )}
              </Link>
              <p className="mt-4 text-xs font-bold uppercase leading-relaxed tracking-wide text-[#0a0e1a] dark:text-white">
                {FOOTER_LEGAL_NAME}
              </p>
              <address className="mt-3 space-y-0.5 text-sm not-italic leading-relaxed text-[#5c6b7a] dark:text-blue-200/75">
                {FOOTER_ADDRESS.map((line) => (
                  <span key={line} className="block">
                    {line}
                  </span>
                ))}
              </address>
            </div>

            <FooterColumn title={t(locale, "footer.quickLinks")} className="sm:col-span-1">
              <FooterLinkList items={quickLinks} />
            </FooterColumn>

            <FooterColumn title={t(locale, "footer.popularSearches")}>
              <FooterLinkList items={popularLinks} />
            </FooterColumn>

            <FooterColumn title={t(locale, "footer.browseByCity")}>
              <FooterLinkList items={cityLinks} />
            </FooterColumn>

            <FooterColumn title={t(locale, "footer.contact")}>
              <ul className="space-y-4">
                <li>
                  <p className="text-sm font-medium text-[#0a0e1a] dark:text-blue-50">Support</p>
                  <a
                    href={`tel:${FOOTER_SUPPORT_PHONE_TEL}`}
                    className="mt-0.5 block text-sm font-medium text-primary-600 hover:underline dark:text-primary-400"
                  >
                    {FOOTER_SUPPORT_PHONE}
                  </a>
                </li>
                <li>
                  <p className="text-sm font-medium text-[#0a0e1a] dark:text-blue-50">Email</p>
                  <a
                    href={`mailto:${FOOTER_EMAIL}`}
                    className="mt-0.5 block break-all text-sm font-medium text-primary-600 hover:underline dark:text-primary-400"
                  >
                    {FOOTER_EMAIL}
                  </a>
                </li>
                <li>
                  <p className="text-sm font-medium text-[#0a0e1a] dark:text-blue-50">Location</p>
                  <p className="mt-0.5 text-sm leading-relaxed text-[#5c6b7a] dark:text-blue-200/75">
                    {FOOTER_LOCATION}
                  </p>
                </li>
              </ul>
            </FooterColumn>

            <FooterColumn title={t(locale, "footer.followUs")}>
              <ul className="space-y-3">
                {FOOTER_SOCIAL.map((social) => (
                  <li key={social.label}>
                    <a
                      href={social.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2.5 text-sm text-[#5c6b7a] transition hover:text-primary-600 dark:text-blue-200/80"
                    >
                      <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#f0f4f8] dark:bg-slate-800">
                        <FooterSocialIcon network={social.network} />
                      </span>
                      {social.label}
                    </a>
                  </li>
                ))}
              </ul>
            </FooterColumn>
          </div>

          {/* Copyright bar */}
          <div className="mt-12 border-t border-[#e8edf5] pt-8 text-center dark:border-blue-900/60">
            <p className="text-xs font-medium uppercase tracking-wide text-[#9aa3bd] dark:text-blue-300/70">
              {FOOTER_LEGAL_NAME} © {year}
            </p>
            <p className="mt-2 text-sm text-[#7a85a8] dark:text-blue-300/80">
              Made with <span className="text-[#e85d04]">♥</span> in India{" "}
              <span aria-hidden>🇮🇳</span>
            </p>
          </div>
        </div>
      </footer>

      <ScrollToTopButton />
    </>
  )
}
