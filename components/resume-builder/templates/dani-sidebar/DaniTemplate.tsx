"use client"

import { Briefcase, Globe, Mail, MapPin, Phone, User, type LucideIcon } from "lucide-react"
import daniEn from "@/data/resume-templates/dani-sidebar.en.json"
import type { DaniContactIcon, DaniModel } from "@/lib/designerVariantsResume"

type DaniCopy = typeof daniEn

const HEADER = "#333c4d"
const SIDEBAR = "#2d3545"
const BODY = "#555555"

function DaniContactGlyph({ icon }: { icon: DaniContactIcon }) {
  const c = "h-3.5 w-3.5 shrink-0 text-white"
  switch (icon) {
    case "phone":
      return <Phone className={c} aria-hidden />
    case "email":
      return <Mail className={c} aria-hidden />
    case "location":
      return <MapPin className={c} aria-hidden />
    case "web":
      return <Globe className={c} aria-hidden />
    default:
      return null
  }
}

function SectionHeader({ icon: Icon, title }: { icon: LucideIcon; title: string }) {
  return (
    <div className="mb-3 flex items-center gap-2">
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-600 text-white">
        <Icon className="h-4 w-4" aria-hidden />
      </div>
      <h2 className="text-[11px] font-bold uppercase tracking-wide text-[#333c4d]">{title}</h2>
    </div>
  )
}

export function DaniTemplate({ copy, model }: { copy: DaniCopy; model: DaniModel }) {
  const p = model.personalInfo

  return (
    <div className="flex flex-col border border-slate-300 bg-white text-[10px] shadow-sm md:flex-row" style={{ fontFamily: "Inter, system-ui, sans-serif" }}>
      <div className="min-w-0 flex-1">
        <div className="px-6 py-5 text-white" style={{ backgroundColor: HEADER }}>
          <h1 className="text-[20px] font-bold uppercase leading-tight tracking-wide">{p.fullName || "\u00a0"}</h1>
          <p className="mt-1 text-[10px] uppercase tracking-[0.22em] text-white/90">{p.jobTitle || "\u00a0"}</p>
        </div>

        <div className="space-y-6 px-6 py-6" style={{ color: BODY }}>
          <section>
            <SectionHeader icon={User} title={copy.sections.profile.heading} />
            <div className="flex gap-3">
              <div className="w-px shrink-0 bg-slate-300" />
              <p className="text-justify leading-[1.55]">{model.profileSummary || "\u00a0"}</p>
            </div>
          </section>

          <section>
            <SectionHeader icon={Briefcase} title={copy.sections.experience.heading} />
            <div className="relative pl-4">
              <div className="absolute bottom-1 left-[7px] top-1 w-px bg-slate-300" />
              <div className="space-y-5">
                {model.experience.map((xp, idx) => (
                  <div key={xp.id} className="relative pl-4">
                    <div className="absolute left-0 top-1.5 h-2 w-2 -translate-x-[1px] rounded-full bg-slate-400" />
                    {idx === model.experience.length - 1 && (
                      <div className="absolute bottom-0 left-[7px] h-2 w-2 -translate-x-1/2 translate-y-1 rounded-full bg-slate-400" />
                    )}
                    <p className="text-[10px] font-bold uppercase text-[#333c4d]">{xp.title || "—"}</p>
                    <p className="mt-0.5 text-[9.5px] text-slate-600">
                      {xp.company}
                      {xp.company && xp.dates ? " · " : ""}
                      {xp.dates}
                    </p>
                    <ul className="mt-2 list-disc space-y-1 pl-4 text-[9.5px] leading-snug">
                      {xp.bullets.filter(Boolean).map((b, i) => (
                        <li key={i}>{b}</li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          </section>
        </div>
      </div>

      <aside className="w-full shrink-0 p-5 text-white md:w-[220px]" style={{ backgroundColor: SIDEBAR }}>
        <div className="mx-auto mb-5 h-[100px] w-[100px] overflow-hidden rounded-full border-4 border-white/90 bg-slate-600">
          {model.sidebar.photoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={model.sidebar.photoUrl} alt="" className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full items-center justify-center text-[9px] text-white/80">Photo</div>
          )}
        </div>

        <div className="space-y-3 border-b border-white/20 pb-4">
          {model.sidebar.contacts.map((row) => (
            <div key={row.id} className="flex items-start gap-2 text-[9.5px] leading-snug">
              <DaniContactGlyph icon={row.icon} />
              <span className="min-w-0 break-words">{row.text || "—"}</span>
            </div>
          ))}
        </div>

        <div className="mt-5">
          <h3 className="border-b border-white/50 pb-1 text-[10px] font-bold uppercase tracking-wide">{copy.sections.sidebarSkills.heading}</h3>
          <ul className="mt-3 list-disc space-y-1 pl-4 text-[9.5px] leading-snug text-white/95">
            {model.sidebar.skills.filter(Boolean).map((s, i) => (
              <li key={i}>{s}</li>
            ))}
          </ul>
        </div>

        <div className="mt-5">
          <h3 className="border-b border-white/50 pb-1 text-[10px] font-bold uppercase tracking-wide">{copy.sections.sidebarEducation.heading}</h3>
          <div className="mt-3 space-y-4">
            {model.sidebar.education.map((ed) => (
              <div key={ed.id}>
                <p className="text-[9.5px] font-bold uppercase leading-snug">{ed.level || "—"}</p>
                <p className="mt-1 text-[9px] leading-snug text-white/90">{ed.schoolYearsLine || "—"}</p>
              </div>
            ))}
          </div>
        </div>
      </aside>
    </div>
  )
}
