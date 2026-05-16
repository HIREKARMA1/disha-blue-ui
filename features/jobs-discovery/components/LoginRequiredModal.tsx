"use client"

import { useRouter } from "next/navigation"
import { AnimatePresence, motion } from "framer-motion"
import { Users, X } from "lucide-react"
import { useTranslation } from "@/hooks/useTranslation"
import { cn } from "@/lib/utils"

export interface LoginRequiredModalProps {
  open: boolean
  onClose: () => void
  /** Path to return to after login (e.g. `/jobs` or `/jobs/abc`). */
  redirectPath?: string
  className?: string
}

export function LoginRequiredModal({
  open,
  onClose,
  redirectPath = "/jobs",
  className,
}: LoginRequiredModalProps) {
  const router = useRouter()
  const { t } = useTranslation()

  const loginHref = `/auth/login?redirect=${encodeURIComponent(redirectPath)}&type=student`

  const handleLogin = () => {
    onClose()
    router.push(loginHref)
  }

  return (
    <AnimatePresence>
      {open ? (
        <div
          className={cn("fixed inset-0 z-[100] flex items-center justify-center p-4", className)}
          role="presentation"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-md"
            aria-hidden
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 8 }}
            transition={{ type: "spring", stiffness: 380, damping: 28 }}
            role="dialog"
            aria-modal="true"
            aria-labelledby="login-required-title"
            className="relative w-full max-w-[400px] rounded-[20px] bg-white p-6 shadow-[0_24px_48px_-12px_rgba(15,23,42,0.22)]"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={onClose}
              className="absolute right-4 top-4 rounded-lg p-1 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
              aria-label={t("jobs.loginRequired.close")}
            >
              <X className="h-5 w-5" />
            </button>

            <div className="flex flex-col items-center text-center">
              <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-[#e8f0ff]">
                <Users className="h-7 w-7 text-[#2563eb]" strokeWidth={1.75} aria-hidden />
              </div>

              <h2
                id="login-required-title"
                className="text-xl font-bold tracking-tight text-[#0a0e1a]"
              >
                {t("jobs.loginRequired.title")}
              </h2>
              <p className="mt-2 max-w-[280px] text-sm leading-relaxed text-[#5c6478]">
                {t("jobs.loginRequired.description")}
              </p>

              <div className="mt-6 flex w-full gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="h-11 flex-1 rounded-lg border border-slate-200 bg-white text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                >
                  {t("jobs.loginRequired.cancel")}
                </button>
                <button
                  type="button"
                  onClick={handleLogin}
                  className="h-11 flex-1 rounded-lg bg-[#2563eb] text-sm font-semibold text-white shadow-[0_4px_14px_-4px_rgba(37,99,235,0.55)] transition hover:bg-[#1d4ed8]"
                >
                  {t("jobs.loginRequired.loginNow")}
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      ) : null}
    </AnimatePresence>
  )
}
