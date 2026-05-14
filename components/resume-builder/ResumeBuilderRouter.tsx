"use client"

import { useEffect, useState } from "react"
import { MINIMAL_CLASSIC_BUILDER_VARIANT } from "@/lib/minimalClassicResume"
import {
  DANI_BUILDER_VARIANT,
  MARCELINE_BUILDER_VARIANT,
  MORGAN_BUILDER_VARIANT,
  emptyStructuredRouteForLayoutKey,
  parseStoredContentToStructuredRoute,
  structuredLayoutKeyFromMeta,
  type StructuredResumeRoute,
} from "@/lib/designerVariantsResume"
import { resumeService } from "@/services/resumeService"
import { ResumeBuilder } from "./ResumeBuilder"
import { MinimalClassicResumeBuilder } from "./templates/minimal-classic/MinimalClassicResumeBuilder"
import { MarcelineResumeBuilder } from "./templates/marceline-single/MarcelineResumeBuilder"
import { MorganResumeBuilder } from "./templates/morgan-blocks/MorganResumeBuilder"
import { DaniResumeBuilder } from "./templates/dani-sidebar/DaniResumeBuilder"
import type { SelectedResumeTemplateMeta } from "./TemplateSelection"

export type { SelectedResumeTemplateMeta } from "./TemplateSelection"

export function ResumeBuilderRouter({
  resumeId,
  templateMeta,
}: {
  resumeId: string | null
  templateMeta: SelectedResumeTemplateMeta | null
}) {
  const [mode, setMode] = useState<"loading" | "classic" | "structured">("loading")
  const [structured, setStructured] = useState<StructuredResumeRoute | null>(null)

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      if (resumeId) {
        try {
          const r = await resumeService.getResumeById(resumeId)
          if (cancelled) return
          const parsed = parseStoredContentToStructuredRoute(r.content)
          if (parsed) {
            setStructured(parsed)
            setMode("structured")
          } else {
            setStructured(null)
            setMode("classic")
          }
        } catch {
          if (!cancelled) {
            setStructured(null)
            setMode("classic")
          }
        }
        return
      }
      const lk = structuredLayoutKeyFromMeta(templateMeta)
      if (lk) {
        setStructured(emptyStructuredRouteForLayoutKey(lk))
        setMode("structured")
      } else {
        setStructured(null)
        setMode("classic")
      }
    })()
    return () => {
      cancelled = true
    }
  }, [resumeId, templateMeta])

  if (mode === "loading") {
    return (
      <div className="flex min-h-[calc(100vh-12rem)] items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-2 border-sage/30 border-t-sage-deep dark:border-emerald-800 dark:border-t-emerald-400" />
      </div>
    )
  }

  if (mode === "structured" && structured) {
    switch (structured.layoutKey) {
      case MINIMAL_CLASSIC_BUILDER_VARIANT:
        return <MinimalClassicResumeBuilder resumeId={resumeId} initialModel={structured.initialModel} />
      case MARCELINE_BUILDER_VARIANT:
        return <MarcelineResumeBuilder resumeId={resumeId} initialModel={structured.initialModel} />
      case MORGAN_BUILDER_VARIANT:
        return <MorganResumeBuilder resumeId={resumeId} initialModel={structured.initialModel} />
      case DANI_BUILDER_VARIANT:
        return <DaniResumeBuilder resumeId={resumeId} initialModel={structured.initialModel} />
      default:
        break
    }
  }

  const classicTemplateId =
    templateMeta?.id && !templateMeta.id.startsWith("client:") ? templateMeta.id : null

  return <ResumeBuilder templateId={classicTemplateId} resumeId={resumeId} />
}
