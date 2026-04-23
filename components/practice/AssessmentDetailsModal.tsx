
import { Fragment } from 'react'
import { Dialog, Transition } from '@headlessui/react'
import { X, Clock, Calendar, CheckCircle, Hash, Play, BookOpen, Target, Brain, Briefcase, Code, Calculator } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { JobAssessment } from '@/types/practice'

interface AssessmentDetailsModalProps {
  isOpen: boolean
  onClose: () => void
  assessment: JobAssessment | null
  onStart: (assessment: JobAssessment) => void
}

export function AssessmentDetailsModal({ isOpen, onClose, assessment, onStart }: AssessmentDetailsModalProps) {
  if (!assessment) return null

  const formatDuration = (minutes: number) => {
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60
  if (hours > 0) return `${hours}h ${mins}m`
  return `${mins}m`
  }

  return (
  <Transition appear show={isOpen} as={Fragment}>
  <Dialog as="div" className="relative z-50" onClose={onClose}>
  <Transition.Child
  as={Fragment}
  enter="ease-out duration-300"
  enterFrom="opacity-0"
  enterTo="opacity-100"
  leave="ease-in duration-200"
  leaveFrom="opacity-100"
  leaveTo="opacity-0"
  >
  <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" />
  </Transition.Child>

  <div className="fixed inset-0 overflow-y-auto">
  <div className="flex min-h-full items-center justify-center p-4 text-center">
  <Transition.Child
  as={Fragment}
  enter="ease-out duration-300"
  enterFrom="opacity-0 scale-95"
  enterTo="opacity-100 scale-100"
  leave="ease-in duration-200"
  leaveFrom="opacity-100 scale-100"
  leaveTo="opacity-0 scale-95"
  >
  <Dialog.Panel className="flex max-h-[85vh] w-full max-w-2xl transform flex-col overflow-hidden rounded-2xl border border-slate-200/90 bg-white text-left align-middle shadow-xl transition-all dark:border-emerald-800/70 dark:bg-emerald-950/50">
  {/* Header */}
  <div className="flex-shrink-0 border-b border-slate-200/90 bg-gradient-to-r from-sage/20 to-emerald-50/90 p-6 dark:border-emerald-800/60 dark:from-emerald-950 dark:to-slate-900">
  <div className="flex items-start justify-between">
  <div className="flex-1">
  <div className="flex items-center gap-3 mb-2">
  <Dialog.Title as="h3" className="text-2xl font-bold leading-6 text-slate-900 dark:text-emerald-50">
  {assessment.assessment_name}
  </Dialog.Title>
  <span className={`px-3 py-1 text-sm font-medium rounded-full ${assessment.status === 'ACTIVE'
  ? 'bg-emerald-100 text-emerald-900 dark:bg-emerald-900/45 dark:text-emerald-300'
  : 'bg-slate-100 text-slate-700 dark:bg-emerald-950/50 dark:text-emerald-300'
  }`}>
  {assessment.status}
  </span>
  </div>
  <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-emerald-200/85">
  <Briefcase className="w-4 h-4" />
  <span>Hiring Assessment</span>
  <span className="text-slate-300 dark:text-emerald-700">•</span>
  <span className="font-mono">{assessment.disha_assessment_id}</span>
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
  <div className="p-6 flex-1 overflow-y-auto">
  {/* Description */}
  <div className="mb-6">
  <h3 className="mb-3 flex items-center gap-2 text-base font-semibold text-slate-900 dark:text-emerald-50">
  <BookOpen className="h-5 w-5 text-sage-deep dark:text-emerald-400" />
  Description
  </h3>
  <p className="text-sm leading-relaxed text-slate-600 dark:text-emerald-200/85">
  This assessment is designed to evaluate your skills for the applied role.
  Please ensure you have a stable internet connection before starting.
  </p>
  </div>

  {/* Stats Grid */}
  <div className="grid grid-cols-2 gap-4 mb-6">
  <div className="flex items-center gap-3 rounded-lg border border-sage/40 bg-sage/15 p-4 dark:border-emerald-800/60 dark:bg-emerald-900/25">
  <div className="rounded-lg bg-sage/25 p-2 dark:bg-emerald-900/50">
  <Clock className="h-5 w-5 text-sage-deep dark:text-emerald-300" />
  </div>
  <div>
  <p className="mb-1 text-xs text-slate-600 dark:text-emerald-200/75">Duration</p>
  <p className="text-base font-bold text-sage-deep dark:text-emerald-200">
  {formatDuration(assessment.total_duration_minutes)}
  </p>
  </div>
  </div>

  <div className="flex items-center gap-3 rounded-lg border border-emerald-200/80 bg-emerald-50/80 p-4 dark:border-emerald-800/60 dark:bg-emerald-900/20">
  <div className="rounded-lg bg-emerald-100/90 p-2 dark:bg-emerald-900/50">
  <Hash className="h-5 w-5 text-emerald-700 dark:text-emerald-300" />
  </div>
  <div>
  <p className="mb-1 text-xs text-slate-600 dark:text-emerald-200/75">Rounds</p>
  <p className="text-base font-bold text-emerald-800 dark:text-emerald-200">
  {assessment.round_count} Rounds
  </p>
  </div>
  </div>

  <div className="flex items-center gap-3 rounded-lg border border-emerald-200/80 bg-emerald-50/80 p-4 dark:border-emerald-800/60 dark:bg-emerald-900/25">
  <div className="rounded-lg bg-emerald-100/90 p-2 dark:bg-emerald-900/50">
  <Brain className="h-5 w-5 text-emerald-800 dark:text-emerald-300" />
  </div>
  <div>
  <p className="mb-1 text-xs text-slate-600 dark:text-emerald-200/75">Mode</p>
  <p className="text-base font-bold text-emerald-900 dark:text-emerald-100">
  {assessment.mode || 'Online'}
  </p>
  </div>
  </div>

  <div className="flex items-center gap-3 rounded-lg border border-sage/40 bg-sage/15 p-4 dark:border-emerald-800/60 dark:bg-emerald-900/30">
  <div className="rounded-lg bg-sage/25 p-2 dark:bg-emerald-900/50">
  <Calendar className="h-5 w-5 text-sage-deep dark:text-emerald-300" />
  </div>
  <div>
  <p className="mb-1 text-xs text-slate-600 dark:text-emerald-200/75">Created</p>
  <p className="text-base font-bold text-sage-deep dark:text-emerald-200">
  {new Date(assessment.created_at).toLocaleDateString()}
  </p>
  </div>
  </div>
  </div>

  {/* Rounds List */}
  {assessment.rounds && assessment.rounds.length > 0 && (
  <div className="mb-6">
  <h4 className="mb-3 text-sm font-bold text-slate-900 dark:text-emerald-50">Assessment Rounds</h4>
  <div className="space-y-3">
  {assessment.rounds.map((round) => (
  <div
  key={round.id}
  className="flex items-center justify-between rounded-lg border border-slate-200/80 bg-sage/5 p-3 transition-all hover:bg-white hover:shadow-sm dark:border-emerald-800/50 dark:bg-emerald-950/30 dark:hover:bg-emerald-900/40"
  >
  <div className="flex items-center gap-3">
  <div className={`rounded-md p-2 ${round.round_type === 'aptitude' ? 'bg-sage/25 text-sage-deep dark:bg-emerald-900/40 dark:text-emerald-300' :
  round.round_type === 'coding' ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300' :
  'bg-slate-100 text-slate-600 dark:bg-emerald-950/50 dark:text-emerald-200/80'
  }`}>
  {round.round_type === 'coding' ? <Code className="w-4 h-4" /> :
  round.round_type === 'aptitude' ? <Calculator className="w-4 h-4" /> :
  <Brain className="w-4 h-4" />}
  </div>
  <div>
  <h5 className="text-sm font-medium text-slate-900 dark:text-emerald-50">
  {round.round_number}. {round.round_name}
  </h5>
  <p className="text-xs capitalize text-slate-500 dark:text-emerald-200/70">
  {round.round_type.replace('_', ' ')}
  </p>
  </div>
  </div>
  <div className="flex items-center gap-1.5 rounded border border-slate-200/90 bg-white px-2 py-1 text-xs font-medium text-slate-600 dark:border-emerald-800/60 dark:bg-emerald-950/50 dark:text-emerald-200/80">
  <Clock className="h-3 w-3 shrink-0 text-sage-deep dark:text-emerald-400" />
  {round.duration_minutes}m
  </div>
  </div>
  ))}
  </div>
  </div>
  )}

  {/* Instructions */}
  <div className="rounded-lg border border-sage/40 bg-gradient-to-br from-sage/15 to-emerald-50/80 p-5 dark:border-emerald-800/60 dark:from-emerald-950/60 dark:to-emerald-900/25">
  <h4 className="mb-3 flex items-center gap-2 text-sm font-bold text-sage-deep dark:text-emerald-100">
  <Target className="h-4 w-4" />
  Test Instructions
  </h4>
  <ul className="space-y-2 text-sm text-slate-700 dark:text-emerald-200/90">
  <li className="flex items-start gap-2">
  <span className="text-sage-deep dark:text-emerald-400">•</span>
  <span>Complete all rounds within the time limit.</span>
  </li>
  <li className="flex items-start gap-2">
  <span className="text-sage-deep dark:text-emerald-400">•</span>
  <span>Do not refresh the page during the assessment.</span>
  </li>
  <li className="flex items-start gap-2">
  <span className="text-sage-deep dark:text-emerald-400">•</span>
  <span>Ensure your camera and microphone are working if required.</span>
  </li>
  <li className="flex items-start gap-2">
  <span className="text-sage-deep dark:text-emerald-400">•</span>
  <span>Malpractice or tab switching may lead to disqualification.</span>
  </li>
  </ul>
  </div>
  </div>

  {/* Footer */}
  <div className="flex-shrink-0 border-t border-slate-200/90 bg-white p-6 dark:border-emerald-800/60 dark:bg-emerald-950/40">
  <div className="flex gap-3">
  <Button
  variant="outline"
  onClick={onClose}
  className="flex-1 py-6 text-sm font-medium transition-all duration-200 hover:bg-sage/10 dark:hover:bg-emerald-900/40"
  >
  Close
  </Button>
  <Button
  onClick={() => onStart(assessment)}
  className="flex-1 bg-gradient-to-r from-sage-deep to-emerald-600 py-6 text-sm font-medium text-white shadow-lg transition-all duration-200 hover:from-sage-deep/95 hover:to-emerald-600/95 hover:shadow-xl dark:from-emerald-700 dark:to-emerald-500 dark:hover:from-emerald-600 dark:hover:to-emerald-400"
  >
  <Play className="w-5 h-5 mr-2" />
  Start Assessment
  </Button>
  </div>
  </div>
  </Dialog.Panel>
  </Transition.Child>
  </div>
  </div>
  </Dialog>
  </Transition>
  )
}
