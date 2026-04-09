"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { Navbar } from "@/components/ui/navbar"
import { useAuth } from "@/hooks/useAuth"
import HeroSection from "@/components/home/HeroSection"
import RoleSplitSection from "@/components/home/RoleSplitSection"
import TrustStatsSection from "@/components/home/TrustStatsSection"
import HowItsWork from "@/components/home/HowItsWork"
import FeaturesSection from "@/components/home/FeaturesSection"
import TestimonialsSection from "@/components/home/TestimonialsSection"
import PartnersSection from "@/components/home/PartnersSection"
import FAQSection from "@/components/home/FAQSection"
import CTASection from "@/components/home/CTASection"
import { Footer } from "@/components/ui/footer"

export default function HomePage() {
  const { user, isAuthenticated, isLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading && isAuthenticated && user) {
      router.replace(`/dashboard/${user.user_type}`)
    }
  }, [isLoading, isAuthenticated, user, router])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar variant="transparent" />
        <div className="flex min-h-screen items-center justify-center px-4">
          <div className="text-center">
            <div className="mx-auto mb-4 h-14 w-14 animate-spin rounded-full border-2 border-muted border-t-primary" />
            <p className="text-sm text-muted-foreground">Loading…</p>
          </div>
        </div>
      </div>
    )
  }

  if (isAuthenticated) {
    return null
  }

  return (
    <main className="min-h-screen bg-background text-foreground">
      <Navbar variant="transparent" />
      <HeroSection />
      <RoleSplitSection />
      <TrustStatsSection />
      <HowItsWork />
      <FeaturesSection />
      <PartnersSection />
      <TestimonialsSection />
      <FAQSection />
      <CTASection />
      <div id="about" className="scroll-mt-24">
        <Footer />
      </div>
    </main>
  )
}
