"use client"

import { useState, useEffect } from 'react'
import { Question } from '@/types/practice'
import { Clock, Code, Image as ImageIcon } from 'lucide-react'
import { TestCasesDisplay } from './TestCasesDisplay'

interface QuestionPanelProps {
  question: Question
  questionNumber: number
  onTimeSpent: (timeSpent: number) => void
}

export function QuestionPanel({ question, questionNumber, onTimeSpent }: QuestionPanelProps) {
  const [timeSpent, setTimeSpent] = useState(0)

  // Track time spent on this question
  useEffect(() => {
  const startTime = Date.now()
  const interval = setInterval(() => {
  const elapsed = Math.floor((Date.now() - startTime) / 1000)
  setTimeSpent(elapsed)
  // Only call onTimeSpent every 5 seconds to avoid excessive updates
  if (elapsed % 5 === 0) {
  onTimeSpent(elapsed)
  }
  }, 1000)

  return () => {
  clearInterval(interval)
  const finalTime = Math.floor((Date.now() - startTime) / 1000)
  onTimeSpent(finalTime)
  }
  }, [question.id]) // Remove onTimeSpent from dependency array to prevent infinite loops

  const formatTime = (seconds: number) => {
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const getDifficultyColor = (difficulty: string) => {
  switch (difficulty) {
  case 'easy':
  return 'bg-sage/20 text-sage-deep dark:bg-emerald-900/45 dark:text-emerald-300'
  case 'medium':
  return 'bg-amber-100 text-amber-900 dark:bg-amber-900/35 dark:text-amber-300'
  case 'hard':
  return 'bg-red-100 text-red-800 dark:bg-red-900/35 dark:text-red-300'
  default:
  return 'bg-slate-100 text-slate-700 dark:bg-emerald-950/50 dark:text-emerald-300'
  }
  }

  return (
  <div className="rounded-xl border border-slate-200/90 bg-white p-6 shadow-sm dark:border-emerald-800/70 dark:bg-emerald-950/40 dark:shadow-emerald-950/30">
  {/* Question Header */}
  <div className="flex items-center justify-between mb-6">
  <div className="flex items-center gap-3">
  <div className="flex items-center gap-2">
  <span className="text-sm font-medium text-slate-600 dark:text-emerald-200/80">
  Question {questionNumber}
  </span>
  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(question.difficulty)}`}>
  {question.difficulty}
  </span>
  </div>
  </div>
  <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-emerald-200/80">
  <Clock className="h-4 w-4 shrink-0 text-sage-deep dark:text-emerald-400" />
  <span>Time: {formatTime(timeSpent)}</span>
  </div>
  </div>

  {/* Question Statement */}
  <div className="mb-6">
  <div 
  className="prose prose-gray dark:prose-invert max-w-none"
  dangerouslySetInnerHTML={{ __html: question.statement }}
  />
  </div>

  {/* Test Cases for Coding Questions */}
  {question.type === 'coding' && question.test_cases && (
  <div className="mb-6">
  <TestCasesDisplay testCases={question.test_cases} />
  </div>
  )}

  {/* Question Type Indicator */}
  <div className="flex items-center gap-2 mb-4">
  {question.type === 'coding' && (
  <div className="flex items-center gap-1 rounded-md border border-sage/40 bg-sage/20 px-2 py-1 text-xs font-medium text-sage-deep dark:border-emerald-700 dark:bg-emerald-900/35 dark:text-emerald-200">
  <Code className="w-3 h-3" />
  Coding Question
  </div>
  )}
  {question.type === 'descriptive' && (
  <div className="flex items-center gap-1 rounded-md border border-emerald-200/80 bg-emerald-50 px-2 py-1 text-xs font-medium text-emerald-900 dark:border-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-200">
  <ImageIcon className="w-3 h-3" />
  Descriptive Answer
  </div>
  )}
  {question.type === 'mcq_single' && (
  <div className="flex items-center gap-1 rounded-md border border-emerald-200/80 bg-emerald-50 px-2 py-1 text-xs font-medium text-emerald-900 dark:border-emerald-700 dark:bg-emerald-900/35 dark:text-emerald-200">
  Single Choice
  </div>
  )}
  {question.type === 'mcq_multi' && (
  <div className="flex items-center gap-1 rounded-md border border-sage/40 bg-sage/20 px-2 py-1 text-xs font-medium text-sage-deep dark:border-emerald-700 dark:bg-emerald-900/35 dark:text-emerald-200">
  Multiple Choice
  </div>
  )}
  </div>

  {/* Tags */}
  {question.tags && question.tags.length > 0 && (
  <div className="flex flex-wrap gap-2">
  {question.tags.map((tag, index) => (
  <span
  key={index}
  className="rounded-md border border-slate-200/80 bg-sage/15 px-2 py-1 text-xs text-slate-600 dark:border-emerald-800/50 dark:bg-emerald-900/30 dark:text-emerald-200/80"
  >
  {tag}
  </span>
  ))}
  </div>
  )}
  </div>
  )
}
