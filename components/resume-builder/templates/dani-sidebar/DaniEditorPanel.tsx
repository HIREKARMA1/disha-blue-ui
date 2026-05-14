"use client"

import daniEn from "@/data/resume-templates/dani-sidebar.en.json"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import type { DaniContactIcon, DaniModel } from "@/lib/designerVariantsResume"
import { newId } from "@/lib/minimalClassicResume"
import { AiEnhanceButton } from "../minimal-classic/AiEnhanceButton"

type DaniCopy = typeof daniEn

const ICON_OPTIONS: { value: DaniContactIcon; label: string }[] = [
  { value: "phone", label: "Phone" },
  { value: "email", label: "Email" },
  { value: "location", label: "Location" },
  { value: "web", label: "Web" },
]

export type DaniAiTarget = { kind: "profile_summary" } | { kind: "experience_item"; index: number }

export function DaniEditorPanel({
  copy,
  model,
  onChange,
  onAiTarget,
}: {
  copy: DaniCopy
  model: DaniModel
  onChange: (next: DaniModel) => void
  onAiTarget: (target: DaniAiTarget, currentText: string, sectionLabel: string) => void
}) {
  const patch = (partial: Partial<DaniModel>) => onChange({ ...model, ...partial })

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
        </div>
      </div>

      <div className="rounded-xl border border-slate-200/90 bg-white/90 p-4 dark:border-emerald-800/60 dark:bg-emerald-950/40">
        <Label>{copy.editor.photoUrl}</Label>
        <Input
          className="mt-1"
          value={model.sidebar.photoUrl}
          onChange={(e) => patch({ sidebar: { ...model.sidebar, photoUrl: e.target.value } })}
        />
        <div className="mt-4">
          <div className="mb-2 flex items-center justify-between gap-2">
            <h2 className="text-sm font-semibold text-slate-900 dark:text-emerald-50">{copy.sections.sidebarContacts.heading}</h2>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() =>
                patch({
                  sidebar: {
                    ...model.sidebar,
                    contacts: [...model.sidebar.contacts, { id: newId("dc"), icon: "phone", text: "" }],
                  },
                })
              }
            >
              {copy.sections.sidebarContacts.addRow}
            </Button>
          </div>
          <div className="space-y-2">
            {model.sidebar.contacts.map((row, index) => (
              <div key={row.id} className="flex flex-wrap items-end gap-2 rounded border border-slate-200/80 p-2 dark:border-emerald-800/50">
                <select
                  className="rounded-md border border-slate-200 bg-white px-2 py-2 text-sm dark:border-emerald-800 dark:bg-emerald-950"
                  value={row.icon}
                  onChange={(e) => {
                    const list = [...model.sidebar.contacts]
                    list[index] = { ...row, icon: e.target.value as DaniContactIcon }
                    patch({ sidebar: { ...model.sidebar, contacts: list } })
                  }}
                >
                  {ICON_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value}>
                      {o.label}
                    </option>
                  ))}
                </select>
                <Input
                  className="min-w-[160px] flex-1"
                  value={row.text}
                  onChange={(e) => {
                    const list = [...model.sidebar.contacts]
                    list[index] = { ...row, text: e.target.value }
                    patch({ sidebar: { ...model.sidebar, contacts: list } })
                  }}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="text-red-600"
                  onClick={() => {
                    const list = model.sidebar.contacts.filter((_, i) => i !== index)
                    patch({
                      sidebar: {
                        ...model.sidebar,
                        contacts: list.length ? list : model.sidebar.contacts,
                      },
                    })
                  }}
                >
                  {copy.sections.sidebarContacts.removeRow}
                </Button>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-4">
          <div className="mb-2 flex items-center justify-between gap-2">
            <h2 className="text-sm font-semibold text-slate-900 dark:text-emerald-50">{copy.sections.sidebarSkills.heading}</h2>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => patch({ sidebar: { ...model.sidebar, skills: [...model.sidebar.skills, ""] } })}
            >
              {copy.sections.sidebarSkills.addSkill}
            </Button>
          </div>
          <div className="space-y-2">
            {model.sidebar.skills.map((sk, index) => (
              <div key={index} className="flex gap-2">
                <Input
                  value={sk}
                  onChange={(e) => {
                    const skills = [...model.sidebar.skills]
                    skills[index] = e.target.value
                    patch({ sidebar: { ...model.sidebar, skills } })
                  }}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="text-red-600"
                  onClick={() => {
                    const skills = model.sidebar.skills.filter((_, i) => i !== index)
                    patch({ sidebar: { ...model.sidebar, skills: skills.length ? skills : model.sidebar.skills } })
                  }}
                >
                  {copy.sections.sidebarSkills.removeSkill}
                </Button>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-4">
          <div className="mb-2 flex items-center justify-between gap-2">
            <h2 className="text-sm font-semibold text-slate-900 dark:text-emerald-50">{copy.sections.sidebarEducation.heading}</h2>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() =>
                patch({
                  sidebar: {
                    ...model.sidebar,
                    education: [...model.sidebar.education, { id: newId("de"), level: "", schoolYearsLine: "" }],
                  },
                })
              }
            >
              {copy.sections.sidebarEducation.addEntry}
            </Button>
          </div>
          <div className="space-y-3">
            {model.sidebar.education.map((ed, index) => (
              <div key={ed.id} className="rounded border border-slate-200/80 p-2 dark:border-emerald-800/50">
                <div className="mb-2 flex justify-end">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="text-red-600"
                    onClick={() => {
                      const list = model.sidebar.education.filter((_, i) => i !== index)
                      patch({
                        sidebar: {
                          ...model.sidebar,
                          education: list.length ? list : model.sidebar.education,
                        },
                      })
                    }}
                  >
                    {copy.sections.sidebarEducation.removeEntry}
                  </Button>
                </div>
                <Label>{copy.editor.eduLevel}</Label>
                <Input
                  className="mt-1"
                  value={ed.level}
                  onChange={(e) => {
                    const list = [...model.sidebar.education]
                    list[index] = { ...ed, level: e.target.value }
                    patch({ sidebar: { ...model.sidebar, education: list } })
                  }}
                />
                <div className="mt-2">
                  <Label>{copy.editor.eduSchoolYears}</Label>
                  <Input
                    className="mt-1"
                    value={ed.schoolYearsLine}
                    onChange={(e) => {
                      const list = [...model.sidebar.education]
                      list[index] = { ...ed, schoolYearsLine: e.target.value }
                      patch({ sidebar: { ...model.sidebar, education: list } })
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-slate-200/90 bg-white/90 p-4 dark:border-emerald-800/60 dark:bg-emerald-950/40">
        <div className="mb-2 flex items-center justify-between gap-2">
          <h2 className="text-sm font-semibold text-slate-900 dark:text-emerald-50">{copy.editor.profileBody}</h2>
          <AiEnhanceButton
            label={copy.editor.aiEnhance}
            onClick={() => onAiTarget({ kind: "profile_summary" }, model.profileSummary, copy.sections.profile.heading)}
          />
        </div>
        <Textarea className="min-h-[120px]" value={model.profileSummary} onChange={(e) => patch({ profileSummary: e.target.value })} />
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
                experience: [...model.experience, { id: newId("dx"), title: "", company: "", dates: "", bullets: [""] }],
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
              <div className="grid gap-2 sm:grid-cols-2">
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
                <div>
                  <Label>{copy.editor.expCompany}</Label>
                  <Input
                    className="mt-1"
                    value={xp.company}
                    onChange={(e) => {
                      const list = [...model.experience]
                      list[index] = { ...xp, company: e.target.value }
                      patch({ experience: list })
                    }}
                  />
                </div>
                <div className="sm:col-span-2">
                  <Label>{copy.editor.expDates}</Label>
                  <Input
                    className="mt-1"
                    value={xp.dates}
                    onChange={(e) => {
                      const list = [...model.experience]
                      list[index] = { ...xp, dates: e.target.value }
                      patch({ experience: list })
                    }}
                  />
                </div>
                <div className="sm:col-span-2">
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
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
