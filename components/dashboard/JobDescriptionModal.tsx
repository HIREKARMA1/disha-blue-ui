"use client"

import { motion, AnimatePresence } from 'framer-motion'
import { X, MapPin, Briefcase, Clock, DollarSign, Users, Building, Calendar, Globe, Car, GraduationCap, Award, CheckCircle, ExternalLink, Shield, Download } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { apiClient } from '@/lib/api'
import { useState, useEffect } from 'react'
import { downloadJobDescriptionPDF } from '@/lib/pdfGenerator'
import { toast } from 'react-hot-toast'

interface Job {
 id: string
 title: string
 description: string
 requirements?: string
 responsibilities?: string
 job_type: string
 status: string
 location: string | string[]
 remote_work: boolean
 travel_required: boolean
 onsite_office?: boolean
 mode_of_work?: string
 salary_min?: number
 salary_max?: number
 salary_currency: string
 experience_min?: number
 experience_max?: number
 education_level?: string | string[]
 education_degree?: string | string[]
 education_branch?: string | string[]
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
 corporate_id?: string | null
 corporate_name?: string
 is_active: boolean
 can_apply: boolean
 // Additional fields
 number_of_openings?: number
 perks_and_benefits?: string
 eligibility_criteria?: string
 service_agreement_details?: string
 expiration_date?: string
 ctc_with_probation?: string
 ctc_after_probation?: string
 // Company information fields (for university-created jobs)
 company_name?: string
 company_logo?: string
 company_website?: string
 company_address?: string
 company_size?: string
 company_type?: string
 company_founded?: number
 company_description?: string
 contact_person?: string
 contact_designation?: string
}

interface CorporateProfile {
 id: string
 company_name: string
 website_url?: string
 industry?: string
 company_size?: string
 founded_year?: number
 description?: string
 company_type?: string
 company_logo?: string
 verified: boolean
 contact_person?: string
 contact_designation?: string
 address?: string
}

interface JobDescriptionModalProps {
 job: Job
 onClose: () => void
 onApply: () => void
 isApplying?: boolean
 showApplyButton?: boolean // New prop to control apply button visibility
 applicationStatus?: string // Add application status prop
 hideSensitiveInfo?: boolean // New prop to hide sensitive company information for students
}

export function JobDescriptionModal({ job, onClose, onApply, isApplying = false, showApplyButton = true, applicationStatus, hideSensitiveInfo = false }: JobDescriptionModalProps) {
 const [corporateProfile, setCorporateProfile] = useState<CorporateProfile | null>(null)
 const [loadingCorporate, setLoadingCorporate] = useState(false)
 const [corporateError, setCorporateError] = useState<string | null>(null)
 const [isDownloadingPDF, setIsDownloadingPDF] = useState(false)

 // Helper function to parse and format education data
const parseEducationData = (data: string | string[] | undefined): string[] => {
 if (!data) return []

 if (Array.isArray(data)) {
 return data
 }

 // Handle complex escaped JSON strings from backend payloads
 if (typeof data === 'string') {
 let cleanData = data.trim()

 // First, try to extract values from complex escaped JSON format
 // Look for patterns like: diploma, bachelor, master within the string
const valueMatches = cleanData.match(/([a-zA-Z\s]+)(?=\\?\"|$)/g)
 if (valueMatches) {
 const cleanValues = valueMatches
 .map(match => match.trim())
 .filter(match => match && match.length > 0 && !match.match(/^[{}[\]",\\]+$/))
 .map(match => match.replace(/\\/g,'').replace(/"/g,'').trim())
 .filter(match => match.length > 0)

 if (cleanValues.length > 0) {
 return cleanValues
 }
 }

 // Try to parse as JSON
 try {
 // Handle cases like '{"Bachelor of Engineering"}'
 if (cleanData.startsWith('{"') && cleanData.endsWith('"}')) {
const innerContent = cleanData.slice(2, -2) // Remove '{"' and '"}'
 return [innerContent]
 }

 // Handle escaped JSON strings like '"[\"diploma\",\"bachelor\"]"'
 if (cleanData.startsWith('"') && cleanData.endsWith('"')) {
 cleanData = cleanData.slice(1, -1)
 }

 const parsed = JSON.parse(cleanData)

 if (Array.isArray(parsed)) {
 return parsed
 }

 // If it's a string containing JSON, try to parse it
 if (typeof parsed ==='string') {
 const innerParsed = JSON.parse(parsed)
 if (Array.isArray(innerParsed)) {
 return innerParsed
 }
 // Handle single string values
 return [innerParsed]
 }

 // Handle single string values
 if (typeof parsed ==='string') {
 return [parsed]
 }
 } catch (error) {
 // If JSON parsing fails, try to extract clean values manually
 console.warn('Failed to parse education data as JSON, extracting values manually:', data)

 // Extract text values from the string, ignoring JSON syntax
const textMatches = cleanData.match(/[a-zA-Z][a-zA-Z\s]*[a-zA-Z]|[a-zA-Z]/g)
 if (textMatches) {
 return textMatches
 .map(match => match.trim())
 .filter(match => match.length > 0)
 }
 }

 // Final fallback: treat as comma-separated string
 return cleanData.split(',').map(item => item.trim()).filter(item => item)
 }

 return []
 }

 // Helper function to format education labels
const formatEducationLabel = (level: string): string => {
 switch (level.toLowerCase()) {
 case 'high_school': return 'High School'
 case 'diploma': return 'Diploma'
 case 'bachelor': return 'Bachelor\'s Degree'
 case 'master': return 'Master\'s Degree'
 case 'phd': return 'PhD'
 case 'any': return 'Any'
 default: return level
 }
 }

 useEffect(() => {
 const fetchCorporateProfile = async () => {
 // Validate corporate_id - check for null, undefined, empty string, or"None"string
const corporateId = job.corporate_id;
 const hasValidCorporateId = corporateId &&
 corporateId !=='None'&&
 corporateId !=='null'&&
 corporateId !=='undefined'&&
 (typeof corporateId ==='string'&& corporateId.trim() !=='');

 // Store validated corporate ID as string for TypeScript
const validCorporateId: string | null = hasValidCorporateId ? (corporateId as string) : null;

 // Check if this is a university-created job (on-campus job)
 // University-created jobs have company information in job fields instead of corporate_id
const isUniversityCreatedJob = !hasValidCorporateId && (
 job.company_name ||
 job.company_logo ||
 job.company_website ||
 job.company_address ||
 job.company_description ||
 job.contact_person
 );

 // For university-created jobs (on-campus jobs), use company information from job fields
 if (isUniversityCreatedJob) {
 // Create corporate profile from job's company information fields
 // This ensures university-created jobs display company info the same way as corporate jobs
const profileFromJob: CorporateProfile = {
 id: job.id, // Use job ID as temporary ID
 company_name: job.company_name || job.corporate_name ||'Company',
 website_url: job.company_website,
 industry: job.industry,
 company_size: job.company_size,
 founded_year: job.company_founded,
 description: job.company_description,
 company_type: job.company_type,
 company_logo: job.company_logo,
 verified: false, // University-created jobs are not verified
 contact_person: job.contact_person,
 contact_designation: job.contact_designation,
 address: job.company_address
 }
 setCorporateProfile(profileFromJob)
 setCorporateError(null)
 setLoadingCorporate(false)
 return
 }

 // For corporate-created jobs, fetch from corporate profile API
 if (!validCorporateId) {
 setLoadingCorporate(false)
 setCorporateProfile(null)
 return
 }

 setLoadingCorporate(true)
 setCorporateError(null)

 try {
 const profile = await apiClient.getPublicCorporateProfile(validCorporateId)
 setCorporateProfile(profile)
 } catch (error) {
 console.error('Failed to fetch corporate profile:', error)
 setCorporateError('Failed to load company information')
 } finally {
 setLoadingCorporate(false)
 }
 }

 fetchCorporateProfile()
 }, [job.corporate_id, job.company_name, job.company_logo, job.company_website, job.company_address, job.company_description, job.contact_person])

 const handleDownloadPDF = async () => {
 setIsDownloadingPDF(true)
 try {
 // Helper function to convert education data to readable string
const formatEducationForPDF = (data: string | string[] | undefined): string => {
 if (!data) return ''
 const parsed = parseEducationData(data)
 return parsed.map(item => formatEducationLabel(item)).join(',')
 }

 // Convert job data to match PDF generator interface with all fields
const jobData = {
 id: job.id,
 title: job.title,
 description: job.description,
 requirements: job.requirements,
 responsibilities: job.responsibilities,
 job_type: job.job_type,
 location: Array.isArray(job.location) ? job.location.join(',') : job.location,
 remote_work: job.remote_work,
 travel_required: job.travel_required,
 onsite_office: (() => {
 // Use the same logic as EditJobModal for consistency
 if (job.mode_of_work) {
 return job.mode_of_work ==='onsite'|| job.mode_of_work ==='hybrid'} else {
 // Fallback for existing jobs: if remote_work is false and no mode_of_work, assume onsite
 return !job.remote_work
 }
 })(),
 salary_min: job.salary_min,
 salary_max: job.salary_max,
 salary_currency: job.salary_currency,
 experience_min: job.experience_min,
 experience_max: job.experience_max,
 education_level: formatEducationForPDF(job.education_level),
 education_degree: formatEducationForPDF(job.education_degree),
 education_branch: formatEducationForPDF(job.education_branch),
 skills_required: job.skills_required,
 application_deadline: job.application_deadline,
 industry: job.industry,
 selection_process: job.selection_process,
 campus_drive_date: job.campus_drive_date,
 corporate_name: job.corporate_name,
 corporate_id: job.corporate_id || undefined,
 created_at: job.created_at,
 number_of_openings: job.number_of_openings,
 perks_and_benefits: job.perks_and_benefits,
 eligibility_criteria: job.eligibility_criteria,
 service_agreement_details: job.service_agreement_details,
 expiration_date: job.expiration_date,
 status: job.status,
 ctc_with_probation: job.ctc_with_probation,
 ctc_after_probation: job.ctc_after_probation,
 }

 console.log('Corporate Profile being passed to PDF:', corporateProfile)
 const success = await downloadJobDescriptionPDF(jobData, corporateProfile || undefined)
 if (success) {
 toast.success('Job description PDF downloaded successfully!')
 } else {
 toast.error('Failed to generate PDF. Please try again.')
 }
 } catch (error) {
 console.error('Error downloading PDF:', error)
 toast.error('Failed to generate PDF. Please try again.')
 } finally {
 setIsDownloadingPDF(false)
 }
 }


 const formatSalary = (currency: string, min?: number, max?: number) => {
 if (!min && !max) return 'Not specified'
 if (min && max) return `${currency} ${min.toLocaleString()} - ${max.toLocaleString()}`
 if (min) return `${currency} ${min.toLocaleString()}+`
 if (max) return `${currency} Up to ${max.toLocaleString()}`
 return'Not specified'}

 const formatExperience = (min?: number, max?: number) => {
 if (min === undefined && max === undefined) return 'Not specified'
 if (min !== undefined && max !== undefined) return `${min}-${max} years`
 if (min !== undefined) return `${min}+ years`
 if (max !== undefined) return `Up to ${max} years`
 return'Not specified'}

 const formatDate = (dateString: string) => {
 const date = new Date(dateString)
 return date.toLocaleDateString('en-US', {
 year:'numeric',
 month:'long',
 day:'numeric'})
 }

 const getJobTypeLabel = (jobType: string) => {
 const labels = {
 full_time:'Full Time',
 part_time:'Part Time',
 contract:'Contract',
 internship:'Internship',
 freelance:'Freelance'}
 return labels[jobType as keyof typeof labels] || jobType
 }

 const isDeadlineExpired = () => {
 if (!job.application_deadline) return false
 const deadline = new Date(job.application_deadline)
 const now = new Date()
 return deadline < now
 }

 const canApply = () => {
 return applicationStatus !=='applied'&& !isDeadlineExpired() && job.can_apply
 }

 return (
 <AnimatePresence>
 <motion.div
 initial={{ opacity: 0 }}
 animate={{ opacity: 1 }}
 exit={{ opacity: 0 }}
 className="fixed inset-0 z-[9999] flex items-center justify-center p-4"onClick={onClose}
 >
 <motion.div
 initial={{ opacity: 0, scale: 0.96, y: 16 }}
 animate={{ opacity: 1, scale: 1, y: 0 }}
 exit={{ opacity: 0, scale: 0.96, y: 16 }}
 transition={{ type:"spring", damping: 26, stiffness: 320 }}
 className="max-h-[92vh] w-full max-w-5xl overflow-hidden rounded-xl border bg-card"onClick={(e) => e.stopPropagation()}
 >
 <div className="flex max-h-[92vh] flex-col lg:max-h-[90vh] lg:flex-row">
 <div className="flex min-h-0 min-w-0 flex-1 flex-col">
 <div className="border-b px-5 py-5 sm:px-7 sm:py-6">
 <div className="flex items-start justify-between gap-4">
 <div className="min-w-0 flex-1">
 <p className="font-display text-[11px] font-semibold uppercase tracking-[0.2em] text-primary">
 Role
 </p>
 <h2 className="font-display mt-2 text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
 {job.title}
 </h2>
 {(job.company_name || job.corporate_name) && (
 <p className="mt-2 flex items-center gap-2 text-base font-medium text-muted-foreground">
 <Building className="h-5 w-5 shrink-0 text-primary"/>
 <span className="truncate">{job.company_name || job.corporate_name}</span>
 </p>
 )}
 </div>
 <button
 type="button"onClick={onClose}
 className="rounded-xl p-2 text-muted-foreground transition-colors hover:bg-muted">
 <X className="h-5 w-5"/>
 </button>
 </div>
 </div>

 <div className="min-h-0 flex-1 overflow-y-auto p-5 sm:p-7">
 <div className="mb-6 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
 <div className="bg-white rounded-xl border border-gray-200 p-4">
 <div className="flex items-center gap-3">
 <div className="p-2 rounded-xl bg-primary-100">
 <MapPin className="w-5 h-5 text-primary-600"/>
 </div>
 <div>
 <p className="text-sm text-gray-600">Location</p>
 <div className="flex flex-wrap gap-1">
 {Array.isArray(job.location) ? (
 job.location.map((loc, index) => (
 <span
 key={index}
 className="px-2 py-1 bg-gray-100 text-gray-800 text-sm font-medium">
 {loc}
 </span>
 ))
 ) : (
 <p className="font-medium text-gray-900">{job.location}</p>
 )}
 </div>
 {job.remote_work && (
 <span className="text-xs bg-blue-50 text-blue-800 px-2 py-1 mt-2 inline-block">
 Remote Available
 </span>
 )}
 </div>
 </div>
 </div>

 <div className="bg-white rounded-xl border border-gray-200 p-4">
 <div className="flex items-center gap-3">
 <div className="p-2 rounded-xl bg-blue-50">
 <DollarSign className="w-5 h-5 text-blue-600"/>
 </div>
 <div>
 <p className="text-sm text-gray-600">Salary Range</p>
 <p className="font-medium text-gray-900">
 {formatSalary(job.salary_currency, job.salary_min, job.salary_max)}
 </p>
 </div>
 </div>
 </div>

 <div className="bg-white rounded-xl border border-gray-200 p-4">
 <div className="flex items-center gap-3">
 <div className="p-2 rounded-xl bg-blue-50">
 <Briefcase className="w-5 h-5 text-blue-600"/>
 </div>
 <div>
 <p className="text-sm text-gray-600">Experience</p>
 <p className="font-medium text-gray-900">
 {formatExperience(job.experience_min, job.experience_max)}
 </p>
 </div>
 </div>
 </div>

 <div className="bg-white rounded-xl border border-gray-200 p-4">
 <div className="flex items-center gap-3">
 <div className="p-2 rounded-xl bg-orange-50">
 <Clock className="w-5 h-5 text-orange-600"/>
 </div>
 <div>
 <p className="text-sm text-gray-600">Job Type</p>
 <p className="font-medium text-gray-900">
 {getJobTypeLabel(job.job_type)}
 </p>
 </div>
 </div>
 </div>

 <div className="bg-white rounded-xl border border-gray-200 p-4">
 <div className="flex items-center gap-3">
 <div className="p-2 rounded-xl bg-red-50">
 <Calendar className="w-5 h-5 text-red-600"/>
 </div>
 <div>
 <p className="text-sm text-gray-600">Posted</p>
 <p className="font-medium text-gray-900">
 {formatDate(job.created_at)}
 </p>
 </div>
 </div>
 </div>

 {/* Work Mode */}
 <div className="bg-white rounded-xl border border-gray-200 p-4">
 <div className="flex items-center gap-3">
 <div className="p-2 rounded-xl bg-purple-50">
 <Building className="w-5 h-5 text-purple-600"/>
 </div>
 <div>
 <p className="text-sm text-gray-600">Work Mode</p>
 <p className="font-medium text-gray-900">
 {job.mode_of_work ? job.mode_of_work.charAt(0).toUpperCase() + job.mode_of_work.slice(1) :
 (job.onsite_office ?'Onsite': job.remote_work ?'Remote':'Not Specified')}
 </p>
 </div>
 </div>
 </div>

 {/* Job Status */}
 <div className="bg-white rounded-xl border border-gray-200 p-4">
 <div className="flex items-center gap-3">
 <div className={`p-2 rounded-xl ${job.status ==='active'?'bg-blue-50':'bg-gray-50'}`}>
 <CheckCircle className={`w-5 h-5 ${job.status ==='active'?'text-blue-600':'text-gray-600'}`} />
 </div>
 <div>
 <p className="text-sm text-gray-600">Status</p>
 <p className="font-medium text-gray-900 capitalize">
 {job.status} {job.is_active ?'(Active)':'(Inactive)'}
 </p>
 </div>
 </div>
 </div>

 {/* Number of Openings */}
 <div className="bg-white rounded-xl border border-gray-200 p-4">
 <div className="flex items-center gap-3">
 <div className="p-2 rounded-xl bg-indigo-50">
 <Users className="w-5 h-5 text-indigo-600"/>
 </div>
 <div>
 <p className="text-sm text-gray-600">Openings</p>
 <p className="font-medium text-gray-900">
 {job.number_of_openings ?
 `${job.number_of_openings} position${job.number_of_openings > 1 ?'s':''}` :'Not specified'}
 </p>
 </div>
 </div>
 </div>

 {/* Expiration Date */}
 {job.expiration_date && (
 <div className="bg-white rounded-xl border border-gray-200 p-4">
 <div className="flex items-center gap-3">
 <div className={`p-2 rounded-xl ${new Date(job.expiration_date) < new Date() ?'bg-red-50':'bg-yellow-50'}`}>
 <Calendar className={`w-5 h-5 ${new Date(job.expiration_date) < new Date() ?'text-red-600':'text-yellow-600'}`} />
 </div>
 <div>
 <p className="text-sm text-gray-600">Expires</p>
 <p className={`font-medium ${new Date(job.expiration_date) < new Date() ?'text-red-900':'text-yellow-900'}`}>
 {formatDate(job.expiration_date)}
 {new Date(job.expiration_date) < new Date() &&'(Expired)'}
 </p>
 </div>
 </div>
 </div>
 )}
 </div>

 {/* Company Information */}
 <div className="mb-6">
 <h3 className="text-xl font-semibold text-gray-900 mb-3 flex items-center gap-2">
 <Building className="w-5 h-5 text-primary-500"/>
 Company Information
 {corporateProfile?.verified && (
 <span className="ml-2 px-2 py-1 bg-blue-100 text-blue-800 text-xs flex items-center gap-1">
 <Shield className="w-3 h-3"/>
 Verified
 </span>
 )}
 </h3>

 {loadingCorporate ? (
 <div className="bg-white rounded-xl border border-gray-200 p-4">
 <div className="animate-pulse space-y-3">
 <div className="h-4 bg-gray-200 rounded-none w-3/4"></div>
 <div className="h-4 bg-gray-200 rounded-none w-1/2"></div>
 <div className="h-4 bg-gray-200 rounded-none w-2/3"></div>
 </div>
 </div>
 ) : corporateError ? (
 <div className="bg-red-50 border border-red-200 rounded-xl p-4">
 <p className="text-red-800">{corporateError}</p>
 </div>
 ) : corporateProfile ? (
 <div className="bg-white rounded-xl border border-gray-200 p-4">
 <div className="flex items-start gap-4">
 {corporateProfile.company_logo && (
 <img
 src={corporateProfile.company_logo}
 alt={corporateProfile.company_name}
 className="w-16 h-16 rounded-xl object-cover border border-gray-200"/>
 )}
 <div className="flex-1">
 <h4 className="text-lg font-semibold text-gray-900 mb-2">
 {corporateProfile.company_name}
 </h4>

 <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
 {/* Left Column */}
 <div className="space-y-3">
 {corporateProfile.industry && (
 <div className="flex items-center gap-2">
 <Building className="w-4 h-4 text-gray-500"/>
 <span className="text-gray-600">Industry:</span>
 <span className="text-gray-900 font-medium">{corporateProfile.industry}</span>
 </div>
 )}

 {corporateProfile.founded_year && (
 <div className="flex items-center gap-2">
 <Calendar className="w-4 h-4 text-gray-500"/>
 <span className="text-gray-600">Founded:</span>
 <span className="text-gray-900 font-medium">{corporateProfile.founded_year}</span>
 </div>
 )}

 {corporateProfile.website_url && (
 <div className="flex items-center gap-2">
 <Globe className="w-4 h-4 text-gray-500"/>
 <span className="text-gray-600">Website:</span>
 <a
 href={corporateProfile.website_url}
 target="_blank"rel="noopener noreferrer"className="text-primary-600 hover:text-primary-700 font-medium flex items-center gap-1">
 Visit Website
 <ExternalLink className="w-3 h-3"/>
 </a>
 </div>
 )}

 {corporateProfile.address && (
 <div className="flex items-start gap-2">
 <MapPin className="w-4 h-4 text-gray-500 mt-0.5"/>
 <div>
 <span className="text-gray-600">Address:</span>
 <p className="text-gray-900 font-medium">{corporateProfile.address}</p>
 </div>
 </div>
 )}
 </div>

 {/* Right Column */}
 <div className="space-y-3">
 {corporateProfile.company_size && (
 <div className="flex items-center gap-2">
 <Users className="w-4 h-4 text-gray-500"/>
 <span className="text-gray-600">Size:</span>
 <span className="text-gray-900 font-medium">{corporateProfile.company_size}</span>
 </div>
 )}

 {corporateProfile.company_type && (
 <div className="flex items-center gap-2">
 <Briefcase className="w-4 h-4 text-gray-500"/>
 <span className="text-gray-600">Type:</span>
 <span className="text-gray-900 font-medium capitalize">{corporateProfile.company_type}</span>
 </div>
 )}
 </div>
 </div>

 <div className="mt-4 pt-4 border-t border-gray-200">
 <h5 className="font-medium text-gray-900 mb-2">About {corporateProfile.company_name}</h5>
 <p className="text-gray-700 leading-relaxed text-sm">
 {corporateProfile.description ||'.'}
 </p>
 </div>

 {corporateProfile.contact_person && !hideSensitiveInfo && (
 <div className="mt-4 pt-4 border-t border-gray-200">
 <h5 className="font-medium text-gray-900 mb-2">Contact Information</h5>
 <div className="text-sm text-gray-600">
 <p><span className="font-medium">Contact Person:</span> {corporateProfile.contact_person}</p>
 {corporateProfile.contact_designation && (
 <p><span className="font-medium">Designation:</span> {corporateProfile.contact_designation}</p>
 )}
 </div>
 </div>
 )}
 </div>
 </div>
 </div>
 ) : (
 <div className="bg-gray-50 rounded-xl border border-gray-200 p-4">
 <p className="text-gray-500">Company information not available</p>
 </div>
 )}
 </div>

 {/* Job Description */}
 <div className="mb-6">
 <h3 className="text-xl font-semibold text-gray-900 mb-3 flex items-center gap-2">
 <Briefcase className="w-5 h-5 text-primary-500"/>
 Job Description
 </h3>
 <div className="bg-white rounded-xl border border-gray-200 p-4">
 <p className="text-gray-700 leading-relaxed">
 {job.description}
 </p>
 </div>
 </div>

 {/* Requirements */}
 {job.requirements && (
 <div className="mb-6">
 <h3 className="text-xl font-semibold text-gray-900 mb-3 flex items-center gap-2">
 <Award className="w-5 h-5 text-primary-500"/>
 Requirements
 </h3>
 <div className="bg-white rounded-xl border border-gray-200 p-4">
 <p className="text-gray-700 leading-relaxed">
 {job.requirements}
 </p>
 </div>
 </div>
 )}

 {/* Responsibilities */}
 {job.responsibilities && (
 <div className="mb-6">
 <h3 className="text-xl font-semibold text-gray-900 mb-3 flex items-center gap-2">
 <Briefcase className="w-5 h-5 text-primary-500"/>
 Responsibilities
 </h3>
 <div className="bg-white rounded-xl border border-gray-200 p-4">
 <p className="text-gray-700 leading-relaxed">
 {job.responsibilities}
 </p>
 </div>
 </div>
 )}

 {/* Skills Required */}
 {job.skills_required && job.skills_required.length > 0 && (
 <div className="mb-6">
 <h3 className="text-xl font-semibold text-gray-900 mb-3 flex items-center gap-2">
 <Award className="w-5 h-5 text-primary-500"/>
 Skills Required
 </h3>
 <div className="flex flex-wrap gap-2">
 {job.skills_required.map((skill, index) => (
 <span
 key={index}
 className="px-3 py-2 bg-primary-50 text-primary-800 rounded-xl font-medium border border-primary-200">
 {skill}
 </span>
 ))}
 </div>
 </div>
 )}

 {/* Education Level */}
 {job.education_level && (
 <div className="mb-6">
 <h3 className="text-xl font-semibold text-gray-900 mb-3 flex items-center gap-2">
 <GraduationCap className="w-5 h-5 text-primary-500"/>
 Education Level
 </h3>
 <div className="flex flex-wrap gap-2">
 {parseEducationData(job.education_level).map((level, index) => (
 <span
 key={index}
 className="px-3 py-2 bg-blue-50 text-blue-800 rounded-xl font-medium border border-blue-200">
 {formatEducationLabel(level)}
 </span>
 ))}
 </div>
 </div>
 )}

 {/* Education Degree */}
 {job.education_degree && (
 <div className="mb-6">
 <h3 className="text-xl font-semibold text-gray-900 mb-3 flex items-center gap-2">
 <GraduationCap className="w-5 h-5 text-primary-500"/>
 Education Degree
 </h3>
 <div className="flex flex-wrap gap-2">
 {parseEducationData(job.education_degree).map((degree, index) => (
 <span
 key={index}
 className="px-3 py-2 bg-blue-50 text-blue-800 rounded-xl font-medium border border-blue-200">
 {degree}
 </span>
 ))}
 </div>
 </div>
 )}

 {/* Education Branch */}
 {job.education_branch && (
 <div className="mb-6">
 <h3 className="text-xl font-semibold text-gray-900 mb-3 flex items-center gap-2">
 <GraduationCap className="w-5 h-5 text-primary-500"/>
 Education Branch
 </h3>
 <div className="flex flex-wrap gap-2">
 {parseEducationData(job.education_branch).map((branch, index) => (
 <span
 key={index}
 className="px-3 py-2 bg-purple-50 text-purple-800 rounded-xl font-medium border border-purple-200">
 {branch}
 </span>
 ))}
 </div>
 </div>
 )}

 {/* Industry */}
 {job.industry && (
 <div className="mb-6">
 <h3 className="text-xl font-semibold text-gray-900 mb-3 flex items-center gap-2">
 <Building className="w-5 h-5 text-primary-500"/>
 Industry
 </h3>
 <div className="bg-white rounded-xl border border-gray-200 p-4">
 <p className="text-gray-700 font-medium text-lg">
 {job.industry}
 </p>
 </div>
 </div>
 )}

 {/* Number of Openings */}
 <div className="mb-6">
 <h3 className="text-xl font-semibold text-gray-900 mb-3 flex items-center gap-2">
 <Users className="w-5 h-5 text-primary-500"/>
 Number of Openings
 </h3>
 <div className="bg-white rounded-xl border border-gray-200 p-4">
 <p className="text-gray-700 font-medium text-lg">
 {job.number_of_openings ?
 `${job.number_of_openings} position${job.number_of_openings > 1 ?'s':''} available` :'Not specified'}
 </p>
 </div>
 </div>

 {/* Perks and Benefits */}
 {job.perks_and_benefits && (
 <div className="mb-6">
 <h3 className="text-xl font-semibold text-gray-900 mb-3 flex items-center gap-2">
 <Award className="w-5 h-5 text-primary-500"/>
 Perks and Benefits
 </h3>
 <div className="bg-white rounded-xl border border-gray-200 p-4">
 <p className="text-gray-700 leading-relaxed">
 {job.perks_and_benefits}
 </p>
 </div>
 </div>
 )}

 {/* Eligibility Criteria */}
 {job.eligibility_criteria && (
 <div className="mb-6">
 <h3 className="text-xl font-semibold text-gray-900 mb-3 flex items-center gap-2">
 <CheckCircle className="w-5 h-5 text-primary-500"/>
 Eligibility Criteria
 </h3>
 <div className="bg-white rounded-xl border border-gray-200 p-4">
 <p className="text-gray-700 leading-relaxed">
 {job.eligibility_criteria}
 </p>
 </div>
 </div>
 )}

 {/* Service Agreement Details */}
 {job.service_agreement_details && (
 <div className="mb-6">
 <h3 className="text-xl font-semibold text-gray-900 mb-3 flex items-center gap-2">
 <Shield className="w-5 h-5 text-primary-500"/>
 Service Agreement Details
 </h3>
 <div className="bg-white rounded-xl border border-gray-200 p-4">
 <p className="text-gray-700 leading-relaxed">
 {job.service_agreement_details}
 </p>
 </div>
 </div>
 )}

 {/* CTC Details */}
 {(job.ctc_with_probation || job.ctc_after_probation) && (
 <div className="mb-6">
 <h3 className="text-xl font-semibold text-gray-900 mb-3 flex items-center gap-2">
 <DollarSign className="w-5 h-5 text-primary-500"/>
 CTC Details
 </h3>
 <div className="bg-white rounded-xl border border-gray-200 p-4">
 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
 {job.ctc_with_probation && (
 <div>
 <h4 className="font-medium text-gray-900 mb-1">During Probation</h4>
 <p className="text-gray-700">{job.ctc_with_probation}</p>
 </div>
 )}
 {job.ctc_after_probation && (
 <div>
 <h4 className="font-medium text-gray-900 mb-1">Probation Duration</h4>
 <p className="text-gray-700">{job.ctc_after_probation}</p>
 </div>
 )}
 </div>
 </div>
 </div>
 )}

 {/* Additional Job Details */}
 <div className="mb-6">
 <h3 className="text-xl font-semibold text-gray-900 mb-3 flex items-center gap-2">
 <Briefcase className="w-5 h-5 text-primary-500"/>
 Additional Job Details
 </h3>
 <div className="bg-white rounded-xl border border-gray-200 p-4">
 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
 {/* Left Column */}
 <div className="space-y-4">
 {/* Industry */}
 <div>
 <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
 <Building className="w-4 h-4 text-primary-500"/>
 Industry
 </h4>
 <p className="text-gray-700">
 {job.industry ||'Not specified'}
 </p>
 </div>

 {/* Remote Work */}
 <div>
 <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
 <Globe className="w-4 h-4 text-primary-500"/>
 Remote Work
 </h4>
 <p className="text-gray-700">
 {job.remote_work ?'Available':'Not available'}
 </p>
 </div>

 {/* Travel Required */}
 <div>
 <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
 <Car className="w-4 h-4 text-primary-500"/>
 Travel Required
 </h4>
 <p className="text-gray-700">
 {job.travel_required ?'Yes':'No'}
 </p>
 </div>

 {/* Onsite Office */}
 <div>
 <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
 <Building className="w-4 h-4 text-primary-500"/>
 Onsite Office
 </h4>
 <p className="text-gray-700">
 {(() => {
 // Use the same logic as EditJobModal for consistency
 if (job.mode_of_work) {
 return (job.mode_of_work ==='onsite'|| job.mode_of_work ==='hybrid') ?'Available':'Not Available'} else {
 // Fallback for existing jobs: if remote_work is false and no mode_of_work, assume onsite
 return !job.remote_work ?'Available':'Not Available'}
 })()}
 </p>
 </div>
 </div>

 {/* Right Column */}
 <div className="space-y-4">
 {/* Application Statistics */}
 <div>
 <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
 <Users className="w-4 h-4 text-primary-500"/>
 Applications
 </h4>
 <p className="text-gray-700">
 {job.current_applications} / {job.max_applications} applications
 </p>
 </div>

 {/* Job Status */}
 <div>
 <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
 <CheckCircle className="w-4 h-4 text-primary-500"/>
 Job Status
 </h4>
 <p className="text-gray-700 capitalize">
 {job.status} {job.is_active ?'(Active)':'(Inactive)'}
 </p>
 </div>
 </div>
 </div>
 </div>
 </div>

 {/* Selection Process */}
 {job.selection_process && (
 <div className="mt-6">
 <h3 className="text-xl font-semibold text-gray-900 mb-3 flex items-center gap-2">
 <Award className="w-5 h-5 text-primary-500"/>
 Selection Process
 </h3>
 <div className="bg-white rounded-xl border border-gray-200 p-4">
 <p className="text-gray-700 leading-relaxed">
 {job.selection_process}
 </p>
 </div>
 </div>
 )}

 {/* Application Deadline */}
 {job.application_deadline && (
 <div className="mt-6">
 <h3 className="text-xl font-semibold text-gray-900 mb-3 flex items-center gap-2">
 <Calendar className="w-5 h-5 text-primary-500"/>
 Application Deadline
 </h3>
 <div className={cn("rounded-xl p-4 border",
 isDeadlineExpired()
 ?"bg-red-50 border-red-200":"bg-white border-gray-200")}>
 <p className={cn("font-medium",
 isDeadlineExpired()
 ?"text-red-800":"text-gray-700")}>
 {formatDate(job.application_deadline)}
 {isDeadlineExpired() && (
 <span className="ml-2 text-red-600">
 (Expired)
 </span>
 )}
 </p>
 </div>
 </div>
 )}

 {/* Campus Drive Info */}
 {job.campus_drive_date && (
 <div className="mt-6">
 <h3 className="text-xl font-semibold text-gray-900 mb-3 flex items-center gap-2">
 <Users className="w-5 h-5 text-primary-500"/>
 Campus Drive
 </h3>
 <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
 <p className="text-blue-800 font-medium">
 Campus Drive Date: {formatDate(job.campus_drive_date)}
 </p>
 </div>
 </div>
 )}

 {/* Job Expiration */}
 {job.expiration_date && (
 <div className="mt-6">
 <h3 className="text-xl font-semibold text-gray-900 mb-3 flex items-center gap-2">
 <Calendar className="w-5 h-5 text-primary-500"/>
 Job Expiration
 </h3>
 <div className={cn("rounded-xl p-4 border",
 new Date(job.expiration_date) < new Date()
 ?"bg-red-50 border-red-200":"bg-yellow-50 border-yellow-200")}>
 <p className={cn("font-medium",
 new Date(job.expiration_date) < new Date()
 ?"text-red-800":"text-yellow-800")}>
 Expires: {formatDate(job.expiration_date)}
 {new Date(job.expiration_date) < new Date() && (
 <span className="ml-2 text-red-600">
 (Expired)
 </span>
 )}
 </p>
 </div>
 </div>
 )}
 </div>
 </div>

 <aside className="flex w-full shrink-0 flex-col gap-4 border-t p-5 sm:p-6 lg:max-w-[320px] lg:border-l lg:border-t-0">
 <p className="font-display text-xs font-semibold uppercase tracking-[0.18em] text-primary">
 At a glance
 </p>
 <div className="space-y-3 text-sm">
 <div>
 <p className="text-xs font-medium text-muted-foreground">Compensation</p>
 <p className="font-semibold text-foreground">
 {formatSalary(job.salary_currency, job.salary_min, job.salary_max)}
 </p>
 </div>
 <div>
 <p className="text-xs font-medium text-muted-foreground">Experience</p>
 <p className="font-semibold text-foreground">
 {formatExperience(job.experience_min, job.experience_max)}
 </p>
 </div>
 <div>
 <p className="text-xs font-medium text-muted-foreground">Work mode</p>
 <p className="font-semibold text-foreground">
 {job.mode_of_work
 ? job.mode_of_work.charAt(0).toUpperCase() + job.mode_of_work.slice(1)
 : job.remote_work
 ?'Remote-friendly':'On-site / hybrid'}
 </p>
 </div>
 </div>
 <div className="rounded-xl border border-dashed bg-primary/[0.05] p-4">
 <p className="text-xs font-semibold text-foreground">Presentation tip</p>
 <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
 Tie your strongest bullets to the skills and responsibilities below—clear overlap
 reads as strong fit without any automated score.
 </p>
 </div>
 {showApplyButton && (
 <Button
 type="button"variant="gradient"className="mt-auto hidden h-12 w-full rounded-xl font-semibold shadow-lg shadow-primary/20 lg:flex"onClick={onApply}
 disabled={!canApply() || isApplying}
 >
 {isApplying ? (
 <>
 <span className="mr-2 inline-block h-4 w-4 animate-spin border-2 border-white border-t-transparent"/>
 Applying…
 </>
 ) : (
 <>
 <CheckCircle className="mr-2 h-4 w-4"/>
 {applicationStatus ==='applied'?'Applied': isDeadlineExpired()
 ?'Closed':'Apply now'}
 </>
 )}
 </Button>
 )}
 </aside>
 </div>

 <div className="border-t p-4 sm:p-5">
 <div className="flex flex-col items-stretch justify-end gap-3 sm:flex-row sm:items-center">
 <Button
 type="button"variant="outline"onClick={handleDownloadPDF}
 disabled={isDownloadingPDF}
 className="h-11 rounded-xl border-border font-semibold">
 {isDownloadingPDF ? (
 <>
 <span className="mr-2 inline-block h-4 w-4 animate-spin border-2 border-primary border-t-transparent"/>
 Generating…
 </>
 ) : (
 <>
 <Download className="mr-2 h-4 w-4"/>
 Download PDF
 </>
 )}
 </Button>
 {showApplyButton && (
 <Button
 type="button"variant="gradient"onClick={onApply}
 disabled={!canApply() || isApplying}
 className={cn('h-11 rounded-xl font-semibold shadow-md shadow-primary/15 lg:hidden',
 !canApply() &&'opacity-50',
 )}
 >
 {isApplying ?'Applying…': applicationStatus ==='applied'?'Applied': isDeadlineExpired() ?'Closed':'Apply now'}
 </Button>
 )}
 </div>
 </div>
 </motion.div>
 </motion.div>

 </AnimatePresence>
 )
}

