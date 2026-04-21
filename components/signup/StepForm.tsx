"use client"

import { ReactNode, useEffect, useState } from "react"
import { Volume2 } from "lucide-react"
import { SignupLanguageSwitcher } from "@/components/signup/LanguageSwitcher"
import { speakText } from "@/lib/speech"

interface StepFormProps {
  title: string
  subtitle: string
  step?: number
  totalSteps?: number
  helperHint?: string
  helperVoiceText?: string
  children: ReactNode
}

export function StepForm({ title, subtitle, step, totalSteps = 4, helperHint, helperVoiceText, children }: StepFormProps) {
  const [simpleMode, setSimpleMode] = useState(false)
  useEffect(() => {
    const raw = localStorage.getItem("hk_simple_mode")
    setSimpleMode(raw === "true")
  }, [])

  const toggleSimpleMode = () => {
    const next = !simpleMode
    setSimpleMode(next)
    localStorage.setItem("hk_simple_mode", String(next))
  }

  const playVoiceHint = () => {
    const text = helperVoiceText || helperHint
    if (!text) return
    void speakText(text)
  }

  return (
    <section className={`mx-auto max-w-xl rounded-2xl bg-white p-6 shadow-lg dark:bg-zinc-900 md:p-8 ${simpleMode ? "text-lg" : ""}`}>
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className={`font-semibold ${simpleMode ? "text-3xl" : "text-2xl"}`}>{title}</h1>
          <p className={`mt-1 text-muted-foreground ${simpleMode ? "text-base" : "text-sm"}`}>{subtitle}</p>
        </div>
        <div className="flex items-center gap-2">
          <SignupLanguageSwitcher />
          <button
            type="button"
            onClick={toggleSimpleMode}
            className="rounded-full border px-3 py-1 text-xs font-medium"
          >
            Simple Mode {simpleMode ? "On" : "Off"}
          </button>
        </div>
      </div>
      {step ? (
        <div className="mt-4 space-y-2">
          <p className="text-sm font-medium">Step {step} of {totalSteps}</p>
          <div className="h-2 w-full rounded-full bg-gray-200">
            <div
              className="h-2 rounded-full bg-primary transition-all duration-300"
              style={{ width: `${Math.round((step / totalSteps) * 100)}%` }}
            />
          </div>
        </div>
      ) : null}
      {helperHint ? (
        <div className="mt-3 rounded-lg border border-primary/20 bg-primary/5 px-3 py-2">
          <p className={`${simpleMode ? "text-base" : "text-sm"}`}>{helperHint}</p>
          <button type="button" className="mt-1 inline-flex items-center gap-1 text-xs text-primary" onClick={playVoiceHint}>
            <Volume2 className="h-3.5 w-3.5" /> Listen
          </button>
        </div>
      ) : null}
      <div className="mt-5 space-y-4">{children}</div>
    </section>
  )
}
