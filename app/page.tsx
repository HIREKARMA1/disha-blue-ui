"use client"

import { Navbar } from "@/components/ui/navbar"
import { useAuth } from "@/hooks/useAuth"
import HeroSection from "@/components/home/HeroSection"
import ConnectionStoriesSection from "@/components/home/ConnectionStoriesSection"
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
  const { isLoading } = useAuth()

  if (isLoading) {
  return (
  <div className="min-h-screen bg-[#F7F7F5] dark:bg-emerald-950">
  <Navbar variant="transparent" />
  <div className="flex min-h-screen items-center justify-center px-4">
  <div className="text-center">
  <p className="text-sm text-slate-600 dark:text-emerald-300">Loading…</p>
  </div>
  </div>
  </div>
  )
  }

  return (
  <main className="min-h-screen bg-[#F7F7F5] text-slate-900 dark:bg-emerald-950 dark:text-emerald-50">
  <Navbar variant="transparent" />
  <HeroSection />
  <ConnectionStoriesSection />
  <RoleSplitSection />
  <TrustStatsSection />
  <HowItsWork />
  <FeaturesSection />
  <PartnersSection />
  <TestimonialsSection />
  <FAQSection />
  <CTASection />
  <div id="about" className="scroll-mt-24">
  <Footer hideIcons />
  </div>
  </main>
  )
}
