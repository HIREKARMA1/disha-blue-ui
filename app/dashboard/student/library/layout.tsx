"use client"

import { Navbar } from '@/components/ui/navbar'
import { StudentSidebar } from '@/components/dashboard/StudentSidebar'
import { useSidebarPreviewMode } from '@/hooks/useSidebarPreviewMode'

export default function LibraryLayout({
 children,
}: {
 children: React.ReactNode
}) {
 const isSidebarPreview = useSidebarPreviewMode()

 if (isSidebarPreview) {
 return (
 <div className="dashboard-overview-page min-h-screen" data-sidebar-preview>
 <main className="flex-1">{children}</main>
 </div>
 )
 }

 return (
 <div className="dashboard-overview-page min-h-screen">
 <Navbar />
 <div className="flex">
 <StudentSidebar />
 <main className="flex-1 lg:pl-16">
 {children}
 </main>
 </div>
 </div>
 )
}
