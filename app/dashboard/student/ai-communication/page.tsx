"use client"

import { StudentDashboardLayout } from "@/components/dashboard/StudentDashboardLayout"
import { AICommunicationRoom } from "@/components/communication/AICommunicationRoom"

export default function AICommunicationPage() {
  return (
    <StudentDashboardLayout>
      <div className="space-y-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">AI Communication Assessment</h1>
          <p className="text-sm text-muted-foreground">
            Real-time voice conversation with AI trainer, multilingual support, and automatic feedback.
          </p>
        </div>
        <AICommunicationRoom />
      </div>
    </StudentDashboardLayout>
  )
}
