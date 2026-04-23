"use client"

import { CheckCircle, AlertCircle, Star } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ProfileField {
  name: string
  completed: boolean
  required: boolean
  category: string
}

interface ProfileCompletionProps {
  completion: number
  fields?: ProfileField[]
  completionData?: {
  completed_fields: string[]
  missing_fields: string[]
  total_fields: number
  completed_count: number
  }
  className?: string
}

export function ProfileCompletion({ completion, fields, completionData, className }: ProfileCompletionProps) {
  const getCompletionColor = (percentage: number) => {
  if (percentage >= 80) return 'text-sage-deep dark:text-emerald-300'
  if (percentage >= 60) return 'text-emerald-700 dark:text-emerald-400'
  if (percentage >= 40) return 'text-amber-700 dark:text-amber-400'
  return 'text-red-600 dark:text-red-400'
  }

  const getProgressColor = (percentage: number) => {
  if (percentage >= 80) return 'bg-sage-deep dark:bg-emerald-500'
  if (percentage >= 60) return 'bg-emerald-600 dark:bg-emerald-400'
  if (percentage >= 40) return 'bg-amber-500 dark:bg-amber-400'
  return 'bg-red-500 dark:bg-red-500'
  }

  // Use completionData if available, otherwise fall back to fields
  const completedCount = completionData?.completed_count || (fields ? fields.filter(field => field.completed).length : 0)
  const totalFields = completionData?.total_fields || (fields ? fields.length : 0)
  const completedFieldsList = completionData?.completed_fields || (fields ? fields.filter(field => field.completed).map(f => f.name) : [])
  const missingFieldsList = completionData?.missing_fields || (fields ? fields.filter(field => !field.completed).map(f => f.name) : [])

  // For backward compatibility, still calculate category stats if fields are provided
  const categories = fields ? Array.from(new Set(fields.map(field => field.category))) : []
  const categoryStats = fields ? categories.map(category => {
  const categoryFields = fields.filter(field => field.category === category)
  const completed = categoryFields.filter(field => field.completed).length
  const total = categoryFields.length
  return { category, completed, total, percentage: (completed / total) * 100 }
  }) : []

  return (
  <div className={cn("rounded-xl border border-slate-200/90 bg-white p-6 shadow-sm dark:border-emerald-800/70 dark:bg-emerald-900/25", className)}>
  {/* Header */}
  <div className="flex items-center justify-between mb-6">
  <div>
  <h3 className="text-lg font-semibold text-slate-900 dark:text-emerald-50">
  Profile Completion
  </h3>
  <p className="text-sm text-slate-600 dark:text-emerald-200/80">
  Complete your profile to increase your chances
  </p>
  </div>
  <div className="text-right">
  <div className={cn("text-2xl font-bold", getCompletionColor(completion))}>
  {completion}%
  </div>
  <div className="text-xs text-slate-500 dark:text-emerald-400/90">
  {completedCount} of {totalFields} fields
  </div>
  </div>
  </div>

  {/* Progress Bar */}
  <div className="mb-6">
  <div className="h-3 w-full rounded-full bg-slate-200 dark:bg-emerald-950/60">
  <div
  className={cn("h-3 rounded-full transition-all duration-500 ease-out", getProgressColor(completion))}
  style={{ width: `${completion}%` }}
  />
  </div>
  <div className="mt-2 flex justify-between text-xs text-slate-500 dark:text-emerald-400/80">
  <span>0%</span>
  <span>25%</span>
  <span>50%</span>
  <span>75%</span>
  <span>100%</span>
  </div>
  </div>

  {/* Category Breakdown - Only show if fields are provided */}
  {fields && fields.length > 0 && (
  <div className="space-y-4 mb-6">
  <h4 className="text-sm font-medium text-slate-900 dark:text-emerald-50">
  Category Progress
  </h4>
  {categoryStats.map(({ category, completed, total, percentage }) => (
  <div key={category} className="space-y-2">
  <div className="flex items-center justify-between">
  <span className="text-sm capitalize text-slate-700 dark:text-emerald-200/90">
  {category}
  </span>
  <span className="text-sm text-slate-600 dark:text-emerald-200/75">
  {completed}/{total}
  </span>
  </div>
  <div className="h-2 w-full rounded-full bg-slate-200 dark:bg-emerald-950/60">
  <div
  className={cn("h-2 rounded-full transition-all duration-300", getProgressColor(percentage))}
  style={{ width: `${percentage}%` }}
  />
  </div>
  </div>
  ))}
  </div>
  )}

  {/* Completion Status */}
  <div className="space-y-4">
  <h4 className="text-sm font-medium text-slate-900 dark:text-emerald-50">
  Completion Status
  </h4>

  {/* Completed Fields */}
  {completedFieldsList.length > 0 && (
  <div className="space-y-2">
  <div className="flex items-center space-x-2 text-sm text-sage-deep dark:text-emerald-300">
  <CheckCircle className="w-4 h-4" />
  <span>Completed ({completedFieldsList.length})</span>
  </div>
  <div className="grid grid-cols-2 gap-2">
  {completedFieldsList.slice(0, 6).map((fieldName, index) => {
  const formatted = fieldName
  .replace(/_/g, ' ')
  .replace(/\w\S*/g, (txt) => txt.charAt(0).toUpperCase() + txt.substring(1).toLowerCase())
  return (
  <div key={index} className="rounded bg-sage/15 px-2 py-1 text-xs text-slate-700 dark:bg-emerald-900/40 dark:text-emerald-200/90">
  {formatted}
  </div>
  )
  })}
  {completedFieldsList.length > 6 && (
  <div className="px-2 py-1 text-xs text-slate-500 dark:text-emerald-400/80">
  +{completedFieldsList.length - 6} more
  </div>
  )}
  </div>
  </div>
  )}

  {/* Missing Fields */}
  {missingFieldsList.length > 0 && (
  <div className="space-y-2">
  <div className="flex items-center space-x-2 text-sm text-red-600">
  <AlertCircle className="w-4 h-4" />
  <span>Missing ({missingFieldsList.length})</span>
  </div>
  <div className="grid grid-cols-2 gap-2">
  {missingFieldsList.slice(0, 6).map((fieldName, index) => {
  const formatted = fieldName
  .replace(/_/g, ' ')
  .replace(/\w\S*/g, (txt) => txt.charAt(0).toUpperCase() + txt.substring(1).toLowerCase())
  return (
  <div key={index} className="rounded bg-red-50 px-2 py-1 text-xs text-slate-700 dark:bg-red-900/30 dark:text-red-200">
  {formatted}
  </div>
  )
  })}
  {missingFieldsList.length > 6 && (
  <div className="px-2 py-1 text-xs text-slate-500 dark:text-emerald-400/80">
  +{missingFieldsList.length - 6} more
  </div>
  )}
  </div>
  </div>
  )}
  </div>

  {/* Completion Tips */}
  {completion < 100 && (
  <div className="mt-6 rounded-lg border border-sage/40 bg-sage/10 p-4 dark:border-emerald-800 dark:bg-emerald-900/35">
  <h5 className="mb-2 text-sm font-medium text-sage-deep dark:text-emerald-200">
  Tips to Complete Your Profile
  </h5>
  <ul className="space-y-1 text-xs text-slate-700 dark:text-emerald-200/85">
  <li>• Add a professional profile picture</li>
  <li>• Upload your latest resume</li>
  <li>• Fill in your academic details</li>
  <li>• Add your technical skills</li>
  <li>• Include your work experience</li>
  </ul>
  </div>
  )}
  </div>
  )
}

