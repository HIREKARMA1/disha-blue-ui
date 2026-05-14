"use client"

import type { ReactNode } from "react"
import { Mail, MapPin, Phone } from "lucide-react"
import type { MinimalClassicCopy, MinimalClassicModel } from "@/lib/minimalClassicResume"

export function MinimalClassicResumeShell({ children }: { children: ReactNode }) {
  return (
    <div className="border border-[#d4d4d4] bg-white px-6 py-7 text-[#111] shadow-sm">
      {children}
    </div>
  )
}

export function MinimalClassicDocumentHeader({
  data,
}: {
  data: MinimalClassicModel["personalInfo"]
}) {
  return (
    <header className="text-center">
      <h1 className="text-[22px] font-bold uppercase tracking-[0.12em] text-[#111]">
        {data.fullName || "\u00a0"}
      </h1>
      <p className="mt-1 text-[11px] font-normal uppercase tracking-[0.18em] text-[#333]">
        {data.jobTitle || "\u00a0"}
      </p>
      <div className="my-3 border-t border-[#c8c8c8]" />
      <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-[10px] uppercase tracking-wide text-[#222]">
        <span className="inline-flex items-center gap-1.5">
          <Phone className="h-3.5 w-3.5 shrink-0 text-[#444]" aria-hidden />
          {data.phone || "—"}
        </span>
        <span className="inline-flex items-center gap-1.5">
          <MapPin className="h-3.5 w-3.5 shrink-0 text-[#444]" aria-hidden />
          {data.location || "—"}
        </span>
        <span className="inline-flex items-center gap-1.5">
          <Mail className="h-3.5 w-3.5 shrink-0 text-[#444]" aria-hidden />
          {data.email || "—"}
        </span>
      </div>
      <div className="mt-3 border-t border-[#c8c8c8]" />
    </header>
  )
}

export function MinimalClassicRuledSectionTitle({ title }: { title: string }) {
  return (
    <div className="mt-5">
      <h2 className="text-[11px] font-bold uppercase tracking-[0.14em] text-[#111]">{title}</h2>
      <div className="mt-1.5 border-t border-[#c8c8c8]" />
    </div>
  )
}

export function MinimalClassicAboutBlock({
  copy,
  body,
}: {
  copy: MinimalClassicCopy
  body: string
}) {
  return (
    <section>
      <MinimalClassicRuledSectionTitle title={copy.sections.aboutMe.heading} />
      <p className="mt-2 text-justify text-[10.5px] leading-[1.55] text-[#222]">{body || "\u00a0"}</p>
    </section>
  )
}

export function MinimalClassicTimelineEntries({
  entries,
}: {
  entries: MinimalClassicModel["education"]
}) {
  return (
    <div className="mt-3 space-y-4">
      {entries.map((row) => (
        <div key={row.id} className="grid grid-cols-12 gap-3 text-[10.5px] leading-snug">
          <div className="col-span-12 sm:col-span-4">
            <p className="font-medium text-[#111]">{row.dateRange}</p>
            <p className="mt-0.5 text-[#333]">{row.organization}</p>
          </div>
          <div className="col-span-12 sm:col-span-8">
            <p className="font-bold text-[#111]">{row.title}</p>
            <p className="mt-1 text-justify leading-[1.55] text-[#222]">{row.body}</p>
          </div>
        </div>
      ))}
    </div>
  )
}

export function MinimalClassicSkillsBlock({
  copy,
  skills,
}: {
  copy: MinimalClassicCopy
  skills: string[]
}) {
  const cols = 4
  const rows = Math.max(1, Math.ceil(skills.length / cols))
  const padded = [...skills]
  while (padded.length < rows * cols) padded.push("")

  return (
    <section>
      <MinimalClassicRuledSectionTitle title={copy.sections.skills.heading} />
      <div className="mt-3 grid grid-cols-2 gap-x-4 gap-y-1 sm:grid-cols-4">
        {padded.map((s, i) => (
          <div key={i} className="flex items-start gap-1.5 text-[10.5px] text-[#222]">
            <span className="mt-[5px] h-1 w-1 shrink-0 rounded-full bg-[#111]" />
            <span>{s || "\u00a0"}</span>
          </div>
        ))}
      </div>
    </section>
  )
}

export function MinimalClassicReferencesBlock({
  copy,
  references,
}: {
  copy: MinimalClassicCopy
  references: MinimalClassicModel["references"]
}) {
  return (
    <section>
      <MinimalClassicRuledSectionTitle title={copy.sections.references.heading} />
      <div className="mt-3 grid grid-cols-1 gap-6 sm:grid-cols-2">
        {references.map((r) => (
          <div key={r.id} className="grid grid-cols-12 gap-2 text-[10.5px]">
            <div className="col-span-12 sm:col-span-5">
              <p className="font-bold text-[#111]">{r.name}</p>
              <p className="mt-0.5 text-[#333]">{r.subtitle}</p>
            </div>
            <div className="col-span-12 sm:col-span-7 text-[#222]">
              <p>
                {copy.sections.references.phoneLabel}: {r.phone}
              </p>
              <p className="mt-0.5">
                {copy.sections.references.socialLabel}: {r.social}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}

export function MinimalClassicTemplate({
  copy,
  model,
  className = "",
}: {
  copy: MinimalClassicCopy
  model: MinimalClassicModel
  className?: string
}) {
  return (
    <div className={`minimal-classic-print-root mx-auto max-w-[720px] ${className}`}>
      <MinimalClassicResumeShell>
        <MinimalClassicDocumentHeader data={model.personalInfo} />
        <MinimalClassicAboutBlock copy={copy} body={model.aboutMe} />
        <section>
          <MinimalClassicRuledSectionTitle title={copy.sections.education.heading} />
          <MinimalClassicTimelineEntries entries={model.education} />
        </section>
        <section>
          <MinimalClassicRuledSectionTitle title={copy.sections.experience.heading} />
          <MinimalClassicTimelineEntries entries={model.experience} />
        </section>
        <MinimalClassicSkillsBlock copy={copy} skills={model.skills} />
        <MinimalClassicReferencesBlock copy={copy} references={model.references} />
      </MinimalClassicResumeShell>
    </div>
  )
}
