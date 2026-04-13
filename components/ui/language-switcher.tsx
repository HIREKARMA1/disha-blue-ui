'use client'

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useLocale } from '@/contexts/LocaleContext'
import { SupportedLocale, t } from '@/lib/i18n'
import { cn } from '@/lib/utils'

const languages: Array<{ value: SupportedLocale; label: string }> = [
  { value: 'en', label: 'English' },
  { value: 'hi', label: 'हिन्दी' },
  { value: 'or', label: 'ଓଡ଼ିଆ' },
]

const triggerBar = cn(
  'border-2 border-white/90 bg-white font-medium text-slate-900 shadow-none',
  'hover:bg-slate-50',
  'focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-sage-deep',
  'dark:border-emerald-400/70 dark:bg-emerald-900 dark:text-emerald-100',
  'dark:hover:bg-emerald-800 dark:hover:text-white',
  'dark:focus:ring-emerald-400 dark:focus:ring-offset-emerald-950',
  '[&_svg]:text-slate-600 dark:[&_svg]:text-emerald-200',
)

const triggerSurface = cn(
  'border border-slate-200 bg-white font-medium text-slate-900 shadow-none',
  'hover:bg-slate-50 hover:border-slate-300',
  'focus:ring-2 focus:ring-sage-deep/40 focus:ring-offset-2 focus:ring-offset-white',
  'dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100',
  'dark:hover:bg-slate-800 dark:hover:border-slate-500',
  'dark:focus:ring-slate-500 dark:focus:ring-offset-slate-900',
  '[&_svg]:text-slate-600 dark:[&_svg]:text-slate-300',
)

interface LanguageSwitcherProps {
  compact?: boolean
  /** `bar`: sage / emerald navbar. `surface`: white or neutral headers. */
  variant?: 'bar' | 'surface'
}

export function LanguageSwitcher({ compact = false, variant = 'bar' }: LanguageSwitcherProps) {
  const { locale, setLocale } = useLocale()
  const triggerVariant = variant === 'surface' ? triggerSurface : triggerBar

  return (
    <div className={compact ? 'w-full' : 'w-[132px]'}>
      <Select value={locale} onValueChange={(v) => setLocale(v as SupportedLocale)}>
        <SelectTrigger
          aria-label={t(locale, 'nav.language')}
          className={cn(
            compact ? 'h-10 w-full rounded-none' : 'h-9 rounded-none',
            triggerVariant,
          )}
        >
          <SelectValue />
        </SelectTrigger>
        <SelectContent className="rounded-none border-slate-200 bg-white dark:border-slate-600 dark:bg-slate-900">
          {languages.map((item) => (
            <SelectItem
              key={item.value}
              value={item.value}
              className="rounded-none focus:bg-slate-100 dark:focus:bg-slate-800"
            >
              {item.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}
