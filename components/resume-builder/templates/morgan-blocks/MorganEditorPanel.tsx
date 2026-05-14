"use client"

import morganEn from "@/data/resume-templates/morgan-blocks.en.json"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import type { MorganContactIcon, MorganModel } from "@/lib/designerVariantsResume"
import { newId } from "@/lib/minimalClassicResume"
import { AiEnhanceButton } from "../minimal-classic/AiEnhanceButton"

type MorganCopy = typeof morganEn

const ICON_OPTIONS: { value: MorganContactIcon; label: string }[] = [
  { value: "phone", label: "Phone" },
  { value: "location", label: "Location" },
  { value: "email", label: "Email" },
  { value: "web", label: "Web" },
  { value: "linkedin", label: "LinkedIn" },
]

export type MorganAiTarget =
  | { kind: "summary" }
  | { kind: "expertise" }
  | { kind: "experience_item"; index: number }

export function MorganEditorPanel({
  copy,
  model,
  onChange,
  onAiTarget,
}: {
  copy: MorganCopy
  model: MorganModel
  onChange: (next: MorganModel) => void
  onAiTarget: (target: MorganAiTarget, currentText: string, sectionLabel: string) => void
}) {
  const patch = (partial: Partial<MorganModel>) => onChange({ ...model, ...partial })

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-slate-200/90 bg-white/90 p-4 dark:border-emerald-800/60 dark:bg-emerald-950/40">
        <h2 className="mb-3 text-sm font-semibold text-slate-900 dark:text-emerald-50">{copy.editor.personalBlockTitle}</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <Label>{copy.editor.personalFieldLabels.fullName}</Label>
            <Input
              className="mt-1"
              value={model.personalInfo.fullName}
              onChange={(e) => patch({ personalInfo: { ...model.personalInfo, fullName: e.target.value } })}
            />
          </div>
          <div>
            <Label>{copy.editor.personalFieldLabels.jobTitle}</Label>
            <Input
              className="mt-1"
              value={model.personalInfo.jobTitle}
              onChange={(e) => patch({ personalInfo: { ...model.personalInfo, jobTitle: e.target.value } })}
            />
          </div>
          <div className="sm:col-span-2">
            <Label>{copy.editor.personalFieldLabels.photoUrl}</Label>
            <Input
              className="mt-1"
              value={model.personalInfo.photoUrl}
              onChange={(e) => patch({ personalInfo: { ...model.personalInfo, photoUrl: e.target.value } })}
            />
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-slate-200/90 bg-white/90 p-4 dark:border-emerald-800/60 dark:bg-emerald-950/40">
        <div className="mb-2 flex items-center justify-between gap-2">
          <h2 className="text-sm font-semibold text-slate-900 dark:text-emerald-50">{copy.sections.contacts.heading}</h2>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() =>
              patch({
                contacts: [...model.contacts, { id: newId("mc"), icon: "phone", text: "" }],
              })
            }
          >
            {copy.sections.contacts.addRow}
          </Button>
        </div>
        <div className="space-y-3">
          {model.contacts.map((row, index) => (
            <div key={row.id} className="flex flex-wrap items-end gap-2 rounded-lg border border-slate-200/80 p-2 dark:border-emerald-800/50">
              <div>
                <Label className="text-xs">{copy.editor.contactIconLabel}</Label>
                <select
                  className="mt-1 block w-32 rounded-md border border-slate-200 bg-white px-2 py-2 text-sm dark:border-emerald-800 dark:bg-emerald-950"
                  value={row.icon}
                  onChange={(e) => {
                    const list = [...model.contacts]
                    list[index] = { ...row, icon: e.target.value as MorganContactIcon }
                    patch({ contacts: list })
                  }}
                >
                  {ICON_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value}>
                      {o.label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="min-w-[180px] flex-1">
                <Label className="text-xs">{copy.editor.contactText}</Label>
                <Input
                  className="mt-1"
                  value={row.text}
                  onChange={(e) => {
                    const list = [...model.contacts]
                    list[index] = { ...row, text: e.target.value }
                    patch({ contacts: list })
                  }}
                />
              </div>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="text-red-600"
                onClick={() => {
                  const list = model.contacts.filter((_, i) => i !== index)
                  patch({ contacts: list.length ? list : model.contacts })
                }}
              >
                {copy.sections.contacts.removeRow}
              </Button>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-xl border border-slate-200/90 bg-white/90 p-4 dark:border-emerald-800/60 dark:bg-emerald-950/40">
        <div className="mb-2 flex items-center justify-between gap-2">
          <h2 className="text-sm font-semibold text-slate-900 dark:text-emerald-50">{copy.editor.summaryBody}</h2>
          <AiEnhanceButton
            label={copy.editor.aiEnhance}
            onClick={() => onAiTarget({ kind: "summary" }, model.summary, copy.sections.summary.heading)}
          />
        </div>
        <Textarea className="min-h-[100px]" value={model.summary} onChange={(e) => patch({ summary: e.target.value })} />
      </div>

      <div className="rounded-xl border border-slate-200/90 bg-white/90 p-4 dark:border-emerald-800/60 dark:bg-emerald-950/40">
        <div className="mb-2 flex items-center justify-between gap-2">
          <h2 className="text-sm font-semibold text-slate-900 dark:text-emerald-50">{copy.editor.expertiseBody}</h2>
          <AiEnhanceButton
            label={copy.editor.aiEnhance}
            onClick={() => onAiTarget({ kind: "expertise" }, model.expertise, copy.sections.expertise.heading)}
          />
        </div>
        <Textarea className="min-h-[80px]" value={model.expertise} onChange={(e) => patch({ expertise: e.target.value })} />
      </div>

      <div className="rounded-xl border border-slate-200/90 bg-white/90 p-4 dark:border-emerald-800/60 dark:bg-emerald-950/40">
        <div className="mb-2 flex items-center justify-between gap-2">
          <h2 className="text-sm font-semibold text-slate-900 dark:text-emerald-50">{copy.sections.education.heading}</h2>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() =>
              patch({
                education: [...model.education, { id: newId("mrg-ed"), institution: "", degreeDatesLine: "", bullets: [""] }],
              })
            }
          >
            {copy.sections.education.addEntry}
          </Button>
        </div>
        <div className="space-y-3">
          {model.education.map((ed, index) => (
            <div key={ed.id} className="rounded-lg border border-slate-200/80 p-3 dark:border-emerald-800/50">
              <div className="mb-2 flex justify-end">
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
                <Label>{copy.editor.eduInstitution}</Label>
                <Input
                  className="mt-1"
                  value={ed.institution}
                  onChange={(e) => {
                    const list = [...model.education]
                    list[index] = { ...ed, institution: e.target.value }
                    patch({ education: list })
                  }}
                />
              </div>
              <div className="mt-2">
                <Label>{copy.editor.eduDegreeDates}</Label>
                <Input
                  className="mt-1"
                  value={ed.degreeDatesLine}
                  onChange={(e) => {
                    const list = [...model.education]
                    list[index] = { ...ed, degreeDatesLine: e.target.value }
                    patch({ education: list })
                  }}
                />
              </div>
              <div className="mt-2">
                <Label>{copy.editor.bulletPlaceholder}</Label>
                <Textarea
                  className="mt-1 min-h-[72px]"
                  value={ed.bullets.join("\n")}
                  onChange={(e) => {
                    const list = [...model.education]
                    list[index] = {
                      ...ed,
                      bullets: e.target.value.split("\n").map((l) => l.trim()).filter(Boolean).length
                        ? e.target.value.split("\n").map((l) => l.trim()).filter(Boolean)
                        : [""],
                    }
                    patch({ education: list })
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-xl border border-slate-200/90 bg-white/90 p-4 dark:border-emerald-800/60 dark:bg-emerald-950/40">
        <div className="mb-2 flex items-center justify-between gap-2">
          <h2 className="text-sm font-semibold text-slate-900 dark:text-emerald-50">{copy.sections.experience.heading}</h2>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() =>
              patch({
                experience: [...model.experience, { id: newId("mrg-xp"), title: "", companyDatesLine: "", bullets: [""] }],
              })
            }
          >
            {copy.sections.experience.addEntry}
          </Button>
        </div>
        <div className="space-y-3">
          {model.experience.map((xp, index) => (
            <div key={xp.id} className="rounded-lg border border-slate-200/80 p-3 dark:border-emerald-800/50">
              <div className="mb-2 flex justify-end">
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
              <div>
                <Label>{copy.editor.expTitle}</Label>
                <Input
                  className="mt-1"
                  value={xp.title}
                  onChange={(e) => {
                    const list = [...model.experience]
                    list[index] = { ...xp, title: e.target.value }
                    patch({ experience: list })
                  }}
                />
              </div>
              <div className="mt-2">
                <Label>{copy.editor.expCompanyDates}</Label>
                <Input
                  className="mt-1"
                  value={xp.companyDatesLine}
                  onChange={(e) => {
                    const list = [...model.experience]
                    list[index] = { ...xp, companyDatesLine: e.target.value }
                    patch({ experience: list })
                  }}
                />
              </div>
              <div className="mt-2">
                <div className="mb-1 flex flex-wrap items-center justify-between gap-2">
                  <Label>{copy.editor.bulletPlaceholder}</Label>
                  <AiEnhanceButton
                    label={copy.editor.aiEnhance}
                    onClick={() =>
                      onAiTarget(
                        { kind: "experience_item", index },
                        xp.bullets.filter(Boolean).join("\n"),
                        copy.sections.experience.heading
                      )
                    }
                  />
                </div>
                <Textarea
                  className="mt-1 min-h-[72px]"
                  value={xp.bullets.join("\n")}
                  onChange={(e) => {
                    const list = [...model.experience]
                    list[index] = {
                      ...xp,
                      bullets: e.target.value.split("\n").map((l) => l.trim()).filter(Boolean).length
                        ? e.target.value.split("\n").map((l) => l.trim()).filter(Boolean)
                        : [""],
                    }
                    patch({ experience: list })
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-xl border border-slate-200/90 bg-white/90 p-4 dark:border-emerald-800/60 dark:bg-emerald-950/40">
        <div className="mb-2 flex items-center justify-between gap-2">
          <h2 className="text-sm font-semibold text-slate-900 dark:text-emerald-50">{copy.sections.references.heading}</h2>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() =>
              patch({
                references: [
                  ...model.references,
                  { id: newId("mrg-r"), name: "", titleCompany: "", phone: "", email: "" },
                ],
              })
            }
          >
            {copy.sections.references.addRef}
          </Button>
        </div>
        <div className="space-y-3">
          {model.references.map((r, index) => (
            <div key={r.id} className="rounded-lg border border-slate-200/80 p-3 dark:border-emerald-800/50">
              <div className="mb-2 flex justify-end">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="text-red-600"
                  onClick={() => {
                    const list = model.references.filter((_, i) => i !== index)
                    patch({ references: list.length ? list : model.references })
                  }}
                >
                  {copy.sections.references.removeRef}
                </Button>
              </div>
              <div className="grid gap-2 sm:grid-cols-2">
                <div>
                  <Label>{copy.editor.refName}</Label>
                  <Input
                    className="mt-1"
                    value={r.name}
                    onChange={(e) => {
                      const list = [...model.references]
                      list[index] = { ...r, name: e.target.value }
                      patch({ references: list })
                    }}
                  />
                </div>
                <div>
                  <Label>{copy.editor.refTitleCompany}</Label>
                  <Input
                    className="mt-1"
                    value={r.titleCompany}
                    onChange={(e) => {
                      const list = [...model.references]
                      list[index] = { ...r, titleCompany: e.target.value }
                      patch({ references: list })
                    }}
                  />
                </div>
                <div>
                  <Label>{copy.editor.refPhone}</Label>
                  <Input
                    className="mt-1"
                    value={r.phone}
                    onChange={(e) => {
                      const list = [...model.references]
                      list[index] = { ...r, phone: e.target.value }
                      patch({ references: list })
                    }}
                  />
                </div>
                <div>
                  <Label>{copy.editor.refEmail}</Label>
                  <Input
                    className="mt-1"
                    value={r.email}
                    onChange={(e) => {
                      const list = [...model.references]
                      list[index] = { ...r, email: e.target.value }
                      patch({ references: list })
                    }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
