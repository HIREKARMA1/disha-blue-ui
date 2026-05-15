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
    <div className="fixed inset-0 z-50 lg:hidden">
      <button
        type="button"
        className="absolute inset-0 bg-[#0a0e1a]/40 backdrop-blur-sm"
        onClick={onClose}
        aria-label="Close filters"
      />
      <div className="absolute bottom-0 left-0 right-0 max-h-[88vh] overflow-y-auto rounded-t-2xl border-t border-[#dde3f5] bg-white p-4 shadow-2xl dark:border-blue-900 dark:bg-slate-950">
        <div className="mb-3 flex items-center justify-between">
          <p className="text-lg font-bold text-[#0a0e1a] dark:text-white">Filters</p>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-[#7a85a8] hover:bg-[#f0f4ff]"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
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
  )
}
