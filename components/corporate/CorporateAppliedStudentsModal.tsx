"use client"

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, User, Mail, Phone, Calendar, MapPin, GraduationCap, Building, Eye, Download } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { apiClient } from '@/lib/api'
import { toast } from 'react-hot-toast'
import { StudentProfileModal } from '@/components/dashboard/StudentProfileModal'
import { StudentListItem } from '@/types/university'
import { exportAppliedStudentsToExcel, AppliedStudentExport } from '@/utils/exportToExcel'
import {
  corporateModalBackdropClass,
  corporateModalShellClass,
  corporateModalHeaderClass,
  corporateSurfaceClass,
} from '@/components/corporate/corporate-ui'
import { cn } from '@/lib/utils'

interface Job {
  id: string
  title: string
  corporate_name?: string
}

interface AppliedStudent extends AppliedStudentExport {
  profile_picture?: string
}

interface CorporateAppliedStudentsModalProps {
  isOpen: boolean
  onClose: () => void
  job: Job | null
}

export function CorporateAppliedStudentsModal({ isOpen, onClose, job }: CorporateAppliedStudentsModalProps) {
  const [students, setStudents] = useState<AppliedStudent[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showProfileModal, setShowProfileModal] = useState(false)
  const [selectedStudent, setSelectedStudent] = useState<StudentListItem | null>(null)
  const [isLoadingProfile, setIsLoadingProfile] = useState(false)
  const [fullProfileData, setFullProfileData] = useState<any>(null)

  // Fetch applied students when modal opens
  useEffect(() => {
  if (isOpen && job) {
  fetchAppliedStudents()
  }
  }, [isOpen, job])

  const fetchAppliedStudents = async () => {
  if (!job) return

  try {
  setIsLoading(true)
  setError(null)

  // Use the corporate applications endpoint
  const response = await apiClient.getJobApplications(job.id)

  if (response && response.applications) {
  // Transform the applications data to match AppliedStudent interface
  const appliedStudents: AppliedStudent[] = response.applications.map((app: any) => ({
  id: app.student_id,
  name: app.student_name,
  email: app.student_email,
  phone: app.phone || '',
  university_id: app.university_id || '',
  degree: app.degree || '',
  branch: app.branch || '',
  graduation_year: app.graduation_year || 0,
  cgpa: app.cgpa || 0,
  applied_at: app.applied_at,
  status: app.status,
  cover_letter: app.cover_letter,
  expected_salary: app.expected_salary,
  availability_date: app.availability_date,
  city: app.city || '',
  skills: app.technical_skills ? app.technical_skills.split(', ') : [],
  profile_picture: app.profile_picture || '',

  // Document fields
  resume: app.resume || '',
  tenth_certificate: app.tenth_certificate || '',
  twelfth_certificate: app.twelfth_certificate || '',
  internship_certificates: app.internship_certificates || '',

  // Skills tab fields
  technical_skills: app.technical_skills || '',
  soft_skills: app.soft_skills || '',
  certifications: app.certifications || '',
  preferred_industry: app.preferred_industry || '',
  job_roles_of_interest: app.job_roles_of_interest || '',
  location_preferences: app.location_preferences || '',
  language_proficiency: app.language_proficiency || '',

  // Experience tab fields
  internship_experience: app.internship_experience || '',
  project_details: app.project_details || '',
  extracurricular_activities: app.extracurricular_activities || '',

  // Social tab fields
  linkedin_profile: app.linkedin_profile || '',
  github_profile: app.github_profile || '',
  personal_website: app.personal_website || '',

  // Additional profile fields
  bio: app.bio || '',
  institution: app.institution || '',
  major: app.major || '',
  dob: app.dob || '',
  gender: app.gender || '',
  country: app.country || '',
  state: app.state || '',
  tenth_grade_percentage: app.tenth_grade_percentage || 0,
  twelfth_grade_percentage: app.twelfth_grade_percentage || 0,
  total_percentage: app.total_percentage || 0,
  email_verified: app.email_verified || false,
  phone_verified: app.phone_verified || false,
  created_at: app.created_at || app.applied_at,
  updated_at: app.updated_at || app.applied_at,
  last_login: app.last_login || '',
  profile_completion_percentage: app.profile_completion_percentage || 0,
  college_id: app.college_id || ''
  }))

  setStudents(appliedStudents)
  } else {
  setStudents([])
  }
  } catch (error: any) {
  console.error('Failed to fetch applied students:', error)
  setError('Failed to load applied students. Please try again.')
  toast.error('Failed to load applied students')
  } finally {
  setIsLoading(false)
  }
  }

  const handleExportExcel = () => {
  if (students.length === 0) {
  toast.error('No data to export')
  return
  }

  try {
  exportAppliedStudentsToExcel(students, job?.title || 'Unknown Job', job?.corporate_name)
  toast.success('File downloaded successfully! (CSV format)')
  } catch (error) {
  console.error('Export error:', error)
  toast.error('Failed to export data. Please try again.')
  }
  }

  const handleViewStudentProfile = async (student: AppliedStudent) => {
  try {
  setIsLoadingProfile(true)

  // Convert AppliedStudent to StudentListItem format
  const studentListItem: StudentListItem = {
  id: student.id,
  name: student.name,
  email: student.email,
  phone: student.phone || '',
  university_id: student.university_id || '',
  degree: student.degree || '',
  branch: student.branch || '',
  graduation_year: student.graduation_year || 0,
  btech_cgpa: student.cgpa || 0,
  profile_picture: student.profile_picture || '',
  city: student.city || '',
  placement_status: student.status || 'active',
  total_applications: 0,
  interviews_attended: 0,
  offers_received: 0,
  profile_completion_percentage: student.profile_completion_percentage || 0,
  is_archived: false,
  created_at: student.created_at || student.applied_at,

  // Skills tab data
  technical_skills: student.technical_skills || '',
  soft_skills: student.soft_skills || '',
  certifications: student.certifications || '',
  preferred_industry: student.preferred_industry || '',
  job_roles_of_interest: student.job_roles_of_interest || '',
  location_preferences: student.location_preferences || '',
  language_proficiency: student.language_proficiency || '',

  // Experience tab data
  internship_experience: student.internship_experience || '',
  project_details: student.project_details || '',
  extracurricular_activities: student.extracurricular_activities || '',

  // Social tab data
  linkedin_profile: student.linkedin_profile || '',
  github_profile: student.github_profile || '',
  personal_website: student.personal_website || '',

  // Document data
  resume: student.resume || '',
  tenth_certificate: student.tenth_certificate || '',
  twelfth_certificate: student.twelfth_certificate || '',
  internship_certificates: student.internship_certificates || '',

  // Additional profile data
  bio: student.bio || '',
  institution: student.institution || '',
  major: student.major || '',
  dob: student.dob || '',
  gender: student.gender || '',
  country: student.country || '',
  state: student.state || '',
  tenth_grade_percentage: student.tenth_grade_percentage || 0,
  twelfth_grade_percentage: student.twelfth_grade_percentage || 0,
  total_percentage: student.total_percentage || 0,
  email_verified: student.email_verified || false,
  phone_verified: student.phone_verified || false,
  status: student.status || 'active',
  college_id: student.college_id || ''
  }

  setSelectedStudent(studentListItem)
  setShowProfileModal(true)

  // Set the full profile data to null since we're using the complete data from applied students
  setFullProfileData(null)
  } catch (error) {
  console.error('Failed to load student profile:', error)
  toast.error('Failed to load student profile')
  } finally {
  setIsLoadingProfile(false)
  }
  }

  const formatDate = (dateString: string) => {
  try {
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', {
  year: 'numeric',
  month: 'short',
  day: 'numeric',
  hour: '2-digit',
  minute: '2-digit'
  })
  } catch (error) {
  return 'Invalid date'
  }
  }

  const getStatusColor = (status: string) => {
  const colors = {
  applied: 'border border-primary/25 bg-primary/10 text-primary',
  shortlisted: 'border border-emerald-500/25 bg-emerald-500/10 text-emerald-800 dark:text-emerald-200',
  rejected: 'border border-destructive/25 bg-destructive/10 text-destructive',
  hired: 'border border-secondary/30 bg-secondary/12 text-secondary-foreground',
  withdrawn: 'border border-border bg-muted text-muted-foreground',
  }
  return colors[status as keyof typeof colors] || colors.applied
  }

  const getStatusLabel = (status: string) => {
  const labels = {
  applied: 'Applied',
  shortlisted: 'Shortlisted',
  rejected: 'Rejected',
  hired: 'Hired',
  withdrawn: 'Withdrawn'
  }
  return labels[status as keyof typeof labels] || status
  }

  const filteredStudents = students // For now, no filtering - can add search functionality later

  const handleClose = () => {
  setStudents([])
  setError(null)
  setSelectedStudent(null)
  setFullProfileData(null)
  onClose()
  }

  if (!isOpen) return null

  return (
  <>
  <AnimatePresence>
  <motion.div
  initial={{ opacity: 0 }}
  animate={{ opacity: 1 }}
  exit={{ opacity: 0 }}
  className={cn(corporateModalBackdropClass, 'z-[110]')}
  onClick={handleClose}
  >
  <motion.div
  initial={{ scale: 0.97, opacity: 0, y: 10 }}
  animate={{ scale: 1, opacity: 1, y: 0 }}
  exit={{ scale: 0.97, opacity: 0, y: 10 }}
  className={cn(corporateModalShellClass, 'flex max-h-[90vh] w-full max-w-6xl flex-col')}
  onClick={(e) => e.stopPropagation()}
  >
  <div className={cn(corporateModalHeaderClass, 'flex-shrink-0 space-y-4')}>
  <div className="flex items-start justify-between gap-4">
  <div>
  <h2 className="font-display text-xl font-semibold tracking-tight text-foreground">
  Applicants for this role
  </h2>
  <p className="text-sm text-muted-foreground mt-1">
  Review everyone who applied—export or open a full profile.
  </p>
  </div>
  <Button
  variant="ghost"
  size="sm"
  onClick={handleClose}
  className="h-9 w-9 shrink-0 rounded-xl p-0"
  >
  <X className="h-4 w-4" />
  </Button>
  </div>

  <div className={cn(corporateSurfaceClass, 'p-4')}>
  <h3 className="font-semibold text-foreground">{job?.title}</h3>
  {job?.corporate_name && (
  <p className="text-sm text-muted-foreground mt-1">{job.corporate_name}</p>
  )}
  <p className="text-xs font-medium text-muted-foreground mt-2 tabular-nums">
  {students.length} application{students.length !== 1 ? 's' : ''}
  </p>
  </div>
  </div>

  <div className="flex flex-1 flex-col overflow-y-auto min-h-0 bg-card/30 p-5 sm:p-6">
  {isLoading ? (
  <div className="flex flex-col items-center justify-center gap-3 py-16">
  <div className="h-10 w-10 animate-spin rounded-full border-2 border-primary border-t-transparent" />
  <p className="text-sm text-muted-foreground">Loading applicants…</p>
  </div>
  ) : error ? (
  <div className={cn(corporateSurfaceClass, 'py-10 text-center')}>
  <p className="text-destructive text-sm font-medium mb-4">{error}</p>
  <Button onClick={fetchAppliedStudents} variant="outline" className="rounded-xl">
  Try again
  </Button>
  </div>
  ) : students.length > 0 ? (
  <div className="overflow-x-auto rounded-xl border border-border/70 bg-card/50">
  <table className="w-full min-w-[800px] border-collapse text-sm">
  <thead>
  <tr className="border-b border-border bg-muted/35">
  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">Student</th>
  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">University</th>
  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">Education</th>
  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">Applied</th>
  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">Stage</th>
  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">Actions</th>
  </tr>
  </thead>
  <tbody className="divide-y divide-border">
  {filteredStudents.map((student) => (
  <tr key={student.id} className="transition-colors hover:bg-muted/30">
  <td className="py-3 px-4">
  <div className="flex items-center gap-3">
  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-primary/30 to-secondary/30 ring-2 ring-background">
  {student.profile_picture ? (
  <img
  src={student.profile_picture}
  alt={student.name}
  className="w-10 h-10 rounded-full object-cover"
  />
  ) : (
  <User className="w-5 h-5 text-white" />
  )}
  </div>
  <div>
  <h4 className="font-semibold text-foreground">
  {student.name}
  </h4>
  <div className="flex items-center gap-2 text-xs text-muted-foreground">
  <Mail className="w-3 h-3" />
  <span>{student.email}</span>
  </div>
  {student.phone && (
  <div className="flex items-center gap-2 text-xs text-muted-foreground">
  <Phone className="w-3 h-3" />
  <span>{student.phone}</span>
  </div>
  )}
  </div>
  </div>
  </td>
  <td className="py-3 px-4">
  <div className="flex items-center gap-2 text-sm text-muted-foreground">
  <Building className="h-4 w-4 shrink-0 opacity-70" />
  <span>{student.university_id || 'Not specified'}</span>
  </div>
  </td>
  <td className="py-3 px-4">
  <div className="text-sm">
  <div className="text-foreground font-medium">
  {student.degree || 'Not specified'}
  </div>
  <div className="text-muted-foreground">
  {student.branch && `${student.branch}`}
  {student.graduation_year && ` • ${student.graduation_year}`}
  </div>
  {student.cgpa && (
  <div className="text-muted-foreground">
  CGPA: {student.cgpa}
  </div>
  )}
  </div>
  </td>
  <td className="py-3 px-4">
  <div className="flex items-center gap-2 text-sm text-muted-foreground">
  <Calendar className="w-4 h-4 shrink-0 opacity-70" />
  <span>{formatDate(student.applied_at)}</span>
  </div>
  </td>
  <td className="py-3 px-4">
  <span className={cn('inline-flex rounded-full px-2.5 py-1 text-xs font-semibold', getStatusColor(student.status))}>
  {getStatusLabel(student.status)}
  </span>
  </td>
  <td className="py-3 px-4">
  <div className="flex items-center gap-2">
  <Button
  variant="outline"
  size="sm"
  onClick={() => handleViewStudentProfile(student)}
  disabled={isLoadingProfile}
  className="h-9 rounded-xl px-3"
  >
  {isLoadingProfile ? (
  <div className="w-4 h-4 border-2 border-gray-300 border-t-transparent rounded-full animate-spin mr-1" />
  ) : (
  <Eye className="w-4 h-4 mr-1" />
  )}
  View
  </Button>
  </div>
  </td>
  </tr>
  ))}
  </tbody>
  </table>
  </div>
  ) : (
  <div className={cn(corporateSurfaceClass, 'py-14 text-center')}>
  <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-2xl bg-primary/10 text-primary">
  <User className="h-10 w-10" />
  </div>
  <h3 className="text-lg font-semibold text-foreground mb-2">
  No applicants yet
  </h3>
  <p className="text-sm text-muted-foreground max-w-sm mx-auto leading-relaxed">
  When candidates apply, they will appear in this table with stage and profile actions.
  </p>
  </div>
  )}
  </div>

  {/* Footer */}
  <div className="flex-shrink-0 border-t border-border bg-muted/20 p-5">
  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
  <div className="text-sm text-muted-foreground">
  Showing {filteredStudents.length} application{filteredStudents.length !== 1 ? 's' : ''}
  </div>
  <div className="flex items-center gap-3">
  <Button
  variant="outline"
  onClick={handleClose}
  className="rounded-xl px-6"
  >
  Close
  </Button>
  {students.length > 0 && (
  <Button
  onClick={handleExportExcel}
  className="rounded-xl bg-gradient-to-r from-primary to-secondary text-primary-foreground shadow-md hover:opacity-95"
  >
  <Download className="w-4 h-4 mr-2" />
  Export
  </Button>
  )}
  </div>
  </div>
  </div>
  </motion.div>
  </motion.div>
  </AnimatePresence>

  {/* Student Profile Modal */}
  {showProfileModal && selectedStudent && (
  <StudentProfileModal
  isOpen={showProfileModal}
  onClose={() => {
  setShowProfileModal(false)
  setSelectedStudent(null)
  }}
  student={selectedStudent}
  fullProfile={fullProfileData}
  isLoading={isLoadingProfile}
  />
  )}
  </>
  )
}