"use client"

import { Camera, Mic, ShieldAlert } from "lucide-react"
import { Button } from "@/components/ui/button"

interface Props {
  hasPermission: boolean
  error: string | null
  onRequestPermissions: () => void
}

export function PermissionGate({ hasPermission, error, onRequestPermissions }: Props) {
  return (
    <div className="dashboard-overview-card p-8">
      <h2 className="font-display text-2xl font-semibold text-slate-900 dark:text-emerald-50">Allow microphone and camera access</h2>
      <p className="mt-2 text-sm text-slate-600 dark:text-emerald-200/85">
        We need camera and microphone permissions to run a real mock interview with voice and video.
      </p>
      <div className="mt-6 grid gap-3 md:grid-cols-2">
        <div className="rounded-2xl border border-slate-200/90 bg-white p-4 dark:border-emerald-800 dark:bg-emerald-950/30">
          <Mic className="mb-2 h-5 w-5 text-sage-deep dark:text-emerald-300" />
          <p className="text-sm font-semibold text-slate-900 dark:text-emerald-50">Microphone</p>
          <p className="text-xs text-slate-600 dark:text-emerald-300">Capture your spoken response for AI processing.</p>
        </div>
        <div className="rounded-2xl border border-slate-200/90 bg-white p-4 dark:border-emerald-800 dark:bg-emerald-950/30">
          <Camera className="mb-2 h-5 w-5 text-sage-deep dark:text-emerald-300" />
          <p className="text-sm font-semibold text-slate-900 dark:text-emerald-50">Camera</p>
          <p className="text-xs text-slate-600 dark:text-emerald-300">Show your live video feed inside interview room.</p>
        </div>
      </div>
      {error && (
        <div className="mt-4 flex items-start gap-2 rounded-2xl border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-950/20 dark:text-red-200">
          <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}
      {hasPermission ? (
        <p className="mt-5 text-sm font-medium text-emerald-700 dark:text-emerald-300">Permissions granted. Loading interview session...</p>
      ) : (
        <Button onClick={onRequestPermissions} className="mt-5 h-11 bg-sage-deep text-white hover:bg-sage-deep/90 dark:bg-emerald-600 dark:hover:bg-emerald-500">
          Grant Access
        </Button>
      )}
    </div>
  )
}
