"use client"

import { Globe, Linkedin, Mail, MapPin, Phone } from "lucide-react"
import morganEn from "@/data/resume-templates/morgan-blocks.en.json"
import type { MorganContactIcon, MorganModel } from "@/lib/designerVariantsResume"

type MorganCopy = typeof morganEn

const NAVY = "#0b1d3a"
const SLATE_BG = "#6b7280"
const PANEL = "#e8eef5"

function ContactGlyph({ icon }: { icon: MorganContactIcon }) {
  const c = "h-4 w-4 shrink-0"
  switch (icon) {
    case "phone":
      return <Phone className={c} style={{ color: NAVY }} aria-hidden />
    case "location":
      return <MapPin className={c} style={{ color: NAVY }} aria-hidden />
    case "email":
      return <Mail className={c} style={{ color: NAVY }} aria-hidden />
    case "web":
      return <Globe className={c} style={{ color: NAVY }} aria-hidden />
    case "linkedin":
      return <Linkedin className={c} style={{ color: NAVY }} aria-hidden />
    default:
      return null
  }
}

export function MorganTemplate({ copy, model }: { copy: MorganCopy; model: MorganModel }) {
  const p = model.personalInfo

  return (
    <div className="overflow-hidden border border-slate-300 bg-white text-[10px] shadow-sm" style={{ fontFamily: "Inter, system-ui, sans-serif" }}>
      <header className="relative flex items-center gap-5 px-6 py-6 text-white" style={{ backgroundColor: NAVY }}>
        <div
          className="pointer-events-none absolute right-0 top-0 h-32 w-32 opacity-[0.12]"
          style={{
            backgroundImage: `radial-gradient(circle at 30% 30%, #fff 1px, transparent 1px)`,
            backgroundSize: "14px 14px",
          }}
        />
        <div className="relative z-[1] h-[88px] w-[88px] shrink-0 overflow-hidden rounded-full border-4 border-white bg-slate-300">
          {p.photoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={p.photoUrl} alt="" className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-[11px] text-slate-600">Photo</div>
          )}
        </div>
        <div className="relative z-[1] min-w-0">
          <h1 className="text-[20px] font-bold uppercase leading-tight tracking-wide">{p.fullName || "\u00a0"}</h1>
          <p className="mt-1 text-[11px] font-medium uppercase tracking-[0.25em] text-white/90">{p.jobTitle || "\u00a0"}</p>
        </div>
      </header>

      <section className="grid gap-0 md:grid-cols-2" style={{ backgroundColor: PANEL }}>
        <div className="space-y-3 border-slate-300/80 p-5 md:border-r">
          {model.contacts.map((row) => (
            <div key={row.id} className="flex items-start gap-3 text-[#1e293b]">
              <ContactGlyph icon={row.icon} />
              <p className="min-w-0 break-words leading-snug">{row.text || "—"}</p>
            </div>
          ))}
        </div>
        <div className="space-y-4 border-t border-slate-300/80 p-5 md:border-t-0 md:border-l md:border-slate-300/80">
          <div>
            <p className="text-[9px] font-bold uppercase tracking-wide" style={{ color: NAVY }}>
              {copy.sections.summary.heading}
            </p>
            <p className="mt-2 text-justify leading-[1.55] text-slate-700">{model.summary || "\u00a0"}</p>
          </div>
          <div>
            <p className="text-[9px] font-bold uppercase tracking-wide" style={{ color: NAVY }}>
              {copy.sections.expertise.heading}
            </p>
            <p className="mt-2 leading-[1.55] text-slate-700">{model.expertise || "\u00a0"}</p>
          </div>
        </div>
      </section>

      <section className="grid gap-0 text-white md:grid-cols-2" style={{ backgroundColor: SLATE_BG }}>
        <div className="border-white/25 p-5 md:border-r">
          <h2 className="text-[10px] font-bold uppercase tracking-wide" style={{ color: NAVY }}>
            {copy.sections.education.heading}
          </h2>
          <div className="mt-4 space-y-5">
            {model.education.map((ed) => (
              <div key={ed.id}>
                <p className="text-[10px] font-bold uppercase leading-snug">{ed.institution || "—"}</p>
                <p className="mt-1 text-[9px] uppercase leading-snug text-white/95">{ed.degreeDatesLine || "—"}</p>
                <ul className="mt-2 list-disc space-y-1 pl-4 text-[9.5px] leading-snug text-white/90">
                  {ed.bullets.filter(Boolean).map((b, i) => (
                    <li key={i}>{b}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
        <div className="border-t border-white/25 p-5 md:border-t-0 md:border-l md:border-white/25">
          <h2 className="text-[10px] font-bold uppercase tracking-wide" style={{ color: NAVY }}>
            {copy.sections.experience.heading}
          </h2>
          <div className="mt-4 space-y-5">
            {model.experience.map((xp) => (
              <div key={xp.id}>
                <p className="text-[10px] font-bold uppercase leading-snug">{xp.title || "—"}</p>
                <p className="mt-1 text-[9px] uppercase leading-snug text-white/95">{xp.companyDatesLine || "—"}</p>
                <ul className="mt-2 list-disc space-y-1 pl-4 text-[9.5px] leading-snug text-white/90">
                  {xp.bullets.filter(Boolean).map((b, i) => (
                    <li key={i}>{b}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="grid gap-6 border-t border-slate-200 bg-[#f4f5f7] p-5 md:grid-cols-[minmax(0,140px)_1fr]">
        <h2 className="text-[10px] font-bold uppercase leading-snug" style={{ color: NAVY }}>
          {copy.sections.references.heading}
        </h2>
        <div className="grid gap-6 md:grid-cols-2 md:divide-x md:divide-slate-300">
          {model.references.map((r, i) => (
            <div key={r.id} className={i > 0 ? "md:pl-6" : ""}>
              <p className="text-[10px] font-bold uppercase" style={{ color: NAVY }}>
                {r.name || "—"}
              </p>
              <p className="mt-1 text-[9px] text-slate-600">{r.titleCompany || "—"}</p>
              <p className="mt-1 text-[9px] text-slate-600">{r.phone}</p>
              <p className="mt-0.5 text-[9px] text-slate-600">{r.email}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
