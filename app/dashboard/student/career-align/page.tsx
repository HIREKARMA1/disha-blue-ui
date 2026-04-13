"use client"

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Upload, FileText, Target, CheckCircle, AlertCircle, Loader2, BarChart3, Search, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { JobCard } from '@/components/dashboard/JobCard'
import { JobDescriptionModal } from '@/components/dashboard/JobDescriptionModal'
import { ApplicationModal } from '@/components/dashboard/ApplicationModal'
import { ErrorBoundary } from '@/components/ErrorBoundary'
import { apiClient } from '@/lib/api'
import { toast } from 'react-hot-toast'
import { StudentDashboardLayout } from '@/components/dashboard/StudentDashboardLayout'
import { cn } from '@/lib/utils'
interface Job {
 id: string
 title: string
 description: string
 requirements?: string
 responsibilities?: string
 job_type: string
 status: string
 location: string
 remote_work: boolean
 travel_required: boolean
 salary_min?: number
 salary_max?: number
 salary_currency: string
 experience_min?: number
 experience_max?: number
 education_level?: string
 skills_required?: string[]
 application_deadline?: string
 max_applications: number
 current_applications: number
 industry?: string
 selection_process?: string
 campus_drive_date?: string
 views_count: number
 applications_count: number
 created_at: string
 corporate_id: string
 corporate_name?: string
 is_active: boolean
 can_apply: boolean
}

interface JobMatch {
 id: string
 title: string
 location?: string
 job_type?: string
 application_end_date?: string
 required_skills: string[]
 match_score: number
 company_name?: string
 salary_min?: number
 salary_max?: number
 experience_min?: number
 experience_max?: number
 industry?: string
 views_count?: number
 applications_count?: number
}

interface ResumeScore {
 needs_ats_formatting: boolean
 keywords: string[]
 overall_score: number
 suggestions: string[]
}

interface SkillGap {
 skills: string[]
 message: string
 priority: string
}

interface CareerAlignResponse {
 job_match_score: number
 top_recommended_jobs: JobMatch[]
 resume_score: ResumeScore
 skill_gap: SkillGap
 user_id: string
}

function CareerAlignPageContent() {
 const [selectedFile, setSelectedFile] = useState<File | null>(null)
 const [isAnalyzing, setIsAnalyzing] = useState(false)
 const [analysisResult, setAnalysisResult] = useState<CareerAlignResponse | null>(null)
 const [error, setError] = useState<string | null>(null)
 const [selectedJob, setSelectedJob] = useState<Job | null>(null)
 const [showApplicationModal, setShowApplicationModal] = useState(false)
 const [currentApplicationJob, setCurrentApplicationJob] = useState<Job | null>(null)
 const [applyingJobs, setApplyingJobs] = useState<Set<string>>(new Set())
 const [applicationStatus, setApplicationStatus] = useState<Map<string, string>>(new Map())
 const [jobStatusFilter, setJobStatusFilter] = useState<'all'|'open'|'closed'>('open') // Filter for job status

 // Pagination state
 const [currentPage, setCurrentPage] = useState(1)
 const [jobsPerPage] = useState(9)

 // Search state
const [searchTerm, setSearchTerm] = useState('')
 const [filteredJobs, setFilteredJobs] = useState<Job[]>([])

 const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
 const file = event.target.files?.[0]
 if (file) {
 if (file.type !=='application/pdf') {
 toast.error('Please select a PDF file')
 return
 }
 if (file.size > 10 * 1024 * 1024) { // 10MB limit
 toast.error('File size must be less than 10MB')
 return
 }
 setSelectedFile(file)
 setError(null)
 }
 }

 const handleAnalyze = async () => {
 if (!selectedFile) {
 toast.error('Please select a PDF file first')
 return
 }

 setIsAnalyzing(true)
 setError(null)

 try {
 const formData = new FormData()
 formData.append('resume', selectedFile)

 const result: CareerAlignResponse = await apiClient.analyzeResume(formData)
 setAnalysisResult(result)
 setCurrentPage(1)
 const jobs = convertJobMatchesToJobs(result.top_recommended_jobs)

 // Check application status for recommended jobs
 await checkApplicationStatus(jobs)

 toast.success('Resume analysis completed successfully!')
 } catch (err: any) {
 console.error('Analysis error:', err)
 const errorMessage = err.response?.data?.detail || 'Failed to analyze resume. Please try again.'
 setError(errorMessage)
 toast.error(errorMessage)
 } finally {
 setIsAnalyzing(false)
 }
 }

 const handleApplyClick = (job: Job) => {
 setCurrentApplicationJob(job)
 setShowApplicationModal(true)
 }

 const applyForJob = async (jobId: string, applicationData: any) => {
 try {
 setApplyingJobs(prev => new Set(prev).add(jobId))

 await apiClient.applyForJob(jobId, {
 job_id: jobId,
 cover_letter: applicationData.cover_letter || `I am interested in this position and believe my skills and experience make me a great fit.`,
 expected_salary: applicationData.expected_salary || null,
 availability_date: applicationData.availability_date || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
 })

 setApplicationStatus(prev => {
 const newStatus = new Map(prev).set(jobId,'applied')

 // Save to localStorage for persistence
const currentStatus = Object.fromEntries(newStatus)
 localStorage.setItem('appliedJobs', JSON.stringify(currentStatus))

 console.log(`Application status updated for job ${jobId}:`, newStatus.get(jobId))
 console.log('All application statuses:', Object.fromEntries(newStatus))
 return newStatus
 })

 toast.success('Application submitted successfully!')
 setShowApplicationModal(false)
 setCurrentApplicationJob(null)
 } catch (error: any) {
 console.error('Application error:', error)
 const data = error.response?.data
 const message =
 (data && typeof data.error ==='string'&& data.error) ||
 (data && typeof data.detail ==='string'&& data.detail) || 'Failed to submit application'
 toast.error(message)
 } finally {
 setApplyingJobs(prev => {
 const newSet = new Set(prev)
 newSet.delete(jobId)
 return newSet
 })
 }
 }

 // Helper function to check if a job is expired
const isJobExpired = (job: Job) => {
 if (!job.application_deadline) return false
 const deadline = new Date(job.application_deadline)
 const now = new Date()
 return deadline < now
 }

 // Helper function to check if a job is open (available for application)
const isJobOpen = (job: Job) => {
 const status = applicationStatus.get(job.id)
 return status !=='applied'&& !isJobExpired(job) && job.can_apply
 }

 // Helper function to check if a job is closed (applied, expired, or not available)
const isJobClosed = (job: Job) => {
 const status = applicationStatus.get(job.id)
 return status ==='applied'|| isJobExpired(job) || !job.can_apply
 }

 // Filter jobs based on job status filter
const filterJobsByStatus = (jobs: Job[]) => {
 if (jobStatusFilter ==='all') return jobs
 if (jobStatusFilter ==='open') return jobs.filter(isJobOpen)
 if (jobStatusFilter ==='closed') return jobs.filter(isJobClosed)
 return jobs
 }

 // Check application status for jobs
const checkApplicationStatus = async (jobs: Job[]) => {
 try {
 const jobIds = jobs.map(job => job.id)
 if (jobIds.length === 0) return

 console.log('Checking application status for job IDs:', jobIds)

 // First, try to fetch applied jobs from server
 try {
 const response = await apiClient.getStudentAppliedJobs()
 if (response && response.applications) {
 const appliedJobsMap = new Map()
 response.applications.forEach((app: any) => {
 appliedJobsMap.set(app.job_id,'applied')
 })
 console.log('Loaded application status from server:', Object.fromEntries(appliedJobsMap))
 setApplicationStatus(appliedJobsMap)

 // Update localStorage with server data
 localStorage.setItem('appliedJobs', JSON.stringify(Object.fromEntries(appliedJobsMap)))
 return
 }
 } catch (serverError) {
 console.log('Server fetch failed, falling back to localStorage:', serverError)
 }

 // Fallback to localStorage if server fetch fails
const appliedJobs = localStorage.getItem('appliedJobs')
 if (appliedJobs) {
 const parsed = JSON.parse(appliedJobs)
 console.log('Loading application status from localStorage:', parsed)
 setApplicationStatus(new Map(Object.entries(parsed)))
 } else {
 console.log('No application status found in localStorage')
 }
 } catch (error) {
 console.error('Error checking application status:', error)
 }
 }

 // Convert job matches to job objects for display
const convertJobMatchesToJobs = (jobMatches: JobMatch[]): Job[] => {
 return jobMatches.map((jobMatch, index) => ({
 id: jobMatch.id,
 title: jobMatch.title,
 description: `Match Score: ${jobMatch.match_score}% - ${jobMatch.required_skills.join(',')}`,
 job_type: jobMatch.job_type ||'full_time',
 status:'active',
 location: jobMatch.location ||'Remote',
 remote_work: true,
 travel_required: false,
 salary_min: jobMatch.salary_min || 800000,
 salary_max: jobMatch.salary_max || 1500000,
 salary_currency:'INR',
 experience_min: jobMatch.experience_min || 2,
 experience_max: jobMatch.experience_max || 5,
 education_level:'Bachelor\'s Degree',
 max_applications: 100,
 current_applications: jobMatch.applications_count || Math.floor(Math.random() * 50),
 views_count: jobMatch.views_count || Math.floor(Math.random() * 200),
 applications_count: jobMatch.applications_count || Math.floor(Math.random() * 50),
 created_at: new Date().toISOString(),
 corporate_id:'corporate-1',
 corporate_name: jobMatch.company_name ||'TechCorp Solutions',
 is_active: true,
 can_apply: true,
 skills_required: jobMatch.required_skills,
 industry: jobMatch.industry ||'Technology',
 application_deadline: jobMatch.application_end_date || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
 }))
 }

 // Get current page jobs
const getCurrentPageJobs = () => {
 if (!analysisResult) return []
 const jobsToUse = filteredJobs.length > 0 ? filteredJobs : convertJobMatchesToJobs(analysisResult.top_recommended_jobs)
 return jobsToUse
 }

 const handlePageChange = (newPage: number) => {
 setCurrentPage(newPage)
 }

 // Filter jobs based on search term
const filterJobs = (jobs: Job[], search: string) => {
 if (!search.trim()) return jobs
 const searchLower = search.toLowerCase()
 return jobs.filter(job => {
 const locationString = Array.isArray(job.location) ? job.location.join('') : job.location
 return job.title.toLowerCase().includes(searchLower) ||
 job.corporate_name?.toLowerCase().includes(searchLower) ||
 locationString.toLowerCase().includes(searchLower) ||
 job.skills_required?.some(skill => skill.toLowerCase().includes(searchLower)) ||
 job.description.toLowerCase().includes(searchLower)
 })
 }

 // Handle search
const handleSearch = (e?: React.FormEvent) => {
 if (e) e.preventDefault()
 if (analysisResult) {
 const allJobs = convertJobMatchesToJobs(analysisResult.top_recommended_jobs)
 const filtered = filterJobs(allJobs, searchTerm)
 setFilteredJobs(filtered)
 setCurrentPage(1)
 }
 }

 // Clear search
const clearSearch = () => {
 setSearchTerm('')
 if (analysisResult) {
 setFilteredJobs([])
 setCurrentPage(1)
 }
 }

 // Load application status on component mount
 useEffect(() => {
 checkApplicationStatus([])
 }, [])

 return (
 <StudentDashboardLayout>
 <motion.div
 initial={{ opacity: 0, y: 20 }}
 animate={{ opacity: 1, y: 0 }}
 transition={{ duration: 0.6 }}
 className="space-y-6">
 {/* Header — aligned with Video Search / student dashboard */}
 <div className="dashboard-overview-card mb-6 !bg-sage/10 p-6 dark:!bg-emerald-900/30">
 <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between lg:gap-6">
 <div className="min-w-0 flex-1">
 <h1 className="mb-2 font-display text-2xl font-semibold tracking-tight text-slate-900 md:text-3xl dark:text-emerald-50">
 Career Align
 </h1>
 <p className="mb-3 text-lg text-slate-600 dark:text-emerald-200/85">
 Upload your resume and get personalized job recommendations
 </p>
 <div className="flex flex-wrap gap-2">
 <span className="inline-flex items-center border border-sage/40 bg-white px-3 py-1 text-sm font-medium text-sage-deep dark:border-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-200">
  {new Date().toLocaleDateString('en-US', { weekday:'long', month:'long', day:'numeric'})}
 </span>
 <span className="inline-flex items-center border border-sage/40 bg-sage/15 px-3 py-1 text-sm font-medium text-sage-deep dark:border-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-200">
  Career Growth
 </span>
 <span className="inline-flex items-center border border-sage/40 bg-sage/15 px-3 py-1 text-sm font-medium text-sage-deep dark:border-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-200">
  New Opportunities
 </span>
 </div>
 </div>
 </div>
 </div>

 {/* Resume Upload Section */}
 <div className="dashboard-overview-card p-6">
 <h2 className="mb-3 font-display text-xl font-semibold text-slate-900 dark:text-emerald-50">
 Resume Analysis
 </h2>

 <div className="space-y-3">
 {/* File Upload */}
 <div className="rounded-2xl border-2 border-dashed border-slate-200/90 bg-slate-50/40 p-6 text-center dark:border-emerald-800/70 dark:bg-emerald-950/25">
 <Upload className="mx-auto mb-2 h-8 w-8 text-slate-400 dark:text-emerald-500/80"/>
 <p className="mb-1 text-sm text-slate-600 dark:text-emerald-200/85">
 Upload your resume in PDF format
 </p>
 <p className="mb-3 text-xs text-slate-500 dark:text-emerald-400/80">
 Maximum file size: 10MB
 </p>
 <input
 type="file"accept=".pdf"onChange={handleFileSelect}
 className="hidden"id="resume-upload"/>
 <label
 htmlFor="resume-upload"className="inline-flex cursor-pointer items-center rounded-2xl border border-slate-200/90 bg-white px-3 py-2 text-sm text-slate-800 transition-colors hover:border-sage-deep/50 hover:bg-sage/10 dark:border-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-100 dark:hover:border-emerald-600 dark:hover:bg-emerald-900/40">
 Choose File
 </label>
 </div>

 {/* Selected File Display */}
 {selectedFile && (
 <div className="rounded-2xl border border-sage/40 bg-sage/15 p-3 dark:border-emerald-700 dark:bg-emerald-900/35">
 <div className="flex items-center gap-2">
 <FileText className="h-4 w-4 shrink-0 text-sage-deep dark:text-emerald-300"/>
 <span className="text-sm font-medium text-sage-deep dark:text-emerald-200">
 {selectedFile.name}
 </span>
 </div>
 </div>
 )}

 {/* Analyze Button */}
 <Button
 onClick={handleAnalyze}
 disabled={!selectedFile || isAnalyzing}
 className="h-11 w-full bg-sage-deep font-semibold text-white shadow-sm transition-all duration-200 hover:bg-sage-deep/90 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-60 dark:bg-emerald-600 dark:hover:bg-emerald-500">
 {isAnalyzing ? (
 <>
 <Loader2 className="mr-2 h-4 w-4 animate-spin"/>
 Analyzing Resume...
 </>
 ) : (
 <>
 <Target className="mr-2 h-4 w-4"/>
 Analyze Resume
 </>
 )}
 </Button>
 </div>
 </div>

 {/* Analysis Results */}
 {analysisResult && (
 <>
 {/* Analysis summary — sage / dashboard cards */}
 <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-3">
 <div className="dashboard-overview-card p-5">
 <div className="flex items-center justify-between gap-3">
 <div className="min-w-0 flex-1">
 <p className="mb-1 text-sm font-medium text-slate-600 dark:text-emerald-200/85">
 Overall Match Score
 </p>
 <p className="text-3xl font-bold tabular-nums text-sage-deep dark:text-emerald-300">
 {analysisResult.job_match_score}%
 </p>
 </div>
 <div className="shrink-0 rounded-2xl border border-slate-200/90 bg-sage p-3 shadow-sm dark:border-emerald-700 dark:bg-emerald-900/50">
 <Target className="h-6 w-6 text-sage-deep dark:text-emerald-300"/>
 </div>
 </div>
 </div>

 <div className="dashboard-overview-card p-5">
 <div className="flex items-center justify-between gap-3">
 <div className="min-w-0 flex-1">
 <p className="mb-1 text-sm font-medium text-slate-600 dark:text-emerald-200/85">
 Resume Score
 </p>
 <p className="text-3xl font-bold tabular-nums text-slate-900 dark:text-emerald-50">
 {analysisResult.resume_score.overall_score}%
 </p>
 </div>
 <div className="shrink-0 rounded-2xl border border-slate-200/90 bg-sage p-3 shadow-sm dark:border-emerald-700 dark:bg-emerald-900/50">
 <FileText className="h-6 w-6 text-sage-deep dark:text-emerald-300"/>
 </div>
 </div>
 </div>

 <div className="dashboard-overview-card p-5">
 <div className="flex items-center justify-between gap-3">
 <div className="min-w-0 flex-1">
 <p className="mb-1 text-sm font-medium text-slate-600 dark:text-emerald-200/85">
 Skills Found
 </p>
 <p className="text-3xl font-bold tabular-nums text-slate-900 dark:text-emerald-50">
 {analysisResult.resume_score.keywords.length}
 </p>
 </div>
 <div className="shrink-0 rounded-2xl border border-slate-200/90 bg-sage p-3 shadow-sm dark:border-emerald-700 dark:bg-emerald-900/50">
 <BarChart3 className="h-6 w-6 text-sage-deep dark:text-emerald-300"/>
 </div>
 </div>
 </div>
 </div>

 {analysisResult.resume_score.suggestions.length > 0 && (
 <div className="dashboard-overview-card mb-6 border-sage/30 bg-sage/5 p-6 dark:border-emerald-800/60 dark:bg-emerald-950/25">
 <h3 className="mb-3 font-display text-lg font-semibold text-slate-900 dark:text-emerald-50">
 Resume Improvement Suggestions
 </h3>
 <div className="space-y-2">
 {analysisResult.resume_score.suggestions.map((suggestion, index) => (
 <div key={index} className="flex items-start gap-2 rounded-xl border border-slate-200/90 bg-white p-3 dark:border-emerald-800/70 dark:bg-emerald-950/40">
 <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-sage-deep dark:text-emerald-400"/>
 <span className="text-sm text-slate-700 dark:text-emerald-100/90">
 {suggestion}
 </span>
 </div>
 ))}
 </div>
 </div>
 )}

 {analysisResult.skill_gap.skills.length > 0 && (
 <div className="dashboard-overview-card mb-6 border-red-200/80 bg-red-50/60 p-6 dark:border-red-900/50 dark:bg-red-950/20">
 <div className="mb-4 flex items-center gap-3">
 <div className="rounded-2xl border border-red-200/90 bg-white p-2 dark:border-red-900/60 dark:bg-red-950/40">
 <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400"/>
 </div>
 <h2 className="font-display text-xl font-semibold text-slate-900 dark:text-emerald-50">
 Skill Gaps to Address
 </h2>
 </div>
 <div className="flex flex-wrap gap-2">
 {analysisResult.skill_gap.skills.map((skill, index) => (
 <span
 key={index}
 className="inline-flex items-center rounded-xl border border-red-200/90 bg-white px-3 py-1 text-sm font-medium text-red-800 dark:border-red-900/50 dark:bg-red-950/35 dark:text-red-200">
 {skill}
 </span>
 ))}
 </div>
 </div>
 )}

 <div className="dashboard-overview-card p-6">
 <div className="mb-4 flex items-center gap-3">
 <div className="rounded-2xl border border-slate-200/90 bg-sage p-2 dark:border-emerald-700 dark:bg-emerald-900/50">
 <CheckCircle className="h-5 w-5 text-sage-deep dark:text-emerald-300"/>
 </div>
 <h2 className="font-display text-xl font-semibold text-slate-900 dark:text-emerald-50">
 Recommended Jobs
 </h2>
 </div>
 <p className="mb-6 text-sm text-slate-600 dark:text-emerald-200/85">
 Based on your resume analysis
 </p>

 <div className="dashboard-overview-card mb-6 p-6">
 <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
 <div className="relative flex-1">
 <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 dark:text-emerald-500/80"/>
 <input
 type="text"placeholder="Search jobs by title, skills, or company..."value={searchTerm}
 onChange={(e) => setSearchTerm(e.target.value)}
 onKeyDown={(e) => {
 if (e.key ==='Enter') handleSearch(e)
 }}
 className="w-full rounded-2xl border border-slate-200/90 bg-white py-2 pl-10 pr-4 text-slate-900 placeholder:text-slate-500 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-sage-deep dark:border-emerald-800/70 dark:bg-emerald-950/50 dark:text-emerald-50 dark:placeholder:text-emerald-400/70 dark:focus:ring-emerald-500"/>
 </div>

 <select
 value={jobStatusFilter}
 onChange={(e) => setJobStatusFilter(e.target.value as'all'|'open'|'closed')}
 className="h-10 rounded-2xl border border-slate-200/90 bg-white px-3 text-sm text-slate-900 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-sage-deep dark:border-emerald-800/70 dark:bg-emerald-950/50 dark:text-emerald-50 dark:focus:ring-emerald-500">
 <option value="all">All Jobs</option>
 <option value="open">Open Jobs</option>
 <option value="closed">Closed Jobs</option>
 </select>
 <Button
 onClick={() => handleSearch()}
 disabled={!searchTerm.trim()}
 className="h-10 w-full bg-sage-deep px-6 font-semibold text-white shadow-sm transition-all duration-200 hover:bg-sage-deep/90 hover:shadow-md disabled:opacity-60 dark:bg-emerald-600 dark:hover:bg-emerald-500 sm:w-auto">
 <Search className="mr-2 h-4 w-4"/>
 Search
 </Button>

 {searchTerm && (
 <Button
 variant="outline"onClick={clearSearch}
 className="h-10 w-full border-slate-200/90 px-6 transition-all duration-200 hover:border-sage-deep/40 hover:bg-sage/10 hover:shadow-md dark:border-emerald-800 dark:hover:border-emerald-600 sm:w-auto">
 <X className="mr-2 h-4 w-4"/>
 Clear
 </Button>
 )}
 </div>
 </div>

 <div className="dashboard-overview-card mb-6 p-4">
 <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
 <div className="text-sm text-slate-600 dark:text-emerald-200/85">
 <span className="flex items-center gap-2">
  <span className="font-semibold text-sage-deep dark:text-emerald-300">
 {(() => {
 const allJobs = getCurrentPageJobs()
 const statusFiltered = filterJobsByStatus(allJobs)
 return `Showing ${statusFiltered.length} of ${allJobs.length} jobs`
 })()}
 </span>
 </span>
 </div>
 {(() => {
 const allJobs = getCurrentPageJobs()
 const statusFiltered = filterJobsByStatus(allJobs)
 const tp = Math.ceil(statusFiltered.length / jobsPerPage)
 return tp > 1 && (
 <div className="text-xs font-medium text-sage-deep dark:text-emerald-400">
  Page {currentPage} of {tp} • {jobsPerPage} jobs per page
 </div>
 )
 })()}
 </div>
 </div>

 {/* Jobs Grid */}
 <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
 {(() => {
 const allJobs = getCurrentPageJobs()
 const filteredJobs = filterJobsByStatus(allJobs)
 const startIndex = (currentPage - 1) * jobsPerPage
 const endIndex = startIndex + jobsPerPage
 const paginatedJobs = filteredJobs.slice(startIndex, endIndex)

 return paginatedJobs.map((job, index) => {
 const jobApplicationStatus = applicationStatus.get(job.id)
 console.log(`Job ${job.id} (${job.title}) - Application Status: ${jobApplicationStatus}, Can Apply: ${job.can_apply}`)
 // Extract match score from job description
const matchScoreMatch = job.description.match(/Match Score: (\d+(?:\.\d+)?)%/)
 const matchScore = matchScoreMatch ? parseFloat(matchScoreMatch[1]) : 0

 return (
 <JobCard
 key={job.id}
 job={job}
 onViewDescription={() => setSelectedJob(job)}
 onApply={() => handleApplyClick(job)}
 isApplying={applyingJobs.has(job.id)}
 cardIndex={index}
 showMatchScore={true}
 matchScore={matchScore}
 />
 )
 })
 })()}
 </div>

 {/* Pagination */}
 {(() => {
 const allJobs = getCurrentPageJobs()
 const statusFiltered = filterJobsByStatus(allJobs)
 const filteredTotalPages = Math.ceil(statusFiltered.length / jobsPerPage)
 return filteredTotalPages > 1 && (
 <div className="mt-8 flex items-center justify-center">
 <div className="dashboard-overview-card p-4">
 <div className="flex items-center gap-2">
 <Button
 variant="outline"size="sm"onClick={() => handlePageChange(currentPage - 1)}
 disabled={currentPage <= 1}
 className="border-slate-200/90 px-3 py-2 transition-all duration-200 hover:border-sage-deep/40 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-50 dark:border-emerald-800 dark:hover:border-emerald-600">
 ←
 </Button>

 <div className="flex items-center gap-1">
 {[...Array(filteredTotalPages)].map((_, i) => {
 const pageNum = i + 1
 const isCurrentPage = pageNum === currentPage
 const isNearCurrent = Math.abs(pageNum - currentPage) <= 1
 const isFirstOrLast = pageNum === 1 || pageNum === filteredTotalPages

 if (isFirstOrLast || isNearCurrent) {
 return (
 <Button
 key={pageNum}
 variant={isCurrentPage ?"default":"outline"}
 size="sm"onClick={() => handlePageChange(pageNum)}
 className={cn(
 'h-8 min-w-[32px]',
 isCurrentPage
 ?'bg-sage-deep text-white shadow-md hover:bg-sage-deep/90 dark:bg-emerald-600 dark:hover:bg-emerald-500':'border-slate-200/90 transition-all duration-200 hover:border-sage-deep/40 hover:shadow-md dark:border-emerald-800 dark:hover:border-emerald-600',
 )}
 >
 {pageNum}
 </Button>
 )
 } else if (pageNum === currentPage - 2 || pageNum === currentPage + 2) {
 return <span key={pageNum} className="px-2 text-sage-deep/50 dark:text-emerald-500/70">...</span>
 }
 return null
 })}
 </div>

 <Button
 variant="outline"size="sm"onClick={() => handlePageChange(currentPage + 1)}
 disabled={currentPage >= filteredTotalPages}
 className="border-slate-200/90 px-3 py-2 transition-all duration-200 hover:border-sage-deep/40 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-50 dark:border-emerald-800 dark:hover:border-emerald-600">
 →
 </Button>
 </div>
 </div>
 </div>
 )
 })()}
 </div>
 </>
 )}

 {error && (
 <div className="dashboard-overview-card border-red-200/90 bg-red-50/80 p-4 dark:border-red-900/50 dark:bg-red-950/25">
 <div className="flex items-center gap-2">
 <AlertCircle className="h-5 w-5 shrink-0 text-red-600 dark:text-red-400"/>
 <span className="text-sm text-red-800 dark:text-red-200">
 {error}
 </span>
 </div>
 </div>
 )}

 {/* Job Description Modal */}
 {selectedJob && (
 <JobDescriptionModal
 job={selectedJob}
 onClose={() => setSelectedJob(null)}
 onApply={() => {
 handleApplyClick(selectedJob)
 setSelectedJob(null)
 }}
 isApplying={applyingJobs.has(selectedJob.id)}
 />
 )}

 {/* Application Modal */}
 {showApplicationModal && currentApplicationJob && (
 <ApplicationModal
 job={currentApplicationJob}
 onClose={() => {
 setShowApplicationModal(false)
 setCurrentApplicationJob(null)
 }}
 onSubmit={(applicationData) => applyForJob(currentApplicationJob.id, applicationData)}
 isApplying={applyingJobs.has(currentApplicationJob.id)}
 />
 )}
 </motion.div>
 </StudentDashboardLayout>
 )
}

export default function CareerAlignPage() {
 return (
 <ErrorBoundary>
 <CareerAlignPageContent />
 </ErrorBoundary>
 )
}
