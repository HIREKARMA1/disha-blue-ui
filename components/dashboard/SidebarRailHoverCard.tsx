"use client"

import { useRef, useState, useEffect, useCallback } from "react"
import { createPortal } from "react-dom"
import Link from "next/link"
import { ChevronRight, type LucideIcon } from "lucide-react"
import { cn } from "@/lib/utils"

export type SidebarRailHoverItem = {
  label: string
  href: string
  icon: LucideIcon
  description?: string
}

type SidebarRailHoverCardProps = {
  item: SidebarRailHoverItem
  isActive: boolean
  railLinkClassName: string
  dataSidebarItem?: "active" | "inactive"
  onNavigate?: () => void
  learnMoreLabel?: string
}

const CLOSE_MS = 160

export function SidebarRailHoverCard({
  item,
  isActive,
  railLinkClassName,
  dataSidebarItem,
  onNavigate,
  learnMoreLabel = "Find out more",
}: SidebarRailHoverCardProps) {
  const triggerRef = useRef<HTMLAnchorElement>(null)
  const [open, setOpen] = useState(false)
  const [coords, setCoords] = useState({ top: 0, left: 0 })
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const [mounted, setMounted] = useState(false)

  useEffect(() => setMounted(true), [])

  const updatePosition = useCallback(() => {
    const el = triggerRef.current
    if (!el) return
    const r = el.getBoundingClientRect()
    setCoords({ top: r.top + r.height / 2, left: r.right })
  }, [])

  const cancelClose = useCallback(() => {
    if (closeTimerRef.current) {
      clearTimeout(closeTimerRef.current)
      closeTimerRef.current = null
    }
  }, [])

  const scheduleClose = useCallback(() => {
    cancelClose()
    closeTimerRef.current = setTimeout(() => {
      setOpen(false)
      closeTimerRef.current = null
    }, CLOSE_MS)
  }, [cancelClose])

  const handleOpen = useCallback(() => {
    if (typeof window !== "undefined" && !window.matchMedia("(min-width: 1024px)").matches) {
      return
    }
    cancelClose()
    updatePosition()
    setOpen(true)
  }, [cancelClose, updatePosition])

  useEffect(() => {
    if (!open) return
    updatePosition()
    const onUpdate = () => updatePosition()
    window.addEventListener("scroll", onUpdate, true)
    window.addEventListener("resize", onUpdate)
    return () => {
      window.removeEventListener("scroll", onUpdate, true)
      window.removeEventListener("resize", onUpdate)
    }
  }, [open, updatePosition])

  useEffect(() => {
    return () => {
      if (closeTimerRef.current) clearTimeout(closeTimerRef.current)
    }
  }, [])

  useEffect(() => {
    if (!open) {
      setPreviewUrl(null)
      return
    }
    if (typeof window === "undefined") return
    const u = new URL(item.href, window.location.origin)
    u.searchParams.set("sidebarPreview", "1")
    setPreviewUrl(u.toString())
  }, [open, item.href])

  const Icon = item.icon

  const popover =
    open && mounted ? (
      createPortal(
        <div
          className="pointer-events-none fixed z-[100] hidden lg:block"
          style={{
            top: coords.top,
            left: coords.left,
            transform: "translateY(-50%)",
          }}
        >
          <div
            className="pointer-events-auto flex items-center pl-1"
            onMouseEnter={handleOpen}
            onMouseLeave={scheduleClose}
          >
            <div
              className="shrink-0 border-y-8 border-y-transparent border-r-[9px] border-r-white dark:border-r-blue-900"
              aria-hidden
            />
            <div
              className={cn(
                "max-w-[17.5rem] overflow-hidden rounded-none border border-slate-200 bg-white shadow-none",
                "dark:border-blue-800 dark:bg-blue-900 dark:shadow-black/30",
              )}
            >
              <div className="relative h-40 w-full overflow-hidden bg-gray-950">
                {previewUrl ? (
                  <iframe
                    key={previewUrl}
                    src={previewUrl}
                    title={`${item.label} preview`}
                    className="pointer-events-none absolute left-0 top-0 block h-[800px] w-[1280px] max-w-none origin-top-left scale-[0.2] border-0"
                    loading="eager"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center bg-slate-100 dark:bg-blue-950">
                    <Icon
                      className="h-12 w-12 text-slate-600 dark:text-blue-200"
                      strokeWidth={1.25}
                    />
                  </div>
                )}
              </div>
              <div className="space-y-2 p-4">
                <h3 className="text-base font-semibold leading-tight text-slate-900 dark:text-blue-50">
                  {item.label}
                </h3>
                {item.description ? (
                  <p className="text-sm leading-snug text-slate-600 dark:text-blue-200/85">
                    {item.description}
                  </p>
                ) : null}
                <Link
                  href={item.href}
                  className="inline-flex items-center gap-1 pt-1 text-sm font-medium text-slate-800 hover:text-slate-950 dark:text-blue-100 dark:hover:text-white"
                  onClick={() => {
                    onNavigate?.()
                    setOpen(false)
                  }}
                >
                  {learnMoreLabel}
                  <ChevronRight className="h-4 w-4" strokeWidth={2} />
                </Link>
              </div>
            </div>
          </div>
        </div>,
        document.body,
      )
    ) : null

  return (
    <>
      <Link
        ref={triggerRef}
        href={item.href}
        data-sidebar-item={dataSidebarItem}
        className={cn(
          railLinkClassName,
          !isActive && "rounded-none hover:bg-slate-100 dark:hover:bg-blue-900",
        )}
        onClick={() => onNavigate?.()}
        onMouseEnter={handleOpen}
        onMouseLeave={scheduleClose}
      >
        <Icon className="h-5 w-5" strokeWidth={1.75} />
      </Link>
      {popover}
    </>
  )
}
