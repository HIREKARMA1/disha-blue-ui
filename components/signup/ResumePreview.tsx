"use client"

import { useMemo, useState } from "react"
import jsPDF from "jspdf"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

interface ResumePreviewProps {
  resume: any
  onChange?: (next: any) => void
  onTemplateChange?: (template: "simple-ats" | "modern-clean" | "compact") => void
  template?: "simple-ats" | "modern-clean" | "compact"
}

export function ResumePreview({ resume, template = "simple-ats", onChange, onTemplateChange }: ResumePreviewProps) {
  const [local, setLocal] = useState<any>(resume)
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

  const downloadPdf = () => {
    const doc = new jsPDF()
    const content = JSON.stringify(merged, null, 2)
    doc.setFontSize(10)
    doc.text(content, 10, 10, { maxWidth: 190 })
    doc.save("resume.pdf")
  }

  const downloadDocx = () => {
    const blob = new Blob([JSON.stringify(merged, null, 2)], {
      type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "resume.docx"
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="space-y-4">
      <div className="grid gap-3 rounded-xl border bg-muted/20 p-3">
        <div>
          <label className="text-xs font-medium">Template</label>
          <select
            className="mt-1 w-full rounded-md border bg-background px-2 py-2 text-sm"
            value={template}
            onChange={(e) => onTemplateChange?.(e.target.value as "simple-ats" | "modern-clean" | "compact")}
          >
            <option value="simple-ats">Simple ATS</option>
            <option value="modern-clean">Modern clean</option>
            <option value="compact">Compact</option>
          </select>
        </div>
        <Input
          placeholder="Name"
          value={merged?.personal_info?.name || ""}
          onChange={(e) => update("personal_info.name", e.target.value)}
        />
        <Input
          placeholder="Skills (comma separated)"
          value={(merged?.skills || []).join(", ")}
          onChange={(e) => update("skills", e.target.value.split(",").map((v: string) => v.trim()).filter(Boolean))}
        />
        <textarea
          className="min-h-24 w-full rounded-md border bg-background px-3 py-2 text-sm"
          placeholder="Experience bullets (one per line)"
          value={((merged?.experience?.[0]?.bullets as string[]) || []).join("\n")}
          onChange={(e) => update("experience.0.bullets", e.target.value.split("\n").map((v) => v.trim()).filter(Boolean))}
        />
      </div>
      <div className="flex gap-2">
        <Button onClick={downloadPdf}>Download PDF</Button>
        <Button variant="outline" onClick={downloadDocx}>
          Download DOCX
        </Button>
      </div>
    </div>
  )
}
