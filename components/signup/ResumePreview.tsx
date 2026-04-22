"use client"

import { useMemo, useState } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { downloadResumePdfFromHtml } from "@/lib/resumePdf"

export type OnboardingResumeTemplate = "blue_collar_basic" | "compact_professional" | "simple-ats" | "modern-clean" | "compact"

interface ResumePreviewProps {
  resume: any
  resumeHtml?: string
  regenerating?: boolean
  onChange?: (next: any) => void
  onTemplateChange?: (template: OnboardingResumeTemplate) => void
  template?: OnboardingResumeTemplate
}

export function ResumePreview({
  resume,
  resumeHtml = "",
  regenerating = false,
  template = "blue_collar_basic",
  onChange,
  onTemplateChange,
}: ResumePreviewProps) {
  const [local, setLocal] = useState<any>(resume)
  const [pdfBusy, setPdfBusy] = useState(false)
  const merged = useMemo(() => local || resume, [local, resume])

  const update = (path: string, value: any) => {
    const next = JSON.parse(JSON.stringify(merged))
    const keys = path.split(".")
    let current = next
    for (let i = 0; i < keys.length - 1; i += 1) current = current[keys[i]]
    current[keys[keys.length - 1]] = value
    setLocal(next)
    onChange?.(next)
  }

  const displayName = merged?.header?.full_name || merged?.personal_info?.name || ""
  const skillsJoined = Array.isArray(merged?.skills) ? merged.skills.join(", ") : ""

  const downloadPdf = async () => {
    if (!resumeHtml?.trim()) return
    setPdfBusy(true)
    try {
      const safeName = String(displayName || "resume").replace(/[^\w\s-]/g, "").trim() || "resume"
      await downloadResumePdfFromHtml(resumeHtml, `${safeName.replace(/\s+/g, "_")}_resume.pdf`)
    } finally {
      setPdfBusy(false)
    }
  }

  return (
    <div className="space-y-4">
      <div className="grid gap-3 rounded-xl border bg-muted/20 p-3">
        <div>
          <label className="text-xs font-medium">Template</label>
          <select
            className="mt-1 w-full rounded-md border bg-background px-2 py-2 text-sm"
            value={template === "simple-ats" || template === "modern-clean" ? "blue_collar_basic" : template}
            disabled={regenerating}
            onChange={(e) => onTemplateChange?.(e.target.value as OnboardingResumeTemplate)}
          >
            <option value="blue_collar_basic">Blue collar basic (ATS)</option>
            <option value="compact_professional">Compact professional</option>
          </select>
        </div>
        <Input
          placeholder="Name"
          value={displayName}
          onChange={(e) => {
            const v = e.target.value
            update("header.full_name", v)
            update("personal_info.name", v)
          }}
        />
        <Input
          placeholder="Skills (comma separated)"
          value={skillsJoined}
          onChange={(e) => update("skills", e.target.value.split(",").map((v: string) => v.trim()).filter(Boolean))}
        />
        <textarea
          className="min-h-24 w-full rounded-md border bg-background px-3 py-2 text-sm"
          placeholder="Professional summary"
          value={String(merged?.professional_summary || merged?.summary || "")}
          onChange={(e) => {
            const v = e.target.value
            update("professional_summary", v)
            update("summary", v)
          }}
        />
      </div>
      <div className="flex flex-wrap gap-2">
        <Button
          type="button"
          onClick={() => void downloadPdf()}
          disabled={!resumeHtml?.trim() || pdfBusy || regenerating}
          loading={pdfBusy}
        >
          Download Resume (PDF)
        </Button>
      </div>
    </div>
  )
}
