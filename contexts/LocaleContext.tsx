'use client'

import { createContext, PropsWithChildren, useContext, useEffect, useMemo, useState } from 'react'
import { SupportedLocale, getClientLocale, setClientLocale } from '@/lib/i18n'

interface LocaleContextValue {
  locale: SupportedLocale
  setLocale: (locale: SupportedLocale) => void
}

const LocaleContext = createContext<LocaleContextValue>({
  locale: 'en',
  setLocale: () => undefined,
})

export function LocaleProvider({ children }: PropsWithChildren) {
  const [locale, setLocaleState] = useState<SupportedLocale>('en')

  useEffect(() => {
    const detected = getClientLocale()
    setLocaleState(detected)
    if (typeof document !== 'undefined') {
      document.documentElement.lang = detected
      document.documentElement.dir = 'ltr'
    }
  }, [])

  const setLocale = (nextLocale: SupportedLocale) => {
    setLocaleState(nextLocale)
    setClientLocale(nextLocale)
    if (typeof document !== 'undefined') {
      document.documentElement.lang = nextLocale
      document.documentElement.dir = 'ltr'
    }
  }

  const value = useMemo(() => ({ locale, setLocale }), [locale])
  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>
}

export function useLocale() {
  return useContext(LocaleContext)
}
