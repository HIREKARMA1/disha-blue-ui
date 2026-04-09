export const BRANDING = {
  appName: process.env.NEXT_PUBLIC_APP_NAME || 'APP_NAME',
  tagline: process.env.NEXT_PUBLIC_APP_TAGLINE || 'Hyper-local opportunity platform',
  logoLight: process.env.NEXT_PUBLIC_LOGO_LIGHT || '/images/HKlogoblack.png',
  logoDark: process.env.NEXT_PUBLIC_LOGO_DARK || '/images/HKlogowhite.png',
  supportEmail: process.env.NEXT_PUBLIC_SUPPORT_EMAIL || 'support@example.com',
} as const

export type BrandingConfig = typeof BRANDING
