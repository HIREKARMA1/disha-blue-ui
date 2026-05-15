"use client"

import { CorporateDashboardLayout } from "@/components/dashboard/CorporateDashboardLayout"
import { CorporateApplicationsSection } from "@/components/corporate/applications/CorporateApplicationsSection"

export default function CorporateApplications() {
  return (
    <CorporateDashboardLayout>
      <CorporateApplicationsSection />
    </CorporateDashboardLayout>
  )
}
