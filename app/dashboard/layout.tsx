"use client"

import { useEffect } from "react"
import { usePathname, useRouter } from "next/navigation"

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    const token =
      localStorage.getItem("access_token") ||
      localStorage.getItem("token")

    if (!token) {
      router.replace("/auth/login")
    }
  }, [pathname, router])

  return <>{children}</>
}
