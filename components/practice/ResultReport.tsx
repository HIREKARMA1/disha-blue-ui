"use client"

import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  ArrowLeft,
  Download,
  Trophy,
  Clock,
  Target,
  TrendingUp,
  CheckCircle,
  XCircle,
  Eye,
  EyeOff
} from 'lucide-react'
import { PracticeModule, SubmitAttemptResponse } from '@/types/practice'
import { Button } from '@/components/ui/button'
import { PDFExport } from './PDFExport'
import { toast } from 'react-hot-toast'

interface ResultReportProps {
  result: SubmitAttemptResponse
  module?: PracticeModule | null
  onBackToDashboard: () => void
  onBackToExam: () => void
}

export function ResultReport({
  result,
  module,
  onBackToDashboard,
  onBackToExam
}: ResultReportProps) {
  const [showReviewMode, setShowReviewMode] = useState(false)
  const [isExporting, setIsExporting] = useState(false)

  const formatTime = (seconds: number) => {
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const secs = seconds % 60

  if (hours > 0) {
  return `${hours}h ${minutes}m ${secs}s`
  }
  return `${minutes}m ${secs}s`
  }

  const getScoreColor = (score: number) => {
  if (score >= 80) return 'text-sage-deep dark:text-emerald-300'
  if (score >= 60) return 'text-amber-700 dark:text-amber-400/90'
  return 'text-red-600 dark:text-red-400'
  }

  const handleEnterFullscreen = async () => {
  try {
  const elem: any = document.documentElement
  if (elem.requestFullscreen) {
  // navigationUI: 'hide' is supported by some browsers (e.g., Firefox)
  await elem.requestFullscreen({ navigationUI: 'hide' } as any)
  } else if (elem.mozRequestFullScreen) {
  await elem.mozRequestFullScreen()
  } else if (elem.webkitRequestFullscreen) {
  await elem.webkitRequestFullscreen()
  } else if (elem.msRequestFullscreen) {
  await elem.msRequestFullscreen()
  }

  // Verify that fullscreen actually engaged
  const becameFullscreen = !!(document.fullscreenElement || (document as any).webkitFullscreenElement || (document as any).msFullscreenElement)
  if (!becameFullscreen) {
  toast.error('Fullscreen was blocked. Allow fullscreen for this site and try again.')
  }
  } catch (error) {
  console.error('Failed to enter fullscreen:', error)
  toast.error('Unable to enter fullscreen. Please click again or check browser settings.')
  }
  }

  const getScoreBgColor = (score: number) => {
  if (score >= 80) return 'bg-emerald-100/90 dark:bg-emerald-900/35'
  if (score >= 60) return 'bg-amber-100/90 dark:bg-amber-900/30'
  return 'bg-red-100 dark:bg-red-900/20'
  }

  const handleExportPDF = async () => {
  if (!module) {
  toast.error('Module data not available for export')
  return
  }

  setIsExporting(true)
  try {
  await PDFExport.exportReport(result, module)
  toast.success('Report downloaded successfully!')
  } catch (error) {
  console.error('Failed to export PDF:', error)
  toast.error('Failed to download report')
  } finally {
  setIsExporting(false)
  }
  }

  return (
  <div className="space-y-6">
  {/* Header */}
  <div className="flex items-center justify-between">
  <div className="flex items-center gap-4">
  <Button
  onClick={onBackToDashboard}
  variant="outline"
  size="sm"
  >
  <ArrowLeft className="w-4 h-4 mr-2" />
  Back to Practice
  </Button>
  <div>
  <h1 className="text-2xl font-bold text-slate-900 dark:text-emerald-50">
  Exam Results
  </h1>
  <p className="text-slate-600 dark:text-emerald-200/85">
  {module?.title || 'Practice Module'}
  </p>
  </div>
  </div>
  {/* <div className="flex items-center gap-2">
  <Button
  onClick={() => setShowReviewMode(!showReviewMode)}
  variant="outline"
  size="sm"
  >
  {showReviewMode ? (
  <>
  <EyeOff className="w-4 h-4 mr-2" />
  Hide Review
  </>
  ) : (
  <>
  <Eye className="w-4 h-4 mr-2" />
  Review Answers
  </>
  )}
  </Button>
  <Button
  onClick={handleExportPDF}
  disabled={isExporting}
  className="bg-gradient-to-r from-sage-deep to-emerald-600 hover:from-sage-deep/95 hover:to-emerald-600/95 dark:from-emerald-700 dark:to-emerald-500"
  >
  <Download className="w-4 h-4 mr-2" />
  {isExporting ? 'Exporting...' : 'Download Report'}
  </Button>
  </div> */}
  </div>

  {/* Score Overview */}
  <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
  <motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ delay: 0.1 }}
  className={`${getScoreBgColor(result.score_percent)} rounded-xl border border-slate-200/90 p-6 dark:border-emerald-800/60`}
  >
  <div className="flex items-center justify-between">
  <div>
  <p className="text-sm font-medium text-slate-600 dark:text-emerald-200/80">
  Overall Score
  </p>
  <p className={`text-3xl font-bold ${getScoreColor(result.score_percent)}`}>
  {result.score_percent.toFixed(1)}%
  </p>
  </div>
  <Trophy className={`w-8 h-8 ${getScoreColor(result.score_percent)}`} />
  </div>
  </motion.div>

  <motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ delay: 0.2 }}
  className="rounded-xl border border-slate-200/90 bg-white p-6 dark:border-emerald-800/60 dark:bg-emerald-950/40"
  >
  <div className="flex items-center justify-between">
  <div>
  <p className="text-sm font-medium text-slate-600 dark:text-emerald-200/80">
  Time Taken
  </p>
  <p className="text-2xl font-bold text-slate-900 dark:text-emerald-50">
  {formatTime(result.time_taken_seconds)}
  </p>
  </div>
  <Clock className="h-6 w-6 shrink-0 text-sage-deep dark:text-emerald-400" />
  </div>
  </motion.div>

  <motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ delay: 0.3 }}
  className="rounded-xl border border-slate-200/90 bg-white p-6 dark:border-emerald-800/60 dark:bg-emerald-950/40"
  >
  <div className="flex items-center justify-between">
  <div>
  <p className="text-sm font-medium text-slate-600 dark:text-emerald-200/80">
  Role Fit Score
  </p>
  <p className="text-2xl font-bold text-slate-900 dark:text-emerald-50">
  {result.role_fit_score.toFixed(1)}%
  </p>
  </div>
  <Target className="h-6 w-6 text-slate-500 dark:text-emerald-400/80" />
  </div>
  </motion.div>

  <motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ delay: 0.4 }}
  className="rounded-xl border border-slate-200/90 bg-white p-6 dark:border-emerald-800/60 dark:bg-emerald-950/40"
  >
  <div className="flex items-center justify-between">
  <div>
  <p className="text-sm font-medium text-slate-600 dark:text-emerald-200/80">
  Correct Answers
  </p>
  <p className="text-2xl font-bold text-slate-900 dark:text-emerald-50">
  {result.question_results.filter(r => r.is_correct).length}/{result.question_results.length}
  </p>
  </div>
  <CheckCircle className="h-6 w-6 text-sage-deep dark:text-emerald-400" />
  </div>
  </motion.div>
  </div>

  {/* Weak Areas */}
  {result.weak_areas && result.weak_areas.length > 0 && (
  <motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ delay: 0.5 }}
  className="rounded-xl border border-slate-200/90 bg-white p-6 dark:border-emerald-800/60 dark:bg-emerald-950/40"
  >
  <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold text-slate-900 dark:text-emerald-50">
  <TrendingUp className="h-5 w-5 text-sage-deep dark:text-emerald-400" />
  Areas for Improvement
  </h3>
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
  {result.weak_areas.map((area, index) => (
  <div
  key={index}
  className="rounded-lg border border-slate-200/80 bg-sage/10 p-4 dark:border-emerald-800/50 dark:bg-emerald-900/25"
  >
  <div className="mb-2 flex items-center justify-between">
  <span className="text-sm font-medium text-slate-900 dark:text-emerald-50">
  {area.tag}
  </span>
  <span className={`text-sm font-bold ${getScoreColor(area.accuracy)}`}>
  {area.accuracy.toFixed(1)}%
  </span>
  </div>
  <div className="h-2 w-full rounded-full bg-slate-200 dark:bg-emerald-900/50">
  <div
  className={`h-2 rounded-full ${area.accuracy >= 60 ? 'bg-sage-deep dark:bg-emerald-500' :
  area.accuracy >= 40 ? 'bg-amber-500 dark:bg-amber-500/90' : 'bg-red-500 dark:bg-red-500/90'
  }`}
  style={{ width: `${area.accuracy}%` }}
  ></div>
  </div>
  </div>
  ))}
  </div>
  </motion.div>
  )}

  {/* Question Review */}
  {showReviewMode && (
  <motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ delay: 0.6 }}
  className="rounded-xl border border-slate-200/90 bg-white p-6 dark:border-emerald-800/60 dark:bg-emerald-950/40"
  >
  <h3 className="mb-4 text-lg font-semibold text-slate-900 dark:text-emerald-50">
  Question Review
  </h3>
  <div className="space-y-4">
  {result.question_results.map((questionResult, index) => (
  <div
  key={index}
  className={`p-4 rounded-lg border ${questionResult.is_correct
  ? 'border-emerald-200/90 bg-emerald-50/90 dark:border-emerald-700/60 dark:bg-emerald-900/25'
  : 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-700'
  }`}
  >
  <div className="flex items-start gap-3">
  <div className="flex-shrink-0 mt-1">
  {questionResult.is_correct ? (
  <CheckCircle className="h-5 w-5 text-sage-deep dark:text-emerald-400" />
  ) : (
  <XCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
  )}
  </div>
  <div className="flex-1">
  <div className="flex items-center gap-2 mb-2">
  <span className="text-sm font-medium text-slate-900 dark:text-emerald-50">
  Question {index + 1}
  </span>
  <span className={`px-2 py-1 rounded-full text-xs font-medium ${questionResult.is_correct
  ? 'bg-emerald-100 text-emerald-900 dark:bg-emerald-900/40 dark:text-emerald-300'
  : 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
  }`}>
  {questionResult.is_correct ? 'Correct' : 'Incorrect'}
  </span>
  </div>
  {questionResult.explanation && (
  <div
  className="prose prose-sm max-w-none text-sm text-slate-600 dark:text-emerald-200/85 dark:prose-invert"
  dangerouslySetInnerHTML={{ __html: questionResult.explanation }}
  />
  )}
  </div>
  </div>
  </div>
  ))}
  </div>
  </motion.div>
  )}

  {/* Action Buttons */}
  <div className="flex items-center justify-center gap-4 pt-6">
  {/* Retake Exam button - commented out as per requirement */}
  {/* <Button
  onClick={() => {
  handleEnterFullscreen();
  onBackToExam(); // start the exam after fullscreen
  }}
  variant="outline"
  size="lg"
  >
  Retake Exam
  </Button> */}

  {/* <Button
  onClick={onBackToDashboard}
  className="bg-gradient-to-r from-sage-deep to-emerald-600 hover:from-sage-deep/95 hover:to-emerald-600/95 dark:from-emerald-700 dark:to-emerald-500"
  size="lg"
  >
  Go to Practice Dashboard
  </Button> */}
  </div>
  </div>
  )
}
