// Centralized color system for HireKarma
// Brand primary: #2563eb (solid blue theme)

export const colors = {
  // Primary brand colors
  primary: {
    50: '#eff6ff',
    100: '#dbeafe',
    200: '#bfdbfe',
    300: '#93c5fd',
    400: '#60a5fa',
    500: '#3b82f6',
    600: '#2563eb', // Main brand color
    700: '#1d4ed8',
    800: '#1e40af',
    900: '#1e3a8a',
  },

  // Secondary colors
  secondary: {
    50: '#eff6ff',
    100: '#dbeafe',
    200: '#bfdbfe',
    300: '#93c5fd',
    400: '#60a5fa',
    500: '#3b82f6',
    600: '#2563eb',
    700: '#1d4ed8',
    800: '#1e40af',
    900: '#1e3a8a',
  },

  // Accent colors
  accent: {
    yellow: {
      50: '#fffdf0',
      100: '#fff8cc',
      200: '#fff399',
      300: '#ffee66',
      400: '#ffe933',
      500: '#fec40d',
      600: '#e5b00c',
      700: '#cc9c0b',
      800: '#b3880a',
      900: '#997409',
    },
    orange: {
      50: '#fef7f0',
      100: '#fdebd1',
      200: '#fbdfb2',
      300: '#f9d393',
      400: '#f7c774',
      500: '#f58020',
      600: '#dd731d',
      700: '#c5661a',
      800: '#ad5917',
      900: '#954c14',
    },
    red: {
      50: '#fdf2f2',
      100: '#fbe6e6',
      200: '#f9d9d9',
      300: '#f7cccc',
      400: '#f5bfbf',
      500: '#d64246',
      600: '#c13b3f',
      700: '#ac3438',
      800: '#972d31',
      900: '#82262a',
    },
    green: {
      50: '#f0f9f6',
      100: '#d1f0e6',
      200: '#b2e7d6',
      300: '#93dec6',
      400: '#74d5b6',
      500: '#098855',
      600: '#087a4c',
      700: '#076c43',
      800: '#065e3a',
      900: '#055031',
    },
  },

  // Semantic colors
  semantic: {
    success: '#098855',
    warning: '#fec40d',
    error: '#d64246',
    info: '#2563eb',
  },

  // Neutral colors
  neutral: {
    50: '#f9fafb',
    100: '#f3f4f6',
    200: '#e5e7eb',
    300: '#d1d5db',
    400: '#9ca3af',
    500: '#6b7280',
    600: '#4b5563',
    700: '#374151',
    800: '#1f2937',
    900: '#111827',
  },

  // Background colors
  background: {
    primary: '#ffffff',
    secondary: '#f9fafb',
    tertiary: '#f3f4f6',
    dark: '#111827',
    darkSecondary: '#1f2937',
    darkTertiary: '#374151',
  },

  // Text colors
  text: {
    primary: '#111827',
    secondary: '#374151',
    tertiary: '#6b7280',
    inverse: '#ffffff',
    muted: '#9ca3af',
  },

  // Border colors
  border: {
    light: '#e5e7eb',
    medium: '#d1d5db',
    dark: '#9ca3af',
    focus: '#2563eb',
  },

  // Shadow colors
  shadow: {
    light: 'rgba(37, 99, 235, 0.1)',
    medium: 'rgba(37, 99, 235, 0.15)',
    dark: 'rgba(37, 99, 235, 0.25)',
  },
} as const

// Color utility functions
export const getColor = (colorPath: string) => {
  const path = colorPath.split('.')
  let current: any = colors

  for (const key of path) {
    if (current[key] === undefined) {
      console.warn(`Color not found: ${colorPath}`)
      return colors.primary[600]
    }
    current = current[key]
  }

  return current
}

export const { primary, secondary, accent, semantic, neutral, background, text, border, shadow } = colors

export default colors
