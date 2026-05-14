"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { motion } from "framer-motion"
import { Download, Save, UserPlus, FileText, Eye } from "lucide-react"
import toast from "react-hot-toast"
import { Button } from "@/components/ui/button"
import morganEn from "@/data/resume-templates/morgan-blocks.en.json"
import { apiClient } from "@/lib/api"
import { MORGAN_BUILDER_VARIANT, type MorganModel, type MorganResumeContent } from "@/lib/designerVariantsResume"
import { resumeService } from "@/services/resumeService"
import { useProfile } from "@/hooks/useProfile"
import { MorganTemplate } from "./MorganTemplate"
import { MorganEditorPanel, type MorganAiTarget } from "./MorganEditorPanel"
import { SectionAiEnhanceModal } from "../minimal-classic/SectionAiEnhanceModal"
import { cloneMorganDefaults, mergeProfileIntoMorgan } from "./buildInitialModel"

const SEEDED_CLASSIC_TEMPLATE_ID = "550e8400-e29b-41d4-a716-446655440001"

let html2pdf: any
if (typeof window !== "undefined") {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  html2pdf = require("html2pdf.js")
}

function applyAiTextToMorganModel(model: MorganModel, target: MorganAiTarget, text: string): MorganModel {
  if (target.kind === "summary") return { ...model, summary: text }
  if (target.kind === "expertise") return { ...model, expertise: text }
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

export function MorganResumeBuilder({ resumeId, initialModel }: { resumeId: string | null; initialModel: MorganModel | null }) {
  const copy = morganEn
  const { profile, loading: profileLoading, error: profileError, isAuthenticated, refreshProfile } =
    useProfile()
  const [model, setModel] = useState<MorganModel | null>(null)
  const [localResumeId, setLocalResumeId] = useState<string | null>(resumeId)
  const [dbTemplateId, setDbTemplateId] = useState<string | null>(SEEDED_CLASSIC_TEMPLATE_ID)
  const [loading, setLoading] = useState(false)
  const [saved, setSaved] = useState(false)
  const [showForm, setShowForm] = useState(true)
  const [showPreview, setShowPreview] = useState(true)
  const previewRef = useRef<HTMLDivElement>(null)

  const [aiOpen, setAiOpen] = useState(false)
  const [aiLoading, setAiLoading] = useState(false)
  const [aiTarget, setAiTarget] = useState<MorganAiTarget | null>(null)
  const [aiSectionLabel, setAiSectionLabel] = useState("")
  const [aiCurrentText, setAiCurrentText] = useState("")

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
    const base = cloneMorganDefaults()
    setModel(mergeProfileIntoMorgan(base, profile as unknown as Record<string, unknown>))
  }, [profile, initialModel])

  const buildStoredContent = useCallback(
    (m: MorganModel): MorganResumeContent => ({
      builderVariant: MORGAN_BUILDER_VARIANT,
      morganBlocks: m,
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
      const firstEdu = model.education[0]
      const firstXp = model.experience[0]
      const phoneRow = model.contacts.find((c) => c.icon === "phone")
      const emailRow = model.contacts.find((c) => c.icon === "email")
      const locRow = model.contacts.find((c) => c.icon === "location")
      const payload: Record<string, string | undefined> = {
        name: model.personalInfo.fullName,
        phone: phoneRow?.text,
        city: locRow?.text,
        email: emailRow?.text,
        bio: [model.summary, model.expertise].filter(Boolean).join("\n\n") || undefined,
        institution: firstEdu?.institution,
        degree: firstEdu?.degreeDatesLine,
        technical_skills: model.expertise || undefined,
        internship_experience: firstXp ? `${firstXp.title} — ${firstXp.companyDatesLine}` : undefined,
        profile_picture: model.personalInfo.photoUrl || undefined,
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

  const openAi = (target: MorganAiTarget, currentText: string, sectionLabel: string) => {
    setAiTarget(target)
    setAiCurrentText(currentText)
    setAiSectionLabel(sectionLabel)
    setAiOpen(true)
  }

  const runAi = async (instruction: string) => {
    if (!model || !aiTarget) return
    const locale = typeof window !== "undefined" ? localStorage.getItem("locale") || "en" : "en"
    const sectionContext = `${copy.ai.sectionContextHeader}\n${model.personalInfo.fullName}\n${model.personalInfo.jobTitle}`
    setAiLoading(true)
    try {
      const res = await resumeService.enhanceResumeSection({
        section_type: `${aiSectionLabel}:${JSON.stringify(aiTarget)}`,
        section_context: sectionContext,
        user_instruction: instruction || copy.ai.defaultInstruction,
        current_text: aiCurrentText,
        language: locale,
      })
      setModel(applyAiTextToMorganModel(model, aiTarget, res.enhanced_text))
      setAiOpen(false)
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
            : "AI enhancement failed. Sign in as a student and ensure the API URL and AI keys are configured."
      toast.error(msg)
    } finally {
      setAiLoading(false)
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
            <MorganEditorPanel copy={copy} model={model} onChange={setModel} onAiTarget={openAi} />
          </motion.div>
          <motion.div
            initial={{ opacity: 0, x: 12 }}
            animate={{ opacity: 1, x: 0 }}
            className={`lg:sticky lg:top-24 lg:max-h-[calc(100vh-7rem)] lg:overflow-y-auto ${showPreview ? "block" : "hidden lg:block"}`}
          >
            <div ref={previewRef} className="rounded-xl bg-slate-100/80 p-3 dark:bg-emerald-950/40">
              <MorganTemplate copy={copy} model={model} />
            </div>
          </motion.div>
        </div>
      </div>

      <SectionAiEnhanceModal
        copy={copy}
        open={aiOpen}
        sectionLabel={aiSectionLabel}
        initialInstruction={copy.ai.defaultInstruction}
        loading={aiLoading}
        onClose={() => !aiLoading && setAiOpen(false)}
        onConfirm={runAi}
      />
    </div>
  )
}
