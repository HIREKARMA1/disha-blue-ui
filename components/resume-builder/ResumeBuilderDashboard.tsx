"use client"

import { motion } from 'framer-motion'
import { Plus, FileText, Download, Edit, Trash2, MoreVertical } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useState, useEffect, useRef } from 'react'
import { resumeService, type ResumeData } from '@/services/resumeService'
import toast from 'react-hot-toast'
import { ResumePreview } from './ResumePreview'

// Defer importing html2pdf to client runtime to avoid SSR issues
let html2pdf: any
if (typeof window !== 'undefined') {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  html2pdf = require('html2pdf.js')
}

interface ResumeBuilderDashboardProps {
  onNewResume: () => void
  onEditResume: (resumeId: string) => void
}

interface ResumePreview {
  name: string
  title: string
  email: string
  phone: string
  summary: string
  skills: string[]
  experience: string
}

export function ResumeBuilderDashboard({ onNewResume, onEditResume }: ResumeBuilderDashboardProps) {
  const [openMenu, setOpenMenu] = useState<string | null>(null)
  const [resumes, setResumes] = useState<ResumeData[]>([])
  const [loading, setLoading] = useState(true)
  const [downloadingResume, setDownloadingResume] = useState<ResumeData | null>(null)
  const [isDownloading, setIsDownloading] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)
  const downloadPreviewRef = useRef<HTMLDivElement | null>(null)

  // Load resumes on component mount
  useEffect(() => {
  loadResumes()
  }, [])

  // Close menu when clicking outside
  useEffect(() => {
  const handleClickOutside = (event: MouseEvent) => {
  if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
  setOpenMenu(null)
  }
  }

  document.addEventListener('mousedown', handleClickOutside)
  return () => {
  document.removeEventListener('mousedown', handleClickOutside)
  }
  }, [])

  const loadResumes = async () => {
  try {
  setLoading(true)
  const response = await resumeService.getResumes()
  setResumes(response.resumes)
  } catch (error) {
  console.error('Error loading resumes:', error)
  toast.error('Failed to load resumes')
  } finally {
  setLoading(false)
  }
  }

  const handleDeleteResume = async (resumeId: string) => {
  try {
  await resumeService.deleteResume(resumeId)
  toast.success('Resume deleted successfully')
  loadResumes() // Reload the list
  } catch (error) {
  console.error('Error deleting resume:', error)
  toast.error('Failed to delete resume')
  }
  }

  // Helper function to format date
  const formatDate = (dateString: string) => {
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', {
  month: 'numeric',
  day: 'numeric',
  year: 'numeric'
  })
  }

  // Helper function to get resume preview data
  const getResumePreview = (resume: ResumeData): ResumePreview => {
  const content = resume.content
  return {
  name: content.header.fullName || 'Unnamed',
  title: content.experience?.[0]?.position || 'Professional',
  email: content.header.email || '',
  phone: content.header.phone || '',
  summary: content.summary || '',
  skills: [
  ...(content.skills.technical || []),
  ...(content.skills.soft || [])
  ].slice(0, 4),
  experience: content.experience?.[0]?.company || 'No experience listed'
  }
  }

  const handleMenuToggle = (resumeId: string) => {
  setOpenMenu(openMenu === resumeId ? null : resumeId)
  }

  const handleAction = (action: string, resumeId: string) => {
  setOpenMenu(null)
  switch (action) {
  case 'edit':
  onEditResume(resumeId)
  break
  case 'download': {
  const resume = resumes.find(r => r.id === resumeId)
  if (!resume) {
  toast.error('Resume not found for download')
  return
  }
  setDownloadingResume(resume)
  break
  }
  case 'delete':
  handleDeleteResume(resumeId)
  break
  }
  }

  // Called by the hidden ResumePreview once the template has fully loaded,
  // so the generated PDF captures the actual resume rather than the loading state.
  const handlePreviewReady = async () => {
  if (!downloadingResume || !downloadPreviewRef.current || !html2pdf || isDownloading) {
  return
  }

  try {
  setIsDownloading(true)

  const safeName =
  downloadingResume.content?.header?.fullName ||
  downloadingResume.name ||
  'resume'

  const fileName = `${safeName.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_resume.pdf`

  const options = {
  margin: [10, 10, 10, 10] as [number, number, number, number],
  filename: fileName,
  image: { type: 'jpeg', quality: 0.85 },
  html2canvas: {
  scale: 1.5,
  useCORS: true,
  allowTaint: true,
  },
  jsPDF: {
  unit: 'mm',
  format: 'a4',
  orientation: 'portrait',
  compress: true,
  },
  }

  await html2pdf().from(downloadPreviewRef.current).set(options).save()
  toast.success('Resume downloaded successfully!')
  } catch (error) {
  console.error('Error downloading resume:', error)
  toast.error('Failed to download resume. Please try again.')
  } finally {
  setIsDownloading(false)
  setDownloadingResume(null)
  }
  }

  const getStatusBadgeClass = (status: 'draft' | 'published' | 'archived') => {
  switch (status) {
  case 'published':
  return 'bg-sage/25 text-sage-deep dark:bg-emerald-900/50 dark:text-emerald-200'
  case 'draft':
  return 'bg-amber-50 text-amber-900 dark:bg-amber-950/40 dark:text-amber-200'
  case 'archived':
  return 'bg-slate-100 text-slate-700 dark:bg-emerald-950/60 dark:text-emerald-300/90'
  default:
  return 'bg-slate-100 text-slate-700 dark:bg-emerald-950/60 dark:text-emerald-300/90'
  }
  }

  return (
  <div className="space-y-6">

  {/* Your Resumes Grid */}
  <motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ delay: 0.1 }}
  className="space-y-6"
  >
  <div>
  <h2 className="mb-4 text-xl font-semibold text-slate-900 dark:text-emerald-50">
  Your Resumes
  </h2>
  <p className="mb-6 text-slate-600 dark:text-emerald-200/85">
  Manage and edit your existing resumes
  </p>
  </div>

  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
  {/* New Resume Card */}
  <motion.div
  initial={{ opacity: 0, scale: 0.9 }}
  animate={{ opacity: 1, scale: 1 }}
  className="dashboard-overview-card cursor-pointer border-2 border-dashed border-sage-deep/40 p-6 transition-all duration-300 hover:border-sage-deep hover:bg-sage/10 hover:shadow-md dark:border-emerald-600/50 dark:hover:border-emerald-500 dark:hover:bg-emerald-900/35"
  onClick={onNewResume}
  >
  <div className="flex h-full flex-col items-center justify-center text-center">
  <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-sage/30 transition-transform duration-300 group-hover:scale-110 dark:bg-emerald-900/50">
  <Plus className="h-8 w-8 text-sage-deep dark:text-emerald-200" />
  </div>
  <h3 className="mb-2 text-lg font-semibold text-slate-900 dark:text-emerald-50">
  New Resume
  </h3>
  <p className="text-sm text-slate-600 dark:text-emerald-200/85">
  Create a new resume from scratch or pre-fill with your profile
  </p>
  </div>
  </motion.div>

  {/* Existing Resume Cards */}
  {loading ? (
  <div className="col-span-full flex items-center justify-center py-8">
  <div className="h-8 w-8 animate-spin rounded-full border-2 border-sage/30 border-t-sage-deep dark:border-emerald-800 dark:border-t-emerald-400" />
  <span className="ml-2 text-slate-600 dark:text-emerald-200/85">Loading resumes...</span>
  </div>
  ) : resumes.length === 0 ? (
  <div className="col-span-full py-8 text-center">
  <p className="text-slate-600 dark:text-emerald-200/85">No resumes found. Create your first resume to get started!</p>
  </div>
  ) : (
  resumes.map((resume, index) => {
  const headerTints = [
  'bg-sage/15 dark:bg-emerald-900/35',
  'bg-slate-50 dark:bg-emerald-950/40',
  'bg-sage/25 dark:bg-emerald-900/45',
  'bg-slate-100/80 dark:bg-emerald-950/50',
  ]
  const headerTint = headerTints[index % headerTints.length]

  return (
  <motion.div
  key={resume.id}
  initial={{ opacity: 0, scale: 0.9 }}
  animate={{ opacity: 1, scale: 1 }}
  transition={{ delay: 0.1 + index * 0.1 }}
  className="dashboard-overview-card transition-shadow hover:shadow-md"
  >
  <div className={`border-b border-slate-200/90 p-4 dark:border-emerald-800/65 ${headerTint}`}>
  <div className="flex items-start justify-between">
  <div className="flex-1 min-w-0">
  <h3 className="truncate text-sm font-semibold text-slate-900 dark:text-emerald-50">
  {resume.name}
  </h3>
  <p className="mt-1 text-xs text-slate-500 dark:text-emerald-400/80">
  Last updated: {formatDate(resume.updated_at)}
  </p>
  </div>
  <div className="relative ml-2" ref={menuRef}>
  <Button
  variant="ghost"
  size="sm"
  className="h-8 w-8 p-0 hover:bg-white/60 dark:hover:bg-emerald-900/50"
  onClick={() => handleMenuToggle(resume.id)}
  >
  <MoreVertical className="w-4 h-4" />
  </Button>

  {/* Dropdown Menu */}
  {openMenu === resume.id && (
  <div className="absolute right-0 top-full z-10 mt-1 w-48 rounded-xl border border-slate-200/90 bg-white shadow-lg dark:border-emerald-800 dark:bg-emerald-950">
  <div className="py-1">
  <button
  onClick={() => handleAction('edit', resume.id)}
  className="flex w-full items-center px-4 py-2 text-left text-sm text-slate-700 hover:bg-sage/15 dark:text-emerald-100 dark:hover:bg-emerald-900/50"
  >
  <Edit className="w-4 h-4 mr-2" />
  Edit
  </button>
  <button
  onClick={() => handleAction('download', resume.id)}
  disabled={isDownloading}
  className="flex w-full items-center px-4 py-2 text-left text-sm text-slate-700 hover:bg-sage/15 disabled:opacity-60 dark:text-emerald-100 dark:hover:bg-emerald-900/50"
  >
  <Download className="w-4 h-4 mr-2" />
  {isDownloading ? 'Downloading...' : 'Download'}
  </button>
  <button
  onClick={() => handleAction('delete', resume.id)}
  className="w-full text-left px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center"
  >
  <Trash2 className="w-4 h-4 mr-2" />
  Delete
  </button>
  </div>
  </div>
  )}
  </div>
  </div>
  </div>

  {/* Resume Preview Content */}
  <div className="p-4">
  <div className="min-h-[330px] rounded-xl border border-slate-200/90 bg-white/95 p-4 dark:border-emerald-800/60 dark:bg-emerald-950/40">
  {/* Mini Resume Preview */}
  <div className="space-y-3 text-xs">
  {(() => {
  const preview = getResumePreview(resume)
  return (
  <>
  {/* Header */}
  <div className="mb-3 border-b border-slate-200 pb-3 text-center dark:border-emerald-800/60">
  <div className="text-sm font-bold text-slate-900 dark:text-emerald-50">
  {preview.name}
  </div>
  <div className="text-slate-600 dark:text-emerald-200/80">
  {preview.title}
  </div>
  <div className="text-xs text-slate-500 dark:text-emerald-400/70">
  {preview.email} • {preview.phone}
  </div>
  </div>

  {/* Summary */}
  <div className="line-clamp-3 leading-tight text-slate-700 dark:text-emerald-100/90">
  {preview.summary}
  </div>

  {/* Skills Preview */}
  <div className="flex flex-wrap gap-1 mt-3">
  {preview.skills.slice(0, 4).map((skill: string, idx: number) => (
  <span key={idx} className="rounded bg-sage/25 px-2 py-1 text-xs text-sage-deep dark:bg-emerald-900/50 dark:text-emerald-200">
  {skill}
  </span>
  ))}
  {preview.skills.length > 4 && (
  <span key="more" className="rounded bg-sage/25 px-2 py-1 text-xs text-sage-deep dark:bg-emerald-900/50 dark:text-emerald-200">
  +{preview.skills.length - 4}
  </span>
  )}
  </div>

  {/* Experience */}
  <div className="mt-3 text-xs text-slate-600 dark:text-emerald-300/80">
  {preview.experience}
  </div>
  </>
  )
  })()}
  </div>
  </div>
  </div>

  {/* Footer with Status and Template */}
  <div className="px-4 pb-4 flex items-center justify-between">
  <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusBadgeClass(resume.status)}`}>
  {resume.status.charAt(0).toUpperCase() + resume.status.slice(1)}
  </span>
  <span className="text-xs text-slate-500 dark:text-emerald-400/75">
  {resume.template?.name || 'Default Template'}
  </span>
  </div>
  </motion.div>
  );
  })
  )}
  </div>
  </motion.div>

  {/* Resume Building Tips */}
  <motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ delay: 0.2 }}
  className="dashboard-overview-card !bg-sage/10 p-6 dark:!bg-emerald-900/25"
  >
  <div className="mb-4 flex items-center gap-3">
  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-sage-deep text-white dark:bg-emerald-700">
  <FileText className="h-5 w-5" />
  </div>
  <h3 className="text-lg font-semibold text-slate-900 dark:text-emerald-50">
  Resume Building Tips
  </h3>
  </div>
  <ul className="space-y-2 text-sm text-slate-700 dark:text-emerald-100/90">
  <li>• Keep your resume concise and focused on relevant experience</li>
  <li>• Use action verbs to describe your achievements</li>
  <li>• Tailor your resume for each job application</li>
  <li>• Include quantifiable results when possible</li>
  <li>• Proofread carefully for grammar and spelling errors</li>
  </ul>
  </motion.div>

  {/* Hidden preview container used for generating PDFs when downloading from the dashboard */}
  <div
  style={{
  position: 'fixed',
  left: '-10000px',
  top: 0,
  width: '800px',
  pointerEvents: 'none',
  opacity: 0,
  zIndex: -1,
  }}
  >
  {downloadingResume && (
  <div ref={downloadPreviewRef}>
  <ResumePreview
  resumeData={downloadingResume.content}
  templateId={downloadingResume.template_id}
  onReady={handlePreviewReady}
  />
  </div>
  )}
  </div>
  </div>
  )
}
