"use client"

import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Clock, Users, Brain, Target, BookOpen, Shield, GraduationCap, Calendar, Tag, CheckCircle, Play, Eye } from 'lucide-react'
import { PracticeModule, SubmitAttemptResponse } from '@/types/practice'
import { Button } from '@/components/ui/button'

interface PracticeDetailsModalProps {
  isOpen: boolean
  onClose: () => void
  module: PracticeModule | null
  onStartPractice: () => void
  onViewResults?: () => void
  isSubmitted?: boolean
  result?: SubmitAttemptResponse
}

export function PracticeDetailsModal({
  isOpen,
  onClose,
  module,
  onStartPractice,
  onViewResults,
  isSubmitted = false,
  result
}: PracticeDetailsModalProps) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
  setMounted(true)
  return () => setMounted(false)
  }, [])

  if (!module || !mounted) return null

  const formatDuration = (seconds: number) => {
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)

  if (hours > 0) {
  return `${hours}h ${minutes}m`
  }
  return `${minutes}m`
  }

  const getDifficultyColor = (difficulty?: string) => {
  switch (difficulty) {
  case 'easy':
  return 'bg-sage/20 text-sage-deep dark:bg-emerald-900/45 dark:text-emerald-300'
  case 'medium':
  return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400'
  case 'hard':
  return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
  default:
  return 'bg-slate-100 text-slate-700 dark:bg-emerald-950/50 dark:text-emerald-300'
  }
  }

  const getCreatorIcon = (creatorType?: string) => {
  if (creatorType === 'admin') {
  return <Shield className="w-4 h-4" />
  }
  return <GraduationCap className="w-4 h-4" />
  }

  const getCreatorLabel = (creatorType?: string) => {
  if (creatorType === 'admin') {
  return 'Admin Practice Test'
  }
  return 'University Practice Test'
  }

  const modalContent = (
  <AnimatePresence>
  {isOpen && (
  <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
  {/* Backdrop - No Blur */}
  <motion.div
  initial={{ opacity: 0 }}
  animate={{ opacity: 1 }}
  exit={{ opacity: 0 }}
  className="absolute inset-0 bg-black bg-opacity-50"
  onClick={onClose}
  />

  {/* Enhanced Modal */}
  <motion.div
  initial={{ opacity: 0, scale: 0.95, y: 20 }}
  animate={{ opacity: 1, scale: 1, y: 0 }}
  exit={{ opacity: 0, scale: 0.95, y: 20 }}
  transition={{ duration: 0.3 }}
  className="relative max-h-[90vh] w-full max-w-3xl overflow-hidden rounded-xl border border-slate-200/90 bg-white shadow-2xl dark:border-emerald-800/60 dark:bg-emerald-950/50"
  onClick={(e) => e.stopPropagation()}
  >
  {/* Header */}
  <div className="border-b border-slate-200/90 bg-gradient-to-r from-sage/20 to-emerald-50/90 p-6 dark:border-emerald-800/60 dark:from-emerald-950 dark:to-slate-900">
  <div className="flex items-start justify-between">
  <div className="flex-1">
  <div className="flex items-center gap-3 mb-2">
  <h2 className="text-2xl font-bold text-slate-900 dark:text-emerald-50">
  {module.title}
  </h2>
  {module.difficulty && (
  <span className={`px-3 py-1 text-sm font-medium rounded-full ${getDifficultyColor(module.difficulty)}`}>
  {module.difficulty.charAt(0).toUpperCase() + module.difficulty.slice(1)}
  </span>
  )}
  </div>

  <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-emerald-200/85">
  {getCreatorIcon(module.creator_type)}
  <span>{getCreatorLabel(module.creator_type)}</span>
  </div>
  </div>

  <button
  onClick={onClose}
  className="rounded-lg p-2 text-slate-400 transition-all duration-200 hover:bg-white hover:text-slate-600 dark:hover:bg-emerald-900/50 dark:hover:text-emerald-100"
  >
  <X className="w-6 h-6" />
  </button>
  </div>
  </div>

  {/* Content */}
  <div className="max-h-[calc(90vh-250px)] overflow-y-auto">
  <div className="p-6">
  {/* Description */}
  <div className="mb-6">
  <h3 className="mb-3 flex items-center gap-2 text-base font-semibold text-slate-900 dark:text-emerald-50">
  <BookOpen className="h-5 w-5 text-sage-deep dark:text-emerald-400" />
  Description
  </h3>
  <p className="text-sm leading-relaxed text-slate-600 dark:text-emerald-200/85">
  {module.description || 'Test your skills with this practice assessment and improve your performance.'}
  </p>
  </div>

  {/* Quick Stats */}
  <div className="grid grid-cols-2 gap-4 mb-6">
  <div className="flex items-center gap-3 rounded-lg border border-sage/40 bg-sage/15 p-4 dark:border-emerald-800/60 dark:bg-emerald-900/25">
  <div className="rounded-lg bg-sage/25 p-2 dark:bg-emerald-900/50">
  <Clock className="h-5 w-5 text-sage-deep dark:text-emerald-300" />
  </div>
  <div>
  <p className="mb-1 text-xs text-slate-600 dark:text-emerald-200/75">Duration</p>
  <p className="text-base font-bold text-sage-deep dark:text-emerald-200">
  {formatDuration(module.duration_seconds)}
  </p>
  </div>
  </div>

  <div className="flex items-center gap-3 rounded-lg border border-emerald-200/80 bg-emerald-50/80 p-4 dark:border-emerald-800/60 dark:bg-emerald-900/25">
  <div className="rounded-lg bg-emerald-100/90 p-2 dark:bg-emerald-900/50">
  <Target className="h-5 w-5 text-emerald-800 dark:text-emerald-300" />
  </div>
  <div>
  <p className="mb-1 text-xs text-slate-600 dark:text-emerald-200/75">Questions</p>
  <p className="text-base font-bold text-emerald-900 dark:text-emerald-100">
  {module.questions_count}
  </p>
  </div>
  </div>

  <div className="flex items-center gap-3 rounded-lg border border-emerald-200/80 bg-emerald-50/80 p-4 dark:border-emerald-800/60 dark:bg-emerald-900/20">
  <div className="rounded-lg bg-emerald-100/90 p-2 dark:bg-emerald-900/50">
  <BookOpen className="h-5 w-5 text-emerald-800 dark:text-emerald-300" />
  </div>
  <div>
  <p className="mb-1 text-xs text-slate-600 dark:text-emerald-200/75">Role</p>
  <p className="text-base font-bold text-emerald-900 dark:text-emerald-100">
  {module.role}
  </p>
  </div>
  </div>

  <div className="flex items-center gap-3 rounded-lg border border-sage/40 bg-sage/15 p-4 dark:border-emerald-800/60 dark:bg-emerald-900/30">
  <div className="rounded-lg bg-sage/25 p-2 dark:bg-emerald-900/50">
  <Brain className="h-5 w-5 text-sage-deep dark:text-emerald-300" />
  </div>
  <div>
  <p className="mb-1 text-xs text-slate-600 dark:text-emerald-200/75">Status</p>
  <p className="text-base font-bold text-sage-deep dark:text-emerald-200">
  {isSubmitted ? 'Completed' : 'Available'}
  </p>
  </div>
  </div>
  </div>

  {/* Additional Info */}
  <div className="space-y-4 mb-6">
  {module.category && (
  <div className="rounded-lg border border-slate-200/80 bg-sage/10 p-4 dark:border-emerald-800/50 dark:bg-emerald-900/20">
  <div className="flex items-center justify-between">
  <span className="text-sm font-semibold text-slate-900 dark:text-emerald-50">Category:</span>
  <span className="text-sm font-medium text-slate-600 dark:text-emerald-200/85">
  {module.category.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
  </span>
  </div>
  </div>
  )}

  {module.tags && module.tags.length > 0 && (
  <div className="rounded-lg border border-slate-200/80 bg-sage/10 p-4 dark:border-emerald-800/50 dark:bg-emerald-900/20">
  <div className="mb-3 flex items-center gap-2">
  <Tag className="h-4 w-4 text-slate-600 dark:text-emerald-400/80" />
  <span className="text-sm font-semibold text-slate-900 dark:text-emerald-50">Tags</span>
  </div>
  <div className="flex flex-wrap gap-2">
  {module.tags.slice(0, 5).map((tag, index) => (
  <span
  key={index}
  className="rounded-full border border-sage/40 bg-sage/20 px-3 py-1.5 text-xs font-medium text-sage-deep dark:border-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-200"
  >
  {tag}
  </span>
  ))}
  {module.tags.length > 5 && (
  <span className="rounded-full border border-slate-200/90 bg-slate-100 px-3 py-1.5 text-xs font-medium text-slate-600 dark:border-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300">
  +{module.tags.length - 5} more
  </span>
  )}
  </div>
  </div>
  )}
  </div>

  {/* Result Section (if submitted) - COMMENTED OUT */}
  {/* {isSubmitted && result && (
  <div className="mb-4 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-700">
  <h4 className="text-xs font-semibold text-green-900 dark:text-green-100 mb-2 flex items-center gap-1">
  <CheckCircle className="w-3 h-3" />
  Your Results
  </h4>
  <div className="grid grid-cols-3 gap-2">
  <div className="text-center">
  <p className="text-sm font-bold text-green-600 dark:text-green-400">
  {result.score_percent}%
  </p>
  <p className="text-xs text-green-700 dark:text-green-300">Score</p>
  </div>
  <div className="text-center">
  <p className="text-sm font-bold text-green-600 dark:text-green-400">
  {result.question_results?.filter(q => (q as any).is_correct ?? (q as any).correct)?.length}/{result.question_results?.length}
  </p>
  <p className="text-xs text-green-700 dark:text-green-300">Correct</p>
  </div>
  <div className="text-center">
  <p className="text-sm font-bold text-green-600 dark:text-green-400">
  {result.time_taken_seconds}s
  </p>
  <p className="text-xs text-green-700 dark:text-green-300">Time</p>
  </div>
  </div>
  </div>
  )} */}

  {/* Instructions */}
  <div className="rounded-lg border border-sage/40 bg-gradient-to-br from-sage/15 to-emerald-50/80 p-5 dark:border-emerald-800/60 dark:from-emerald-950/60 dark:to-emerald-900/25">
  <h4 className="mb-3 flex items-center gap-2 text-sm font-bold text-sage-deep dark:text-emerald-100">
  <Target className="h-4 w-4" />
  Test Instructions
  </h4>
  <ul className="space-y-2 text-sm text-slate-700 dark:text-emerald-200/90">
  <li className="flex items-start gap-2">
  <span className="text-sage-deep dark:text-emerald-400">•</span>
  <span>Read each question carefully before selecting your answer</span>
  </li>
  <li className="flex items-start gap-2">
  <span className="text-sage-deep dark:text-emerald-400">•</span>
  <span>You can navigate between questions using the navigation buttons</span>
  </li>
  <li className="flex items-start gap-2">
  <span className="text-sage-deep dark:text-emerald-400">•</span>
  <span>Review all your answers before submitting the test</span>
  </li>
  <li className="flex items-start gap-2">
  <span className="text-sage-deep dark:text-emerald-400">•</span>
  <span>Timer will start automatically when you begin the test</span>
  </li>
  </ul>
  </div>
  </div>
  </div>

  {/* Footer */}
  <div className="border-t border-slate-200/90 bg-white p-6 dark:border-emerald-800/60 dark:bg-emerald-950/40">
  <div className="flex gap-3">
  <Button
  onClick={onClose}
  variant="outline"
  className="flex-1 py-3 text-sm font-medium transition-all duration-200 hover:bg-sage/10 dark:hover:bg-emerald-900/40"
  >
  Close
  </Button>
  {isSubmitted && result && onViewResults ? (
  <>
  {/* <Button
  onClick={() => {
  onViewResults()
  onClose()
  }}
  className="flex-1 py-3 text-sm font-medium bg-green-600 hover:bg-green-700 text-white transition-all duration-200"
  >
  <Eye className="w-4 h-4 mr-2" />
  View Results
  </Button> */}
  {/* <Button
  onClick={() => {
  onStartPractice()
  onClose()
  }}
  className="flex-1 py-3 text-sm font-medium bg-blue-600 hover:bg-blue-700 text-white transition-all duration-200"
  >
  <Play className="w-4 h-4 mr-2" />
  Retake
  </Button> */}
  </>
  ) : (
  <Button
  onClick={() => {
  onStartPractice()
  onClose()
  }}
  className="flex-1 bg-gradient-to-r from-sage-deep to-emerald-600 py-3 text-sm font-medium text-white shadow-lg transition-all duration-200 hover:from-sage-deep/95 hover:to-emerald-600/95 hover:shadow-xl dark:from-emerald-700 dark:to-emerald-500 dark:hover:from-emerald-600 dark:hover:to-emerald-400"
  >
  <Play className="w-5 h-5 mr-2" />
  Start Practice Test
  </Button>
  )}
  </div>
  </div>
  </motion.div>
  </div>
  )}
  </AnimatePresence>
  )

  return createPortal(modalContent, document.body)
}