"use client"

import marcelineEn from "@/data/resume-templates/marceline-single.en.json"
import type { MarcelineModel } from "@/lib/designerVariantsResume"

const NAVY = "#0f2540"
const MUTED = "#3d4f63"

type MarcelineCopy = typeof marcelineEn

function SectionRule({ title }: { title: string }) {
  return (
    <section className="mt-4">
      <h2 className="text-[11px] font-bold uppercase tracking-[0.12em]" style={{ color: NAVY }}>
        {title}
      </h2>
      <div className="mt-1.5 border-t border-slate-300" />
    </section>
  )
}

export function MarcelineTemplate({ copy, model }: { copy: MarcelineCopy; model: MarcelineModel }) {
  const { personalInfo: p } = model
  const contactBits = [p.addressLine, p.phone, p.email].filter(Boolean)

  return (
    <div className="border border-slate-300 bg-white px-7 py-8 text-[10.5px] shadow-sm" style={{ fontFamily: "Inter, system-ui, sans-serif" }}>
      <header className="text-center">
        <h1 className="text-[22px] font-bold uppercase tracking-[0.08em]" style={{ color: NAVY }}>
          {p.fullName || "\u00a0"}
        </h1>
        <p className="mt-1 text-[11px] font-bold uppercase tracking-[0.14em]" style={{ color: NAVY }}>
          {p.jobTitle || "\u00a0"}
        </p>
        <p className="mt-3 text-[10px] leading-relaxed" style={{ color: MUTED }}>
          {contactBits.length ? contactBits.join("  |  ") : "\u00a0"}
        </p>
        <div className="mt-4 h-1 w-full rounded-sm" style={{ backgroundColor: NAVY }} />
      </header>

      <SectionRule title={copy.sections.profileSummary.heading} />
      <p className="mt-2 text-justify leading-[1.55]" style={{ color: MUTED }}>
        {model.profileSummary || "\u00a0"}
      </p>

      <SectionRule title={copy.sections.experience.heading} />
      <div className="mt-3 space-y-4">
        {model.experience.map((job) => (
          <div key={job.id}>
            <div className="flex flex-wrap items-baseline justify-between gap-2 text-[10.5px]">
              <span className="font-bold uppercase tracking-wide" style={{ color: NAVY }}>
                {job.role || "—"}
              </span>
              <span className="text-right font-bold uppercase tracking-wide" style={{ color: NAVY }}>
                {[job.company, job.dates].filter(Boolean).join("  |  ") || "—"}
              </span>
            </div>
            <ul className="mt-2 list-disc space-y-1 pl-5" style={{ color: MUTED }}>
              {job.bullets.filter(Boolean).map((b, i) => (
                <li key={i} className="leading-snug">
                  {b}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <SectionRule title={copy.sections.education.heading} />
      <div className="mt-3 space-y-3">
        {model.education.map((ed) => (
          <div key={ed.id}>
            <p className="font-bold" style={{ color: NAVY }}>
              {ed.degree || "—"}
            </p>
            <p className="mt-0.5" style={{ color: NAVY }}>
              {ed.institutionYear || "—"}
            </p>
          </div>
        ))}
      </div>

      <SectionRule title={copy.sections.skills.heading} />
      <div className="mt-3 space-y-2">
        {model.skillGroups.map((g) => (
          <p key={g.id} className="leading-snug" style={{ color: MUTED }}>
            <span className="font-bold" style={{ color: NAVY }}>
              {g.label}:{" "}
            </span>
            {g.itemsLine || "—"}
          </p>
        ))}
      </div>

      <SectionRule title={copy.sections.achievements.heading} />
      <ul className="mt-3 list-disc space-y-1 pl-5" style={{ color: MUTED }}>
        {model.achievements.map((a) => (
          <li key={a.id} className="leading-snug">
            {a.text || "—"}
          </li>
        ))}
      </ul>
    </div>
  )
}
