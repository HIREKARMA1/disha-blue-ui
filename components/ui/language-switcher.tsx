'use client'

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useLocale } from '@/contexts/LocaleContext'
import { SupportedLocale, t } from '@/lib/i18n'

const languages: Array<{ value: SupportedLocale; label: string }> = [
  { value: 'en', label: 'English' },
  { value: 'hi', label: 'हिन्दी' },
  { value: 'or', label: 'ଓଡ଼ିଆ' },
]

interface LanguageSwitcherProps {
  compact?: boolean
}

export function LanguageSwitcher({ compact = false }: LanguageSwitcherProps) {
  const { locale, setLocale } = useLocale()

  return (
    <div className={compact ? 'w-full' : 'w-[132px]'}>
      <Select value={locale} onValueChange={(v) => setLocale(v as SupportedLocale)}>
        <SelectTrigger
          aria-label={t(locale, 'nav.language')}
          className={`${compact ? 'h-10 w-full rounded-xl' : 'h-9 rounded-full'} border-border bg-background/80 text-foreground`}
        >
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {languages.map((item) => (
            <SelectItem key={item.value} value={item.value}>
              {item.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}
