"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Search, Check, Sparkles } from "lucide-react"
import { resumeService } from "@/services/resumeService"
import clientTemplatesCatalog from "@/data/resume-templates/client-templates.en.json"
import toast from "react-hot-toast"

export interface SelectedResumeTemplateMeta {
  id: string
  name: string
  description: string
  category: string
  preview_image?: string
  structure?: Record<string, unknown>
  layout?: string
  font_family?: string
  font_size?: string
  sections?: number
  layoutKey?: string
}

interface TemplateSelectionProps {
  onTemplateSelect: (template: SelectedResumeTemplateMeta) => void
}

/**
 * Shipped layouts (always 4). Used when `client-templates.*.json` fails to parse or is empty,
 * and as the source of truth for `layoutKey` so the UI never degrades to a single card.
 */
const BUILTIN_CLIENT_TEMPLATE_ROWS: SelectedResumeTemplateMeta[] = [
  {
    id: "client:minimal-classic-v1",
    name: "Minimal Executive",
    description:
      "Single-page ruled layout with centered header, timeline education and experience, four-column skills, and references.",
    category: "minimalist",
    preview_image: "/assets/resume-template-minimal-classic.png",
    structure: { layoutKey: "minimal-classic-v1" },
    layout: "single-page-ruled",
    font_family: "Inter",
    font_size: "10pt",
    sections: 6,
    layoutKey: "minimal-classic-v1",
  },
  {
    id: "client:marceline-single-v1",
    name: "Marceline — Single column",
    description:
      "Navy single-column resume with profile summary, experience, education, grouped skills, and achievements.",
    category: "creative",
    preview_image: "/assets/resume-template-marceline.png",
    structure: { layoutKey: "marceline-single-v1" },
    layout: "single-column-navy",
    font_family: "Inter",
    font_size: "10pt",
    sections: 6,
    layoutKey: "marceline-single-v1",
  },
  {
    id: "client:morgan-blocks-v1",
    name: "Morgan — Block layout",
    description:
      "Bold block layout with photo header, contact and summary strip, education and experience panels, and references.",
    category: "executive",
    preview_image: "/assets/resume-template-morgan.png",
    structure: { layoutKey: "morgan-blocks-v1" },
    layout: "multi-block",
    font_family: "Inter",
    font_size: "10pt",
    sections: 6,
    layoutKey: "morgan-blocks-v1",
  },
  {
    id: "client:dani-sidebar-v1",
    name: "Dani — Sidebar",
    description:
      "Two-column resume with slate header, main profile and experience timeline, and a sidebar for photo, contact, skills, and education.",
    category: "creative",
    preview_image: "/assets/resume-template-dani.png",
    structure: { layoutKey: "dani-sidebar-v1" },
    layout: "two-column-sidebar",
    font_family: "Inter",
    font_size: "10pt",
    sections: 5,
    layoutKey: "dani-sidebar-v1",
  },
]

/** DB id for legacy Classic ATS row (hidden from picker; old resumes may still reference it). */
const CLASSIC_ATS_TEMPLATE_DB_ID = "550e8400-e29b-41d4-a716-446655440000"

const PREVIEW_BY_LAYOUT_KEY: Record<string, string> = {
  /** Classic layout still renders in the classic builder; use minimal art if a card ever slips through. */
  "classic-ats": "/assets/resume-template-minimal-classic.png",
  "minimal-classic-v1": "/assets/resume-template-minimal-classic.png",
  "marceline-single-v1": "/assets/resume-template-marceline.png",
  "morgan-blocks-v1": "/assets/resume-template-morgan.png",
  "dani-sidebar-v1": "/assets/resume-template-dani.png",
}

function layoutKeyOf(t: SelectedResumeTemplateMeta): string | undefined {
  const fromStruct =
    t.structure && typeof t.structure.layoutKey === "string" ? t.structure.layoutKey : undefined
  return t.layoutKey || fromStruct
}

/** Preview art per layoutKey so cards match the real template (DB may omit or reuse a wrong URL). */
export function resolvedTemplatePreviewUrl(t: SelectedResumeTemplateMeta): string {
  const lk = layoutKeyOf(t)
  if (lk && PREVIEW_BY_LAYOUT_KEY[lk]) return PREVIEW_BY_LAYOUT_KEY[lk]
  if (t.preview_image?.startsWith("/")) return t.preview_image
  if (t.preview_image?.startsWith("http")) return t.preview_image
  return "/assets/resume-template-minimal-classic.png"
}

function isClassicAtsRemovedFromPicker(t: SelectedResumeTemplateMeta): boolean {
  if (t.id === CLASSIC_ATS_TEMPLATE_DB_ID) return true
  const lk = layoutKeyOf(t)
  return lk === "classic-ats"
}

function withResolvedPreviews(rows: SelectedResumeTemplateMeta[]): SelectedResumeTemplateMeta[] {
  return rows.map((r) => ({ ...r, preview_image: resolvedTemplatePreviewUrl(r) }))
}

function buildClientTemplateRows(): SelectedResumeTemplateMeta[] {
  const list = clientTemplatesCatalog?.templates
  if (!Array.isArray(list) || list.length === 0) {
    return BUILTIN_CLIENT_TEMPLATE_ROWS
  }
  return list.map((t) => ({
    id: t.clientTemplateId,
    name: t.name,
    description: t.description,
    category: t.category,
    preview_image: t.preview_image,
    structure: { layoutKey: t.layoutKey },
    layout: t.layout,
    font_family: t.font_family,
    font_size: t.font_size,
    sections: t.sections,
    layoutKey: t.layoutKey,
  }))
}

function applyCategoryCounts(merged: SelectedResumeTemplateMeta[]) {
  return [
    { id: "all", name: "All Templates", count: merged.length },
    { id: "professional", name: "Professional", count: merged.filter((x) => x.category === "professional").length },
    { id: "creative", name: "Creative", count: merged.filter((x) => x.category === "creative").length },
    { id: "minimalist", name: "Minimalist", count: merged.filter((x) => x.category === "minimalist").length },
    { id: "executive", name: "Executive", count: merged.filter((x) => x.category === "executive").length },
  ]
}

/** Built-in cards show immediately (before API); avoids empty grid on slow/failed network. */
const INITIAL_TEMPLATES = withResolvedPreviews(buildClientTemplateRows())

export function TemplateSelection({ onTemplateSelect }: TemplateSelectionProps) {
  const [templates, setTemplates] = useState<SelectedResumeTemplateMeta[]>(INITIAL_TEMPLATES)
  const [filteredTemplates, setFilteredTemplates] = useState<SelectedResumeTemplateMeta[]>(INITIAL_TEMPLATES)
  const [selectedCategory, setSelectedCategory] = useState<string>("all")
  const [searchQuery, setSearchQuery] = useState("")
  const [loading, setLoading] = useState(true)
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null)
  const [categories, setCategories] = useState(() => applyCategoryCounts(INITIAL_TEMPLATES))

  useEffect(() => {
    const loadTemplates = async () => {
      const clientRows = buildClientTemplateRows()
      const commit = (merged: SelectedResumeTemplateMeta[]) => {
        const normalized = withResolvedPreviews(merged).filter((t) => !isClassicAtsRemovedFromPicker(t))
        setTemplates(normalized)
        setFilteredTemplates(normalized)
        setCategories(applyCategoryCounts(normalized))
      }

      try {
        const response = await resumeService.getTemplates()
        const apiRows: SelectedResumeTemplateMeta[] = (response.templates || []).map((t: Record<string, unknown>) => {
          const structure = (t.structure as Record<string, unknown> | undefined) || undefined
          const layoutKey =
            typeof structure?.layoutKey === "string" ? structure.layoutKey : undefined
          const layoutFromStruct =
            structure && typeof structure.layout === "string" ? structure.layout : undefined
          const fontFromStruct =
            structure && typeof structure.font_family === "string" ? structure.font_family : undefined
          const fontSizeFromStruct =
            structure && typeof structure.font_size === "string" ? structure.font_size : undefined
          const sectionsFromStruct =
            structure && typeof structure.sections === "number" ? structure.sections : undefined
          return {
            id: String(t.id),
            name: String(t.name || ""),
            description: String(t.description || ""),
            category: String(t.category || "professional"),
            preview_image: typeof t.preview_image === "string" ? t.preview_image : undefined,
            structure,
            layout: typeof t.layout === "string" ? t.layout : layoutFromStruct,
            font_family: typeof t.font_family === "string" ? t.font_family : fontFromStruct,
            font_size: typeof t.font_size === "string" ? t.font_size : fontSizeFromStruct,
            sections: typeof t.sections === "number" ? t.sections : sectionsFromStruct,
            layoutKey,
          }
        })

        const clientIds = new Set(clientRows.map((c) => c.id))
        const clientLayoutKeys = new Set(
          clientRows
            .map((c) => c.layoutKey || (c.structure as { layoutKey?: string } | undefined)?.layoutKey)
            .filter((x): x is string => typeof x === "string" && x.length > 0)
        )

        const clientNameLc = new Set(clientRows.map((c) => c.name.trim().toLowerCase()))

        const apiDeduped = apiRows.filter((a) => {
          if (clientIds.has(a.id)) return false
          const lk = a.layoutKey || (a.structure as { layoutKey?: string } | undefined)?.layoutKey
          if (typeof lk === "string" && lk.length > 0 && clientLayoutKeys.has(lk)) return false
          if (clientNameLc.has(a.name.trim().toLowerCase())) return false
          return true
        })

        const merged = [...clientRows, ...apiDeduped]
        const uniqueById = new Map<string, SelectedResumeTemplateMeta>()
        for (const row of merged) {
          if (!uniqueById.has(row.id)) uniqueById.set(row.id, row)
        }
        commit(Array.from(uniqueById.values()))
      } catch (error) {
        console.error("Error loading templates:", error)
        commit(clientRows.length ? withResolvedPreviews(clientRows) : INITIAL_TEMPLATES)
        if (clientRows.length) {
          toast.error(
            "Could not load templates from the server. Showing built-in templates only — save still needs at least one server template in the database.",
            { duration: 6000 }
          )
        } else {
          toast.error("No resume templates available. Check your connection and API configuration.", { duration: 6000 })
        }
      } finally {
        setLoading(false)
      }
    }

    loadTemplates()
  }, [])

  useEffect(() => {
    let filtered = templates

    if (selectedCategory !== "all") {
      filtered = filtered.filter((template) => template.category === selectedCategory)
    }

    if (searchQuery) {
      const q = searchQuery.toLowerCase()
      filtered = filtered.filter(
        (template) =>
          template.name.toLowerCase().includes(q) ||
          (template.description || "").toLowerCase().includes(q)
      )
    }

    if (filtered.length === 0 && selectedCategory !== "all" && templates.length > 0) {
      setSelectedCategory("all")
      return
    }

    setFilteredTemplates(filtered)
  }, [templates, selectedCategory, searchQuery])

  const handleTemplateSelect = (template: SelectedResumeTemplateMeta) => {
    setSelectedTemplate(template.id)
    setTimeout(() => {
      onTemplateSelect(template)
    }, 300)
  }

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "professional":
        return "bg-sage/25 text-sage-deep dark:bg-emerald-900/50 dark:text-emerald-200"
      case "creative":
        return "bg-slate-100 text-slate-800 dark:bg-emerald-950/60 dark:text-emerald-200"
      case "minimalist":
        return "bg-slate-50 text-slate-700 dark:bg-emerald-950/40 dark:text-emerald-300"
      case "executive":
        return "bg-sage/35 text-slate-900 dark:bg-emerald-900/55 dark:text-emerald-100"
      default:
        return "bg-slate-100 text-slate-700 dark:bg-emerald-950/50 dark:text-emerald-200"
    }
  }

  const getTemplateCardColor = (templateId: string) => {
    const colors = [
      "bg-gradient-to-br from-sage/20 to-sage/40 border border-sage/35",
      "bg-gradient-to-br from-slate-50 to-sage/25 border border-slate-200/90",
      "bg-gradient-to-br from-sage/15 to-slate-100 border border-sage/30",
      "bg-gradient-to-br from-slate-100 to-sage/20 border border-slate-200/80",
      "bg-gradient-to-br from-sage/25 to-slate-50 border border-sage/40",
    ]
    let hash = 0
    for (let i = 0; i < templateId.length; i++) {
      hash = (hash + templateId.charCodeAt(i) * (i + 1)) % 10007
    }
    return colors[hash % colors.length]
  }

  if (loading && templates.length === 0) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-2 border-sage/30 border-t-sage-deep dark:border-emerald-800 dark:border-t-emerald-400" />
      </div>
    )
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {loading && (
        <p className="text-center text-xs text-slate-500 dark:text-emerald-400/80">
          Loading templates from server…
        </p>
      )}
      <div className="dashboard-overview-card p-4 sm:p-6">
        <p className="mb-3 text-center text-xs text-slate-600 dark:text-emerald-200/85">
          Showing <span className="font-semibold text-slate-800 dark:text-emerald-100">{filteredTemplates.length}</span>{" "}
          template{filteredTemplates.length === 1 ? "" : "s"}. Use{" "}
          <span className="font-medium">All Templates</span> to see every layout (category filters hide built-in
          designer cards).
        </p>
        <div className="flex flex-col gap-4 sm:flex-row">
          <div className="relative w-full sm:flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 dark:text-emerald-500/80" />
            <input
              type="text"
              placeholder="Search templates..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-2xl border border-slate-200/90 bg-white py-2 pl-10 pr-4 text-slate-900 placeholder:text-slate-500 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-sage-deep dark:border-emerald-800/70 dark:bg-emerald-950/50 dark:text-emerald-50 dark:placeholder:text-emerald-400/70 dark:focus:ring-emerald-500"
            />
          </div>

          <div className="flex w-full items-center space-x-2 sm:w-auto">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="min-w-[150px] flex-1 rounded-2xl border border-slate-200/90 bg-white px-3 py-2 text-sm text-slate-900 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-sage-deep dark:border-emerald-800/70 dark:bg-emerald-950/50 dark:text-emerald-50 dark:focus:ring-emerald-500 sm:flex-none"
            >
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name} ({category.count})
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 sm:gap-8 lg:grid-cols-2 xl:grid-cols-3">
        {filteredTemplates.map((template, index) => (
          <motion.div
            key={template.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className={`cursor-pointer overflow-hidden rounded-2xl border border-slate-200/90 shadow-[0_4px_24px_-6px_rgba(15,23,42,0.09)] transition-all duration-200 hover:shadow-lg dark:border-emerald-800/65 ${
              selectedTemplate === template.id
                ? "ring-2 ring-sage-deep ring-offset-2 ring-offset-white dark:ring-emerald-400 dark:ring-offset-emerald-950"
                : "hover:scale-[1.02]"
            }`}
            onClick={() => handleTemplateSelect(template)}
          >
            <div className={`p-4 ${getTemplateCardColor(template.id)}`}>
              <div className="relative overflow-hidden rounded-lg bg-white shadow-inner">
                <img
                  src={resolvedTemplatePreviewUrl(template)}
                  alt={template.name}
                  className="h-44 w-full rounded-lg object-cover object-top sm:h-48 md:h-52"
                  loading="lazy"
                />
                <div className="pointer-events-none absolute bottom-2 left-2 inline-flex items-center gap-1 rounded-full bg-slate-900/85 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-white shadow-sm backdrop-blur-sm dark:bg-emerald-950/90">
                  <Sparkles className="h-3.5 w-3.5 shrink-0 text-amber-200" aria-hidden />
                  AI enhance
                </div>
                {selectedTemplate === template.id && (
                  <div className="absolute right-3 top-3 rounded-full bg-sage-deep p-2 text-white shadow-lg dark:bg-emerald-600">
                    <Check className="h-4 w-4" />
                  </div>
                )}
              </div>

              <div className="mt-4 rounded-lg bg-white/90 p-3 backdrop-blur-sm">
                <div className="mb-2 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <h3 className="text-base font-semibold text-slate-900 sm:text-lg dark:text-emerald-50">
                    {template.name}
                  </h3>
                  <span
                    className={`w-fit rounded-full px-2 py-1 text-xs font-medium ${getCategoryColor(template.category)}`}
                  >
                    {template.category}
                  </span>
                </div>

                <p className="mb-2 line-clamp-2 text-xs text-slate-600 sm:text-sm dark:text-emerald-200/85">
                  {template.description}
                </p>

                <div className="space-y-1 text-xs text-slate-500 dark:text-emerald-400/75">
                  <div className="flex items-center space-x-2">
                    <span>Layout:</span>
                    <span className="font-medium">{template.layout || "—"}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span>Font:</span>
                    <span className="font-medium">{template.font_family || "—"}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span>Sections:</span>
                    <span className="font-medium">{template.sections ?? "—"}</span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {filteredTemplates.length === 0 && (
        <div className="py-12 text-center">
          <div className="mb-4 text-slate-400 dark:text-emerald-500/60">
            <Search className="mx-auto h-16 w-16" />
          </div>
          <h3 className="mb-2 text-lg font-medium text-slate-900 dark:text-emerald-50">No templates found</h3>
          <p className="text-slate-600 dark:text-emerald-200/85">Try adjusting your search or filter criteria</p>
        </div>
      )}
    </div>
  )
}
