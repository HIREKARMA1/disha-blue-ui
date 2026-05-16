"use client"

import { AnimatePresence, motion } from "framer-motion"
import { X } from "lucide-react"
import { cn } from "@/lib/utils"
import type { Job } from "@/components/jobs/AllJobs"
import type { JobLocationCluster } from "../utils/indiaGeo"
import { JobsMapJobCard } from "./JobsMapJobCard"

type Props = {
  cluster: JobLocationCluster | null
  applyingJobId: string | null
  onClose: () => void
  onViewDetails: (job: Job) => void
  onApply: (job: Job) => void
  className?: string
  variant?: "desktop" | "mobile"
}

export function JobsMapSidePanel({
  cluster,
  applyingJobId,
  onClose,
  onViewDetails,
  onApply,
  className,
  variant = "desktop",
}: Props) {
  const isMobile = variant === "mobile"
  const count = cluster?.jobs.length ?? 0
  const title =
    cluster && count === 1
      ? `${cluster.label} — 1 job`
      : cluster
        ? `${cluster.label} — ${count} jobs`
        : ""

  const handleClose = (e?: React.MouseEvent) => {
    e?.preventDefault()
    e?.stopPropagation()
    onClose()
  }

  return (
    <AnimatePresence mode="wait">
      {cluster ? (
        <>
          {isMobile ? (
            <motion.button
              type="button"
              key="backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-[999] bg-slate-900/40 backdrop-blur-[2px] lg:hidden"
              aria-label="Close job list"
              onClick={handleClose}
            />
          ) : null}

          <motion.aside
            key={cluster.id}
            initial={isMobile ? { y: "100%", opacity: 0.9 } : { x: 24, opacity: 0 }}
            animate={isMobile ? { y: 0, opacity: 1 } : { x: 0, opacity: 1 }}
            exit={isMobile ? { y: "100%", opacity: 0 } : { x: 24, opacity: 0 }}
            transition={{ type: "spring", damping: 28, stiffness: 320 }}
            className={cn(
              "flex flex-col overflow-hidden border-slate-200/90 bg-white shadow-2xl dark:border-slate-700 dark:bg-slate-900",
              !isMobile &&
                "absolute bottom-4 right-4 top-4 z-[1000] w-full max-w-[380px] rounded-2xl border",
              isMobile &&
                "fixed inset-x-0 bottom-0 z-[1000] max-h-[min(72vh,560px)] rounded-t-2xl border-t",
              className,
            )}
            role="dialog"
            aria-modal={isMobile}
            aria-labelledby="jobs-map-panel-title"
          >
            <header className="shrink-0 border-b border-slate-100 dark:border-slate-800">
              {isMobile ? (
                <div className="flex justify-center pt-3">
                  <div className="h-1 w-10 rounded-full bg-slate-200 dark:bg-slate-700" />
                </div>
              ) : null}
              <div className="flex items-start justify-between gap-3 px-4 py-4">
                <div className="min-w-0 flex-1 pr-2">
                  <h2
                    id="jobs-map-panel-title"
                    className="text-lg font-bold text-slate-900 dark:text-slate-50"
                  >
                    {title}
                  </h2>
                  <p className="mt-0.5 text-sm text-slate-500">Tap a job to view details or apply</p>
                </div>
                <button
                  type="button"
                  onClick={handleClose}
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-slate-50 text-slate-600 transition hover:border-slate-300 hover:bg-slate-100 active:scale-95 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
                  aria-label="Close panel"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </header>

            <div className="flex-1 space-y-3 overflow-y-auto overscroll-contain px-4 py-4 scroll-smooth">
              {cluster.jobs.map((job, index) => (
                <motion.div
                  key={job.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.04, duration: 0.25 }}
                >
                  <JobsMapJobCard
                    job={job}
                    isApplying={applyingJobId === job.id}
                    onViewDetails={() => onViewDetails(job)}
                    onApply={() => onApply(job)}
                  />
                </motion.div>
              ))}
            </div>
          </motion.aside>
        </>
      ) : null}
    </AnimatePresence>
  )
}
