"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import type { MinimalClassicCopy, MinimalClassicModel } from "@/lib/minimalClassicResume"
import { newId } from "@/lib/minimalClassicResume"
import { AiEnhanceButton } from "./AiEnhanceButton"

export type AiTarget = { kind: "about_me" } | { kind: "experience_item"; index: number }

export function MinimalClassicEditorPanel({
  copy,
  model,
  onChange,
  onAiTarget,
}: {
  copy: MinimalClassicCopy
  model: MinimalClassicModel
  onChange: (next: MinimalClassicModel) => void
  onAiTarget: (target: AiTarget, currentText: string, sectionTypeLabel: string) => void
}) {
  const patch = (partial: Partial<MinimalClassicModel>) => onChange({ ...model, ...partial })

  const patchPersonal = (key: keyof MinimalClassicModel["personalInfo"], value: string) => {
    onChange({
      ...model,
      personalInfo: { ...model.personalInfo, [key]: value },
    })
  }

  const patchTimeline = (
    listKey: "education" | "experience",
    index: number,
    key: keyof MinimalClassicModel["education"][0],
    value: string
  ) => {
    const list = [...model[listKey]]
    list[index] = { ...list[index], [key]: value }
    patch({ [listKey]: list })
  }

  const addTimeline = (listKey: "education" | "experience") => {
    const list = [
      ...model[listKey],
      {
        id: newId(listKey),
        dateRange: "",
        organization: "",
        title: "",
        body: "",
      },
    ]
    patch({ [listKey]: list })
  }

  const removeTimeline = (listKey: "education" | "experience", index: number) => {
    const list = model[listKey].filter((_, i) => i !== index)
    patch({ [listKey]: list.length ? list : model[listKey] })
  }

  const patchSkill = (index: number, value: string) => {
    const skills = [...model.skills]
    skills[index] = value
    patch({ skills })
  }

  const patchRef = (index: number, key: keyof MinimalClassicModel["references"][0], value: string) => {
    const references = [...model.references]
    references[index] = { ...references[index], [key]: value }
    patch({ references })
  }

  const addRef = () => {
    patch({
      references: [
        ...model.references,
        { id: newId("ref"), name: "", subtitle: "", phone: "", social: "" },
      ],
    })
  }

  const removeRef = (index: number) => {
    const references = model.references.filter((_, i) => i !== index)
    patch({ references: references.length ? references : model.references })
  }

  const skillsPadded = [...model.skills]
  while (skillsPadded.length < 8) skillsPadded.push("")
  const skillSlots = skillsPadded.slice(0, Math.max(8, Math.ceil(skillsPadded.length / 4) * 4))

  return (
    <div className="space-y-6">
      <section className="dashboard-overview-card rounded-2xl border border-slate-200/90 p-4 dark:border-emerald-800/60">
        <h2 className="mb-3 text-sm font-semibold text-slate-900 dark:text-emerald-50">
          {copy.editor.personalBlockTitle}
        </h2>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div>
            <Label>{copy.editor.personalFieldLabels.fullName}</Label>
            <Input
              className="mt-1"
              value={model.personalInfo.fullName}
              onChange={(e) => patchPersonal("fullName", e.target.value)}
            />
          </div>
          <div>
            <Label>{copy.editor.personalFieldLabels.jobTitle}</Label>
            <Input
              className="mt-1"
              value={model.personalInfo.jobTitle}
              onChange={(e) => patchPersonal("jobTitle", e.target.value)}
            />
          </div>
          <div>
            <Label>{copy.editor.personalFieldLabels.phone}</Label>
            <Input
              className="mt-1"
              value={model.personalInfo.phone}
              onChange={(e) => patchPersonal("phone", e.target.value)}
            />
          </div>
          <div>
            <Label>{copy.editor.personalFieldLabels.email}</Label>
            <Input
              className="mt-1"
              value={model.personalInfo.email}
              onChange={(e) => patchPersonal("email", e.target.value)}
            />
          </div>
          <div className="sm:col-span-2">
            <Label>{copy.editor.personalFieldLabels.location}</Label>
            <Input
              className="mt-1"
              value={model.personalInfo.location}
              onChange={(e) => patchPersonal("location", e.target.value)}
            />
          </div>
        </div>
      </section>

      <section className="dashboard-overview-card rounded-2xl border border-slate-200/90 p-4 dark:border-emerald-800/60">
        <div className="mb-3 flex items-center justify-between gap-2">
          <h2 className="text-sm font-semibold text-slate-900 dark:text-emerald-50">
            {copy.sections.aboutMe.heading}
          </h2>
          <AiEnhanceButton
            label={copy.editor.aiEnhance}
            onClick={() => onAiTarget({ kind: "about_me" }, model.aboutMe, copy.sections.aboutMe.heading)}
          />
        </div>
        <Textarea
          rows={6}
          value={model.aboutMe}
          onChange={(e) => patch({ aboutMe: e.target.value })}
          className="text-sm"
        />
      </section>

      {(["education", "experience"] as const).map((listKey) => (
        <section
          key={listKey}
          className="dashboard-overview-card rounded-2xl border border-slate-200/90 p-4 dark:border-emerald-800/60"
        >
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
            <h2 className="text-sm font-semibold text-slate-900 dark:text-emerald-50">
              {copy.sections[listKey].heading}
            </h2>
            <Button type="button" variant="secondary" size="sm" onClick={() => addTimeline(listKey)}>
              {copy.sections[listKey].addEntry}
            </Button>
          </div>
          <div className="space-y-4">
            {model[listKey].map((row, index) => (
              <div
                key={row.id}
                className="rounded-xl border border-slate-200/80 p-3 dark:border-emerald-800/50"
              >
                <div className="mb-2 flex justify-end">
                  <Button type="button" variant="ghost" size="sm" onClick={() => removeTimeline(listKey, index)}>
                    {copy.sections[listKey].removeEntry}
                  </Button>
                </div>
                <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                  <div>
                    <Label>{copy.editor.timelineDateRange}</Label>
                    <Input
                      className="mt-1"
                      value={row.dateRange}
                      onChange={(e) => patchTimeline(listKey, index, "dateRange", e.target.value)}
                    />
                  </div>
                  <div>
                    <Label>{copy.editor.timelineOrganization}</Label>
                    <Input
                      className="mt-1"
                      value={row.organization}
                      onChange={(e) => patchTimeline(listKey, index, "organization", e.target.value)}
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <Label>{copy.editor.timelineTitle}</Label>
                    <Input
                      className="mt-1"
                      value={row.title}
                      onChange={(e) => patchTimeline(listKey, index, "title", e.target.value)}
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <div className="mb-1 flex flex-wrap items-center justify-between gap-2">
                      <Label>{copy.editor.timelineBody}</Label>
                      {listKey === "experience" && (
                        <AiEnhanceButton
                          label={copy.editor.aiEnhance}
                          onClick={() =>
                            onAiTarget(
                              { kind: "experience_item", index },
                              row.body,
                              copy.sections.experience.heading
                            )
                          }
                        />
                      )}
                    </div>
                    <Textarea
                      className="mt-1"
                      rows={4}
                      value={row.body}
                      onChange={(e) => patchTimeline(listKey, index, "body", e.target.value)}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      ))}

      <section className="dashboard-overview-card rounded-2xl border border-slate-200/90 p-4 dark:border-emerald-800/60">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-sm font-semibold text-slate-900 dark:text-emerald-50">
            {copy.sections.skills.heading}
          </h2>
        </div>
        <p className="mb-2 text-xs text-slate-500 dark:text-emerald-400/80">{copy.sections.skills.columnHint}</p>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {skillSlots.map((s, i) => (
            <div key={i}>
              <Label className="text-xs">
                {copy.editor.skillLabel} {i + 1}
              </Label>
              <Input className="mt-1" value={s} onChange={(e) => patchSkill(i, e.target.value)} />
            </div>
          ))}
        </div>
      </section>

      <section className="dashboard-overview-card rounded-2xl border border-slate-200/90 p-4 dark:border-emerald-800/60">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-sm font-semibold text-slate-900 dark:text-emerald-50">
            {copy.sections.references.heading}
          </h2>
          <Button type="button" variant="secondary" size="sm" onClick={addRef}>
            {copy.sections.references.addReference}
          </Button>
        </div>
        <div className="space-y-4">
          {model.references.map((r, index) => (
            <div
              key={r.id}
              className="rounded-xl border border-slate-200/80 p-3 dark:border-emerald-800/50"
            >
              <div className="mb-2 flex justify-end">
                <Button type="button" variant="ghost" size="sm" onClick={() => removeRef(index)}>
                  {copy.sections.education.removeEntry}
                </Button>
              </div>
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                <div>
                  <Label>{copy.editor.referenceName}</Label>
                  <Input
                    className="mt-1"
                    value={r.name}
                    onChange={(e) => patchRef(index, "name", e.target.value)}
                  />
                </div>
                <div>
                  <Label>{copy.editor.referenceSubtitle}</Label>
                  <Input
                    className="mt-1"
                    value={r.subtitle}
                    onChange={(e) => patchRef(index, "subtitle", e.target.value)}
                  />
                </div>
                <div>
                  <Label>{copy.editor.referencePhone}</Label>
                  <Input
                    className="mt-1"
                    value={r.phone}
                    onChange={(e) => patchRef(index, "phone", e.target.value)}
                  />
                </div>
                <div>
                  <Label>{copy.editor.referenceSocial}</Label>
                  <Input
                    className="mt-1"
                    value={r.social}
                    onChange={(e) => patchRef(index, "social", e.target.value)}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
