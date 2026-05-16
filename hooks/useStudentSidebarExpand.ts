'use client'

import { useCallback, useEffect, useState } from 'react'

export const STUDENT_SIDEBAR_STORAGE_KEY = 'student-sidebar-expanded'
export const STUDENT_SIDEBAR_WIDTH_COLLAPSED = '4.25rem'
export const STUDENT_SIDEBAR_WIDTH_EXPANDED = '15rem'

export function useStudentSidebarExpand() {
  const [expanded, setExpanded] = useState(true)
  const [hydrated, setHydrated] = useState(false)

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STUDENT_SIDEBAR_STORAGE_KEY)
      if (stored === 'true' || stored === 'false') {
        setExpanded(stored === 'true')
      }
    } catch {
      /* ignore */
    }
    setHydrated(true)
  }, [])

  useEffect(() => {
    if (!hydrated) return
    const width = expanded ? STUDENT_SIDEBAR_WIDTH_EXPANDED : STUDENT_SIDEBAR_WIDTH_COLLAPSED
    document.documentElement.style.setProperty('--student-sidebar-width', width)
    try {
      localStorage.setItem(STUDENT_SIDEBAR_STORAGE_KEY, String(expanded))
    } catch {
      /* ignore */
    }
  }, [expanded, hydrated])

  const toggle = useCallback(() => {
    setExpanded((prev) => !prev)
  }, [])

  return { expanded, setExpanded, toggle, hydrated }
}
