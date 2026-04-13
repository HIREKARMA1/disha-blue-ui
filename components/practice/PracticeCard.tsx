"use client"

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Clock, Users, Brain, Play, Star, CheckCircle, Eye, Shield, GraduationCap, Target, BookOpen } from 'lucide-react'
import { PracticeModule, SubmitAttemptResponse } from '@/types/practice'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { PracticeDetailsModal } from './PracticeDetailsModal'
import { toast } from 'react-hot-toast'

interface PracticeCardProps {
  module: PracticeModule
  onStart: () => void
  onViewResults?: () => void
  isSubmitted?: boolean
  result?: SubmitAttemptResponse
}



export function PracticeCard({ module, onStart, onViewResults, isSubmitted = false, result }: PracticeCardProps) {
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false)

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

  const getRoleColor = (role: string) => {
  const colors = [
  'bg-sage/20 text-sage-deep dark:bg-emerald-900/45 dark:text-emerald-300',
  'bg-emerald-100/90 text-emerald-900 dark:bg-emerald-900/40 dark:text-emerald-200',
  'bg-sage/15 text-slate-800 dark:bg-emerald-950/50 dark:text-emerald-100',
  ]
  const hash = role.split('').reduce((a, b) => a + b.charCodeAt(0), 0)
  return colors[hash % colors.length]
  }

  const getScoreColor = (score: number) => {
  if (score >= 80) return 'text-sage-deep dark:text-emerald-300'
  if (score >= 60) return 'text-amber-700 dark:text-amber-400/90'
  return 'text-red-600 dark:text-red-400'
  }

  const getCardColors = () => {
  const colorSchemes = [
  {
  bg: 'bg-gradient-to-br from-sage/25 to-white dark:from-emerald-950/40 dark:to-emerald-900/25',
  border: 'border-slate-200/90 dark:border-emerald-800/65',
  hover: 'hover:shadow-[0_8px_28px_-8px_rgba(15,23,42,0.11)] dark:hover:shadow-none',
  accent: 'text-sage-deep dark:text-emerald-300',
  },
  {
  bg: 'bg-gradient-to-br from-emerald-50/90 to-sage/15 dark:from-emerald-900/30 dark:to-emerald-950/40',
  border: 'border-emerald-200/70 dark:border-emerald-800/65',
  hover: 'hover:shadow-[0_8px_28px_-8px_rgba(15,23,42,0.11)] dark:hover:shadow-none',
  accent: 'text-emerald-800 dark:text-emerald-300',
  },
  {
  bg: 'bg-gradient-to-br from-white to-sage/10 dark:from-emerald-900/25 dark:to-emerald-950/35',
  border: 'border-slate-200/90 dark:border-emerald-800/65',
  hover: 'hover:shadow-[0_8px_28px_-8px_rgba(15,23,42,0.11)] dark:hover:shadow-none',
  accent: 'text-sage-deep dark:text-emerald-200',
  },
  {
  bg: 'bg-gradient-to-br from-slate-50/95 to-sage/10 dark:from-emerald-950/50 dark:to-emerald-900/20',
  border: 'border-slate-200/90 dark:border-emerald-800/65',
  hover: 'hover:shadow-[0_8px_28px_-8px_rgba(15,23,42,0.11)] dark:hover:shadow-none',
  accent: 'text-slate-700 dark:text-emerald-300',
  },
  ]

  const hash = (module.id + module.title).split('').reduce((a, b) => a + b.charCodeAt(0), 0)
  return colorSchemes[hash % colorSchemes.length]
  }

  const cardColors = getCardColors()

  return (
  <motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.3 }}
  className={`${cardColors.bg} group flex h-full flex-col rounded-2xl border ${cardColors.border} ${cardColors.hover} transition-all duration-200 hover:shadow-md`}
  >
  {/* Header */}
  <div className="flex-shrink-0 border-b border-slate-200/90 p-6 dark:border-emerald-800/70">
  <div className="mb-3 flex items-start justify-between">
  <div className="flex-1">
  <h3 className={`line-clamp-2 text-lg font-semibold text-slate-900 transition-colors group-hover:${cardColors.accent} dark:text-emerald-50`}>
  {module.title}
  </h3>
  {/* Creator Info */}
  {module.creator_type && (
  <p className="mt-1 flex items-center gap-2 text-sm text-slate-600 dark:text-emerald-200/80">
  {module.creator_type === 'admin' ? (
  <Shield className="w-4 h-4" />
  ) : (module.creator_type as string) === 'corporate' ? (
  <Target className="w-4 h-4" />
  ) : (
  <GraduationCap className="w-4 h-4" />
  )}
  {module.creator_type === 'admin' ? 'Admin Practice Test' :
  (module.creator_type as string) === 'corporate' ? 'Corporate Practice Test' :
  'University Practice Test'}
  </p>
  )}
  </div>
  <div className="flex flex-col items-end gap-2">
  {/* Difficulty Badge */}
  {module.difficulty && (
  <span className={cn(
  "px-2 py-1 text-xs font-medium rounded-full",
  getDifficultyColor(module.difficulty)
  )}>
  {module.difficulty.charAt(0).toUpperCase() + module.difficulty.slice(1)}
  </span>
  )}

  {/* Score Badge for completed tests - COMMENTED OUT */}
  {/* {isSubmitted && result && (
  <div className={`px-3 py-1 rounded-full text-xs font-bold shadow-sm ${result.score_percent >= 80 ? 'bg-green-500 text-white' :
  result.score_percent >= 60 ? 'bg-orange-500 text-white' :
  'bg-red-500 text-white'
  }`}>
  {result.score_percent.toFixed(1)}% Score
  </div>
  )} */}
  </div>
  </div>

  {/* Practice Test Meta */}
  <div className="grid grid-cols-2 gap-3 text-sm">
  <div className="flex items-center gap-2 text-slate-600 dark:text-emerald-200/80">
  <Clock className={`w-4 h-4 ${cardColors.accent}`} />
  <span className="truncate">{formatDuration(module.duration_seconds)}</span>
  </div>

  <div className="flex items-center gap-2 text-slate-600 dark:text-emerald-200/80">
  <Target className={`w-4 h-4 ${cardColors.accent}`} />
  <span className="truncate">{module.questions_count} Questions</span>
  </div>

  <div className="flex items-center gap-2 text-slate-600 dark:text-emerald-200/80">
  <BookOpen className={`w-4 h-4 ${cardColors.accent}`} />
  <span className="truncate">{module.role}</span>
  </div>

  <div className="flex items-center gap-2 text-slate-600 dark:text-emerald-200/80">
  <Brain className={`w-4 h-4 ${cardColors.accent}`} />
  <span className="truncate">
  {isSubmitted ? 'Completed' : 'Available'}
  </span>
  </div>

  {/* Days Remaining */}
  {module.days_remaining !== null && module.days_remaining !== undefined && (
  <div className="flex items-center gap-2 text-slate-600 dark:text-emerald-200/80">
  <Clock className={`w-4 h-4 ${cardColors.accent}`} />
  <span className="truncate">
  {module.days_remaining === 0
  ? 'Expires Today'
  : module.days_remaining === 1
  ? '1 Day Left'
  : `${module.days_remaining} Days Left`
  }
  </span>
  </div>
  )}
  </div>

  {/* Tags/Skills */}
  {module.tags && module.tags.length > 0 && (
  <div className="mt-4">
  <div className="flex flex-wrap gap-2">
  {module.tags.slice(0, 3).map((tag, index) => (
  <span
  key={index}
  className="rounded-md bg-sage/15 px-2 py-1 text-xs text-slate-700 dark:bg-emerald-900/45 dark:text-emerald-200/90"
  >
  {tag}
  </span>
  ))}
  {module.tags.length > 3 && (
  <span className="rounded-md bg-sage/15 px-2 py-1 text-xs text-slate-700 dark:bg-emerald-900/45 dark:text-emerald-200/90">
  +{module.tags.length - 3} more
  </span>
  )}
  </div>
  </div>
  )}
  </div>

  {/* Content */}
  <div className="p-6 flex-1 flex flex-col">
  <p className="mb-4 line-clamp-3 text-sm text-slate-600 dark:text-emerald-200/80">
  {module.description || 'Test your skills with this practice assessment and improve your performance.'}
  </p>

  {/* Additional Info */}
  <div className="space-y-2 mb-4 flex-1">
  {module.category && (
  <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-emerald-400/85">
  <Brain className={`w-3 h-3 ${cardColors.accent}`} />
  <span>{module.category.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}</span>
  </div>
  )}

  {/* Correct answers count - COMMENTED OUT */}
  {/* {isSubmitted && result && (
  <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-emerald-400/85">
  <CheckCircle className="w-3 h-3 text-green-500" />
  <span>
  {result.question_results.filter(r => r.is_correct).length}/{result.question_results.length} correct answers
  </span>
  </div>
  )} */}
  </div>

  {/* Status Indicators */}
  {isSubmitted && result && (
  <div className="mb-3 text-center">
  <div className="flex items-center justify-center gap-2">
  <CheckCircle className="h-4 w-4 text-sage-deep dark:text-emerald-400" />
  <span className="text-sm font-medium text-sage-deep dark:text-emerald-300">
  Practice Completed
  </span>
  </div>
  </div>
  )}

  {/* Action Buttons */}
  <div className="flex gap-3 mt-auto pt-4">
  <Button
  onClick={() => setIsDetailsModalOpen(true)}
  variant="outline"
  size="sm"
  className="flex flex-1 items-center gap-2 border-slate-200/90 transition-all duration-200 hover:border-sage-deep/40 hover:shadow-md dark:border-emerald-800 dark:hover:border-emerald-600"
  >
  <Eye className="w-4 h-4" />
  View Details
  </Button>

  {/* View Results / Start Practice button - Modified to only show "Start Practice" */}
  {!isSubmitted && (
  <Button
  onClick={onStart}
  size="sm"
  className="flex flex-1 items-center gap-2 bg-sage-deep transition-all duration-200 hover:bg-sage-deep/90 hover:shadow-md dark:bg-emerald-600 dark:hover:bg-emerald-500"
  >
  <Play className="w-4 h-4" />
  Start Practice
  </Button>
  )}
  {/* Original button with View Results - COMMENTED OUT */}
  {/* <Button
  onClick={() => {
  if (isSubmitted && result && onViewResults) {
  onViewResults()
  } else {
  onStart()
  }
  }}
  disabled={isSubmitted && !result}
  size="sm"
  className={cn(
  "flex-1 flex items-center gap-2 transition-all duration-200 hover:shadow-md",
  isSubmitted && result
  ? "bg-green-500 hover:bg-green-600"
  : "bg-primary-500 hover:bg-primary-600"
  )}
  >
  {isSubmitted && result ? (
  <>
  <CheckCircle className="w-4 h-4" />
  View Results
  </>
  ) : (
  <>
  <Play className="w-4 h-4" />
  Start Practice
  </>
  )}
  </Button> */}

  </div>
  </div>

  {/* Practice Details Modal */}
  <PracticeDetailsModal
  isOpen={isDetailsModalOpen}
  onClose={() => setIsDetailsModalOpen(false)}
  module={module}
  onStartPractice={onStart}
  onViewResults={onViewResults}
  isSubmitted={isSubmitted}
  result={result}
  />
  </motion.div>
  )
}
