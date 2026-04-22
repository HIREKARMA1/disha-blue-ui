"use client"

import { ReactNode } from "react"
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
  const playVoiceHint = () => {
    const text = helperVoiceText || helperHint
    if (!text) return
    const hasDevanagari = /[\u0900-\u097F]/.test(text)
    void speakText(text, hasDevanagari ? "hi" : undefined)
  }

  return (
    <section className="mx-auto max-w-xl rounded-2xl border border-border bg-background p-6 shadow-sm transition-all duration-200 ease-in-out hover:shadow-md md:p-8">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">{title}</h1>
          <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>
        </div>
        <div className="flex items-center gap-2">
          <SignupLanguageSwitcher />
        </div>
      </div>
      {step ? (
        <div className="mt-4 space-y-2">
          <div className="flex items-center justify-between gap-2">
            <p className="text-sm font-medium text-foreground">Step {step} of {totalSteps}</p>
            <p className="text-xs text-muted-foreground">{Math.round((step / totalSteps) * 100)}%</p>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
            <div
              className="h-2 rounded-full bg-primary transition-all duration-500 ease-in-out"
              style={{ width: `${Math.round((step / totalSteps) * 100)}%` }}
            />
          </div>
        </div>
      ) : null}
      {helperHint ? (
        <div className="mt-3 rounded-xl border border-border bg-muted/40 p-4">
          <p className="text-sm text-foreground">{helperHint}</p>
          <button type="button" className="mt-1 inline-flex items-center gap-1 text-xs text-muted-foreground transition-all duration-200 ease-in-out hover:text-primary" onClick={playVoiceHint}>
            <Volume2 className="h-3.5 w-3.5" /> Listen
          </button>
        </div>
      ) : null}
      <div className="mt-6 space-y-4">{children}</div>
    </section>
  )
}
