"use client"

import { useState } from 'react'
import { TestCase } from '@/types/practice'
import { ChevronDown, ChevronRight, Eye, EyeOff, ArrowRight, ArrowLeft, CheckCircle, XCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface TestCasesDisplayProps {
  testCases: TestCase[]
  showResults?: boolean
  results?: Array<{
  test_case_id: number
  input: string
  expected_output: string
  actual_output: string
  passed: boolean
  points: number
  is_hidden: boolean
  }>
}

export function TestCasesDisplay({ testCases, showResults = false, results = [] }: TestCasesDisplayProps) {
  const [isExpanded, setIsExpanded] = useState(true)
  const [showHidden, setShowHidden] = useState(false)

  if (!testCases || testCases.length === 0) {
  return (
  <div className="rounded-lg border border-amber-200/90 bg-amber-50/90 p-4 dark:border-amber-800/50 dark:bg-amber-900/25">
  <div className="flex items-center gap-2 text-amber-900 dark:text-amber-300">
  <Eye className="w-4 h-4" />
  <span className="text-sm font-medium">No test cases available</span>
  </div>
  </div>
  )
  }

  // Filter test cases based on hidden visibility
  const visibleTestCases = testCases.filter(tc => !tc.is_hidden || showHidden)
  const hiddenCount = testCases.length - visibleTestCases.length

  return (
  <div className="rounded-lg border border-slate-200/90 bg-slate-50/80 dark:border-emerald-800/60 dark:bg-emerald-950/35">
  {/* Header */}
  <div className="flex items-center justify-between border-b border-slate-200/90 p-4 dark:border-emerald-800/50">
  <div className="flex items-center gap-2">
  <Button
  variant="ghost"
  size="sm"
  onClick={() => setIsExpanded(!isExpanded)}
  className="p-0 h-auto hover:bg-transparent"
  >
  {isExpanded ? (
  <ChevronDown className="h-4 w-4 text-slate-600 dark:text-emerald-300/80" />
  ) : (
  <ChevronRight className="h-4 w-4 text-slate-600 dark:text-emerald-300/80" />
  )}
  </Button>
  <h3 className="text-sm font-semibold text-slate-900 dark:text-emerald-50">
  Test Cases ({testCases.length})
  </h3>
  {hiddenCount > 0 && (
  <span className="text-xs text-slate-500 dark:text-emerald-200/65">
  ({hiddenCount} hidden)
  </span>
  )}
  </div>
  
  {hiddenCount > 0 && (
  <Button
  variant="ghost"
  size="sm"
  onClick={() => setShowHidden(!showHidden)}
  className="text-xs text-slate-600 hover:text-slate-900 dark:text-emerald-200/75 dark:hover:text-emerald-50"
  >
  {showHidden ? (
  <>
  <EyeOff className="w-3 h-3 mr-1" />
  Hide Hidden
  </>
  ) : (
  <>
  <Eye className="w-3 h-3 mr-1" />
  Show Hidden
  </>
  )}
  </Button>
  )}
  </div>

  {/* Test Cases List */}
  {isExpanded && (
  <div className="p-4 space-y-3">
  {visibleTestCases.map((testCase, index) => {
  const result = results.find(r => r.test_case_id === index + 1)
  const isPassed = result?.passed
  const hasResult = result !== undefined

  return (
  <div
  key={testCase.id || index}
  className="rounded-lg border border-slate-200/90 bg-white p-4 dark:border-emerald-800/60 dark:bg-emerald-950/40"
  >
  {/* Test Case Header */}
  <div className="flex items-center justify-between mb-3">
  <div className="flex items-center gap-2">
  <span className="text-sm font-medium text-slate-900 dark:text-emerald-50">
  Test Case {index + 1}
  </span>
  {testCase.is_hidden && (
  <span className="rounded-md border border-amber-200/80 bg-amber-50 px-2 py-1 text-xs text-amber-900 dark:border-amber-800/50 dark:bg-amber-900/30 dark:text-amber-300">
  Hidden
  </span>
  )}
  <span className="rounded-md border border-sage/40 bg-sage/20 px-2 py-1 text-xs text-sage-deep dark:border-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-200">
  {testCase.points} point{testCase.points !== 1 ? 's' : ''}
  </span>
  </div>
  
  {hasResult && (
  <div className="flex items-center gap-1">
  {isPassed ? (
  <CheckCircle className="h-4 w-4 text-sage-deep dark:text-emerald-400" />
  ) : (
  <XCircle className="w-4 h-4 text-red-600 dark:text-red-400" />
  )}
  <span className={`text-xs font-medium ${
  isPassed 
  ? 'text-sage-deep dark:text-emerald-400' 
  : 'text-red-600 dark:text-red-400'
  }`}>
  {isPassed ? 'Passed' : 'Failed'}
  </span>
  </div>
  )}
  </div>

  {/* Input */}
  <div className="mb-3">
  <div className="flex items-center gap-2 mb-2">
  <ArrowRight className="h-4 w-4 text-slate-500 dark:text-emerald-300/70" />
  <span className="text-sm font-medium text-slate-700 dark:text-emerald-200/85">Input:</span>
  </div>
  <div className="rounded-md bg-slate-100 p-3 font-mono text-sm dark:bg-emerald-950/60">
  <pre className="whitespace-pre-wrap text-slate-900 dark:text-emerald-50">
  {hasResult ? result.input : (testCase.input_data || '(no input)')}
  </pre>
  </div>
  </div>

  {/* Expected Output */}
  <div className="mb-3">
  <div className="flex items-center gap-2 mb-2">
  <ArrowLeft className="h-4 w-4 text-slate-500 dark:text-emerald-300/70" />
  <span className="text-sm font-medium text-slate-700 dark:text-emerald-200/85">Expected Output:</span>
  </div>
  <div className="rounded-md bg-slate-100 p-3 font-mono text-sm dark:bg-emerald-950/60">
  <pre className="whitespace-pre-wrap text-slate-900 dark:text-emerald-50">
  {hasResult ? result.expected_output : (testCase.expected_output || '(no output)')}
  </pre>
  </div>
  </div>

  {/* Actual Output (if available) */}
  {hasResult && result?.actual_output !== undefined && (
  <div className="mb-3">
  <div className="flex items-center gap-2 mb-2">
  <ArrowLeft className="h-4 w-4 text-slate-500 dark:text-emerald-300/70" />
  <span className="text-sm font-medium text-slate-700 dark:text-emerald-200/85">Actual Output:</span>
  </div>
  <div className={`rounded-md border p-3 font-mono text-sm ${
  isPassed 
  ? 'border-emerald-200/90 bg-emerald-50/90 dark:border-emerald-700/60 dark:bg-emerald-900/25' 
  : 'border-red-200 dark:border-red-800/60 bg-red-50 dark:bg-red-900/25'
  }`}>
  <pre className={`whitespace-pre-wrap ${
  isPassed 
  ? 'text-emerald-950 dark:text-emerald-100' 
  : 'text-red-900 dark:text-red-100'
  }`}>
  {result.actual_output}
  </pre>
  </div>
  </div>
  )}

  {/* Error (if available) */}
  {hasResult && result?.actual_output && result.actual_output.startsWith('Error:') && (
  <div className="mb-3">
  <div className="flex items-center gap-2 mb-2">
  <XCircle className="w-4 h-4 text-red-600 dark:text-red-400" />
  <span className="text-sm font-medium text-red-700 dark:text-red-300">Error:</span>
  </div>
  <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-md p-3">
  <pre className="text-sm text-red-900 dark:text-red-100 whitespace-pre-wrap">
  {result.actual_output}
  </pre>
  </div>
  </div>
  )}
  </div>
  )
  })}
  </div>
  )}
  </div>
  )
}
