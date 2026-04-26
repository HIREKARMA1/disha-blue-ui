"use client"

import { Bot } from "lucide-react"
import { InterviewPersonality } from "@/services/aiInterviewService"

interface Props {
  isSpeaking: boolean
  latestPrompt: string
  personality?: InterviewPersonality
}

const personalityLabel: Record<string, string> = {
  friendly_mentor: "Friendly Mentor",
  strict_hr: "Strict HR",
  technical_expert: "Technical Expert",
}

export function AIAvatar({ isSpeaking, latestPrompt, personality = "friendly_mentor" }: Props) {
  return (
    <div className={`rounded-2xl border border-slate-200/90 bg-white p-5 transition-all dark:border-emerald-800 dark:bg-emerald-950/30 ${isSpeaking ? "scale-[1.01]" : "animate-pulse"}`}>
      <div className="mb-4 flex items-center gap-3">
        <div className={`relative rounded-2xl bg-sage p-3 dark:bg-emerald-900/50 ${isSpeaking ? "animate-bounce" : ""}`}>
          <Bot className="h-6 w-6 text-sage-deep dark:text-emerald-300" />
          {isSpeaking && <span className="absolute -right-1 -top-1 h-3 w-3 animate-ping rounded-full bg-emerald-400" />}
        </div>
        <div>
          <p className="text-sm font-semibold text-slate-900 dark:text-emerald-50">AI Interviewer</p>
          <p className="text-xs text-slate-600 dark:text-emerald-300">{personalityLabel[personality]} • {isSpeaking ? "Speaking..." : "Waiting for your response"}</p>
        </div>
      </div>
      <p className="rounded-xl bg-sage/10 p-3 text-sm text-slate-700 dark:bg-emerald-900/35 dark:text-emerald-100">{latestPrompt || "Click start interview to begin."}</p>
    </div>
  )
}
