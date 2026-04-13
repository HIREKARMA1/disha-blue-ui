"use client"

import { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Upload, FileText, CheckCircle, AlertCircle, Loader } from 'lucide-react'
import { ApplicationData } from '@/app/dashboard/corporate/applications/page'
import { corporateModalBackdropClass, corporateModalShellClass, corporateModalHeaderClass } from '@/components/corporate/corporate-ui'
import { cn } from '@/lib/utils'

interface OfferLetterUploadModalProps {
  isOpen: boolean
  onClose: () => void
  application: ApplicationData | null
  onSubmit: (applicationId: string, file: File) => void
}

export function OfferLetterUploadModal({
  isOpen,
  onClose,
  application,
  onSubmit
}: OfferLetterUploadModalProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [isDragOver, setIsDragOver] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
  const maxSize = 10 * 1024 * 1024 // 10MB

  const handleFileSelect = (file: File) => {
  setError(null)

  // Validate file type
  if (!allowedTypes.includes(file.type)) {
  setError('Please select a PDF, DOC, or DOCX file.')
  return
  }

  // Validate file size
  if (file.size > maxSize) {
  setError('File size must be less than 10MB.')
  return
  }

  setSelectedFile(file)
  }

  const handleDrop = (e: React.DragEvent) => {
  e.preventDefault()
  setIsDragOver(false)

  const files = Array.from(e.dataTransfer.files)
  if (files.length > 0) {
  handleFileSelect(files[0])
  }
  }

  const handleDragOver = (e: React.DragEvent) => {
  e.preventDefault()
  setIsDragOver(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
  e.preventDefault()
  setIsDragOver(false)
  }

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  const files = e.target.files
  if (files && files.length > 0) {
  handleFileSelect(files[0])
  }
  }

  const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault()
  if (!application || !selectedFile) return

  setIsSubmitting(true)
  try {
  await onSubmit(application.id, selectedFile)
  handleClose()
  } catch (err) {
  console.error('Upload failed:', err)
  } finally {
  setIsSubmitting(false)
  }
  }

  const handleClose = () => {
  if (!isSubmitting) {
  setSelectedFile(null)
  setError(null)
  onClose()
  }
  }

  const formatFileSize = (bytes: number) => {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  if (!application) return null

  return (
  <AnimatePresence>
  {isOpen && (
  <div className={cn(corporateModalBackdropClass, 'z-[110]')}>
  <motion.div
  initial={{ opacity: 0 }}
  animate={{ opacity: 1 }}
  exit={{ opacity: 0 }}
  className="absolute inset-0"
  onClick={handleClose}
  />

  <motion.div
  initial={{ opacity: 0, scale: 0.97, y: 12 }}
  animate={{ opacity: 1, scale: 1, y: 0 }}
  exit={{ opacity: 0, scale: 0.97, y: 12 }}
  className={cn(corporateModalShellClass, 'relative z-[1] w-full max-w-lg max-h-[90vh] overflow-hidden')}
  onClick={(e) => e.stopPropagation()}
  >
  <div className={cn(corporateModalHeaderClass, 'flex items-start justify-between gap-4')}>
  <div>
  <h2 className="font-display text-xl font-semibold tracking-tight text-foreground">
  Upload offer letter
  </h2>
  <p className="text-sm text-muted-foreground mt-1">
  {application.student_name} · {application.job_title}
  </p>
  </div>
  <button
  type="button"
  onClick={handleClose}
  disabled={isSubmitting}
  className="shrink-0 rounded-xl p-2 text-muted-foreground transition-colors hover:bg-muted disabled:opacity-50"
  >
  <X className="w-5 h-5" />
  </button>
  </div>

  <form onSubmit={handleSubmit} className="p-6 space-y-6 bg-card/40">
  {/* File Upload Area */}
  <div
  className={cn(
  'relative rounded-2xl border-2 border-dashed p-8 text-center transition-colors',
  isDragOver
  ? 'border-primary/50 bg-primary/8'
  : 'border-border hover:border-primary/30 bg-muted/20',
  )}
  onDrop={handleDrop}
  onDragOver={handleDragOver}
  onDragLeave={handleDragLeave}
  >
  <input
  ref={fileInputRef}
  type="file"
  accept=".pdf,.doc,.docx"
  onChange={handleFileInputChange}
  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
  disabled={isSubmitting}
  />

  {selectedFile ? (
  <div className="space-y-3">
  <div className="flex items-center justify-center w-12 h-12 mx-auto bg-green-100 dark:bg-green-900/20 rounded-full">
  <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400" />
  </div>
  <div>
  <p className="text-sm font-medium text-gray-900 dark:text-white">
  {selectedFile.name}
  </p>
  <p className="text-xs text-gray-500 dark:text-gray-400">
  {formatFileSize(selectedFile.size)}
  </p>
  </div>
  <button
  type="button"
  onClick={() => setSelectedFile(null)}
  className="text-sm text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300"
  >
  Remove file
  </button>
  </div>
  ) : (
  <div className="space-y-3">
  <div className="flex items-center justify-center w-12 h-12 mx-auto bg-gray-100 dark:bg-gray-700 rounded-full">
  <Upload className="w-6 h-6 text-gray-400" />
  </div>
  <div>
  <p className="text-sm font-medium text-gray-900 dark:text-white">
  Drop your offer letter here
  </p>
  <p className="text-xs text-gray-500 dark:text-gray-400">
  or click to browse files
  </p>
  </div>
  <p className="text-xs text-gray-400 dark:text-gray-500">
  PDF, DOC, DOCX up to 10MB
  </p>
  </div>
  )}
  </div>

  {/* Error Message */}
  {error && (
  <div className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-lg">
  <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0" />
  <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
  </div>
  )}

  {/* File Requirements */}
  <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
  <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
  File Requirements:
  </h4>
  <ul className="text-xs text-muted-foreground space-y-1">
  <li>• Supported formats: PDF, DOC, DOCX</li>
  <li>• Maximum file size: 10MB</li>
  <li>• File will be stored securely and shared with the candidate</li>
  </ul>
  </div>

  {/* Actions */}
  <div className="flex flex-col-reverse gap-3 pt-4 border-t border-border sm:flex-row sm:justify-end">
  <button
  type="button"
  onClick={handleClose}
  disabled={isSubmitting}
  className="rounded-xl border border-border bg-background px-4 py-2.5 text-sm font-medium transition-colors hover:bg-muted disabled:opacity-50"
  >
  Cancel
  </button>
  <button
  type="submit"
  disabled={!selectedFile || isSubmitting}
  className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-primary to-secondary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-md transition hover:opacity-95 disabled:opacity-50"
  >
  {isSubmitting ? (
  <>
  <Loader className="w-4 h-4 animate-spin" />
  Uploading...
  </>
  ) : (
  <>
  <Upload className="w-4 h-4" />
  Upload Offer Letter
  </>
  )}
  </button>
  </div>
  </form>
  </motion.div>
  </div>
  )}
  </AnimatePresence>
  )
}
