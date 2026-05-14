"use client"

import { useEffect, useState } from "react"
import { Sparkles } from "lucide-react"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { SectionAiEnhanceModal } from "@/components/resume-builder/templates/minimal-classic/SectionAiEnhanceModal"
import { AiEnhanceButton } from "@/components/resume-builder/templates/minimal-classic/AiEnhanceButton"
import { useResumeAiEnhance } from "@/features/resume-builder/hooks/useResumeAiEnhance"
import type { ResumeAiEnhanceSection } from "@/features/resume-builder/types/ai-enhance"
import toast from "react-hot-toast"

const LAKSHYA_CLASSIC_TEMPLATE_ID = "classic-ats"

const AI_COPY = {
  editor: {
    aiModalTitle: "Enhance with AI",
    aiInstructionLabel: "Optional focus",
    aiInstructionPlaceholder:
      "E.g. emphasize leadership, metrics, or ATS keywords. Leave blank for a smart rewrite — instructions are applied on the server.",
    aiApply: "Apply enhancement",
    aiCancel: "Cancel",
    aiWorking: "Enhancing…",
  },
  ai: {
    sectionContextHeader: "Name and target role (for tone only):",
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
  const { enhance: enhanceLakshya, loading: aiEnhanceLoading } = useResumeAiEnhance()
  const [target, setTarget] = useState<ClassicAiTarget>({ kind: "summary" })
  const [lakshyaSection, setLakshyaSection] = useState<ResumeAiEnhanceSection>("summary")
  const [expIndex, setExpIndex] = useState(0)
  const [modalOpen, setModalOpen] = useState(false)

  useEffect(() => {
    const n = resumeData.experience?.length ?? 0
    if (n === 0) return
    setExpIndex((i) => Math.min(Math.max(0, i), n - 1))
  }, [resumeData.experience?.length])

  const openModal = (t: ClassicAiTarget) => {
    setTarget(t)
    setLakshyaSection(t.kind === "experience_description" ? "experience" : "summary")
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

  const runAi = async (optionalHint: string) => {
    const locale = typeof window !== "undefined" ? localStorage.getItem("locale") || "en" : "en"
    const draftText = getCurrentText(resumeData, target)
    try {
      const res = await enhanceLakshya({
        section: lakshyaSection,
        text: draftText,
        hint: optionalHint.trim() || undefined,
        context: {
          fullName: resumeData.header?.fullName || "",
          templateId: LAKSHYA_CLASSIC_TEMPLATE_ID,
        },
        language: locale,
      })
      if (!res.success) {
        toast.error(res.message || "AI could not enhance this section.")
        return
      }
      onApply(applyEnhanced(resumeData, target, res.enhancedText))
      setModalOpen(false)
      toast.success("Section updated")
    } catch (e: unknown) {
      console.error(e)
      toast.error("AI enhancement failed. Check your connection and try again.")
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
        loading={aiEnhanceLoading}
        onClose={() => !aiEnhanceLoading && setModalOpen(false)}
        onConfirm={runAi}
      />
    </div>
  )
}
