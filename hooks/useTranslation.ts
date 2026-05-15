'use client'

import { useCallback, useMemo } from 'react'
import { useLocale } from '@/contexts/LocaleContext'
import { getMessage } from '@/lib/i18n/loadDictionary'
import { t as translate, tf as translateWithFallback, type SupportedLocale } from '@/lib/i18n'

export function useTranslation() {
  const { locale, setLocale } = useLocale()

  const t = useCallback((key: string) => translate(locale, key), [locale])

  const tf = useCallback((key: string, fallback: string) => translateWithFallback(locale, key, fallback), [locale])

  const tArray = useCallback(
    (key: string): string[] => {
      const value = getMessage(locale, key)
      if (Array.isArray(value)) return value.filter((item): item is string => typeof item === 'string')
      const fallback = getMessage('en', key)
      if (Array.isArray(fallback)) return fallback.filter((item): item is string => typeof item === 'string')
      return []
    },
    [locale],
  )

  const tParams = useCallback(
    (key: string, params: Record<string, string | number>) => {
      let text = t(key)
      for (const [param, value] of Object.entries(params)) {
        text = text.replace(new RegExp(`\\{\\{${param}\\}\\}`, 'g'), String(value))
      }
      return text
    },
    [t],
  )

  return useMemo(
    () => ({ locale, setLocale, t, tf, tArray, tParams }),
    [locale, setLocale, t, tf, tArray, tParams],
  )
}

export type { SupportedLocale }
