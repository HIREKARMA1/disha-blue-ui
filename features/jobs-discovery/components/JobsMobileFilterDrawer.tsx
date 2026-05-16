"use client"

import { X } from "lucide-react"
import { JobsFiltersSidebar, type JobsFilterValues } from "./JobsFiltersSidebar"

type Props = {
  open: boolean
  onClose: () => void
  filters: JobsFilterValues
  onChange: (key: keyof JobsFilterValues, value: string) => void
  onApply: () => void
  onClear: () => void
}

export function JobsMobileFilterDrawer({ open, onClose, filters, onChange, onApply, onClear }: Props) {
  if (!open) return null

  return (
    <div className="fixed inset-0 z-[60] flex items-end justify-center p-0 sm:items-center sm:p-4 lg:hidden">
      <button
        type="button"
        className="absolute inset-0 bg-[#0a0e1a]/45 backdrop-blur-[2px]"
        onClick={onClose}
        aria-label="Close filters"
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="jobs-filter-title"
        className="relative flex max-h-[min(88vh,640px)] w-full flex-col overflow-hidden rounded-t-[1.25rem] border border-[#dde3f5] bg-white shadow-2xl sm:max-h-[85vh] sm:max-w-md sm:rounded-2xl dark:border-blue-900 dark:bg-slate-950"
      >
        <div className="flex shrink-0 items-center justify-between border-b border-[#e8edf5] px-4 py-3.5 dark:border-blue-900/60">
          <p id="jobs-filter-title" className="text-lg font-bold text-[#0a0e1a] dark:text-white">
            Filters
          </p>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-[#7a85a8] transition hover:bg-[#f0f4ff] dark:hover:bg-blue-900/50"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4">
          <JobsFiltersSidebar
            filters={filters}
            onChange={onChange}
            onApply={() => {
              onApply()
              onClose()
            }}
            onClear={onClear}
            className="border-0 bg-transparent p-0 shadow-none"
          />
        </div>
      </div>
    </div>
  )
}
