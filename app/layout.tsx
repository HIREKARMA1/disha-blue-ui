import type { Metadata, Viewport } from 'next'
import { Inter, Noto_Sans_Devanagari, Noto_Sans_Oriya, Poppins, Plus_Jakarta_Sans, Sora } from 'next/font/google'
import './globals.css'
import { ThemeProvider } from '@/components/providers/theme-provider'
import { AppQueryProvider } from '@/components/providers/query-provider'
import { LoadingProvider } from '@/contexts/LoadingContext'
import { LocaleProvider } from '@/contexts/LocaleContext'
import { Toaster } from 'react-hot-toast'
import { BRANDING } from '@/config/branding'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })
const poppins = Poppins({
  weight: ['400', '500', '600', '700'],
  subsets: ['latin'],
  variable: '--font-poppins',
})
const display = Plus_Jakarta_Sans({
  subsets: ['latin'],
  variable: '--font-display',
  weight: ['400', '500', '600', '700', '800'],
})
const sora = Sora({
  subsets: ['latin'],
  variable: '--font-sora',
  weight: ['300', '400', '600', '700', '800'],
})
const devanagari = Noto_Sans_Devanagari({
  subsets: ['devanagari'],
  variable: '--font-devanagari',
  weight: ['400', '500', '600', '700'],
})
const odia = Noto_Sans_Oriya({
  subsets: ['oriya'],
  variable: '--font-odia',
  weight: ['400', '500', '600', '700'],
})

export const metadata: Metadata = {
  title: `${BRANDING.appName} - ${BRANDING.tagline}`,
  description: BRANDING.tagline,

}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
  <html lang="en" suppressHydrationWarning>
  <body
  className={`${inter.variable} ${poppins.variable} ${display.variable} ${sora.variable} ${devanagari.variable} ${odia.variable} font-sans antialiased`}
  >
  <ThemeProvider
  attribute="class"
  defaultTheme="system"
  enableSystem
  disableTransitionOnChange
  >
  <AppQueryProvider>
  <LocaleProvider>
  <LoadingProvider>
  {children}
  <Toaster
  position="top-right"
  toastOptions={{
  duration: 4000,
  style: {
  background: 'var(--toast-bg)',
  color: 'var(--toast-color)',
  border: '1px solid var(--toast-border)',
  },
  }}
  />
  </LoadingProvider>
  </LocaleProvider>
  </AppQueryProvider>
  </ThemeProvider>
  </body>
  </html>
  )
}
