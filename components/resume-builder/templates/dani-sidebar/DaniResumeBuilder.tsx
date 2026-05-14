"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { motion } from "framer-motion"
import { Download, Save, UserPlus, FileText, Eye } from "lucide-react"
import toast from "react-hot-toast"
import { Button } from "@/components/ui/button"
import daniEn from "@/data/resume-templates/dani-sidebar.en.json"
import { apiClient } from "@/lib/api"
import { DANI_BUILDER_VARIANT, type DaniModel, type DaniResumeContent } from "@/lib/designerVariantsResume"
import { resumeService } from "@/services/resumeService"
import { useProfile } from "@/hooks/useProfile"
import { DaniTemplate } from "./DaniTemplate"
import { DaniEditorPanel, type DaniAiTarget } from "./DaniEditorPanel"
import { SectionAiEnhanceModal } from "../minimal-classic/SectionAiEnhanceModal"
import { cloneDaniDefaults, mergeProfileIntoDani } from "./buildInitialModel"
import { useResumeAiEnhance } from "@/features/resume-builder/hooks/useResumeAiEnhance"
import type { ResumeAiEnhanceSection } from "@/features/resume-builder/types/ai-enhance"

const SEEDED_CLASSIC_TEMPLATE_ID = "550e8400-e29b-41d4-a716-446655440001"

let html2pdf: any
if (typeof window !== "undefined") {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  html2pdf = require("html2pdf.js")
}

function getDraftTextForDaniAi(model: DaniModel, target: DaniAiTarget | null): string {
  if (!target) return ""
  if (target.kind === "profile_summary") return model.profileSummary || ""
  const row = model.experience[target.index]
  return row?.bullets?.filter(Boolean).join("\n") ?? ""
}

function applyAiTextToDaniModel(model: DaniModel, target: DaniAiTarget, text: string): DaniModel {
  if (target.kind === "profile_summary") {
    return { ...model, profileSummary: text }
  }
  if (target.kind === "experience_item") {
    const list = [...model.experience]
    const row = list[target.index]
    if (!row) return model
    const lines = text.split("\n").map((l) => l.trim()).filter(Boolean)
    list[target.index] = {
      ...row,
      bullets: lines.length ? lines : text.trim() ? [text.trim()] : [""],
    }
    return { ...model, experience: list }
  }
  return model
}

export function DaniResumeBuilder({ resumeId, initialModel }: { resumeId: string | null; initialModel: DaniModel | null }) {
  const copy = daniEn
  const { profile, loading: profileLoading, error: profileError, isAuthenticated, refreshProfile } =
    useProfile()
  const [model, setModel] = useState<DaniModel | null>(null)
  const [localResumeId, setLocalResumeId] = useState<string | null>(resumeId)
  const [dbTemplateId, setDbTemplateId] = useState<string | null>(SEEDED_CLASSIC_TEMPLATE_ID)
  const [loading, setLoading] = useState(false)
  const [saved, setSaved] = useState(false)
  const [showForm, setShowForm] = useState(true)
  const [showPreview, setShowPreview] = useState(true)
  const previewRef = useRef<HTMLDivElement>(null)

  const { enhance: runLakshyaEnhance, loading: aiBusy } = useResumeAiEnhance()

  const [aiOpen, setAiOpen] = useState(false)
  const [aiTarget, setAiTarget] = useState<DaniAiTarget | null>(null)
  const [aiLakshyaSection, setAiLakshyaSection] = useState<ResumeAiEnhanceSection>("summary")
  const [aiSectionLabel, setAiSectionLabel] = useState("")

  useEffect(() => {
    if (resumeId) setLocalResumeId(resumeId)
  }, [resumeId])

  useEffect(() => {
    let cancelled = false
    const envId =
      typeof process !== "undefined" ? process.env.NEXT_PUBLIC_RESUME_DEFAULT_TEMPLATE_ID?.trim() : ""
    ;(async () => {
      try {
        const t = await resumeService.getTemplates()
        const first = t.templates?.[0]?.id
        if (!cancelled) {
          if (first) setDbTemplateId(String(first))
          else if (envId) setDbTemplateId(envId)
          else setDbTemplateId(SEEDED_CLASSIC_TEMPLATE_ID)
        }
      } catch {
        if (!cancelled) {
          if (envId) setDbTemplateId(envId)
          else setDbTemplateId(SEEDED_CLASSIC_TEMPLATE_ID)
        }
      }
    })()
    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    if (!profile) return
    if (initialModel) {
      setModel(initialModel)
      return
    }
    const base = cloneDaniDefaults()
    setModel(mergeProfileIntoDani(base, profile as unknown as Record<string, unknown>))
  }, [profile, initialModel])

  const buildStoredContent = useCallback(
    (m: DaniModel): DaniResumeContent => ({
      builderVariant: DANI_BUILDER_VARIANT,
      daniSidebar: m,
    }),
    []
  )

  const handleSave = async () => {
    if (!model) {
      toast.error("Nothing to save")
      return
    }
    setLoading(true)
    try {
      const name = model.personalInfo.fullName ? `${model.personalInfo.fullName} — Resume` : "My resume"
      const content = buildStoredContent(model)
      const currentId = localResumeId || resumeId
      if (currentId) {
        await resumeService.updateResume(currentId, { name, content, status: "published" })
        toast.success(copy.editor.saved)
      } else {
        const created = await resumeService.createResume({
          template_id: dbTemplateId ?? SEEDED_CLASSIC_TEMPLATE_ID,
          name,
          content,
          status: "published",
        })
        setLocalResumeId(created.id)
        toast.success(copy.editor.saved)
      }
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    } catch (e) {
      console.error(e)
      toast.error("Failed to save resume")
    } finally {
      setLoading(false)
    }
  }

  const handleDownload = async () => {
    if (!previewRef.current || !model) return
    try {
      setLoading(true)
      const options = {
        margin: [8, 8, 8, 8] as [number, number, number, number],
        filename: `${(model.personalInfo.fullName || "resume").replace(/[^\w\-]+/g, "_")}.pdf`,
        image: { type: "jpeg", quality: 0.88 },
        enableLinks: true,
        html2canvas: { scale: 1.55, useCORS: true, allowTaint: true },
        jsPDF: { unit: "mm", format: "a4", orientation: "portrait", compress: true },
      }
      if (!html2pdf) throw new Error("pdf")
      await html2pdf().from(previewRef.current).set(options).save()
    } catch (e) {
      console.error(e)
      toast.error("Failed to generate PDF")
    } finally {
      setLoading(false)
    }
  }

  const handleAddToProfile = async () => {
    if (!model?.personalInfo.fullName?.trim()) {
      toast.error("Add your name before syncing to profile")
      return
    }
    setLoading(true)
    try {
      const firstEd = model.sidebar.education[0]
      const firstXp = model.experience[0]
      const phoneRow = model.sidebar.contacts.find((c) => c.icon === "phone")
      const emailRow = model.sidebar.contacts.find((c) => c.icon === "email")
      const locRow = model.sidebar.contacts.find((c) => c.icon === "location")
      const skillLine = model.sidebar.skills.filter(Boolean).join(", ")
      const payload: Record<string, string | undefined> = {
        name: model.personalInfo.fullName,
        phone: phoneRow?.text,
        city: locRow?.text,
        email: emailRow?.text,
        bio: model.profileSummary || undefined,
        institution: firstEd?.schoolYearsLine?.split(",")[0]?.trim(),
        degree: firstEd?.level,
        technical_skills: skillLine || undefined,
        internship_experience: firstXp ? `${firstXp.title} at ${firstXp.company}` : undefined,
        profile_picture: model.sidebar.photoUrl || undefined,
        personal_website: model.sidebar.contacts.find((c) => c.icon === "web")?.text,
      }
      const cleaned = Object.fromEntries(
        Object.entries(payload).filter(([, v]) => v !== undefined && String(v).trim() !== "")
      )
      await apiClient.client.put("/students/profile", cleaned)
      toast.success("Profile updated from this resume")
      await refreshProfile?.()
    } catch (e) {
      console.error(e)
      toast.error("Could not update profile")
    } finally {
      setLoading(false)
    }
  }

  const openAi = (target: DaniAiTarget, _currentText: string, sectionLabel: string) => {
    setAiTarget(target)
    setAiLakshyaSection(target.kind === "experience_item" ? "experience" : "summary")
    setAiSectionLabel(sectionLabel)
    setAiOpen(true)
  }

  const runAi = async (optionalHint: string) => {
    if (!model || !aiTarget) return
    const locale = typeof window !== "undefined" ? localStorage.getItem("locale") || "en" : "en"
    const draftText = getDraftTextForDaniAi(model, aiTarget)
    try {
      const res = await runLakshyaEnhance({
        section: aiLakshyaSection,
        text: draftText,
        hint: optionalHint.trim() || undefined,
        context: {
          fullName: model.personalInfo.fullName,
          jobTitle: model.personalInfo.jobTitle,
          templateId: DANI_BUILDER_VARIANT,
        },
        language: locale,
      })
      if (!res.success) {
        toast.error(res.message || "AI could not enhance this section.")
        return
      }
      setModel(applyAiTextToDaniModel(model, aiTarget, res.enhancedText))
      setAiOpen(false)
      toast.success("Section updated")
    } catch (e: unknown) {
      console.error(e)
      toast.error("AI enhancement failed. Check your connection and try again.")
    }
  }

  if (!isAuthenticated && !profileLoading) {
    return (
      <div className="flex min-h-[calc(100vh-12rem)] items-center justify-center p-6 text-center text-slate-600 dark:text-emerald-200/85">
        Please log in to use the resume builder.
      </div>
    )
  }

  if (profileLoading || !model) {
    return (
      <div className="flex min-h-[calc(100vh-12rem)] items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-2 border-sage/30 border-t-sage-deep dark:border-emerald-800 dark:border-t-emerald-400" />
      </div>
    )
  }

  if (profileError && !profile) {
    return (
      <div className="p-6 text-center text-red-600 dark:text-red-300">
        {profileError}
        <div className="mt-4">
          <Button onClick={() => refreshProfile?.()}>Retry</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-0">
      <div className="sticky top-0 z-10 border-b border-slate-200/90 bg-white/95 backdrop-blur-sm dark:border-emerald-800/65 dark:bg-emerald-950/85">
        <div className="w-full px-3 py-3 sm:px-4 sm:py-4">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <h1 className="text-xl font-semibold text-slate-900 dark:text-emerald-50">
              {resumeId ? copy.editor.titleEdit : copy.editor.titleCreate}
            </h1>
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
              <div className="flex justify-center gap-2 lg:hidden">
                <Button
                  size="sm"
                  variant={showForm ? "default" : "outline"}
                  onClick={() => {
                    setShowForm(true)
                    setShowPreview(false)
                  }}
                >
                  <FileText className="mr-1 h-4 w-4" /> Edit
                </Button>
                <Button
                  size="sm"
                  variant={showPreview ? "default" : "outline"}
                  onClick={() => {
                    setShowForm(false)
                    setShowPreview(true)
                  }}
                >
                  <Eye className="mr-1 h-4 w-4" /> Preview
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button
                  variant="outline"
                  onClick={handleAddToProfile}
                  disabled={loading}
                  className="border-slate-200/90 dark:border-emerald-700"
                >
                  <UserPlus className="mr-2 h-4 w-4" />
                  {loading ? copy.editor.addToProfileSaving : copy.editor.addToProfile}
                </Button>
                <Button onClick={handleSave} disabled={loading}>
                  {loading ? copy.editor.saving : saved ? copy.editor.saved : copy.editor.save}
                </Button>
                <Button variant="outline" onClick={handleDownload} disabled={loading}>
                  <Download className="mr-2 h-4 w-4" />
                  {loading ? copy.editor.generatingPdf : copy.editor.downloadPdf}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="w-full px-3 py-4 sm:px-4 sm:py-6">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <motion.div
            initial={{ opacity: 0, x: -12 }}
            animate={{ opacity: 1, x: 0 }}
            className={`min-h-0 ${showForm ? "block" : "hidden lg:block"}`}
          >
            <DaniEditorPanel copy={copy} model={model} onChange={setModel} onAiTarget={openAi} />
          </motion.div>
          <motion.div
            initial={{ opacity: 0, x: 12 }}
            animate={{ opacity: 1, x: 0 }}
            className={`lg:sticky lg:top-24 lg:max-h-[calc(100vh-7rem)] lg:overflow-y-auto ${showPreview ? "block" : "hidden lg:block"}`}
          >
            <div ref={previewRef} className="rounded-xl bg-slate-100/80 p-3 dark:bg-emerald-950/40">
              <DaniTemplate copy={copy} model={model} />
            </div>
          </motion.div>
        </div>
      </div>

      <SectionAiEnhanceModal
        copy={copy}
        open={aiOpen}
        sectionLabel={aiSectionLabel}
        loading={aiBusy}
        onClose={() => !aiBusy && setAiOpen(false)}
        onConfirm={runAi}
      />
    </div>
  )
}
