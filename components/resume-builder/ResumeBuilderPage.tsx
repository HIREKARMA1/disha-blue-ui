"use client"

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { FileText, Plus, Search, Filter } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ResumeBuilderDashboard } from './ResumeBuilderDashboard'
import { TemplateSelection } from './TemplateSelection'
import { ResumeBuilder } from './ResumeBuilder'
import { useProfile } from '@/hooks/useProfile'

type ResumeBuilderView = 'dashboard' | 'templates' | 'builder'

export function ResumeBuilderPage() {
  const { profile, loading, error } = useProfile()
  const [currentView, setCurrentView] = useState<ResumeBuilderView>('dashboard')
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null)
  const [selectedResume, setSelectedResume] = useState<string | null>(null)

  // Debug logging
  useEffect(() => {
  console.log('ResumeBuilderPage - Profile loading:', loading)
  console.log('ResumeBuilderPage - Profile data:', profile)
  console.log('ResumeBuilderPage - Profile error:', error)
  }, [profile, loading, error])

  const handleTemplateSelect = (templateId: string) => {
  setSelectedTemplate(templateId)
  setCurrentView('builder')
  }

  const handleResumeSelect = (resumeId: string) => {
  setSelectedResume(resumeId)
  setCurrentView('builder')
  }

  const handleBackToDashboard = () => {
  setCurrentView('dashboard')
  setSelectedTemplate(null)
  setSelectedResume(null)
  }

  const handleBackToTemplates = () => {
  setCurrentView('templates')
  setSelectedTemplate(null)
  }

  // Show loading state while profile is loading
  if (loading) {
  return (
  <div className="space-y-6">
  <div className="flex items-center justify-center h-64">
  <div className="h-12 w-12 animate-spin rounded-full border-2 border-sage/30 border-t-sage-deep dark:border-emerald-800 dark:border-t-emerald-400" />
  </div>
  </div>
  )
  }

  // Show error state if profile loading failed
  if (error) {
  return (
  <div className="space-y-6">
  <div className="dashboard-overview-card rounded-2xl border border-red-200/90 bg-red-50/80 p-6 dark:border-red-900/50 dark:bg-red-950/30">
  <h3 className="mb-2 text-lg font-semibold text-red-900 dark:text-red-200">
  Error Loading Profile
  </h3>
  <p className="text-red-700 dark:text-red-300/90">{error}</p>
  </div>
  </div>
  )
  }

  // Show content once profile is loaded
  if (!profile) {
  return (
  <div className="space-y-6">
  <div className="dashboard-overview-card rounded-2xl border border-amber-200/90 bg-amber-50/80 p-6 dark:border-amber-900/40 dark:bg-amber-950/25">
  <h3 className="mb-2 text-lg font-semibold text-amber-900 dark:text-amber-200">
  No Profile Data
  </h3>
  <p className="text-amber-800 dark:text-amber-200/90">
  Unable to load profile data. Please try again.
  </p>
  </div>
  </div>
  )
  }

  return (
  <div className="space-y-6">
  {/* Header — aligned with Video Search / student dashboard */}
  <div className="dashboard-overview-card mb-6 !bg-sage/10 p-6 dark:!bg-emerald-900/30">
  <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between lg:gap-6">
  <div className="min-w-0 flex-1">
  <h1 className="mb-2 font-display text-2xl font-semibold tracking-tight text-slate-900 md:text-3xl dark:text-emerald-50">
  Resume Builder
  </h1>
  <p className="mb-3 text-lg text-slate-600 dark:text-emerald-200/85">
  Create professional resumes with our AI-powered builder
  </p>
  <div className="flex flex-wrap gap-2">
  <span className="inline-flex items-center border border-sage/40 bg-white px-3 py-1 text-sm font-medium text-sage-deep dark:border-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-200">
  {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
  </span>
  <span className="inline-flex items-center border border-sage/40 bg-sage/15 px-3 py-1 text-sm font-medium text-sage-deep dark:border-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-200">
  Career Growth
  </span>
  <span className="inline-flex items-center border border-sage/40 bg-sage/15 px-3 py-1 text-sm font-medium text-sage-deep dark:border-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-200">
  New Opportunities
  </span>
  </div>
  </div>
  <div className="flex flex-wrap items-center gap-3">
  {currentView !== 'dashboard' && (
  <Button
  variant="outline"
  onClick={handleBackToDashboard}
  className="flex items-center gap-2 border-slate-200/90 text-sage-deep hover:bg-sage/20 dark:border-emerald-700 dark:text-emerald-200 dark:hover:bg-emerald-900/50"
  >
  <FileText className="h-4 w-4" />
  <span>Dashboard</span>
  </Button>
  )}
  {currentView === 'builder' && (
  <Button
  variant="outline"
  onClick={handleBackToTemplates}
  className="flex items-center gap-2 border-slate-200/90 text-sage-deep hover:bg-sage/20 dark:border-emerald-700 dark:text-emerald-200 dark:hover:bg-emerald-900/50"
  >
  <Filter className="h-4 w-4" />
  <span>Change Template</span>
  </Button>
  )}
  </div>
  </div>
  </div>

  {/* Content */}
  <motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ delay: 0.1 }}
  >
  {currentView === 'dashboard' && (
  <ResumeBuilderDashboard
  onNewResume={() => setCurrentView('templates')}
  onEditResume={handleResumeSelect}
  />
  )}

  {currentView === 'templates' && (
  <TemplateSelection
  onTemplateSelect={handleTemplateSelect}
  />
  )}

  {currentView === 'builder' && (
  <ResumeBuilder
  templateId={selectedTemplate}
  resumeId={selectedResume}
  />
  )}
  </motion.div>
  </div>
  )
}
