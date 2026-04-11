
import { motion } from 'framer-motion'
import { Clock, Calendar, Hash, PlayCircle, Eye, CheckCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { JobAssessment } from '@/types/practice'

interface JobAssessmentCardProps {
  assessment: JobAssessment
  cardIndex?: number
  onViewDetails: () => void
  onStart: () => void
}

const cardColors = [
  { bg: 'bg-sage/15 dark:bg-emerald-900/25', border: 'border-slate-200/90 dark:border-emerald-800/70', text: 'text-sage-deep dark:text-emerald-300', icon: 'text-sage-deep dark:text-emerald-400', hover: 'hover:border-sage-deep/40 dark:hover:border-emerald-600' },
  { bg: 'bg-emerald-50/80 dark:bg-emerald-900/20', border: 'border-emerald-200/80 dark:border-emerald-800/70', text: 'text-emerald-900 dark:text-emerald-200', icon: 'text-emerald-700 dark:text-emerald-400', hover: 'hover:border-emerald-400/60 dark:hover:border-emerald-500' },
  { bg: 'bg-slate-50/90 dark:bg-emerald-950/35', border: 'border-slate-200/90 dark:border-emerald-800/70', text: 'text-slate-800 dark:text-emerald-200', icon: 'text-sage-deep dark:text-emerald-300', hover: 'hover:border-sage-deep/35 dark:hover:border-emerald-600' },
]

const getCardColorScheme = (index: number) => {
  return cardColors[index % cardColors.length]
}

export function JobAssessmentCard({ assessment, cardIndex = 0, onViewDetails, onStart }: JobAssessmentCardProps) {
  const colors = getCardColorScheme(cardIndex)

  return (
  <motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  className={`${colors.bg} rounded-xl border ${colors.border} ${colors.hover} transition-all duration-300 hover:shadow-lg hover:-translate-y-1 group flex flex-col h-full`}
  >
  <div className="p-6 flex-1">
  {/* Header */}
  <div className="flex justify-between items-start mb-4">
  <div>
  <Badge variant="outline" className={`mb-2 bg-white/50 backdrop-blur-sm ${colors.text} border-current`}>
  {assessment.mode}
  </Badge>
  <h3 className="text-lg font-bold leading-tight text-slate-900 dark:text-emerald-50">
  {assessment.assessment_name}
  </h3>
  <p className="mt-1 font-mono text-xs text-slate-500 dark:text-emerald-400/80">
  {assessment.disha_assessment_id}
  </p>
  </div>
  </div>

  {/* Metrics */}
  <div className="grid grid-cols-2 gap-3 mb-6">
  <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-emerald-200/80">
  <Clock className={`w-4 h-4 ${colors.icon}`} />
  <span>{assessment.total_duration_minutes} mins</span>
  </div>
  <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-emerald-200/80">
  <Hash className={`w-4 h-4 ${colors.icon}`} />
  <span>{assessment.round_count} Rounds</span>
  </div>
  <div className="col-span-2 flex items-center gap-2 text-sm text-slate-600 dark:text-emerald-200/80">
  <Calendar className={`w-4 h-4 ${colors.icon}`} />
  <span>Created: {assessment.created_at ? new Date(assessment.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'N/A'}</span>
  </div>
  </div>
  </div>

  {/* Footer */}
  <div className="mt-auto flex gap-3 rounded-b-xl border-t border-slate-200/80 bg-white/40 p-4 pt-0 backdrop-blur-sm dark:border-emerald-800/60 dark:bg-emerald-950/20">
  <Button
  variant="outline"
  size="sm"
  className="flex-1 border-slate-200/90 bg-white text-slate-800 hover:bg-sage/10 dark:border-emerald-800 dark:bg-emerald-950/30 dark:text-emerald-100 dark:hover:bg-emerald-900/40"
  onClick={onViewDetails}
  >
  <Eye className="w-4 h-4 mr-2" />
  View Details
  </Button>
  <Button
  size="sm"
  className={`flex-1 text-white shadow-md transition-all hover:shadow-lg ${assessment.has_attempted
  ? 'cursor-default bg-emerald-700/85 hover:bg-emerald-700/85'
  : 'bg-sage-deep hover:bg-sage-deep/90 dark:bg-emerald-600 dark:hover:bg-emerald-500'
  }`}
  onClick={assessment.has_attempted ? undefined : onStart}
  >
  {assessment.has_attempted ? (
  <>
  <CheckCircle className="w-4 h-4 mr-2" />
  Completed
  </>
  ) : (
  <>
  <PlayCircle className="w-4 h-4 mr-2" />
  Start
  </>
  )}
  </Button>
  </div>
  </motion.div>
  )
}
