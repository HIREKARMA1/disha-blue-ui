import { getMessage as lookupMessage } from '@/lib/i18n/loadDictionary'
import type { SupportedLocale } from '@/lib/i18n/types'

export type { SupportedLocale } from '@/lib/i18n/types'
export { SUPPORTED_LOCALES, LOCALE_LABELS } from '@/lib/i18n/types'

const LOCALE_STORAGE_KEY = 'locale'

export function t(locale: SupportedLocale, key: string): string {
  const value = lookupMessage(locale, key)
  return typeof value === 'string' ? value : key
}

export function tf(locale: SupportedLocale, key: string, fallback: string): string {
  const value = t(locale, key)
  return value === key ? fallback : value
}

export function getClientLocale(): SupportedLocale {
  if (typeof window === 'undefined') return 'en'

  const stored = localStorage.getItem(LOCALE_STORAGE_KEY)
  if (stored === 'en' || stored === 'hi' || stored === 'or') return stored

  const language = (navigator.language || '').toLowerCase()
  if (language.startsWith('hi')) return 'hi'
  if (language.startsWith('or') || language.startsWith('od')) return 'or'
  return 'en'
}

export function setClientLocale(locale: SupportedLocale) {
  if (typeof window === 'undefined') return
  localStorage.setItem(LOCALE_STORAGE_KEY, locale)
  document.cookie = `locale=${locale}; path=/; max-age=31536000; samesite=lax`
}
