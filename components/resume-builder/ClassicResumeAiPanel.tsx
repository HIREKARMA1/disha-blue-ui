"use client"

import { useEffect, useState } from "react"
import { Sparkles } from "lucide-react"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { SectionAiEnhanceModal } from "@/components/resume-builder/templates/minimal-classic/SectionAiEnhanceModal"
import { AiEnhanceButton } from "@/components/resume-builder/templates/minimal-classic/AiEnhanceButton"
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

type ClassicAiTarget = { kind: "summary" } | { kind: "experience_description"; index: number }

type ResumeData = {
  header: { fullName: string }
  summary: string
  experience: Array<{ id: string; company: string; position: string; description: string[] }>
  education: Array<{ id: string; institution: string; degree: string; achievements: string[] }>
  skills: { technical: string[]; soft: string[]; languages: string[] }
  projects: Array<{ id: string; name: string; description: string }>
  certifications: Array<{ id: string; name: string; issuer: string; date: string; link: string }>
}

function getCurrentText(data: ResumeData, target: ClassicAiTarget): string {
  if (target.kind === "summary") return data.summary || ""
  const row = data.experience[target.index]
  return (row?.description || []).filter(Boolean).join("\n")
}

function applyEnhanced(data: ResumeData, target: ClassicAiTarget, text: string): ResumeData {
  if (target.kind === "summary") {
    return { ...data, summary: text.trim() }
  }
  const experience = data.experience.map((e, i) => {
    if (i !== target.index) return e
    const lines = text.split("\n").map((l) => l.trim()).filter(Boolean)
    const nextDesc = lines.length ? lines : text.trim() ? [text.trim()] : e.description?.length ? e.description : [""]
    return { ...e, description: nextDesc }
  })
  return { ...data, experience }
}

function targetLabel(t: ClassicAiTarget): string {
  if (t.kind === "summary") return "Professional summary"
  return `Experience ${t.index + 1} description`
}

export function ClassicResumeAiPanel({
  resumeData,
  onApply,
}: {
  resumeData: ResumeData
  onApply: (next: ResumeData) => void
}) {
  const [target, setTarget] = useState<ClassicAiTarget>({ kind: "summary" })
  const [expIndex, setExpIndex] = useState(0)
  const [modalOpen, setModalOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [currentText, setCurrentText] = useState("")

  useEffect(() => {
    const n = resumeData.experience?.length ?? 0
    if (n === 0) return
    setExpIndex((i) => Math.min(Math.max(0, i), n - 1))
  }, [resumeData.experience?.length])

  const openModal = (t: ClassicAiTarget) => {
    setTarget(t)
    setCurrentText(getCurrentText(resumeData, t))
    setModalOpen(true)
  }

  const openExperienceModal = () => {
    if (!resumeData.experience?.length) {
      toast.error("Add a work experience entry first")
      return
    }
    const idx = Math.min(Math.max(0, expIndex), resumeData.experience.length - 1)
    openModal({ kind: "experience_description", index: idx })
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

  const expPreview =
    resumeData.experience?.length && resumeData.experience[expIndex]
      ? (resumeData.experience[expIndex].description || []).filter(Boolean).join("\n")
      : ""

  return (
    <div className="dashboard-overview-card rounded-2xl border border-slate-200/90 p-4 dark:border-emerald-800/60 dark:bg-emerald-950/35">
      <div className="mb-4 flex items-center gap-2">
        <Sparkles className="h-4 w-4 shrink-0 text-sage-deep dark:text-emerald-300" aria-hidden />
        <h2 className="text-base font-semibold text-slate-900 dark:text-emerald-50">Polish with AI</h2>
      </div>
      <p className="mb-4 text-sm text-slate-600 dark:text-emerald-200/85">
        Enhance your professional summary or the bullet-style description for a specific work experience. Other fields
        stay manual.
      </p>

      <div className="space-y-4 border-b border-slate-200/80 pb-4 dark:border-emerald-800/50">
        <h3 className="text-sm font-medium text-slate-800 dark:text-emerald-100">Professional summary</h3>
        <AiEnhanceButton label="Enhance with AI" onClick={() => openModal({ kind: "summary" })} />
        <div>
          <Label className="text-xs text-slate-500 dark:text-emerald-400/80">Summary (preview)</Label>
          <Textarea readOnly className="mt-1 max-h-28 min-h-[72px] text-xs" value={resumeData.summary || ""} />
        </div>
      </div>

      <div className="space-y-3 pt-4">
        <h3 className="text-sm font-medium text-slate-800 dark:text-emerald-100">Experience description</h3>
        {resumeData.experience?.length ? (
          <>
            <div>
              <Label className="text-xs text-slate-500 dark:text-emerald-400/80">Which entry</Label>
              <select
                className="mt-1 w-full rounded-xl border border-slate-200/90 bg-white px-3 py-2 text-sm text-slate-900 dark:border-emerald-800/70 dark:bg-emerald-950/50 dark:text-emerald-50"
                value={expIndex}
                onChange={(e) => setExpIndex(Number(e.target.value))}
              >
                {resumeData.experience.map((_, i) => (
                  <option key={resumeData.experience[i].id} value={i}>
                    Experience {i + 1}
                    {resumeData.experience[i].position ? ` — ${resumeData.experience[i].position}` : ""}
                  </option>
                ))}
              </select>
            </div>
            <AiEnhanceButton label="Enhance with AI" onClick={openExperienceModal} />
            <div>
              <Label className="text-xs text-slate-500 dark:text-emerald-400/80">Description lines (preview)</Label>
              <Textarea readOnly className="mt-1 max-h-28 min-h-[72px] text-xs" value={expPreview} />
            </div>
          </>
        ) : (
          <p className="text-xs text-slate-500 dark:text-emerald-400/80">Add work experience in the form to use AI here.</p>
        )}
      </div>

      <SectionAiEnhanceModal
        copy={AI_COPY}
        open={modalOpen}
        sectionLabel={targetLabel(target)}
        initialInstruction={AI_COPY.ai.defaultInstruction}
        loading={loading}
        onClose={() => !loading && setModalOpen(false)}
        onConfirm={runAi}
      />
    </div>
  )
}
