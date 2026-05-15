"use client"

import { useEffect, useState } from 'react'
import { getClientLocale, tf, type SupportedLocale } from '@/lib/i18n'

interface WelcomeMessageProps {
  className?: string
  studentName?: string
}

function getGreetingForHour(hour: number, locale: SupportedLocale) {
  if (hour >= 12 && hour < 17) {
    return {
      greeting: tf(locale, 'student.welcome.greetingAfternoon', 'Good afternoon'),
      message: tf(
        locale,
        'student.welcome.messageAfternoon',
        'Keep going - fresh local jobs are being posted near you.',
      ),
    }
  }
  if (hour >= 17) {
    return {
      greeting: tf(locale, 'student.welcome.greetingEvening', 'Good evening'),
      message: tf(
        locale,
        'student.welcome.messageEvening',
        'Great effort today. Review applications and plan your next move.',
      ),
    }
  }
  return {
    greeting: tf(locale, 'student.welcome.greetingMorning', 'Good morning'),
    message: tf(
      locale,
      'student.welcome.messageMorning',
      'Ready to explore nearby jobs and local opportunities today?',
    ),
  }
}

export function WelcomeMessage({ className = '', studentName = 'Student' }: WelcomeMessageProps) {
  const [locale, setLocale] = useState<SupportedLocale>('en')
  const [formattedDate, setFormattedDate] = useState('')
  const [greeting, setGreeting] = useState('Good afternoon')
  const [message, setMessage] = useState(
    'Keep going - fresh local jobs are being posted near you.',
  )

  useEffect(() => {
    const clientLocale = getClientLocale()
    const now = new Date()
    const { greeting: g, message: m } = getGreetingForHour(now.getHours(), clientLocale)
    setLocale(clientLocale)
    setGreeting(g)
    setMessage(m)
    setFormattedDate(
      now.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' }),
    )
  }, [])

  return (
    <div className={`dashboard-overview-card p-6 transition-colors hover:border-blue-600/70 ${className}`}>
      <div className="space-y-4">
        <div className="min-w-0 space-y-4">
          <h1 className="text-2xl font-semibold text-slate-900 dark:text-blue-50">
            {greeting}, {studentName}!
          </h1>
          <p className="text-base text-slate-600 dark:text-blue-200">{message}</p>
          <div className="flex flex-wrap gap-2">
            <span
              suppressHydrationWarning
              className="inline-flex items-center rounded-full border border-slate-200/90 bg-blue-50 px-3 py-1 text-sm text-slate-800 shadow-sm dark:border-blue-700 dark:bg-blue-900/60 dark:text-blue-100"
            >
              {formattedDate || '\u00a0'}
            </span>
            <span className="inline-flex items-center rounded-full border border-slate-200/90 bg-blue-50 px-3 py-1 text-sm text-slate-800 shadow-sm dark:border-blue-700 dark:bg-blue-900/60 dark:text-blue-100">
              {tf(locale, 'student.welcome.tagLocalOpportunities', 'Local Opportunities')}
            </span>
            <span className="inline-flex items-center rounded-full border border-slate-200/90 bg-blue-50 px-3 py-1 text-sm text-slate-800 shadow-sm dark:border-blue-700 dark:bg-blue-900/60 dark:text-blue-100">
              {tf(locale, 'student.welcome.tagNearbyHiring', 'Nearby Hiring')}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
