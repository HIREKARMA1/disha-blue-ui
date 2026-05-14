"use client"

import { useEffect, useMemo, useState } from "react"
import { Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { SectionAiEnhanceModal } from "@/components/resume-builder/templates/minimal-classic/SectionAiEnhanceModal"
import { resumeService } from "@/services/resumeService"
import toast from "react-hot-toast"

const AI_COPY = {
  editor: {
    aiModalTitle: "Enhance with AI",
    aiInstructionLabel: "What should the AI focus on?",
    aiInstructionPlaceholder: "e.g. Stronger verbs, tighter bullets, align with software roles…",
    aiApply: "Apply enhancement",
    aiCancel: "Cancel",
    aiWorking: "Enhancing…",
  },
  ai: {
    sectionContextHeader: "Name and target role (for tone only):",
    defaultInstruction: "Polish for clarity and professional tone without adding new facts.",
  },
} as const

type ClassicAiTarget =
  | { kind: "summary" }
  | { kind: "skills_technical" }
  | { kind: "skills_soft" }
  | { kind: "skills_languages" }
  | { kind: "experience"; index: number }
  | { kind: "education"; index: number }
  | { kind: "project"; index: number }
  | { kind: "certification"; index: number }

type ResumeData = {
  header: { fullName: string }
  summary: string
  experience: Array<{ id: string; company: string; position: string; description: string[] }>
  education: Array<{ id: string; institution: string; degree: string; achievements: string[] }>
  skills: { technical: string[]; soft: string[]; languages: string[] }
  projects: Array<{ id: string; name: string; description: string }>
  certifications: Array<{ id: string; name: string; issuer: string; date: string; link: string }>
}

function targetLabel(t: ClassicAiTarget): string {
  switch (t.kind) {
    case "summary":
      return "Summary"
    case "skills_technical":
      return "Technical skills"
    case "skills_soft":
      return "Soft skills"
    case "skills_languages":
      return "Languages"
    case "experience":
      return `Experience #${t.index + 1}`
    case "education":
      return `Education #${t.index + 1}`
    case "project":
      return `Project #${t.index + 1}`
    case "certification":
      return `Certification #${t.index + 1}`
    default:
      return "Section"
  }
}

function getCurrentText(data: ResumeData, target: ClassicAiTarget): string {
  switch (target.kind) {
    case "summary":
      return data.summary || ""
    case "skills_technical":
      return (data.skills?.technical || []).filter(Boolean).join(", ")
    case "skills_soft":
      return (data.skills?.soft || []).filter(Boolean).join(", ")
    case "skills_languages":
      return (data.skills?.languages || []).filter(Boolean).join(", ")
    case "experience": {
      const row = data.experience[target.index]
      if (!row) return ""
      return [row.position, row.company, ...(row.description || [])].filter(Boolean).join("\n")
    }
    case "education": {
      const row = data.education[target.index]
      if (!row) return ""
      return [row.degree, row.institution, ...(row.achievements || [])].filter(Boolean).join("\n")
    }
    case "project": {
      const row = data.projects[target.index]
      return row ? [row.name, row.description].filter(Boolean).join("\n") : ""
    }
    case "certification": {
      const row = data.certifications[target.index]
      return row ? [row.name, row.issuer, row.date, row.link].filter(Boolean).join("\n") : ""
    }
    default:
      return ""
  }
}

function applyEnhanced(data: ResumeData, target: ClassicAiTarget, text: string): ResumeData {
  const next = { ...data, header: { ...data.header }, skills: { ...data.skills } }
  const lines = text.split("\n").map((l) => l.trim()).filter(Boolean)

  switch (target.kind) {
    case "summary":
      return { ...next, summary: text.trim() }
    case "skills_technical":
      return {
        ...next,
        skills: {
          ...next.skills,
          technical: text
            .split(/[,;\n]+/)
            .map((s) => s.trim())
            .filter(Boolean),
        },
      }
    case "skills_soft":
      return {
        ...next,
        skills: {
          ...next.skills,
          soft: text
            .split(/[,;\n]+/)
            .map((s) => s.trim())
            .filter(Boolean),
        },
      }
    case "skills_languages":
      return {
        ...next,
        skills: {
          ...next.skills,
          languages: text
            .split(/[,;\n]+/)
            .map((s) => s.trim())
            .filter(Boolean),
        },
      }
    case "experience": {
      const exp = [...next.experience]
      const row = { ...exp[target.index] }
      if (lines.length >= 3) {
        row.position = lines[0]
        row.company = lines[1]
        row.description = lines.slice(2).length ? lines.slice(2) : row.description
      } else if (lines.length === 2) {
        row.position = lines[0]
        row.company = lines[1]
      } else {
        row.description = lines.length ? lines : [text.trim()]
      }
      exp[target.index] = row
      return { ...next, experience: exp }
    }
    case "education": {
      const edu = [...next.education]
      const row = { ...edu[target.index] }
      if (lines.length >= 2) {
        row.degree = lines[0]
        row.institution = lines[1]
        row.achievements = lines.slice(2).length ? lines.slice(2) : row.achievements
      } else {
        row.achievements = lines.length ? lines : [text.trim()]
      }
      edu[target.index] = row
      return { ...next, education: edu }
    }
    case "project": {
      const proj = [...next.projects]
      const row = { ...proj[target.index] }
      if (lines.length >= 2) {
        row.name = lines[0]
        row.description = lines.slice(1).join("\n")
      } else {
        row.description = text.trim()
      }
      proj[target.index] = row
      return { ...next, projects: proj }
    }
    case "certification": {
      const cert = [...next.certifications]
      const row = { ...cert[target.index] }
      if (lines.length >= 4) {
        row.name = lines[0]
        row.issuer = lines[1]
        row.date = lines[2]
        row.link = lines[3]
      } else if (lines.length >= 1) {
        row.name = lines[0]
        if (lines[1]) row.issuer = lines[1]
      }
      cert[target.index] = row
      return { ...next, certifications: cert }
    }
    default:
      return next
  }
}

export function ClassicResumeAiPanel({
  resumeData,
  onApply,
}: {
  resumeData: ResumeData
  onApply: (next: ResumeData) => void
}) {
  const [selectedKey, setSelectedKey] = useState("summary")
  const [modalOpen, setModalOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [sectionLabel, setSectionLabel] = useState("")
  const [currentText, setCurrentText] = useState("")

  const options = useMemo(() => {
    const opts: { value: string; label: string; t: ClassicAiTarget }[] = [
      { value: "summary", label: "Professional summary", t: { kind: "summary" } },
      { value: "skills_technical", label: "Technical skills (comma-separated)", t: { kind: "skills_technical" } },
      { value: "skills_soft", label: "Soft skills (comma-separated)", t: { kind: "skills_soft" } },
      { value: "skills_languages", label: "Languages (comma-separated)", t: { kind: "skills_languages" } },
    ]
    resumeData.experience.forEach((_, i) => {
      opts.push({ value: `exp-${i}`, label: `Experience ${i + 1}`, t: { kind: "experience", index: i } })
    })
    resumeData.education.forEach((_, i) => {
      opts.push({ value: `edu-${i}`, label: `Education ${i + 1}`, t: { kind: "education", index: i } })
    })
    resumeData.projects.forEach((_, i) => {
      opts.push({ value: `proj-${i}`, label: `Project ${i + 1}`, t: { kind: "project", index: i } })
    })
    resumeData.certifications.forEach((_, i) => {
      opts.push({ value: `cert-${i}`, label: `Certification ${i + 1}`, t: { kind: "certification", index: i } })
    })
    return opts
  }, [resumeData])

  const target = useMemo(() => {
    const opt = options.find((o) => o.value === selectedKey)
    return opt?.t ?? ({ kind: "summary" } as ClassicAiTarget)
  }, [options, selectedKey])

  useEffect(() => {
    if (!options.some((o) => o.value === selectedKey)) {
      setSelectedKey("summary")
    }
  }, [options, selectedKey])

  useEffect(() => {
    setCurrentText(getCurrentText(resumeData, target))
  }, [resumeData, target])

  const openModal = () => {
    setSectionLabel(targetLabel(target))
    setCurrentText(getCurrentText(resumeData, target))
    setModalOpen(true)
  }

  const runAi = async (instruction: string) => {
    const locale = typeof window !== "undefined" ? localStorage.getItem("locale") || "en" : "en"
    const ctx = `${AI_COPY.ai.sectionContextHeader}\n${resumeData.header?.fullName || ""}`
    setLoading(true)
    try {
      const res = await resumeService.enhanceResumeSection({
        section_type: `classic:${JSON.stringify(target)}`,
        section_context: ctx,
        user_instruction: instruction || AI_COPY.ai.defaultInstruction,
        current_text: currentText,
        language: locale,
      })
      onApply(applyEnhanced(resumeData, target, res.enhanced_text))
      setModalOpen(false)
      toast.success("Section updated")
    } catch (e: unknown) {
      console.error(e)
      const err = e as { response?: { data?: { detail?: unknown } } }
      const detail = err?.response?.data?.detail
      const msg =
        typeof detail === "string"
          ? detail
          : Array.isArray(detail) && detail[0] && typeof (detail[0] as { msg?: string }).msg === "string"
            ? (detail[0] as { msg: string }).msg
            : "AI enhancement failed. Check login and API configuration."
      toast.error(msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="dashboard-overview-card rounded-2xl border border-slate-200/90 p-4 dark:border-emerald-800/60 dark:bg-emerald-950/35">
      <div className="mb-3 flex items-center gap-2">
        <Sparkles className="h-5 w-5 text-sage-deep dark:text-emerald-300" />
        <h2 className="text-base font-semibold text-slate-900 dark:text-emerald-50">Describe details with AI</h2>
      </div>
      <p className="mb-3 text-sm text-slate-600 dark:text-emerald-200/85">
        Pick a section, then open the AI dialog to refine wording. Edit the form after if you need to adjust facts.
      </p>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
        <div className="min-w-0 flex-1">
          <Label className="text-slate-700 dark:text-emerald-200/90">Section</Label>
          <select
            className="mt-1 w-full rounded-xl border border-slate-200/90 bg-white px-3 py-2 text-sm text-slate-900 dark:border-emerald-800/70 dark:bg-emerald-950/50 dark:text-emerald-50"
            value={selectedKey}
            onChange={(e) => setSelectedKey(e.target.value)}
          >
            {options.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </div>
        <Button type="button" onClick={openModal} className="shrink-0">
          <Sparkles className="mr-2 h-4 w-4" />
          Enhance with AI
        </Button>
      </div>
      <div className="mt-3">
        <Label className="text-xs text-slate-500 dark:text-emerald-400/80">Current text (preview)</Label>
        <Textarea readOnly className="mt-1 max-h-28 min-h-[72px] text-xs" value={currentText} />
      </div>

      <SectionAiEnhanceModal
        copy={AI_COPY}
        open={modalOpen}
        sectionLabel={sectionLabel}
        initialInstruction={AI_COPY.ai.defaultInstruction}
        loading={loading}
        onClose={() => !loading && setModalOpen(false)}
        onConfirm={runAi}
      />
    </div>
  )
}
