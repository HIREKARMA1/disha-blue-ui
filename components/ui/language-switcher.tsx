'use client'

import { ChevronDown, Languages } from 'lucide-react'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { navMarketingLangPill } from '@/components/ui/nav-marketing-styles'
import { useLocale } from '@/contexts/LocaleContext'
import { LOCALE_LABELS, SupportedLocale, t } from '@/lib/i18n'
import { cn } from '@/lib/utils'

const languages: Array<{ value: SupportedLocale; label: string }> = (
  ['en', 'hi', 'or'] as SupportedLocale[]
).map((value) => ({ value, label: LOCALE_LABELS[value] }))

const triggerBar = cn(
  'border-2 border-white/90 bg-white font-medium text-slate-900 shadow-none',
  'hover:bg-slate-50',
  'focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-blue-600',
  'dark:border-blue-400/70 dark:bg-blue-900 dark:text-blue-100',
  'dark:hover:bg-blue-800 dark:hover:text-white',
  'dark:focus:ring-blue-400 dark:focus:ring-offset-blue-950',
  '[&_svg]:text-slate-600 dark:[&_svg]:text-blue-200',
)

const triggerSurface = cn(
  'border border-slate-200 bg-white font-medium text-slate-900 shadow-none',
  'hover:bg-slate-50 hover:border-slate-300',
  'focus:ring-2 focus:ring-blue-600/40 focus:ring-offset-2 focus:ring-offset-white',
  'dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100',
  'dark:hover:bg-slate-800 dark:hover:border-slate-500',
  'dark:focus:ring-slate-500 dark:focus:ring-offset-slate-900',
  '[&_svg]:text-slate-600 dark:[&_svg]:text-slate-300',
)

function marketingLocaleLabel(locale: SupportedLocale): string {
  if (locale === 'en') return 'English'
  return LOCALE_LABELS[locale]
}

interface LanguageSwitcherProps {
  compact?: boolean
  /** `bar`: blue-50 / blue navbar. `surface`: white or neutral headers. `marketing`: pill with icon + label. */
  variant?: 'bar' | 'surface' | 'marketing' | 'jobsupi'
}

export function LanguageSwitcher({ compact = false, variant = 'bar' }: LanguageSwitcherProps) {
  const { locale, setLocale } = useLocale()
  const isMarketing = variant === 'marketing' || variant === 'jobsupi'
  const triggerVariant = isMarketing
    ? navMarketingLangPill
    : variant === 'surface'
      ? triggerSurface
      : triggerBar

  return (
    <div className={cn(compact ? 'w-full' : isMarketing ? 'w-auto shrink-0' : 'w-[132px]')}>
      <Select value={locale} onValueChange={(v) => setLocale(v as SupportedLocale)}>
        <SelectTrigger
          aria-label={t(locale, 'nav.language')}
          className={cn(
            compact ? 'h-10 w-full' : isMarketing ? 'w-auto' : 'h-9',
            !isMarketing && !compact && 'rounded-none',
            compact && !isMarketing && 'rounded-none',
            isMarketing && [
              '[&>span]:line-clamp-none',
              '[&>svg:last-child]:hidden',
            ],
            triggerVariant,
          )}
        >
          {isMarketing ? (
            <>
              <Languages className="h-4 w-4 shrink-0 text-slate-500" aria-hidden />
              <span className="flex-1 text-left normal-case tracking-normal">
                {marketingLocaleLabel(locale)}
              </span>
              <ChevronDown className="h-3.5 w-3.5 shrink-0 text-slate-400" aria-hidden />
            </>
          ) : (
            <SelectValue />
          )}
        </SelectTrigger>
        <SelectContent
          className={cn(
            'border-slate-200 bg-white',
            isMarketing ? 'rounded-xl border-slate-200/90 shadow-lg' : 'rounded-none',
          )}
        >
          {languages.map((item) => (
            <SelectItem
              key={item.value}
              value={item.value}
              className={cn(isMarketing ? 'rounded-lg focus:bg-primary-50' : 'rounded-none focus:bg-slate-100')}
            >
              {item.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}
