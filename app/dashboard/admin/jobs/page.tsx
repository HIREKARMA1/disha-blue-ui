"use client"

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Search, Filter, Eye, Edit, Trash2, MoreVertical, Calendar, MapPin, Briefcase, Clock, DollarSign, Users, Building, Plus, UserCheck, Copy, Check, Link2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { AdminDashboardLayout } from '@/components/dashboard/AdminDashboardLayout'
import { AdminJobCard } from '@/components/admin/AdminJobCard'
import { EditJobModal } from '@/components/dashboard/EditJobModal'
import { DeleteConfirmationModal } from '@/components/dashboard/DeleteConfirmationModal'
import { JobDescriptionModal } from '@/components/dashboard/JobDescriptionModal'
import { AppliedStudentsModal } from '@/components/admin/AppliedStudentsModal'
import { apiClient } from '@/lib/api'
import { toast } from 'react-hot-toast'
import { getClientLocale, tf, type SupportedLocale } from '@/lib/i18n'
interface Job {
 id: string
 title: string
 description: string
 requirements?: string
 responsibilities?: string
 job_type: string
 status: string
 location: string | string[]
 state?: string
 district?: string
 city_or_town?: string
 village_or_locality?: string
 pincode?: string
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
 corporate_id: string
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
 is_public?: boolean
 public_link_token?: string
}

import { useRouter } from 'next/navigation'

export default function AdminJobsPage() {
 const router = useRouter()
 const [locale, setLocale] = useState<SupportedLocale>('en')
 useEffect(() => {
 setLocale(getClientLocale())
 }, [])
 const [jobs, setJobs] = useState<Job[]>([])
 const [loading, setLoading] = useState(true)
 const [searchTerm, setSearchTerm] = useState('')
 const [filters, setFilters] = useState({
 status:'',
 job_type:'',
 industry:'',
 state:'',
 district:'',
 city_or_town:''})
 const [selectedJob, setSelectedJob] = useState<Job | null>(null)
 const [editingJob, setEditingJob] = useState<Job | null>(null)
 const [showEditModal, setShowEditModal] = useState(false)
 const [showJobModal, setShowJobModal] = useState(false)
 const [showFilters, setShowFilters] = useState(false)
 const [showDeleteModal, setShowDeleteModal] = useState(false)
 const [jobToDelete, setJobToDelete] = useState<Job | null>(null)
 const [showAppliedStudentsModal, setShowAppliedStudentsModal] = useState(false)
 const [jobForAppliedStudents, setJobForAppliedStudents] = useState<Job | null>(null)
 const [isDeleting, setIsDeleting] = useState(false)
 const [showPublicLinkModal, setShowPublicLinkModal] = useState(false)
 const [publicLink, setPublicLink] = useState<string | null>(null)
 const [isTogglingPublic, setIsTogglingPublic] = useState(false)
 const [copied, setCopied] = useState(false)
 const [pagination, setPagination] = useState({
 page: 1,
 limit: 9,
 total: 0,
 total_pages: 0
 })
 const activeFilterCount = Object.values(filters).filter(Boolean).length + (searchTerm ? 1 : 0)

 // Fetch all jobs for admin
const fetchJobs = async () => {
 try {
 setLoading(true)
 const response = await apiClient.getAllJobsAdmin()
 console.log(' All jobs fetched for admin:', response)
 setJobs(response)
 setPagination(prev => ({
 ...prev,
 total: response.length,
 total_pages: Math.ceil(response.length / prev.limit)
 }))
 } catch (error: any) {
 console.error('Failed to fetch jobs:', error)
 toast.error('Failed to load jobs. Please try again.')
 } finally {
 setLoading(false)
 }
 }

 useEffect(() => {
 fetchJobs()
 }, [])

 // Filter jobs based on search and filters
const filteredJobs = jobs.filter(job => {
 const locationString = Array.isArray(job.location) ? job.location.join('') : job.location
 const structuredLocationString = [job.village_or_locality, job.city_or_town, job.district, job.state, job.pincode].filter(Boolean).join('')
 const matchesSearch = job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
 job.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
 locationString.toLowerCase().includes(searchTerm.toLowerCase()) ||
 structuredLocationString.toLowerCase().includes(searchTerm.toLowerCase()) ||
 job.corporate_name?.toLowerCase().includes(searchTerm.toLowerCase())

 const matchesStatus = !filters.status || job.status === filters.status
 const matchesJobType = !filters.job_type || job.job_type === filters.job_type
 const matchesIndustry = !filters.industry || job.industry?.toLowerCase().includes(filters.industry.toLowerCase())
 const matchesState = !filters.state || (job.state ||'').toLowerCase().includes(filters.state.toLowerCase())
 const matchesDistrict = !filters.district || (job.district ||'').toLowerCase().includes(filters.district.toLowerCase())
 const matchesCityTown = !filters.city_or_town || (job.city_or_town ||'').toLowerCase().includes(filters.city_or_town.toLowerCase())

 return matchesSearch && matchesStatus && matchesJobType && matchesIndustry && matchesState && matchesDistrict && matchesCityTown
 })

 // Apply pagination to filtered jobs
const paginatedJobs = filteredJobs.slice(
 (pagination.page - 1) * pagination.limit,
 pagination.page * pagination.limit
 )

 // Update pagination when filters change
 useEffect(() => {
 const totalPages = Math.ceil(filteredJobs.length / pagination.limit)
 setPagination(prev => ({
 ...prev,
 total: filteredJobs.length,
 total_pages: totalPages,
 page: prev.page > totalPages ? 1 : prev.page
 }))
 }, [filteredJobs.length, pagination.limit])

 const handleJobUpdated = () => {
 fetchJobs() // Refresh the jobs list
 }

 const handleViewJob = (job: Job) => {
 setSelectedJob(job)
 setShowJobModal(true)
 }

 const handleEditJob = (job: Job) => {
 console.log(' handleEditJob called with job:', job)
 setEditingJob(job)
 setShowEditModal(true)
 }

 const handleDeleteJob = (job: Job) => {
 setJobToDelete(job)
 setShowDeleteModal(true)
 }

 const handleViewAppliedStudents = (job: Job) => {
 setJobForAppliedStudents(job)
 setShowAppliedStudentsModal(true)
 }

 const handleMakePublic = async (job: Job) => {
 setIsTogglingPublic(true)
 try {
 const response = await apiClient.toggleJobPublicStatus(job.id)
 setPublicLink(response.public_link || null)
 setShowPublicLinkModal(true)
 toast.success(job.is_public ?'Job made private successfully!':'Job made public successfully!')
 fetchJobs() // Refresh the jobs list
 } catch (error: any) {
 console.error('Failed to toggle job public status:', error)
 toast.error('Failed to toggle job public status. Please try again.')
 } finally {
 setIsTogglingPublic(false)
 }
 }

 const confirmDeleteJob = async () => {
 if (!jobToDelete) return

 setIsDeleting(true)
 try {
 await apiClient.deleteJobAdmin(jobToDelete.id)
 toast.success('Job deleted successfully!')
 fetchJobs() // Refresh the jobs list
 setShowDeleteModal(false)
 setJobToDelete(null)
 } catch (error: any) {
 console.error('Failed to delete job:', error)
 toast.error('Failed to delete job. Please try again.')
 } finally {
 setIsDeleting(false)
 }
 }

 const handleStatusChange = async (job: Job, newStatus: string) => {
 try {
 await apiClient.changeJobStatusAdmin(job.id, newStatus)

 const statusMessages = {
 active:'activated',
 inactive:'deactivated',
 closed:'closed'}

 const message = statusMessages[newStatus as keyof typeof statusMessages] || 'updated'
 toast.success(`Job ${message} successfully!`)
 fetchJobs() // Refresh the jobs list
 } catch (error: any) {
 console.error('Failed to change job status:', error)
 toast.error('Failed to change job status. Please try again.')
 }
 }

 const clearFilters = () => {
 setSearchTerm('')
 setFilters({
 status:'',
 job_type:'',
 industry:'',
 state:'',
 district:'',
 city_or_town:''})
 }

 const handleCreateAssessment = (job: Job) => {
 router.push(`/dashboard/admin/assessments/create?jobId=${job.id}`)
 }

 return (
 <AdminDashboardLayout>
 <div className="space-y-6 main-content">
 {/* Header */}
 <motion.div
 initial={{ opacity: 0, y: 20 }}
 animate={{ opacity: 1, y: 0 }}
 transition={{ duration: 0.6 }}
 className="rounded-none-none border border-border p-6 shadow-soft">
 <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 lg:gap-6">
 <div className="flex-1 min-w-0">
 <h1 className="font-display text-2xl md:text-3xl font-semibold tracking-tight text-foreground mb-2">
 {tf(locale,'admin.jobs.title','Local Opportunity Oversight')}
 </h1>
 <p className="text-muted-foreground text-base md:text-lg mb-3">
 Review and manage job activity across employers and regions.
 </p>
 <div className="flex flex-wrap gap-2">
 <span className="inline-flex items-center border px-3 py-1 text-xs font-medium text-primary">
 {new Date().toLocaleDateString('en-US', { weekday:'long', month:'long', day:'numeric'})}
 </span>
 <span className="inline-flex items-center border px-3 py-1 text-xs font-medium text-green-700">
 Employer activity
 </span>
 <span className="inline-flex items-center border px-3 py-1 text-xs font-medium text-secondary-700">
 Hyper-local discovery
 </span>
 </div>
 </div>
 </div>
 </motion.div>

 {/* Search and Filters */}
 <div className="rounded-none-none border border-border p-5 shadow-soft relative overflow-visible layout-stable">
 {/* Search Bar */}
 <div className="flex flex-col lg:flex-row gap-4 mb-4">
 <div className="flex-1">
 <div className="relative">
 <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground"/>
 <Input
 type="text"placeholder={tf(locale,'admin.jobs.searchPlaceholder','Search by title, keyword, location, or employer...')}
 value={searchTerm}
 onChange={(e) => setSearchTerm(e.target.value)}
 className="h-11 rounded-none-none border-border bg-background pl-10"/>
 </div>
 </div>

 <div className="flex items-center gap-3">
 <Button
 variant="outline"onClick={() => setShowFilters(!showFilters)}
 className="h-11 rounded-none-none border-2">
 <Filter className="w-4 h-4"/>
 Filters
 </Button>
 </div>
 </div>
 {!loading && (
 <div className="text-xs text-muted-foreground mt-2">
 {activeFilterCount > 0 ? `${activeFilterCount} ${tf(locale,'admin.jobs.activeFiltersSuffix','active search/filter criteria')}` : tf(locale,'common.noFiltersApplied','No filters applied')}
 </div>
 )}

 {/* Advanced Filters */}
 {showFilters && (
 <motion.div
 initial={{ opacity: 0, height: 0 }}
 animate={{ opacity: 1, height:'auto'}}
 exit={{ opacity: 0, height: 0 }}
 className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-border relative">
 <div>
 <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
 Status
 </label>
 <Select value={filters.status ||"all"} onValueChange={(value) => setFilters(prev => ({ ...prev, status: value ==="all"?"": value }))}>
 <SelectTrigger>
 <SelectValue placeholder="All Status"/>
 </SelectTrigger>
 <SelectContent sideOffset={4} className="w-[var(--radix-select-trigger-width)] max-h-[var(--radix-select-content-available-height)]">
 <SelectItem value="all">All Status</SelectItem>
 <SelectItem value="active">Active</SelectItem>
 <SelectItem value="inactive">Inactive</SelectItem>
 <SelectItem value="closed">Closed</SelectItem>
 <SelectItem value="draft">Draft</SelectItem>
 </SelectContent>
 </Select>
 </div>

 <div>
 <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
 Job Type
 </label>
 <Select value={filters.job_type ||"all"} onValueChange={(value) => setFilters(prev => ({ ...prev, job_type: value ==="all"?"": value }))}>
 <SelectTrigger>
 <SelectValue placeholder="All Types"/>
 </SelectTrigger>
 <SelectContent sideOffset={4} className="w-[var(--radix-select-trigger-width)] max-h-[var(--radix-select-content-available-height)]">
 <SelectItem value="all">All Types</SelectItem>
 <SelectItem value="full_time">Full Time</SelectItem>
 <SelectItem value="part_time">Part Time</SelectItem>
 <SelectItem value="contract">Contract</SelectItem>
 <SelectItem value="internship">Internship</SelectItem>
 <SelectItem value="freelance">Freelance</SelectItem>
 </SelectContent>
 </Select>
 </div>

 <div>
 <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
 Industry
 </label>
 <Input
 placeholder="e.g., Technology, Finance"value={filters.industry}
 onChange={(e) => setFilters(prev => ({ ...prev, industry: e.target.value }))}
 />
 </div>
 <div>
 <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
 State
 </label>
 <Input
 placeholder="Filter by state"value={filters.state}
 onChange={(e) => setFilters(prev => ({ ...prev, state: e.target.value }))}
 />
 </div>
 <div>
 <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
 District
 </label>
 <Input
 placeholder="Filter by district"value={filters.district}
 onChange={(e) => setFilters(prev => ({ ...prev, district: e.target.value }))}
 />
 </div>
 <div>
 <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
 City / Town
 </label>
 <Input
 placeholder="Filter by city/town"value={filters.city_or_town}
 onChange={(e) => setFilters(prev => ({ ...prev, city_or_town: e.target.value }))}
 />
 </div>
 </motion.div>
 )}

 {/* Clear Filters */}
 {(searchTerm || filters.status || filters.job_type || filters.industry || filters.state || filters.district || filters.city_or_town) && (
 <div className="flex justify-end mt-4">
 <Button variant="ghost"size="sm"onClick={clearFilters}>
 Clear Filters
 </Button>
 </div>
 )}
 </div>

 {/* Results Summary */}
 <div className="mb-6 rounded-none-none border border-border p-4 shadow-soft">
 <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
 <div className="text-muted-foreground text-sm">
 {loading ? (
 <span className="flex items-center gap-2">
 <div className="animate-spin h-4 w-4 border-b-2 border-primary-500"></div>
 Loading jobs...
 </span>
 ) : (
 <span className="flex items-center gap-2">
 <span className="font-semibold text-primary">
 Showing {((pagination.page - 1) * pagination.limit) + 1} to {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} jobs
 </span>
 </span>
 )}
 </div>
 {pagination.total > 0 && (
 <div className="text-xs text-primary font-medium">
 Page {pagination.page} of {pagination.total_pages} • {pagination.limit} jobs per page
 </div>
 )}
 </div>
 </div>

 {/* Jobs Grid */}
 {loading ? (
 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
 {[...Array(6)].map((_, index) => (
 <div key={index} className="rounded-none-none border border-border p-6 animate-pulse">
 <div className="h-6 bg-gray-200 rounded-none mb-4"></div>
 <div className="h-4 bg-gray-200 rounded-none mb-2"></div>
 <div className="h-4 bg-gray-200 rounded-none mb-4"></div>
 <div className="h-8 bg-gray-200 rounded-none"></div>
 </div>
 ))}
 </div>
 ) : filteredJobs.length > 0 ? (
 <>
 <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
 {paginatedJobs.map((job, index) => (
 <AdminJobCard
 key={job.id}
 job={job}
 onViewDescription={() => handleViewJob(job)}
 onEdit={handleEditJob}
 onDelete={handleDeleteJob}
 onViewAppliedStudents={handleViewAppliedStudents}
 onStatusChange={handleStatusChange}
 onMakePublic={handleMakePublic}
 onCreateAssessment={handleCreateAssessment}
 cardIndex={index}
 />
 ))}
 </div>

 {/* Simple Pagination */}
 {pagination.total_pages > 1 && (
 <div className="mt-8 flex items-center justify-center">
 <div className="rounded-none-none border border-border p-4 shadow-soft">
 <div className="flex items-center gap-2">
 {/* Previous Button */}
 <Button
 variant="outline"size="sm"onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
 disabled={pagination.page <= 1}
 className="px-3 py-2 border-border transition-all duration-200 hover:shadow-sm disabled:opacity-50 disabled:cursor-not-allowed">
 ←
 </Button>

 {/* Page Numbers */}
 <div className="flex items-center gap-1">
 {[...Array(pagination.total_pages)].map((_, i) => {
 const pageNum = i + 1
 const isCurrentPage = pageNum === pagination.page
 const isNearCurrent = Math.abs(pageNum - pagination.page) <= 1
 const isFirstOrLast = pageNum === 1 || pageNum === pagination.total_pages

 if (isFirstOrLast || isNearCurrent) {
 return (
 <Button
 key={pageNum}
 variant={isCurrentPage ?"default":"outline"}
 size="sm"onClick={() => setPagination(prev => ({ ...prev, page: pageNum }))}
 className={`min-w-[32px] h-8 ${isCurrentPage
 ?'bg-primary text-primary-foreground shadow-sm':'border-border transition-all duration-200 hover:shadow-sm'}`}
 >
 {pageNum}
 </Button>
 )
 } else if (pageNum === pagination.page - 2 || pageNum === pagination.page + 2) {
 return <span key={pageNum} className="px-2 text-primary-400">...</span>
 }
 return null
 })}
 </div>

 {/* Next Button */}
 <Button
 variant="outline"size="sm"onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
 disabled={pagination.page >= pagination.total_pages}
 className="px-3 py-2 border-border transition-all duration-200 hover:shadow-sm disabled:opacity-50 disabled:cursor-not-allowed">
 →
 </Button>
 </div>
 </div>
 </div>
 )}
 </>
 ) : (
 <div className="text-center py-12">
 <div className="mx-auto mb-4 flex h-24 w-24 items-center justify-center bg-muted">
 <Briefcase className="h-12 w-12 text-muted-foreground"/>
 </div>
 <h3 className="mb-2 text-lg font-medium text-foreground">
 {searchTerm || filters.status || filters.job_type || filters.industry
 ?'No jobs found matching your criteria':'No job postings yet'}
 </h3>
 <p className="mb-6 text-muted-foreground">
 {searchTerm || filters.status || filters.job_type || filters.industry
 ?'Try adjusting your search or filter criteria':'Jobs will appear here once corporates start posting'}
 </p>
 </div>
 )}
 </div>

 {/* Modals */}
 <EditJobModal
 isOpen={showEditModal}
 onClose={() => {
 setShowEditModal(false)
 setEditingJob(null)
 }}
 onJobUpdated={handleJobUpdated}
 job={editingJob}
 isAdmin={true}
 />

 <DeleteConfirmationModal
 isOpen={showDeleteModal}
 onClose={() => {
 setShowDeleteModal(false)
 setJobToDelete(null)
 }}
 onConfirm={confirmDeleteJob}
 jobTitle={jobToDelete?.title ||''}
 isDeleting={isDeleting}
 />

 <AppliedStudentsModal
 isOpen={showAppliedStudentsModal}
 onClose={() => {
 setShowAppliedStudentsModal(false)
 setJobForAppliedStudents(null)
 }}
 job={jobForAppliedStudents}
 />

 {/* Public Link Modal */}
 {showPublicLinkModal && (
 <div className="fixed inset-0 z-50 overflow-y-auto">
 <div className="flex min-h-screen items-center justify-center p-4">
 <div className="fixed inset-0"onClick={() => setShowPublicLinkModal(false)} />
 <div className="relative w-full max-w-md rounded-none-none border border-border bg-card p-6 shadow-xl">
 <div className="flex items-center justify-between mb-4">
 <h3 className="flex items-center gap-2 text-lg font-semibold text-foreground">
 <Link2 className="w-5 h-5 text-primary"/>
 {publicLink ?'Public Link Generated':'Job Made Private'}
 </h3>
 <button
 onClick={() => setShowPublicLinkModal(false)}
 className="text-muted-foreground hover:text-foreground">
 
 </button>
 </div>

 {publicLink ? (
 <>
 <p className="mb-4 text-sm text-muted-foreground">
 Share this link with students. They can view and apply.
 </p>
 <div className="mb-4 flex items-center gap-2 rounded-none-none border border-border p-3">
 <input
 type="text"value={publicLink}
 readOnly
 className="flex-1 bg-transparent text-sm text-foreground outline-none"/>
 <button
 onClick={async () => {
 try {
 await navigator.clipboard.writeText(publicLink)
 setCopied(true)
 toast.success('Link copied to clipboard!')
 setTimeout(() => setCopied(false), 2000)
 } catch (err) {
 toast.error('Failed to copy link')
 }
 }}
 className="rounded-none p-2 transition-colors hover:bg-muted">
 {copied ? (
 <Check className="w-4 h-4 text-green-600"/>
 ) : (
 <Copy className="w-4 h-4 text-muted-foreground"/>
 )}
 </button>
 </div>
 </>
 ) : (
 <p className="text-sm text-muted-foreground">
 This job is now private and its public link has been removed.
 </p>
 )}

 <div className="flex justify-end gap-2 mt-6">
 <Button
 variant="outline"onClick={() => setShowPublicLinkModal(false)}
 >
 Close
 </Button>
 </div>
 </div>
 </div>
 </div>
 )}

 {selectedJob && (
 <JobDescriptionModal
 job={selectedJob}
 onClose={() => {
 setShowJobModal(false)
 setSelectedJob(null)
 }}
 onApply={() => { }} // Not applicable for admin view
 isApplying={false}
 showApplyButton={false} // Hide apply button in admin context
 />
 )}
 </AdminDashboardLayout>
 )
}
