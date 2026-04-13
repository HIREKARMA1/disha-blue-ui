"use client"

import { useState, useCallback, useEffect } from 'react'
import { Question } from '@/types/practice'
import { Flag, CheckSquare, Square } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { CodingIDE } from './CodingIDE'

interface TestResult {
  passed: boolean
  actualOutput?: string
  error?: string
}

interface OptionsPanelProps {
  question: Question
  answer: string[]
  isFlagged: boolean
  onAnswerChange: (answer: string[]) => void
  onFlagToggle: () => void
  testResults?: TestResult[]
  isTestRunning?: boolean
  isSubmitted?: boolean
  questionResult?: {
  correct: boolean
  score: number
  maxScore: number
  feedback?: string
  }
}

export function OptionsPanel({
  question,
  answer,
  isFlagged,
  onAnswerChange,
  onFlagToggle,
  testResults = [],
  isTestRunning = false,
  isSubmitted = false,
  questionResult
}: OptionsPanelProps) {
  const [localAnswer, setLocalAnswer] = useState<string[]>(answer)
  const [localTestResults, setLocalTestResults] = useState<TestResult[]>(testResults)
  const [localIsTestRunning, setLocalIsTestRunning] = useState<boolean>(isTestRunning)

  const handleOptionSelect = (optionId: string) => {
  let newAnswer: string[]

  if (question.type === 'mcq_single') {
  // Single choice - replace current selection
  newAnswer = [optionId]
  } else if (question.type === 'mcq_multi') {
  // Multiple choice - toggle selection
  if (localAnswer.includes(optionId)) {
  newAnswer = localAnswer.filter(id => id !== optionId)
  } else {
  newAnswer = [...localAnswer, optionId]
  }
  } else {
  // For descriptive and coding questions, this shouldn't be called
  return
  }

  setLocalAnswer(newAnswer)
  onAnswerChange(newAnswer)
  }

  // Keep local state in sync with upstream answer (e.g., when clearing response)
  useEffect(() => {
  setLocalAnswer(answer)
  }, [answer])

  const handleTextChange = useCallback((text: string) => {
  const newAnswer = text ? [text] : []
  setLocalAnswer(newAnswer)
  onAnswerChange(newAnswer)
  }, [onAnswerChange])

  const handleCodeSubmit = useCallback((code: string, language: string) => {
  // Store both code and language
  const submissionData = JSON.stringify({ code, language })
  handleTextChange(submissionData)
  }, [handleTextChange])

  const handleTestResults = useCallback((results: TestResult[], isRunning: boolean) => {
  setLocalTestResults(results)
  setLocalIsTestRunning(isRunning)
  }, [])

  const isOptionSelected = (optionId: string) => {
  return localAnswer.includes(optionId)
  }

  return (
  <div className="space-y-4">

  {/* Answer Options */}
  <div className="rounded-xl border border-slate-200/90 bg-white p-4 shadow-sm dark:border-emerald-800/70 dark:bg-emerald-950/40 dark:shadow-emerald-950/30">
  <h3 className="mb-4 text-sm font-medium text-slate-900 dark:text-emerald-50">
  Your Answer
  </h3>

  {question.type === 'mcq_single' && question.options && (
  <div className="space-y-3">
  {question.options.map((option) => (
  <label
  key={option.id}
  className="flex cursor-pointer items-start gap-3 rounded-lg border border-slate-200/90 p-3 transition-colors hover:bg-sage/10 dark:border-emerald-800/60 dark:hover:bg-emerald-900/35"
  >
  <input
  type="radio"
  name={`question-${question.id}`}
  value={option.id}
  checked={isOptionSelected(option.id)}
  onChange={() => handleOptionSelect(option.id)}
  className="mt-1 h-4 w-4 border-slate-300 text-sage-deep focus:ring-sage-deep dark:border-emerald-700 dark:text-emerald-500 dark:focus:ring-emerald-500"
  />
  <span className="text-sm text-slate-900 dark:text-emerald-50">
  {option.text}
  </span>
  </label>
  ))}
  </div>
  )}

  {question.type === 'mcq_multi' && question.options && (
  <div className="space-y-3">
  {question.options.map((option) => (
  <label
  key={option.id}
  className="flex cursor-pointer items-start gap-3 rounded-lg border border-slate-200/90 p-3 transition-colors hover:bg-sage/10 dark:border-emerald-800/60 dark:hover:bg-emerald-900/35"
  onClick={() => handleOptionSelect(option.id)}
  >
  <input
  type="checkbox"
  checked={isOptionSelected(option.id)}
  onChange={() => handleOptionSelect(option.id)}
  className="mt-1 h-4 w-4 border-slate-300 text-sage-deep focus:ring-sage-deep dark:border-emerald-700 dark:text-emerald-500 dark:focus:ring-emerald-500"
  />
  <span className="text-sm text-slate-900 dark:text-emerald-50">
  {option.text}
  </span>
  </label>
  ))}
  </div>
  )}

  {question.type === 'descriptive' && (
  <div>
  <textarea
  value={localAnswer[0] || ''}
  onChange={(e) => handleTextChange(e.target.value)}
  placeholder="Write your answer here..."
  className="h-32 w-full resize-none rounded-lg border border-slate-300 bg-white p-3 text-slate-900 placeholder:text-slate-500 focus:border-transparent focus:ring-2 focus:ring-sage-deep dark:border-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-50 dark:placeholder:text-emerald-400/60 dark:focus:ring-emerald-500"
  />
  </div>
  )}

  {question.type === 'coding' && (
  <div className="mt-4">
  <CodingIDE
  questionId={question.id}
  question={question}
  initialCode={localAnswer[0] || ''}
  initialLanguage="python"
  onSubmit={handleCodeSubmit}
  onTestResults={handleTestResults}
  className="w-full"
  />
  </div>
  )}
  </div>

  {/* Answer Status */}
  <div className="rounded-lg border border-slate-200/80 bg-sage/10 p-3 dark:border-emerald-800/50 dark:bg-emerald-950/40">
  <div className="space-y-3">
  {/* Basic Status */}
  <div className="flex items-center justify-between text-sm">
  <span className="text-slate-600 dark:text-emerald-200/80">
  Status:
  </span>
  <span className={`font-medium ${localAnswer.length > 0
  ? 'text-sage-deep dark:text-emerald-400'
  : 'text-slate-500 dark:text-emerald-300/70'
  }`}>
  {localAnswer.length > 0 ? 'Answered' : 'Not Answered'}
  </span>
  </div>

  {/* Test Case Results for Coding Questions */}
  {question.type === 'coding' && question.test_cases && question.test_cases.length > 0 && (
  <div className="border-t border-slate-200 dark:border-emerald-800/50 pt-3">
  <div className="mb-2 flex items-center justify-between text-sm">
  <span className="text-slate-600 dark:text-emerald-200/80">
  Test Cases:
  </span>
  {localIsTestRunning ? (
  <span className="font-medium text-sage-deep dark:text-emerald-400">
  Testing...
  </span>
  ) : localTestResults.length > 0 ? (
  <span className="font-medium">
  {localTestResults.filter(r => r.passed).length}/{localTestResults.length} Passed
  </span>
  ) : (
  <span className="text-slate-500 dark:text-emerald-300/70">
  Not Tested
  </span>
  )}
  </div>
  
  {/* Test Case Results */}
  {localTestResults.length > 0 && (
  <div className="space-y-1">
  {localTestResults.map((result, index) => (
  <div key={index} className="flex items-center justify-between text-xs">
  <span className="text-slate-600 dark:text-emerald-200/75">
  Test Case {index + 1}:
  </span>
  <span className={`font-medium ${
  result.passed 
  ? 'text-sage-deep dark:text-emerald-400' 
  : 'text-red-600 dark:text-red-400'
  }`}>
  {result.passed ? ' Passed' : ' Failed'}
  </span>
  </div>
  ))}
  </div>
  )}
  </div>
  )}

  {/* Marks Evaluation for Submitted Answers */}
  {isSubmitted && questionResult && (
  <div className="border-t border-slate-200 dark:border-emerald-800/50 pt-3">
  <div className="mb-2 flex items-center justify-between text-sm">
  <span className="text-slate-600 dark:text-emerald-200/80">
  Marks:
  </span>
  <span className={`font-medium ${
  questionResult.correct 
  ? 'text-sage-deep dark:text-emerald-400' 
  : 'text-red-600 dark:text-red-400'
  }`}>
  {questionResult.score}/{questionResult.maxScore}
  </span>
  </div>
  
  <div className="flex items-center justify-between text-xs">
  <span className="text-slate-600 dark:text-emerald-200/80">
  Result:
  </span>
  <span className={`font-medium ${
  questionResult.correct 
  ? 'text-sage-deep dark:text-emerald-400' 
  : 'text-red-600 dark:text-red-400'
  }`}>
  {questionResult.correct ? ' Correct' : ' Incorrect'}
  </span>
  </div>

  {questionResult.feedback && (
  <div className="mt-2 rounded border border-slate-200/80 bg-white/80 p-2 text-xs text-slate-700 dark:border-emerald-800/50 dark:bg-emerald-900/30 dark:text-emerald-100">
  {questionResult.feedback}
  </div>
  )}
  </div>
  )}
  </div>
  </div>
  </div>
  )
}
