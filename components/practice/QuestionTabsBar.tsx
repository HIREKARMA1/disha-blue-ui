"use client"

import { Question } from '@/types/practice'
import { CheckCircle, Circle, Flag } from 'lucide-react'

interface QuestionTabsBarProps {
  questions: Question[]
  currentIndex: number
  answers: Record<string, string[]>
  flaggedQuestions: Set<string>
  onQuestionSelect: (index: number) => void
}

export function QuestionTabsBar({
  questions,
  currentIndex,
  answers,
  flaggedQuestions,
  onQuestionSelect
}: QuestionTabsBarProps) {
  const getQuestionStatus = (questionId: string, index: number) => {
  if (index === currentIndex) return 'current'
  if (flaggedQuestions.has(questionId)) return 'flagged'
  if (answers[questionId] && answers[questionId].length > 0) return 'answered'
  return 'unanswered'
  }

  const getStatusColor = (status: string) => {
  switch (status) {
  case 'current':
  return 'border-sage-deep bg-sage-deep text-white dark:border-emerald-500 dark:bg-emerald-600'
  case 'answered':
  return 'border-emerald-300 bg-emerald-100 text-emerald-900 dark:border-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300'
  case 'flagged':
  return 'border-amber-300 bg-amber-100 text-amber-900 dark:border-amber-700 dark:bg-amber-900/30 dark:text-amber-300'
  default:
  return 'border-slate-300 bg-slate-100 text-slate-600 dark:border-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-200/80'
  }
  }

  const getStatusIcon = (status: string) => {
  switch (status) {
  case 'answered':
  return <CheckCircle className="w-3 h-3" />
  case 'flagged':
  return <Flag className="w-3 h-3" />
  default:
  return <Circle className="w-3 h-3" />
  }
  }

  return (
  <div className="rounded-xl border border-slate-200/90 bg-white p-4 shadow-sm dark:border-emerald-800/70 dark:bg-emerald-950/40 dark:shadow-emerald-950/40">
  <div className="mb-3 flex items-center justify-between">
  <h3 className="text-sm font-medium text-slate-900 dark:text-emerald-50">
  Questions
  </h3>
  <div className="flex items-center gap-4 text-xs text-slate-600 dark:text-emerald-200/80">
  <div className="flex items-center gap-1">
  <div className="h-3 w-3 rounded-full bg-sage-deep dark:bg-emerald-500"></div>
  <span>Current</span>
  </div>
  <div className="flex items-center gap-1">
  <div className="h-3 w-3 rounded-full border border-emerald-300 bg-emerald-100 dark:border-emerald-700 dark:bg-emerald-900/40"></div>
  <span>Answered</span>
  </div>
  <div className="flex items-center gap-1">
  <div className="h-3 w-3 rounded-full border border-amber-300 bg-amber-100 dark:border-amber-700 dark:bg-amber-900/40"></div>
  <span>Flagged</span>
  </div>
  </div>
  </div>
  
  <div className="flex flex-wrap gap-2">
  {questions.map((question, index) => {
  const status = getQuestionStatus(question.id, index)
  const isCurrent = index === currentIndex
  
  return (
  <button
  key={question.id}
  onClick={() => onQuestionSelect(index)}
  className={`
  flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-medium border transition-all duration-200
  ${getStatusColor(status)}
  ${isCurrent ? 'ring-2 ring-sage/50 dark:ring-emerald-500/50' : ''}
  hover:scale-105 active:scale-95
  `}
  >
  {getStatusIcon(status)}
  <span>{index + 1}</span>
  </button>
  )
  })}
  </div>
  </div>
  )
}
