"use client"

import { useState, useEffect, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft, Clock, Flag, CheckCircle, Circle, ChevronLeft, ChevronRight, Monitor, Maximize2, X, User } from 'lucide-react'
import { PracticeModule, Question, ExamSession, QuestionAnswer } from '@/types/practice'
import { Button } from '@/components/ui/button'
import { QuestionTabsBar } from './QuestionTabsBar'
import { QuestionPanel } from './QuestionPanel'
import { OptionsPanel } from './OptionsPanel'
import { ExamTimer } from './ExamTimer'
import { usePracticeQuestions } from '@/hooks/usePractice'
import { useExamSession } from '@/hooks/useExamSession'
import { useStudentProfile } from '@/hooks/useStudentProfile'
import { useAuth } from '@/hooks/useAuth'
import { toast } from 'react-hot-toast'
import { useRouter } from 'next/navigation'

interface PracticeExamProps {
  module: PracticeModule
  onComplete: (result: any) => void
  onBack: () => void
}

// Helper to add/remove a class to body for hiding sidebar
function setSidebarHidden(hidden: boolean) {
  if (typeof document !== 'undefined') {
  if (hidden) {
  document.body.classList.add('hide-sidebar')
  } else {
  document.body.classList.remove('hide-sidebar')
  }
  }
}

// Updated style block incorporating themes from StudentProfile (gradients, backdrops, rounded cards, shadows, hover effects)
const fullscreenExamStyle = `
/* CSS variables — sage / emerald dashboard theme (matches Library & Video Search) */
:root {
  --exam-bg: #f8fafc;
  --exam-header-bg: #ffffff;
  --exam-header-color: #334155;
  --exam-border: #e2e8f0;
  --question-footer-bg: #ffffff;
  --question-footer-border: #e2e8f0;
  --question-content-bg: #ffffff;
  --question-content-text: #0f172a;
  --option-bg: #f8fafc;
  --option-border: #cbd5e1;
  --option-text: #0f172a;
  --option-hover-bg: #f1f5f9;
  --option-selected-bg: rgba(163, 177, 138, 0.22);
  --option-selected-border: #8f9f78;
  --button-primary-bg: linear-gradient(to right, #8f9f78, #6d7d62);
  --button-primary-text: white;
  --button-secondary-bg: #f1f5f9;
  --button-secondary-text: #475569;
  --card-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
  --hover-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
  --backdrop-blur: blur(8px);
}

.dark {
  --exam-bg: #022c22;
  --exam-header-bg: #064e3b;
  --exam-header-color: #ecfdf5;
  --exam-border: rgba(16, 185, 129, 0.35);
  --question-footer-bg: #064e3b;
  --question-footer-border: rgba(16, 185, 129, 0.35);
  --question-content-bg: #064e3b;
  --question-content-text: #ecfdf5;
  --option-bg: rgba(6, 78, 59, 0.55);
  --option-border: rgba(52, 211, 153, 0.45);
  --option-text: #ecfdf5;
  --option-hover-bg: rgba(6, 95, 70, 0.75);
  --option-selected-bg: rgba(16, 185, 129, 0.28);
  --option-selected-border: #34d399;
  --button-primary-bg: linear-gradient(to right, #15803d, #059669);
  --button-primary-text: white;
  --button-secondary-bg: rgba(6, 78, 59, 0.8);
  --button-secondary-text: #d1fae5;
}

.fullscreen-exam {
  position: fixed !important;
  top: 0; left: 0; right: 0; bottom: 0;
  width: 100vw; height: 100vh;
  z-index: 9999;
  background: var(--exam-bg);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  padding: 0;
  max-width: 100% !important;
  max-height: 100% !important;
  font-family: inherit;
}

.fullscreen-exam .exam-header {
  background: var(--exam-header-bg);
  color: var(--exam-header-color);
  border-bottom: 1px solid var(--exam-border);
  box-shadow: var(--card-shadow);
}

.fullscreen-exam .exam-content {
  flex: 1;
  display: flex;
  gap: 1rem; /* gap-4 */
  width: 100%;
  height: calc(100vh - 130px);
  overflow: hidden;
  padding: 1rem;
}

.fullscreen-exam .question-container {
  flex: 1;
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: hidden;
  background: var(--question-content-bg);
  border-radius: 1rem; /* rounded-xl */
  border: 1px solid var(--exam-border); /* border-gray-200/50 */
  box-shadow: var(--card-shadow);
  transition: all 0.3s ease; /* transition-all duration-300 */
}

.fullscreen-exam .question-container:hover {
  box-shadow: var(--hover-shadow);
  transform: translateY(-2px); /* hover:-translate-y-1 */
}

.fullscreen-exam .question-content {
  flex: 1;
  overflow-y: auto;
  padding: 1.5rem; /* p-6 */
  background: rgba(255, 255, 255, 0.8); /* bg-white/80 */
  backdrop-filter: var(--backdrop-blur); /* backdrop-blur-sm */
  color: var(--question-content-text);
}

.dark .fullscreen-exam .question-content {
  background: rgba(6, 78, 59, 0.72);
}

.fullscreen-exam .question-footer {
  position: sticky;
  bottom: 0;
  width: 100%;
  background: var(--question-footer-bg);
  border-top: 1px solid var(--question-footer-border);
  padding: 1rem;
  box-shadow: var(--card-shadow);
}

.fullscreen-exam .question-palette {
  width: 280px;
  height: 100%;
  overflow-y: auto;
  background: var(--question-content-bg);
  border-left: 1px solid var(--exam-border);
  border-radius: 1rem;
  border: 1px solid var(--exam-border);
  box-shadow: var(--card-shadow);
  transition: all 0.3s ease;
}

.fullscreen-exam .question-palette:hover {
  box-shadow: var(--hover-shadow);
}

.fullscreen-exam .option-item {
  background: var(--option-bg);
  border: 1px solid var(--option-border);
  color: var(--option-text);
  border-radius: 0.5rem; /* rounded-lg */
  transition: all 0.2s ease;
}

.fullscreen-exam .option-item:hover {
  background: var(--option-hover-bg);
  transform: translateY(-1px);
  box-shadow: var(--card-shadow);
}

.fullscreen-exam .option-item.selected {
  background: var(--option-selected-bg);
  border-color: var(--option-selected-border);
}

.fullscreen-exam button.primary {
  background: var(--button-primary-bg);
  color: var(--button-primary-text);
  border-radius: 0.5rem;
  transition: all 0.2s ease;
}

.fullscreen-exam button.primary:hover {
  opacity: 0.9;
  transform: translateY(-1px);
  box-shadow: var(--hover-shadow);
}

.fullscreen-exam button.secondary {
  background: var(--button-secondary-bg);
  color: var(--button-secondary-text);
  border-radius: 0.5rem;
  transition: all 0.2s ease;
}

.fullscreen-exam button.secondary:hover {
  background: var(--option-hover-bg);
}

@media (max-width: 1024px) {
  .fullscreen-exam .exam-content {
  flex-direction: column;
  padding: 0;
  height: calc(100vh - 60px);
  }
  .fullscreen-exam .question-palette {
  width: 100%;
  height: auto;
  max-height: 200px;
  }
}

/* Browser-specific fullscreen selectors */
:fullscreen {
  width: 100vw !important;
  height: 100vh !important;
  max-width: 100vw !important;
  max-height: 100vh !important;
}

:-webkit-full-screen {
  width: 100vw !important;
  height: 100vh !important;
  max-width: 100vw !important;
  max-height: 100vh !important;
}

:-ms-fullscreen {
  width: 100vw !important;
  height: 100vh !important;
  max-width: 100vw !important;
  max-height: 100vh !important;
}

/* Additional StudentProfile-inspired styles: gradients, badges, icons */
.fullscreen-exam .gradient-header {
  background: linear-gradient(to right, #8f9f78, #15803d);
  border-radius: 1rem;
  padding: 1.5rem;
  margin-bottom: 1.5rem;
}

.fullscreen-exam .stat-badge {
  display: inline-flex;
  items-center;
  px-3;
  py-1;
  rounded-full;
  text-sm;
  font-medium;
  background: rgba(163, 177, 138, 0.25);
  color: #3f4f32;
  border: 1px solid rgba(143, 159, 120, 0.65);
}

.dark .fullscreen-exam .stat-badge {
  background: rgba(16, 185, 129, 0.2);
  color: #a7f3d0;
  border-color: rgba(52, 211, 153, 0.45);
}

.fullscreen-exam .icon-circle {
  display: flex;
  items-center;
  justify-center;
  width: 3rem;
  height: 3rem;
  border-radius: 0.75rem;
  background: linear-gradient(to right, #8f9f78, #15803d);
  box-shadow: var(--card-shadow);
}
`

export function PracticeExam({ module, onComplete, onBack }: PracticeExamProps) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [questionResults, setQuestionResults] = useState<Record<string, {
  correct: boolean
  score: number
  maxScore: number
  feedback?: string
  }>>({})
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [isExitingFullscreen, setIsExitingFullscreen] = useState(false)
  const [showFullscreenPrompt, setShowFullscreenPrompt] = useState(false)
  const [isManualSubmit, setIsManualSubmit] = useState(false)

  const { data: questions, isLoading } = usePracticeQuestions(module.id)
  const { session, updateAnswer, updateTimeSpent, toggleFlag, submitExam } = useExamSession(module.id)
  const { user } = useAuth()
  const { profile, isLoading: profileLoading } = useStudentProfile()
  const router = useRouter()

  const currentQuestion = questions?.[currentQuestionIndex]
  const totalQuestions = questions?.length || 0

  // Get question status for the dashboard
  const getQuestionStatus = useCallback((questionId: string) => {
  if (session?.isSubmitted) return 'submitted'
  const isFlagged = session?.flaggedQuestions.has(questionId)
  const hasAnswer = !!(session?.answers[questionId] && session.answers[questionId].length > 0)
  if (isFlagged && hasAnswer) return 'marked-answered'
  if (isFlagged) return 'flagged'
  if (hasAnswer) return 'answered'
  return 'not-visited'
  }, [session])

  // Auto-save progress
  useEffect(() => {
  const interval = setInterval(() => {
  if (session && !session.isSubmitted) {
  console.log('Auto-saving exam progress...')
  }
  }, 10000)
  return () => clearInterval(interval)
  }, [session])

  // Auto-enter fullscreen when exam loads
  useEffect(() => {
  if (!session || session.isSubmitted) return;

  // Check if already in fullscreen
  const alreadyFullscreen = !!(document.fullscreenElement || (document as any).webkitFullscreenElement || (document as any).msFullscreenElement);
  if (alreadyFullscreen) {
  setIsFullscreen(true);
  setSidebarHidden(true);
  setShowFullscreenPrompt(false);
  return;
  }

  // Small delay to ensure the page has fully loaded
  const timer = setTimeout(async () => {
  try {
  const elem: any = document.documentElement;
  if (elem.requestFullscreen) {
  await elem.requestFullscreen({ navigationUI: 'hide' } as any);
  } else if (elem.mozRequestFullScreen) {
  await elem.mozRequestFullScreen();
  } else if (elem.webkitRequestFullscreen) {
  await elem.webkitRequestFullscreen();
  } else if (elem.msRequestFullscreen) {
  await elem.msRequestFullscreen();
  }

  // Verify fullscreen engaged
  const becameFullscreen = !!(document.fullscreenElement || (document as any).webkitFullscreenElement || (document as any).msFullscreenElement);
  if (becameFullscreen) {
  setIsFullscreen(true);
  setSidebarHidden(true);
  setShowFullscreenPrompt(false);
  toast.success('Test started in fullscreen mode');
  } else {
  // Show manual prompt if automatic fullscreen failed
  setShowFullscreenPrompt(true);
  }
  } catch (error) {
  console.error('Failed to enter fullscreen:', error);
  // Show manual prompt if automatic fullscreen failed
  setShowFullscreenPrompt(true);
  }
  }, 300);

  return () => clearTimeout(timer);
  }, [session]);

  // Updated fullscreen handling logic
  useEffect(() => {
  if (!session) return;

  const fullscreenChange = async () => {
  const fs = document.fullscreenElement || (document as any).webkitFullscreenElement || (document as any).msFullscreenElement
  const isNowFullscreen = !!fs;

  if (isNowFullscreen && !isFullscreen) {
  setIsFullscreen(true)
  setSidebarHidden(true)
  return;
  }

  // Only auto-submit when exiting fullscreen mode AND it's not a manual submit
  if (!isNowFullscreen && isFullscreen) {
  setIsFullscreen(false)
  setSidebarHidden(false)

  // Auto-submit only when exiting fullscreen and not already submitted and NOT a manual submit
  if (session && !session.isSubmitted && !isExitingFullscreen && !isManualSubmit) {
  setIsExitingFullscreen(true)
  toast.error("Exam submitted - Full screen mode was exited")
  try {
  await handleSubmitAndRedirect()
  } catch (error) {
  console.error("Error submitting exam:", error)
  window.location.href = '/dashboard/student/practice'
  }
  }
  }
  }

  document.addEventListener('fullscreenchange', fullscreenChange)
  document.addEventListener('webkitfullscreenchange', fullscreenChange)
  document.addEventListener('msfullscreenchange', fullscreenChange)

  return () => {
  document.removeEventListener('fullscreenchange', fullscreenChange)
  document.removeEventListener('webkitfullscreenchange', fullscreenChange)
  document.removeEventListener('msfullscreenchange', fullscreenChange)
  // Do not toggle sidebar visibility or exit fullscreen here, as this cleanup
  // runs on every dependency change and would immediately exit fullscreen.
  }
  }, [session, isFullscreen, isExitingFullscreen, isManualSubmit])

  // On component unmount only: restore sidebar and exit fullscreen if still active
  useEffect(() => {
  return () => {
  try {
  setSidebarHidden(false)
  if (document.fullscreenElement || (document as any).webkitFullscreenElement || (document as any).msFullscreenElement) {
  if (document.exitFullscreen) {
  document.exitFullscreen()
  } else if ((document as any).webkitExitFullscreen) {
  (document as any).webkitExitFullscreen()
  } else if ((document as any).msExitFullscreen) {
  (document as any).msExitFullscreen()
  }
  }
  } catch (error) {
  console.error('Failed to cleanup fullscreen on unmount:', error)
  }
  }
  }, [])

  // Keyboard shortcuts (unchanged)
  useEffect(() => {
  const handleKeyPress = (e: KeyboardEvent) => {
  if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
  return
  }

  switch (e.key.toLowerCase()) {
  case 'n':
  handleNext()
  break
  case 'p':
  handlePrevious()
  break
  case '1':
  case '2':
  case '3':
  case '4':
  case '5':
  case '6':
  case '7':
  case '8':
  case '9':
  const questionNum = parseInt(e.key) - 1
  if (questionNum < totalQuestions) {
  setCurrentQuestionIndex(questionNum)
  }
  break
  }
  }

  if (typeof window !== 'undefined') {
  window.addEventListener('keydown', handleKeyPress)
  return () => window.removeEventListener('keydown', handleKeyPress)
  }
  }, [totalQuestions])

  // Add styles to head
  useEffect(() => {
  let styleTag: HTMLStyleElement | null = null;
  if (typeof document !== 'undefined') {
  styleTag = document.createElement('style');
  styleTag.innerHTML = fullscreenExamStyle;
  document.head.appendChild(styleTag);
  }
  return () => {
  if (styleTag && document.head.contains(styleTag)) {
  document.head.removeChild(styleTag);
  }
  };
  }, []);

  const handleNext = () => {
  if (currentQuestionIndex < totalQuestions - 1) {
  setCurrentQuestionIndex(currentQuestionIndex + 1)
  }
  }

  const handlePrevious = () => {
  if (currentQuestionIndex > 0) {
  setCurrentQuestionIndex(currentQuestionIndex - 1)
  }
  }

  const handleQuestionSelect = (index: number) => {
  setCurrentQuestionIndex(index)
  }

  const handleAnswerChange = (answer: string[]) => {
  if (currentQuestion) {
  updateAnswer(currentQuestion.id, answer)
  }
  }

  const handleTimeSpent = (timeSpent: number) => {
  if (currentQuestion) {
  updateTimeSpent(currentQuestion.id, timeSpent)
  }
  }

  const handleFlagToggle = () => {
  if (currentQuestion) {
  toggleFlag(currentQuestion.id)
  }
  }

  const handleClearResponse = () => {
  if (currentQuestion) {
  updateAnswer(currentQuestion.id, [])
  }
  }

  const handleMarkForReviewAnswered = () => {
  if (!currentQuestion) return
  const qid = currentQuestion.id
  const hasAnswer = !!(session?.answers[qid] && session!.answers[qid].length > 0)
  // Ensure question is flagged; palette color will depend on whether it's answered
  if (!session?.flaggedQuestions.has(qid)) {
  toggleFlag(qid)
  }
  handleNext()
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
  if (becameFullscreen) {
  setIsFullscreen(true)
  setSidebarHidden(true)
  setShowFullscreenPrompt(false)
  toast.success('Test started in fullscreen mode')
  } else {
  toast.error('Fullscreen was blocked. Please allow fullscreen for this site and try again.')
  }
  } catch (error) {
  console.error('Failed to enter fullscreen:', error)
  toast.error('Unable to enter fullscreen. Please click again or check browser settings.')
  }
  }

  const handleSubmit = async () => {
  if (!questions || !session) return

  // Set flag to prevent auto-submit when exiting fullscreen
  setIsManualSubmit(true)

  // Exit fullscreen before submitting
  if (document.fullscreenElement || (document as any).webkitFullscreenElement || (document as any).msFullscreenElement) {
  if (document.exitFullscreen) {
  await document.exitFullscreen()
  } else if ((document as any).webkitExitFullscreen) {
  await (document as any).webkitExitFullscreen()
  } else if ((document as any).msExitFullscreen) {
  await (document as any).msExitFullscreen()
  }
  }

  try {
  const result = await submitExam()
  if (result.question_results && Array.isArray(result.question_results)) {
  const resultsMap: Record<string, {
  correct: boolean
  score: number
  maxScore: number
  feedback?: string
  }> = {}
  result.question_results.forEach((qr: any) => {
  resultsMap[qr.question_id] = {
  correct: qr.correct || false,
  score: qr.score || 0,
  maxScore: qr.max_score || 1,
  feedback: qr.feedback
  }
  })
  setQuestionResults(resultsMap)
  }
  // Show success message for manual submission
  toast.success('Test submitted successfully! ')
  onComplete(result)
  } catch (error) {
  toast.error('Failed to submit exam. Please try again.')
  console.error('Submit error:', error)
  } finally {
  // Reset the manual submit flag
  setIsManualSubmit(false)
  }
  }

  const handleSubmitAndRedirect = async () => {
  if (!session) return
  try {
  setIsExitingFullscreen(true)
  // Perform submission first to ensure results are available
  const result = await submitExam()
  if (result?.question_results && Array.isArray(result.question_results)) {
  const resultsMap: Record<string, {
  correct: boolean
  score: number
  maxScore: number
  feedback?: string
  }> = {}
  result.question_results.forEach((qr: any) => {
  resultsMap[qr.question_id] = {
  correct: qr.correct || false,
  score: qr.score || 0,
  maxScore: qr.max_score || 1,
  feedback: qr.feedback
  }
  })
  setQuestionResults(resultsMap)
  }
  // Let parent flow handle result display (same as manual submit)
  onComplete(result)
  } catch (error) {
  console.error('Auto submit error:', error)
  toast.error('Failed to finalize results. Redirecting to dashboard...')
  try {
  router.push('/dashboard/student/practice')
  } catch {
  window.location.href = '/dashboard/student/practice'
  }
  }
  }

  if (isLoading) {
  return (
  <div className="flex min-h-[400px] items-center justify-center rounded-xl bg-white/80 shadow-sm backdrop-blur-sm dark:bg-emerald-950/50">
  <div className="h-12 w-12 animate-spin rounded-full border-2 border-sage-deep border-t-transparent dark:border-emerald-400"></div>
  </div>
  )
  }

  if (!questions || questions.length === 0) {
  return (
  <div className="bg-red-50/80 dark:bg-red-900/20 border border-red-200/50 dark:border-red-700 rounded-xl p-6 backdrop-blur-sm">
  <h3 className="text-lg font-medium text-red-900 dark:text-red-100 mb-2">
  No Questions Available
  </h3>
  <p className="text-red-700 dark:text-red-300 mb-4">
  This practice module doesn't have any questions yet.
  </p>
  </div>
  )
  }

  return (
  <div className="fullscreen-exam">
  {/* Header - with gradient and shadow */}
  <div className="exam-header p-6 shadow-sm">
  <div className="flex items-center justify-between max-w-7xl mx-auto">
  <div className="flex items-center gap-4">
  <div>
  <h1 className="mb-1 text-xl font-bold text-slate-900 dark:text-emerald-50">
  {module.title}
  </h1>
  <p className="text-sm text-slate-600 dark:text-emerald-200/85">
  Question {currentQuestionIndex + 1} of {totalQuestions}
  </p>
  </div>
  </div>

  <div className="flex items-center gap-6">
  {/* {!isFullscreen && !session?.isSubmitted && (
  <Button
  onClick={handleEnterFullscreen}
  variant="outline"
  size="lg"
  className="hover:-translate-y-0.5 transition-all duration-200"
  >
  <Maximize2 className="w-4 h-4 mr-2" />
  Enter Fullscreen
  </Button>
  )} */}

  <ExamTimer
  duration={module.duration_seconds}
  onTimeUp={handleSubmit}
  />
  </div>
  </div>
  </div>

  {/* Main Content */}
  <div className="exam-content">
  {/* Left Panel - Question */}
  <div className="question-container">
  {/* Question Header */}
  <div className="border-b border-slate-200/80 bg-sage/10 px-6 py-4 backdrop-blur-sm dark:border-emerald-800/60 dark:bg-emerald-950/40">
  <div className="flex items-center justify-between">
  <div className="flex items-center gap-4">
  <span className="text-sm font-medium text-slate-600 dark:text-emerald-200/90">Question {currentQuestionIndex + 1}</span>
  {session?.flaggedQuestions.has(currentQuestion?.id || '') && (
  <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-yellow-50/80 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-200 text-xs font-medium border border-yellow-200/50 dark:border-yellow-700/50 backdrop-blur-sm">
  <Flag className="w-3 h-3" />
  Marked for Review
  </span>
  )}
  </div>
  <div className="text-sm text-slate-500 dark:text-emerald-300/70">
  Single Choice • Mark for Review
  </div>
  </div>
  </div>

  {/* Question Content */}
  <div className="question-content">
  <QuestionPanel
  question={currentQuestion!}
  questionNumber={currentQuestionIndex + 1}
  onTimeSpent={handleTimeSpent}
  />
  <OptionsPanel
  key={currentQuestion?.id}
  question={currentQuestion!}
  answer={session?.answers[currentQuestion?.id || ''] || []}
  isFlagged={session?.flaggedQuestions.has(currentQuestion?.id || '') || false}
  onAnswerChange={handleAnswerChange}
  onFlagToggle={handleFlagToggle}
  isSubmitted={session?.isSubmitted || false}
  questionResult={currentQuestion ? questionResults[currentQuestion.id] : undefined}
  />
  </div>

  {/* Navigation Footer */}
  <div className="question-footer">
  <div className="flex items-center justify-between">
  <div className="flex items-center gap-3">
  <Button
  onClick={handlePrevious}
  disabled={currentQuestionIndex === 0}
  variant="outline"
  size="lg"
  className="hover:-translate-y-0.5 transition-all duration-200"
  >
  <ChevronLeft className="w-4 h-4 mr-2" />
  Previous
  </Button>

  {/* Removed standalone Mark for Review button */}

  <Button
  onClick={handleMarkForReviewAnswered}
  variant="outline"
  size="lg"
  className="text-slate-700 transition-all duration-200 hover:-translate-y-0.5 hover:bg-sage/10 dark:text-emerald-100 dark:hover:bg-emerald-900/40"
  >
  <CheckCircle className="w-4 h-4 mr-2" />
  Mark for Review
  </Button>

  <Button
  onClick={handleClearResponse}
  variant="outline"
  size="lg"
  className="text-slate-700 transition-all duration-200 hover:-translate-y-0.5 hover:bg-sage/10 dark:text-emerald-100 dark:hover:bg-emerald-900/40"
  disabled={!session?.answers[currentQuestion?.id || ''] || session.answers[currentQuestion?.id || '']?.length === 0}
  >
  <X className="w-4 h-4 mr-2" />
  Clear Response
  </Button>
  </div>

  <div className="flex items-center gap-3">
  {currentQuestionIndex === totalQuestions - 1 ? (
  <Button
  onClick={handleSubmit}
  size="lg"
  className="bg-gradient-to-r from-sage-deep to-emerald-600 px-8 text-white shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:from-sage-deep/95 hover:to-emerald-600/95 dark:from-emerald-700 dark:to-emerald-500 dark:hover:from-emerald-600 dark:hover:to-emerald-400"
  >
  Submit Exam
  </Button>
  ) : (
  <Button
  onClick={handleNext}
  size="lg"
  className="bg-gradient-to-r from-sage-deep to-emerald-600 px-8 text-white shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:from-sage-deep/95 hover:to-emerald-600/95 dark:from-emerald-700 dark:to-emerald-500 dark:hover:from-emerald-600 dark:hover:to-emerald-400"
  >
  Next
  <ChevronRight className="w-4 h-4 ml-2" />
  </Button>
  )}
  </div>
  </div>
  </div>
  </div>

  {/* Right Panel - Question Dashboard */}
  <div className="question-palette">
  <div className="h-full border-l border-slate-200/80 bg-white/90 backdrop-blur-sm dark:border-emerald-800/50 dark:bg-emerald-950/40">
  {/* Profile Section - styled like StudentProfile avatar */}
  <div className="flex items-center space-x-3 border-b border-slate-200/80 p-4 dark:border-emerald-800/50">
  <div className="flex-shrink-0">
  {profile?.profile_picture ? (
  <img
  src={profile.profile_picture}
  alt={profile?.name || 'Student'}
  className="h-10 w-10 rounded-full border-2 border-slate-200 object-cover dark:border-emerald-700/60"
  onError={(e) => {
  (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${profile?.name || 'Student'}&background=8f9f78&color=fff`;
  }}
  />
  ) : (
  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-sage-deep to-emerald-600 text-white shadow-sm dark:from-emerald-700 dark:to-emerald-500">
  <User className="h-5 w-5" />
  </div>
  )}
  </div>
  <div className="flex-1 min-w-0">
  <p className="truncate text-sm font-medium text-slate-900 dark:text-emerald-50">
  {profile?.name || user?.name || 'Student'}
  </p>
  <p className="truncate text-xs text-slate-500 dark:text-emerald-200/75">
  {profile?.institution || 'University Student'}
  </p>
  </div>
  </div>

  {/* Dashboard Header */}
  <div className="border-b border-slate-200/80 bg-sage/10 px-4 py-3 backdrop-blur-sm dark:border-emerald-800/50 dark:bg-emerald-950/50">
  <h3 className="font-semibold text-slate-900 dark:text-emerald-50">Question Palette</h3>
  </div>

  {/* Awareness Stats - gradient cards like StudentProfile */}
  <div className="border-b border-slate-200/80 p-4 dark:border-emerald-800/50">
  <div className="grid grid-cols-2 gap-3 text-sm">
  <div className="rounded-lg border border-emerald-200/70 bg-gradient-to-r from-sage/20 to-emerald-50/90 p-2 text-center backdrop-blur-sm dark:border-emerald-700/50 dark:from-emerald-900/35 dark:to-emerald-950/40">
  <div className="font-semibold text-sage-deep dark:text-emerald-200">
  {Object.keys(session?.answers || {}).length}
  </div>
  <div className="text-emerald-800/90 dark:text-emerald-300/90">Answered</div>
  </div>
  <div className="text-center p-2 bg-gradient-to-r from-red-50/80 to-rose-50/80 dark:from-red-900/20 dark:to-rose-900/20 rounded-lg border border-red-200/50 dark:border-red-700/50 backdrop-blur-sm">
  <div className="text-red-700 dark:text-red-200 font-semibold">
  {totalQuestions - Object.keys(session?.answers || {}).length}
  </div>
  <div className="text-red-600 dark:text-red-300">Not Answered</div>
  </div>
  <div className="text-center p-2 bg-gradient-to-r from-yellow-50/80 to-amber-50/80 dark:from-yellow-900/20 dark:to-amber-900/20 rounded-lg border border-yellow-200/50 dark:border-yellow-700/50 backdrop-blur-sm">
  <div className="text-yellow-700 dark:text-yellow-200 font-semibold">
  {questions?.filter(q => session?.flaggedQuestions.has(q.id) && (!session?.answers[q.id] || session!.answers[q.id].length === 0)).length || 0}
  </div>
  <div className="text-yellow-600 dark:text-yellow-300">Marked</div>
  </div>
  <div className="rounded-lg border border-sage/40 bg-gradient-to-r from-sage/25 to-emerald-100/80 p-2 text-center backdrop-blur-sm dark:border-emerald-700/50 dark:from-emerald-900/35 dark:to-emerald-800/25">
  <div className="font-semibold text-sage-deep dark:text-emerald-200">
  {questions?.filter(q => session?.flaggedQuestions.has(q.id) && (session?.answers[q.id] && session!.answers[q.id].length > 0)).length || 0}
  </div>
  <div className="text-sage-deep/90 dark:text-emerald-300/90">Marked & Answered</div>
  </div>
  <div className="rounded-lg border border-sage/40 bg-gradient-to-r from-sage/25 to-emerald-100/80 p-2 text-center backdrop-blur-sm dark:border-emerald-700/50 dark:from-emerald-900/35 dark:to-emerald-800/25">
  <div className="font-semibold text-sage-deep dark:text-emerald-200">
  {totalQuestions}
  </div>
  <div className="text-sage-deep/90 dark:text-emerald-300/90">Total</div>
  </div>
  </div>
  </div>

  {/* Question Grid */}
  <div className="p-4">
  <div className="grid grid-cols-5 gap-2">
  {Array.from({ length: totalQuestions }, (_, i) => {
  const question = questions[i]
  const status = getQuestionStatus(question.id)
  const isCurrent = currentQuestionIndex === i

  const getButtonStyle = () => {
  if (isCurrent) {
  return 'border-sage-deep bg-gradient-to-r from-sage-deep to-emerald-600 text-white shadow-md hover:shadow-lg dark:from-emerald-700 dark:to-emerald-500'
  }

  switch (status) {
  case 'answered':
  return 'border-sage-deep bg-gradient-to-r from-sage-deep to-emerald-600 text-white hover:from-sage-deep/95 hover:to-emerald-700 dark:border-emerald-500 dark:from-emerald-700 dark:to-emerald-500 dark:hover:from-emerald-600 dark:hover:to-emerald-400'
  case 'marked-answered':
  return 'border-emerald-800 bg-gradient-to-r from-emerald-700 to-teal-600 text-white hover:from-emerald-600 hover:to-teal-500 dark:from-emerald-800 dark:to-teal-700'
  case 'flagged':
  return 'bg-gradient-to-r from-yellow-500 to-amber-600 text-white border-yellow-500 hover:from-yellow-600 hover:to-amber-700'
  case 'not-visited':
  return 'bg-gradient-to-r from-red-500 to-rose-600 text-white border-red-500 hover:from-red-600 hover:to-rose-700'
  default:
  return 'border-slate-300 bg-white/90 text-slate-700 hover:bg-sage/10 dark:border-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-100 dark:hover:bg-emerald-900/50'
  }
  }

  return (
  <Button
  key={i}
  variant="outline"
  className={`w-10 h-10 p-0 text-sm font-medium transition-all duration-200 hover:-translate-y-0.5 ${getButtonStyle()}`}
  onClick={() => handleQuestionSelect(i)}
  disabled={session?.isSubmitted}
  >
  {i + 1}
  </Button>
  )
  })}
  </div>
  </div>

  {/* Legend - with badges */}
  <div className="border-t border-slate-200/80 p-4 backdrop-blur-sm dark:border-emerald-800/50">
  <div className="space-y-2 text-xs">
  <div className="flex items-center gap-2">
  <div className="h-3 w-3 rounded bg-gradient-to-r from-sage-deep to-emerald-600 dark:from-emerald-600 dark:to-emerald-400"></div>
  <span className="text-slate-600 dark:text-emerald-200/85">Answered</span>
  </div>
  <div className="flex items-center gap-2">
  <div className="h-3 w-3 rounded bg-gradient-to-r from-red-500 to-rose-600"></div>
  <span className="text-slate-600 dark:text-emerald-200/85">Not Answered</span>
  </div>
  <div className="flex items-center gap-2">
  <div className="h-3 w-3 rounded bg-gradient-to-r from-yellow-500 to-amber-600"></div>
  <span className="text-slate-600 dark:text-emerald-200/85">Marked for Review</span>
  </div>
  <div className="flex items-center gap-2">
  <div className="h-3 w-3 rounded bg-gradient-to-r from-sage-deep to-emerald-600 dark:from-emerald-700 dark:to-emerald-500"></div>
  <span className="text-slate-600 dark:text-emerald-200/85">Current Question</span>
  </div>
  </div>
  </div>
  </div>
  </div>
  </div>

  {/* Fullscreen Prompt Overlay */}
  {showFullscreenPrompt && (
  <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-gradient-to-br from-emerald-950/95 via-slate-900/95 to-emerald-900/90 backdrop-blur-md">
  <div className="mx-4 w-full max-w-md transform rounded-2xl bg-white p-8 text-center shadow-2xl transition-all duration-300 hover:scale-105 dark:border dark:border-emerald-800/60 dark:bg-emerald-950">
  <div className="mb-6">
  <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-sage-deep to-emerald-600 shadow-lg dark:from-emerald-700 dark:to-emerald-500">
  <Maximize2 className="w-10 h-10 text-white" />
  </div>
  </div>

  <h2 className="mb-3 text-2xl font-bold text-slate-900 dark:text-emerald-50">
  Start Test in Fullscreen
  </h2>

  <p className="mb-6 leading-relaxed text-slate-600 dark:text-emerald-200/85">
  This test requires fullscreen mode for the best experience.
  Click the button below to enter fullscreen and begin your test.
  </p>

  <div className="space-y-3">
  <Button
  onClick={handleEnterFullscreen}
  size="lg"
  className="w-full transform rounded-xl bg-gradient-to-r from-sage-deep to-emerald-600 py-4 font-semibold text-white shadow-lg transition-all duration-200 hover:-translate-y-1 hover:from-sage-deep/95 hover:to-emerald-600/95 hover:shadow-xl dark:from-emerald-700 dark:to-emerald-500 dark:hover:from-emerald-600 dark:hover:to-emerald-400"
  >
  <Maximize2 className="w-5 h-5 mr-2" />
  Enter Fullscreen & Start Test
  </Button>

  <Button
  onClick={onBack}
  variant="outline"
  size="lg"
  className="w-full rounded-xl border-slate-300 py-4 hover:bg-sage/10 dark:border-emerald-800 dark:hover:bg-emerald-900/40"
  >
  <ArrowLeft className="w-5 h-5 mr-2" />
  Back to Dashboard
  </Button>
  </div>

  <div className="mt-6 rounded-xl border border-sage/40 bg-sage/15 p-4 dark:border-emerald-800/60 dark:bg-emerald-900/30">
  <p className="text-xs leading-relaxed text-sage-deep dark:text-emerald-200/90">
  <strong>Note:</strong> The test will automatically submit if you exit fullscreen mode during the exam.
  </p>
  </div>
  </div>
  </div>
  )}
  </div>
  )
}