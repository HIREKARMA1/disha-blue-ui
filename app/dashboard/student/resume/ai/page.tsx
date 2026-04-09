"use client"

import { StudentDashboardLayout } from "@/components/dashboard/StudentDashboardLayout"
import { AIResumeBuilderPage } from "@/components/resume-builder/AIResumeBuilderPage"

export default function AIResumeDashboardPage() {
  return (
    <StudentDashboardLayout>
      <AIResumeBuilderPage />
    </StudentDashboardLayout>
  )
}
