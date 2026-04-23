"use client"

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { StudentDashboardLayout } from '@/components/dashboard/StudentDashboardLayout'
import { PracticeExam } from '@/components/practice/PracticeExam'
import { usePracticeModules, usePracticeQuestions } from '@/hooks/usePractice'
import { PracticeModule, SubmitAttemptResponse } from '@/types/practice'
import { Brain } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function PracticeModulePage() {
 const params = useParams()
 const router = useRouter()
 const moduleId = params.moduleId as string

 const [currentView, setCurrentView] = useState<'loading'|'exam'|'error'>('loading')
 const [selectedModule, setSelectedModule] = useState<PracticeModule | null>(null)

 // Fetch all modules to find the one we need
const { data: modules, isLoading: modulesLoading, error: modulesError } = usePracticeModules()

 // Fetch questions for this module to check if it has any
const { data: questions, isLoading: questionsLoading } = usePracticeQuestions(moduleId)

 useEffect(() => {
 if (modulesLoading || questionsLoading) return

 if (modulesError) {
 setCurrentView('error')
 return
 }

 // Find the module by ID
const module = modules?.find(m => m.id === moduleId)

 if (!module) {
 setCurrentView('error')
 return
 }

 // Check if module has questions
 if (!questions || questions.length === 0) {
 setCurrentView('error')
 return
 }

 setSelectedModule(module)
 setCurrentView('exam')
 }, [modules, questions, moduleId, modulesLoading, questionsLoading, modulesError])

 const handleExamComplete = (result: SubmitAttemptResponse) => {
 // Save completion status to localStorage so it reflects on the practice dashboard
 if (selectedModule) {
 // Get existing submitted modules
const existingModules = localStorage.getItem('submitted_practice_modules')
 const submittedModules = existingModules ? JSON.parse(existingModules) : []

 // Add current module if not already submitted
 if (!submittedModules.includes(selectedModule.id)) {
 submittedModules.push(selectedModule.id)
 localStorage.setItem('submitted_practice_modules', JSON.stringify(submittedModules))
 }

 // Save the result for this specific module
 localStorage.setItem(`practice_result_${selectedModule.id}`, JSON.stringify(result))

 console.log(' Saved completion status for module:', selectedModule.id, result)
 }

 // Redirect to practice dashboard instead of showing results
 router.push('/dashboard/student/practice')
 }

 const handleBackToDashboard = () => {
 router.push('/dashboard/student/practice')
 }

 const handleBackToApplications = () => {
 router.push('/dashboard/student/applications')
 }

 if (currentView ==='loading'|| modulesLoading || questionsLoading) {
 return (
 <StudentDashboardLayout>
 <div className="flex min-h-[60vh] items-center justify-center">
 <div className="text-center">
 <div className="mx-auto mb-4 flex h-16 w-16 animate-pulse items-center justify-center rounded-2xl bg-sage/20 dark:bg-emerald-900/45">
 <Brain className="h-8 w-8 text-sage-deep dark:text-emerald-300"/>
 </div>
 <p className="text-slate-600 dark:text-emerald-200/85">Loading practice module...</p>
 </div>
 </div>
 </StudentDashboardLayout>
 )
 }

 if (currentView ==='error'|| !selectedModule) {
 return (
 <StudentDashboardLayout>
 <div className="flex min-h-[60vh] items-center justify-center px-4">
 <div className="dashboard-overview-card max-w-md text-center p-8">
 <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-red-100 dark:bg-red-900/30">
 <Brain className="h-8 w-8 text-red-600 dark:text-red-400"/>
 </div>
 <h2 className="mb-2 text-2xl font-semibold text-slate-900 dark:text-emerald-50">
 Practice Module Not Available
 </h2>
 <p className="mb-6 text-slate-600 dark:text-emerald-200/85">
 {!questions || questions.length === 0
 ?'This practice module doesn\'t have any questions yet. Please contact your university administrator.':'The practice module you\'re trying to access could not be found or is no longer available.'}
 </p>
 <div className="flex flex-wrap justify-center gap-3">
 <Button
 onClick={handleBackToApplications}
 variant="outline"className="border-slate-200/90 dark:border-emerald-800 dark:text-emerald-100 dark:hover:bg-emerald-900/40">
 Back to Applications
 </Button>
 <Button
 onClick={handleBackToDashboard}
 className="bg-sage-deep text-white hover:bg-sage-deep/90 dark:bg-emerald-600 dark:hover:bg-emerald-500">
 Browse Practice Modules
 </Button>
 </div>
 </div>
 </div>
 </StudentDashboardLayout>
 )
 }

 return (
 <PracticeExam
 module={selectedModule}
 onComplete={handleExamComplete}
 onBack={handleBackToDashboard}
 />
 )
}

