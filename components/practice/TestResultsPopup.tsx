"use client"

import React, { useEffect, useState } from 'react'
import { X, CheckCircle, XCircle, Clock, Zap, TestTube } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface TestResult {
  test_case_id: number
  input: string
  expected_output: string
  actual_output: string
  passed: boolean
  points: number
  is_hidden: boolean
}

interface TestResultsPopupProps {
  isVisible: boolean
  onClose: () => void
  results: TestResult[]
  isRunning: boolean
  autoHideDelay?: number // in milliseconds
}

export function TestResultsPopup({ 
  isVisible, 
  onClose, 
  results, 
  isRunning,
  autoHideDelay = 5000 
}: TestResultsPopupProps) {
  const [timeLeft, setTimeLeft] = useState(autoHideDelay / 1000)

  // Auto-hide functionality
  useEffect(() => {
  if (!isVisible || isRunning) {
  setTimeLeft(autoHideDelay / 1000)
  return
  }

  const timer = setInterval(() => {
  setTimeLeft(prev => {
  if (prev <= 1) {
  onClose()
  return 0
  }
  return prev - 1
  })
  }, 1000)

  return () => clearInterval(timer)
  }, [isVisible, isRunning, autoHideDelay, onClose])

  // Reset timer when results change
  useEffect(() => {
  if (isVisible && results.length > 0) {
  setTimeLeft(autoHideDelay / 1000)
  }
  }, [results, isVisible, autoHideDelay])

  if (!isVisible) return null

  const passedTests = results.filter(r => r.passed).length
  const totalTests = results.length
  const totalPoints = results.reduce((sum, r) => sum + (r.passed ? r.points : 0), 0)
  const maxPoints = results.reduce((sum, r) => sum + r.points, 0)

  return (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
  <div className="max-h-[90vh] w-full max-w-4xl overflow-hidden rounded-lg border border-slate-200/90 bg-white shadow-2xl animate-in slide-in-from-bottom-4 duration-300 dark:border-emerald-800/70 dark:bg-emerald-950/50">
  {/* Header */}
  <div className="flex items-center justify-between border-b border-slate-200/90 bg-gradient-to-r from-sage/15 to-emerald-50/80 p-4 dark:border-emerald-800/60 dark:from-emerald-950 dark:to-slate-900">
  <div className="flex items-center gap-3">
  <div className="rounded-lg bg-sage/25 p-2 dark:bg-emerald-900/40">
  <TestTube className="h-5 w-5 text-sage-deep dark:text-emerald-400" />
  </div>
  <div>
  <h2 className="text-lg font-semibold text-slate-900 dark:text-emerald-50">
  Test Case Results
  </h2>
  <p className="text-sm text-slate-600 dark:text-emerald-200/85">
  {isRunning ? 'Running tests...' : `${passedTests}/${totalTests} test cases passed`}
  </p>
  </div>
  </div>
  
  <div className="flex items-center gap-3">
  {/* Auto-hide timer */}
  {!isRunning && timeLeft > 0 && (
  <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-emerald-300/75">
  <Clock className="h-4 w-4 shrink-0 text-sage-deep dark:text-emerald-400" />
  <span>Auto-hide in {Math.ceil(timeLeft)}s</span>
  </div>
  )}
  
  <Button
  variant="ghost"
  size="sm"
  onClick={onClose}
  className="text-slate-500 hover:text-slate-700 dark:text-emerald-300/80 dark:hover:text-emerald-100"
  >
  <X className="w-5 h-5" />
  </Button>
  </div>
  </div>

  {/* Content */}
  <div className="p-4 overflow-y-auto max-h-[calc(90vh-120px)]">
  {isRunning ? (
  <div className="flex items-center justify-center py-12">
  <div className="text-center">
  <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-2 border-sage-deep border-t-transparent dark:border-emerald-400"></div>
  <p className="text-slate-600 dark:text-emerald-200/85">Running test cases...</p>
  </div>
  </div>
  ) : results.length === 0 ? (
  <div className="text-center py-12">
  <TestTube className="mx-auto mb-4 h-12 w-12 text-slate-400 dark:text-emerald-500/50" />
  <p className="text-slate-600 dark:text-emerald-200/85">No test results available</p>
  </div>
  ) : (
  <div className="space-y-4">
  {/* Summary */}
  <div className="rounded-lg border border-slate-200/90 bg-sage/10 p-4 dark:border-emerald-800/60 dark:bg-emerald-950/40">
  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
  <div className="text-center">
  <div className="text-2xl font-bold text-slate-900 dark:text-emerald-50">
  {passedTests}
  </div>
  <div className="text-sm text-slate-600 dark:text-emerald-200/80">
  Passed
  </div>
  </div>
  <div className="text-center">
  <div className="text-2xl font-bold text-slate-900 dark:text-emerald-50">
  {totalTests - passedTests}
  </div>
  <div className="text-sm text-slate-600 dark:text-emerald-200/80">
  Failed
  </div>
  </div>
  <div className="text-center">
  <div className="text-2xl font-bold text-slate-900 dark:text-emerald-50">
  {totalPoints}/{maxPoints}
  </div>
  <div className="text-sm text-slate-600 dark:text-emerald-200/80">
  Points
  </div>
  </div>
  <div className="text-center">
  <div className="text-2xl font-bold text-slate-900 dark:text-emerald-50">
  {Math.round((passedTests / totalTests) * 100)}%
  </div>
  <div className="text-sm text-slate-600 dark:text-emerald-200/80">
  Success Rate
  </div>
  </div>
  </div>
  </div>

  {/* Individual Test Results */}
  <div className="space-y-3">
  {results.map((result, index) => (
  <div
  key={result.test_case_id || index}
  className={`rounded-lg border p-4 ${
  result.passed
  ? 'border-emerald-200/90 bg-emerald-50/90 dark:border-emerald-700/60 dark:bg-emerald-900/25'
  : 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-700'
  }`}
  >
  <div className="flex items-center justify-between mb-3">
  <div className="flex items-center gap-2">
  <span className="font-medium text-slate-900 dark:text-emerald-50">
  Test Case {index + 1}
  </span>
  {result.is_hidden && (
  <span className="rounded-md border border-amber-200/80 bg-amber-50 px-2 py-1 text-xs text-amber-900 dark:border-amber-800/50 dark:bg-amber-900/30 dark:text-amber-300">
  Hidden
  </span>
  )}
  <span className="rounded-md border border-sage/40 bg-sage/20 px-2 py-1 text-xs text-sage-deep dark:border-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-200">
  {result.points} point{result.points !== 1 ? 's' : ''}
  </span>
  </div>
  
  <div className="flex items-center gap-2">
  {result.passed ? (
  <CheckCircle className="h-5 w-5 text-sage-deep dark:text-emerald-400" />
  ) : (
  <XCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
  )}
  <span className={`text-sm font-medium ${
  result.passed 
  ? 'text-sage-deep dark:text-emerald-400' 
  : 'text-red-600 dark:text-red-400'
  }`}>
  {result.passed ? 'PASSED' : 'FAILED'}
  </span>
  </div>
  </div>

  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
  {/* Input */}
  <div>
  <div className="mb-2 text-sm font-medium text-slate-700 dark:text-emerald-200/85">
  Input:
  </div>
  <div className="rounded-md bg-slate-100 p-3 font-mono text-sm dark:bg-emerald-950/60">
  <pre className="whitespace-pre-wrap text-slate-900 dark:text-emerald-50">
  {result.input || '(no input)'}
  </pre>
  </div>
  </div>

  {/* Expected Output */}
  <div>
  <div className="mb-2 text-sm font-medium text-slate-700 dark:text-emerald-200/85">
  Expected Output:
  </div>
  <div className="rounded-md bg-slate-100 p-3 font-mono text-sm dark:bg-emerald-950/60">
  <pre className="whitespace-pre-wrap text-slate-900 dark:text-emerald-50">
  {result.expected_output || '(no output)'}
  </pre>
  </div>
  </div>
  </div>

  {/* Actual Output */}
  <div className="mt-4">
  <div className="mb-2 text-sm font-medium text-slate-700 dark:text-emerald-200/85">
  Your Output:
  </div>
  <div className={`rounded-md p-3 font-mono text-sm ${
  result.passed 
  ? 'border border-emerald-200/90 bg-emerald-100/90 dark:border-emerald-700/60 dark:bg-emerald-900/35' 
  : 'border border-red-200 bg-red-100 dark:border-red-800/60 dark:bg-red-900/35'
  }`}>
  <pre className={`whitespace-pre-wrap ${
  result.passed 
  ? 'text-emerald-950 dark:text-emerald-100' 
  : 'text-red-900 dark:text-red-100'
  }`}>
  {result.actual_output || '(no output)'}
  </pre>
  </div>
  </div>
  </div>
  ))}
  </div>
  </div>
  )}
  </div>

  {/* Footer */}
  {!isRunning && results.length > 0 && (
  <div className="flex items-center justify-between border-t border-slate-200/90 bg-sage/10 p-4 dark:border-emerald-800/60 dark:bg-emerald-950/40">
  <div className="text-sm text-slate-600 dark:text-emerald-200/80">
  {passedTests === totalTests ? (
  <span className="font-medium text-sage-deep dark:text-emerald-400">
  All test cases passed! Great job!
  </span>
  ) : (
  <span className="text-red-600 dark:text-red-400 font-medium">
  {totalTests - passedTests} test case{totalTests - passedTests !== 1 ? 's' : ''} failed. Keep trying!
  </span>
  )}
  </div>
  
  <Button
  onClick={onClose}
  className="bg-gradient-to-r from-sage-deep to-emerald-600 text-white hover:from-sage-deep/95 hover:to-emerald-600/95 dark:from-emerald-700 dark:to-emerald-500 dark:hover:from-emerald-600 dark:hover:to-emerald-400"
  >
  Close
  </Button>
  </div>
  )}
  </div>
  </div>
  )
}
