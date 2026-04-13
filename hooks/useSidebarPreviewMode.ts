"use client"

import { useSearchParams } from "next/navigation"

/** When true, dashboard shell should hide navbar + sidebar (used by sidebar hover iframe previews). */
export function useSidebarPreviewMode(): boolean {
  const searchParams = useSearchParams()
  return searchParams.get("sidebarPreview") === "1"
}
