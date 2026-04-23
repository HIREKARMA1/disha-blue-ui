"use client"

import { InterviewFeedback } from "@/services/aiInterviewService"

interface Props {
  score: number
  feedback: InterviewFeedback
  onRetry: () => void
}

export function ScoreCard({ score, feedback, onRetry }: Props) {
  const metrics = [
    { label: "Communication", value: feedback.communication },
    { label: "Confidence", value: feedback.confidence },
    { label: "Technical", value: feedback.technical },
    { label: "Problem Solving", value: feedback.problem_solving },
  ]

  const downloadReport = async () => {
    const { jsPDF } = await import("jspdf")
    const doc = new jsPDF()
    doc.setFontSize(16)
    doc.text("AI Interview Report", 14, 16)
    doc.setFontSize(12)
    doc.text(`Overall Score: ${score}/100`, 14, 28)
    doc.text(`Emotional State: ${feedback.emotional_state}`, 14, 36)
    doc.text(`Performance Personality: ${feedback.performance_personality || "N/A"}`, 14, 44)
    doc.text("Strengths:", 14, 56)
    feedback.strengths.slice(0, 4).forEach((item, idx) => doc.text(`- ${item}`, 18, 64 + idx * 7))
    const weakStart = 64 + Math.min(feedback.strengths.length, 4) * 7 + 8
    doc.text("Suggestions:", 14, weakStart)
    feedback.suggestions.slice(0, 4).forEach((item, idx) => doc.text(`- ${item}`, 18, weakStart + 8 + idx * 7))
    doc.save("interview-report.pdf")
  }

  return (
    <div className="dashboard-overview-card space-y-5 p-6">
      <h2 className="font-display text-2xl font-semibold text-slate-900 dark:text-emerald-50">Interview Result</h2>
      <div>
        <p className="text-sm text-slate-600 dark:text-emerald-300">Overall Score</p>
        <p className="text-4xl font-bold text-sage-deep dark:text-emerald-300">{score}/100</p>
        <p className="mt-1 text-xs text-slate-600 dark:text-emerald-300">Emotional state: {feedback.emotional_state}</p>
        {feedback.performance_personality && <p className="text-xs text-slate-600 dark:text-emerald-300">Profile: {feedback.performance_personality}</p>}
        {feedback.key_strength_summary && <p className="mt-1 text-xs text-slate-600 dark:text-emerald-300">{feedback.key_strength_summary}</p>}
      </div>
      {metrics.map((metric) => (
        <div key={metric.label}>
          <div className="mb-1 flex justify-between text-sm">
            <span className="text-slate-700 dark:text-emerald-100">{metric.label}</span>
            <span className="font-semibold text-slate-900 dark:text-emerald-50">{metric.value}%</span>
          </div>
          <div className="h-2 rounded-full bg-slate-200 dark:bg-emerald-950/40">
            <div className="h-full rounded-full bg-sage-deep dark:bg-emerald-500" style={{ width: `${metric.value}%` }} />
          </div>
        </div>
      ))}
      <div>
        <p className="mb-2 text-sm font-semibold text-slate-900 dark:text-emerald-50">Strengths</p>
        <ul className="list-disc space-y-1 pl-5 text-sm text-slate-700 dark:text-emerald-100">
          {feedback.strengths.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </div>
      <div>
        <p className="mb-2 text-sm font-semibold text-slate-900 dark:text-emerald-50">Weaknesses</p>
        <ul className="list-disc space-y-1 pl-5 text-sm text-slate-700 dark:text-emerald-100">
          {feedback.weaknesses.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </div>
      <div>
        <p className="mb-2 text-sm font-semibold text-slate-900 dark:text-emerald-50">Suggestions</p>
        <ul className="list-disc space-y-1 pl-5 text-sm text-slate-700 dark:text-emerald-100">
          {feedback.suggestions.map((suggestion) => (
            <li key={suggestion}>{suggestion}</li>
          ))}
        </ul>
      </div>
      {feedback.timeline?.length > 0 && (
        <div>
          <p className="mb-2 text-sm font-semibold text-slate-900 dark:text-emerald-50">Performance Timeline</p>
          <div className="flex items-end gap-2">
            {feedback.timeline.map((point, index) => (
              <div key={`${point}-${index}`} className="flex flex-1 flex-col items-center">
                <div className="w-full rounded-t bg-sage-deep/80 dark:bg-emerald-500/80" style={{ height: `${Math.max(8, point)}px` }} />
                <span className="mt-1 text-[10px] text-slate-600 dark:text-emerald-300">Q{index + 1}</span>
              </div>
            ))}
          </div>
        </div>
      )}
      {feedback.improvement_areas?.length > 0 && (
        <div>
          <p className="mb-2 text-sm font-semibold text-slate-900 dark:text-emerald-50">Key Improvement Areas</p>
          <ul className="list-disc space-y-1 pl-5 text-sm text-slate-700 dark:text-emerald-100">
            {feedback.improvement_areas.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
      )}
      {feedback.learning_path?.length > 0 && (
        <div>
          <p className="mb-2 text-sm font-semibold text-slate-900 dark:text-emerald-50">Suggested Learning Path</p>
          <ul className="list-disc space-y-1 pl-5 text-sm text-slate-700 dark:text-emerald-100">
            {feedback.learning_path.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
      )}
      {feedback.top_priorities?.length > 0 && (
        <div>
          <p className="mb-2 text-sm font-semibold text-slate-900 dark:text-emerald-50">Top 3 Priorities</p>
          <ul className="list-decimal space-y-1 pl-5 text-sm text-slate-700 dark:text-emerald-100">
            {feedback.top_priorities.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
      )}
      <button
        type="button"
        onClick={() => void downloadReport()}
        className="h-11 rounded-2xl border border-sage-deep px-5 text-sm font-semibold text-sage-deep hover:bg-sage/10 dark:border-emerald-400 dark:text-emerald-300 dark:hover:bg-emerald-900/30"
      >
        Download Report (PDF)
      </button>
      <button
        type="button"
        onClick={onRetry}
        className="h-11 rounded-2xl bg-sage-deep px-5 text-sm font-semibold text-white hover:bg-sage-deep/90 dark:bg-emerald-600 dark:hover:bg-emerald-500"
      >
        Retry Interview
      </button>
    </div>
  )
}
