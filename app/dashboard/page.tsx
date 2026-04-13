"use client"

import { motion } from "framer-motion"
import { Home, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ThemeToggle } from "@/components/ui/theme-toggle"
import { LogoutButton } from "@/components/ui/logout-button"
import Link from "next/link"
import { BRANDING } from "@/config/branding"

export default function Dashboard() {
  return (
    <div className="min-h-screen dashboard-overview-page">
      <header className="border-b border-slate-200/80 bg-white/90 backdrop-blur-sm dark:border-emerald-900 dark:bg-emerald-950/80">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-sage-deep text-white dark:bg-emerald-600">
                <Home className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900 dark:text-emerald-50">Dashboard</h1>
                <p className="text-sm text-gray-600 dark:text-emerald-200/80">Welcome to {BRANDING.appName}</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <ThemeToggle variant="surface" />
              <LogoutButton />
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mx-auto max-w-4xl space-y-8"
        >
          <div className="dashboard-overview-shell">
            <div className="dashboard-overview-card p-8 text-center">
              <div className="mb-6 inline-flex h-20 w-20 items-center justify-center rounded-2xl bg-sage-deep text-white dark:bg-emerald-600">
                <Home className="h-10 w-10 text-white" />
              </div>
              <h2 className="mb-4 text-3xl font-bold text-gray-900 dark:text-emerald-50">Welcome to {BRANDING.appName}!</h2>
              <p className="mb-6 text-lg text-gray-600 dark:text-emerald-200/85">
                Your account has been created successfully. Please check your email for verification.
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                <Link href="/">
                  <Button className="rounded-full">
                    Go to Home
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
                <Button variant="outline" className="rounded-full">
                  Complete Profile
                </Button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
            <div className="dashboard-overview-card-interactive p-6 text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-primary-100 dark:bg-emerald-900/60">
                <Home className="h-6 w-6 text-primary-600 dark:text-emerald-300" />
              </div>
              <h3 className="mb-2 font-semibold text-gray-900 dark:text-emerald-50">Home</h3>
              <p className="text-sm text-gray-600 dark:text-emerald-200/75">Return to main page</p>
            </div>

            <div className="dashboard-overview-card-interactive p-6 text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-accent-green-100 dark:bg-emerald-900/60">
                <ArrowRight className="h-6 w-6 text-accent-green-600 dark:text-emerald-300" />
              </div>
              <h3 className="mb-2 font-semibold text-gray-900 dark:text-emerald-50">Get Started</h3>
              <p className="text-sm text-gray-600 dark:text-emerald-200/75">Begin your journey</p>
            </div>

            <div className="dashboard-overview-card-interactive p-6 text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-secondary-100 dark:bg-emerald-900/60">
                <Home className="h-6 w-6 text-secondary-600 dark:text-emerald-300" />
              </div>
              <h3 className="mb-2 font-semibold text-gray-900 dark:text-emerald-50">Explore</h3>
              <p className="text-sm text-gray-600 dark:text-emerald-200/75">Discover opportunities</p>
            </div>

            <div className="dashboard-overview-card-interactive p-6 text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-accent-orange-100 dark:bg-emerald-900/60">
                <ArrowRight className="h-6 w-6 text-accent-orange-600 dark:text-emerald-300" />
              </div>
              <h3 className="mb-2 font-semibold text-gray-900 dark:text-emerald-50">Learn More</h3>
              <p className="text-sm text-gray-600 dark:text-emerald-200/75">About the platform</p>
            </div>
          </div>

          <div className="dashboard-overview-card p-8">
            <h3 className="mb-6 text-center text-2xl font-bold text-gray-900 dark:text-emerald-50">Next Steps</h3>
            <div className="space-y-4">
              <div className="flex items-center space-x-4 rounded-xl bg-gray-50 p-4 dark:bg-emerald-900/30">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary-500 text-sm font-bold text-white">1</div>
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-emerald-50">Verify Your Email</h4>
                  <p className="text-sm text-gray-600 dark:text-emerald-200/75">Check your inbox and click the verification link</p>
                </div>
              </div>
              <div className="flex items-center space-x-4 rounded-xl bg-gray-50 p-4 dark:bg-emerald-900/30">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary-500 text-sm font-bold text-white">2</div>
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-emerald-50">Complete Your Profile</h4>
                  <p className="text-sm text-gray-600 dark:text-emerald-200/75">Add your personal information</p>
                </div>
              </div>
              <div className="flex items-center space-x-4 rounded-xl bg-gray-50 p-4 dark:bg-emerald-900/30">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary-500 text-sm font-bold text-white">3</div>
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-emerald-50">Start Exploring</h4>
                  <p className="text-sm text-gray-600 dark:text-emerald-200/75">Discover nearby opportunities</p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </main>
    </div>
  )
}
