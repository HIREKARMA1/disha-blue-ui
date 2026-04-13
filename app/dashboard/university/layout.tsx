"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"

export default function UniversityRouteDeprecatedLayout() {
 const router = useRouter()

 useEffect(() => {
 // Legacy route group is intentionally retired from active product flow.
 router.replace("/dashboard")
 }, [router])

 return null
}
