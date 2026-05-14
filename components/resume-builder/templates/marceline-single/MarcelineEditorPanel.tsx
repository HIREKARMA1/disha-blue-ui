"use client"

import { Sparkles } from "lucide-react"
import marcelineEn from "@/data/resume-templates/marceline-single.en.json"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import type { MarcelineModel } from "@/lib/designerVariantsResume"
import { newId } from "@/lib/minimalClassicResume"

type MarcelineCopy = typeof marcelineEn

export type MarcelineAiTarget =
  | { kind: "profile_summary" }
  | { kind: "personal_job_title" }
  | { kind: "experience_item"; index: number }
  | { kind: "education_item"; index: number }
  | { kind: "skill_group"; index: number }
  | { kind: "achievement_item"; index: number }

export function MarcelineEditorPanel({
  copy,
  model,
  onChange,
  onAiTarget,
}: {
  copy: MarcelineCopy
  model: MarcelineModel
  onChange: (next: MarcelineModel) => void
  onAiTarget: (target: MarcelineAiTarget, currentText: string, sectionLabel: string) => void
}) {
  const patch = (partial: Partial<MarcelineModel>) => onChange({ ...model, ...partial })

  const patchPersonal = (key: keyof MarcelineModel["personalInfo"], value: string) => {
    onChange({ ...model, personalInfo: { ...model.personalInfo, [key]: value } })
  }

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-slate-200/90 bg-white/90 p-4 dark:border-emerald-800/60 dark:bg-emerald-950/40">
        <h2 className="mb-3 text-sm font-semibold text-slate-900 dark:text-emerald-50">{copy.editor.personalBlockTitle}</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <Label>{copy.editor.personalFieldLabels.fullName}</Label>
            <Input className="mt-1" value={model.personalInfo.fullName} onChange={(e) => patchPersonal("fullName", e.target.value)} />
          </div>
          <div className="flex items-end gap-2">
            <div className="min-w-0 flex-1">
              <Label>{copy.editor.personalFieldLabels.jobTitle}</Label>
              <Input className="mt-1" value={model.personalInfo.jobTitle} onChange={(e) => patchPersonal("jobTitle", e.target.value)} />
            </div>
            <Button
              type="button"
              variant="outline"
              size="icon"
              className="shrink-0"
              onClick={() =>
                onAiTarget(
                  { kind: "personal_job_title" },
                  model.personalInfo.jobTitle,
                  copy.editor.personalFieldLabels.jobTitle
                )
              }
            >
              <Sparkles className="h-4 w-4" />
            </Button>
          </div>
          <div className="sm:col-span-2">
            <Label>{copy.editor.personalFieldLabels.addressLine}</Label>
            <Input className="mt-1" value={model.personalInfo.addressLine} onChange={(e) => patchPersonal("addressLine", e.target.value)} />
          </div>
          <div>
            <Label>{copy.editor.personalFieldLabels.phone}</Label>
            <Input className="mt-1" value={model.personalInfo.phone} onChange={(e) => patchPersonal("phone", e.target.value)} />
          </div>
          <div>
            <Label>{copy.editor.personalFieldLabels.email}</Label>
            <Input className="mt-1" value={model.personalInfo.email} onChange={(e) => patchPersonal("email", e.target.value)} />
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-slate-200/90 bg-white/90 p-4 dark:border-emerald-800/60 dark:bg-emerald-950/40">
        <div className="mb-2 flex items-center justify-between gap-2">
          <h2 className="text-sm font-semibold text-slate-900 dark:text-emerald-50">{copy.editor.profileBody}</h2>
          <Button type="button" variant="outline" size="sm" onClick={() => onAiTarget({ kind: "profile_summary" }, model.profileSummary, copy.sections.profileSummary.heading)}>
            <Sparkles className="mr-1 h-4 w-4" />
            {copy.editor.aiEnhance}
          </Button>
        </div>
        <Textarea className="min-h-[120px]" value={model.profileSummary} onChange={(e) => patch({ profileSummary: e.target.value })} />
      </div>

      <div className="rounded-xl border border-slate-200/90 bg-white/90 p-4 dark:border-emerald-800/60 dark:bg-emerald-950/40">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-sm font-semibold text-slate-900 dark:text-emerald-50">{copy.sections.experience.heading}</h2>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() =>
              patch({
                experience: [
                  ...model.experience,
                  { id: newId("mxp"), role: "", company: "", dates: "", bullets: [""] },
                ],
              })
            }
          >
            {copy.sections.experience.addEntry}
          </Button>
        </div>
        <div className="space-y-4">
          {model.experience.map((job, index) => (
            <div key={job.id} className="rounded-lg border border-slate-200/80 p-3 dark:border-emerald-800/50">
              <div className="mb-2 flex justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    onAiTarget(
                      { kind: "experience_item", index },
                      [job.role, job.company, job.dates, ...job.bullets].join("\n"),
                      copy.sections.experience.heading
                    )
                  }
                >
                  <Sparkles className="mr-1 h-3 w-3" />
                  AI
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="text-red-600"
                  onClick={() => {
                    const list = model.experience.filter((_, i) => i !== index)
                    patch({ experience: list.length ? list : model.experience })
                  }}
                >
                  {copy.sections.experience.removeEntry}
                </Button>
              </div>
              <div className="grid gap-2 sm:grid-cols-2">
                <div>
                  <Label>{copy.editor.experienceRole}</Label>
                  <Input className="mt-1" value={job.role} onChange={(e) => {
                    const list = [...model.experience]
                    list[index] = { ...job, role: e.target.value }
                    patch({ experience: list })
                  }} />
                </div>
                <div>
                  <Label>{copy.editor.experienceCompany}</Label>
                  <Input className="mt-1" value={job.company} onChange={(e) => {
                    const list = [...model.experience]
                    list[index] = { ...job, company: e.target.value }
                    patch({ experience: list })
                  }} />
                </div>
                <div className="sm:col-span-2">
                  <Label>{copy.editor.experienceDates}</Label>
                  <Input className="mt-1" value={job.dates} onChange={(e) => {
                    const list = [...model.experience]
                    list[index] = { ...job, dates: e.target.value }
                    patch({ experience: list })
                  }} />
                </div>
                <div className="sm:col-span-2">
                  <Label>{copy.sections.experience.bulletPlaceholder}</Label>
                  <Textarea
                    className="mt-1 min-h-[80px]"
                    value={job.bullets.join("\n")}
                    onChange={(e) => {
                      const list = [...model.experience]
                      list[index] = {
                        ...job,
                        bullets: e.target.value.split("\n").map((l) => l.trim()).filter(Boolean).length
                          ? e.target.value.split("\n").map((l) => l.trim()).filter(Boolean)
                          : [""],
                      }
                      patch({ experience: list })
                    }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-xl border border-slate-200/90 bg-white/90 p-4 dark:border-emerald-800/60 dark:bg-emerald-950/40">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-sm font-semibold text-slate-900 dark:text-emerald-50">{copy.sections.education.heading}</h2>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() =>
              patch({
                education: [...model.education, { id: newId("med"), degree: "", institutionYear: "" }],
              })
            }
          >
            {copy.sections.education.addEntry}
          </Button>
        </div>
        <div className="space-y-3">
          {model.education.map((ed, index) => (
            <div key={ed.id} className="rounded-lg border border-slate-200/80 p-3 dark:border-emerald-800/50">
              <div className="mb-2 flex justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    onAiTarget(
                      { kind: "education_item", index },
                      [ed.degree, ed.institutionYear].join("\n"),
                      copy.sections.education.heading
                    )
                  }
                >
                  <Sparkles className="mr-1 h-3 w-3" />
                  AI
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="text-red-600"
                  onClick={() => {
                    const list = model.education.filter((_, i) => i !== index)
                    patch({ education: list.length ? list : model.education })
                  }}
                >
                  {copy.sections.education.removeEntry}
                </Button>
              </div>
              <div>
                <Label>{copy.editor.educationDegree}</Label>
                <Input className="mt-1" value={ed.degree} onChange={(e) => {
                  const list = [...model.education]
                  list[index] = { ...ed, degree: e.target.value }
                  patch({ education: list })
                }} />
              </div>
              <div className="mt-2">
                <Label>{copy.editor.educationInstitutionYear}</Label>
                <Input className="mt-1" value={ed.institutionYear} onChange={(e) => {
                  const list = [...model.education]
                  list[index] = { ...ed, institutionYear: e.target.value }
                  patch({ education: list })
                }} />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-xl border border-slate-200/90 bg-white/90 p-4 dark:border-emerald-800/60 dark:bg-emerald-950/40">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-sm font-semibold text-slate-900 dark:text-emerald-50">{copy.sections.skills.heading}</h2>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() =>
              patch({
                skillGroups: [...model.skillGroups, { id: newId("msg"), label: "", itemsLine: "" }],
              })
            }
          >
            {copy.sections.skills.addGroup}
          </Button>
        </div>
        <p className="mb-2 text-xs text-slate-500 dark:text-emerald-400/80">{copy.sections.skills.itemsHint}</p>
        <div className="space-y-3">
          {model.skillGroups.map((g, index) => (
            <div key={g.id} className="rounded-lg border border-slate-200/80 p-3 dark:border-emerald-800/50">
              <div className="mb-2 flex justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => onAiTarget({ kind: "skill_group", index }, `${g.label}\n${g.itemsLine}`, copy.sections.skills.heading)}
                >
                  <Sparkles className="mr-1 h-3 w-3" />
                  AI
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="text-red-600"
                  onClick={() => {
                    const list = model.skillGroups.filter((_, i) => i !== index)
                    patch({ skillGroups: list.length ? list : model.skillGroups })
                  }}
                >
                  {copy.sections.skills.removeGroup}
                </Button>
              </div>
              <div>
                <Label>{copy.editor.skillGroupLabel}</Label>
                <Input className="mt-1" value={g.label} onChange={(e) => {
                  const list = [...model.skillGroups]
                  list[index] = { ...g, label: e.target.value }
                  patch({ skillGroups: list })
                }} />
              </div>
              <div className="mt-2">
                <Label>{copy.sections.skills.itemsHint}</Label>
                <Textarea className="mt-1 min-h-[60px]" value={g.itemsLine} onChange={(e) => {
                  const list = [...model.skillGroups]
                  list[index] = { ...g, itemsLine: e.target.value }
                  patch({ skillGroups: list })
                }} />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-xl border border-slate-200/90 bg-white/90 p-4 dark:border-emerald-800/60 dark:bg-emerald-950/40">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-sm font-semibold text-slate-900 dark:text-emerald-50">{copy.sections.achievements.heading}</h2>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => patch({ achievements: [...model.achievements, { id: newId("mach"), text: "" }] })}
          >
            {copy.sections.achievements.add}
          </Button>
        </div>
        <div className="space-y-3">
          {model.achievements.map((a, index) => (
            <div key={a.id} className="flex gap-2">
              <Textarea
                className="min-h-[56px] flex-1"
                value={a.text}
                onChange={(e) => {
                  const list = [...model.achievements]
                  list[index] = { ...a, text: e.target.value }
                  patch({ achievements: list })
                }}
              />
              <div className="flex flex-col gap-1">
                <Button type="button" variant="outline" size="icon" onClick={() => onAiTarget({ kind: "achievement_item", index }, a.text, copy.sections.achievements.heading)}>
                  <Sparkles className="h-4 w-4" />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="text-red-600"
                  onClick={() => {
                    const list = model.achievements.filter((_, i) => i !== index)
                    patch({ achievements: list.length ? list : model.achievements })
                  }}
                >
                  ×
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
