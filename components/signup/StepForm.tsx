"use client"

import { ReactNode } from "react"
import { Briefcase, GraduationCap, UserRound, Volume2, Wrench } from "lucide-react"
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
  const steps = [
    { id: 1, label: "Personal", icon: UserRound },
    { id: 2, label: "Education", icon: GraduationCap },
    { id: 3, label: "Skills", icon: Wrench },
    { id: 4, label: "Experience", icon: Briefcase },
  ]
  const playVoiceHint = () => {
    const text = helperVoiceText || helperHint
    if (!text) return
    const hasDevanagari = /[\u0900-\u097F]/.test(text)
    void speakText(text, hasDevanagari ? "hi" : undefined)
  }

  return (
    <section className="mx-auto max-w-2xl space-y-6 rounded-3xl border border-border/70 bg-background/95 p-6 shadow-sm backdrop-blur-sm transition-all duration-200 ease-in-out md:p-8">
      {step ? (
        <div className="rounded-2xl border border-border/60 bg-muted/20 p-3 md:p-4">
          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            {steps.slice(0, totalSteps).map((stepItem, index, list) => {
              const Icon = stepItem.icon
              const isActive = stepItem.id === step
              const isCompleted = stepItem.id < step
              return (
                <div key={stepItem.id} className="flex min-w-0 items-center gap-2">
                  <div className="flex flex-col items-center gap-1">
                    <div
                      className={`flex h-10 w-10 items-center justify-center rounded-xl border text-sm transition-all duration-200 ${
                        isActive
                          ? "border-primary/70 bg-primary/15 text-primary shadow-sm"
                          : isCompleted
                            ? "border-primary/40 bg-primary/10 text-primary"
                            : "border-border bg-background text-muted-foreground"
                      }`}
                    >
                      <Icon className="h-4 w-4" />
                    </div>
                    <span className={`text-[11px] font-medium ${isActive || isCompleted ? "text-foreground" : "text-muted-foreground"}`}>
                      {stepItem.label}
                    </span>
                  </div>
                  {index < list.length - 1 ? (
                    <div className={`h-[2px] w-8 rounded-full ${stepItem.id < step ? "bg-primary/40" : "bg-border"}`} />
                  ) : null}
                </div>
              )
            })}
          </div>
        </div>
      ) : null}
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground md:text-3xl">{title}</h1>
          <p className="mt-1.5 text-sm text-muted-foreground">{subtitle}</p>
        </div>
        <div className="flex items-center gap-2">
          <SignupLanguageSwitcher />
        </div>
      </div>
      {step ? (
        <div className="mt-1 space-y-2">
          <div className="flex items-center justify-between gap-2">
            <p className="text-sm font-medium text-foreground">Step {step} of {totalSteps}</p>
            <p className="text-xs text-muted-foreground">{Math.round((step / totalSteps) * 100)}%</p>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-muted/80">
            <div
              className="h-2 rounded-full bg-primary transition-all duration-500 ease-in-out"
              style={{ width: `${Math.round((step / totalSteps) * 100)}%` }}
            />
          </div>
        </div>
      ) : null}
      {helperHint ? (
        <div className="mt-3 rounded-2xl border border-border/70 bg-muted/40 p-4">
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
