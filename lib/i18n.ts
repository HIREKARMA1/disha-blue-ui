import en from '@/locales/en.json'
import hi from '@/locales/hi.json'
import or from '@/locales/or.json'

export type SupportedLocale = 'en' | 'hi' | 'or'
const LOCALE_STORAGE_KEY = 'locale'

const dictionaries = { en, hi, or } as const

export function t(locale: SupportedLocale, key: string): string {
  const parts = key.split('.')
  let value: any = dictionaries[locale]

  for (const part of parts) {
    if (value && typeof value === 'object' && part in value) {
      value = value[part]
    } else {
      value = undefined
      break
    }
  }

  if (typeof value === 'string') return value

  // Fallback to English
  value = parts.reduce((acc: any, part) => (acc && part in acc ? acc[part] : undefined), dictionaries.en as any)
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
