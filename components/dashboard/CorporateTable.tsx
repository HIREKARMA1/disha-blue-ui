"use client"

import { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import {
 Building2,
 Mail,
 Phone,
 MapPin,
 Globe,
 Calendar,
 Star,
 Eye,
 EyeOff,
 ChevronUp,
 ChevronDown,
 ChevronsUpDown,
 Shield,
 Briefcase,
 Trash2,
 Edit
} from 'lucide-react'
import { CorporateListItem } from '@/types/corporate'
import { ArchiveConfirmationModal } from './ArchiveConfirmationModal'
import { CorporateDeleteConfirmationModal } from './CorporateDeleteConfirmationModal'
import { CorporateProfileModal } from './CorporateProfileModal'
import { corporateManagementService } from '@/services/corporateManagementService'
import { getErrorMessage } from '@/lib/error-handler'
import toast from 'react-hot-toast'

interface CorporateTableProps {
 corporates: CorporateListItem[]
 isLoading: boolean
 error: string | null
 onArchiveCorporate: (corporateId: string, archive: boolean) => void
 onDeleteCorporate: (corporateId: string) => void
 onEditCorporate: (corporate: CorporateListItem) => void
 onRetry: () => void
}

type SortField = 'company_name' | 'email' | 'phone' | 'industry' | 'verified' | 'status' | 'total_jobs' | 'created_at'
type SortDirection = 'asc' | 'desc' | null

export function CorporateTable({
 corporates,
 isLoading,
 error,
 onArchiveCorporate,
 onDeleteCorporate,
 onEditCorporate,
 onRetry
}: CorporateTableProps) {
 const [sortField, setSortField] = useState<SortField | null>('created_at')
 const [sortDirection, setSortDirection] = useState<SortDirection>('desc')
 const [currentPage, setCurrentPage] = useState(1)
 const [itemsPerPage] = useState(10)

 // Archive confirmation modal state
const [showArchiveModal, setShowArchiveModal] = useState(false)
 const [selectedCorporate, setSelectedCorporate] = useState<{ id: string; name: string; isArchived: boolean } | null>(null)
 const [isArchiveLoading, setIsArchiveLoading] = useState(false)

 // Delete confirmation modal state
const [showDeleteModal, setShowDeleteModal] = useState(false)
 const [selectedDeleteCorporate, setSelectedDeleteCorporate] = useState<{ id: string; name: string } | null>(null)
 const [isDeleteLoading, setIsDeleteLoading] = useState(false)

 // Profile modal state
const [showProfileModal, setShowProfileModal] = useState(false)
 const [selectedProfileCorporate, setSelectedProfileCorporate] = useState<CorporateListItem | null>(null)
 const [fullProfileData, setFullProfileData] = useState<any>(null)
 const [isLoadingProfile, setIsLoadingProfile] = useState(false)

 const formatDate = (dateString: string) => {
 return new Date(dateString).toLocaleDateString('en-US', {
 year:'numeric',
 month:'short',
 day:'numeric'})
 }

 const getStatusColor = (status: string) => {
 switch (status) {
 case 'active':
 return 'text-green-700'
 case 'inactive':
 return 'text-amber-700'
 case 'suspended':
 return 'text-red-700'
 default:
 return 'border-border bg-muted text-muted-foreground'
 }
 }

 const getVerifiedColor = (verified: boolean) => {
 return verified
 ?'text-green-700':'text-amber-700'}

 // Sorting function
const handleSort = (field: SortField) => {
 if (sortField === field) {
 // Cycle through: asc -> desc -> null
 if (sortDirection ==='asc') {
 setSortDirection('desc')
 } else if (sortDirection ==='desc') {
 setSortDirection(null)
 setSortField(null)
 } else {
 setSortDirection('asc')
 }
 } else {
 setSortField(field)
 setSortDirection('asc')
 }
 setCurrentPage(1) // Reset to first page when sorting
 }

 // Get sort icon
const getSortIcon = (field: SortField) => {
 if (sortField !== field) {
 return <ChevronsUpDown className="w-4 h-4 text-gray-400"/>
 }
 if (sortDirection ==='asc') {
 return <ChevronUp className="w-4 h-4 text-primary-600"/>
 }
 if (sortDirection ==='desc') {
 return <ChevronDown className="w-4 h-4 text-primary-600"/>
 }
 return <ChevronsUpDown className="w-4 h-4 text-gray-400"/>
 }

 // Sort and paginate data
const { sortedCorporates, totalPages, paginatedCorporates } = useMemo(() => {
 let sorted = [...corporates]

 // Apply sorting
 if (sortField && sortDirection) {
 sorted.sort((a, b) => {
 let aValue: any = a[sortField]
 let bValue: any = b[sortField]

 // Handle numeric fields
 if (['total_jobs','total_applications'].includes(sortField)) {
 aValue = Number(aValue) || 0
 bValue = Number(bValue) || 0
 } else if (sortField ==='created_at') {
 // Handle date fields
 aValue = new Date(aValue || 0).getTime()
 bValue = new Date(bValue || 0).getTime()
 } else if (sortField ==='verified') {
 // Handle boolean fields
 aValue = a.verified ? 1 : 0
 bValue = b.verified ? 1 : 0
 } else {
 // Handle string fields
 aValue = String(aValue ||'').toLowerCase()
 bValue = String(bValue ||'').toLowerCase()
 }

 if (sortDirection ==='asc') {
 return aValue < bValue ? -1 : aValue > bValue ? 1 : 0
 } else {
 return aValue > bValue ? -1 : aValue < bValue ? 1 : 0
 }
 })
 }

 // Calculate pagination
const totalPages = Math.ceil(sorted.length / itemsPerPage)
 const startIndex = (currentPage - 1) * itemsPerPage
 const endIndex = startIndex + itemsPerPage
 const paginatedCorporates = sorted.slice(startIndex, endIndex)

 return { sortedCorporates: sorted, totalPages, paginatedCorporates }
 }, [corporates, sortField, sortDirection, currentPage, itemsPerPage])

 // Archive modal handlers
const handleArchiveClick = (corporate: CorporateListItem) => {
 setSelectedCorporate({
 id: corporate.id,
 name: corporate.company_name,
 isArchived: corporate.is_archived
 })
 setShowArchiveModal(true)
 }

 const handleArchiveConfirm = async () => {
 if (!selectedCorporate) return

 setIsArchiveLoading(true)
 try {
 await onArchiveCorporate(selectedCorporate.id, !selectedCorporate.isArchived)
 setShowArchiveModal(false)
 setSelectedCorporate(null)
 } catch (error) {
 console.error('Failed to archive/unarchive corporate:', error)
 // Don't close modal on error, let user retry
 } finally {
 setIsArchiveLoading(false)
 }
 }

 const handleArchiveCancel = () => {
 setShowArchiveModal(false)
 setSelectedCorporate(null)
 }

 // Delete modal handlers
const handleDeleteClick = (corporate: CorporateListItem) => {
 setSelectedDeleteCorporate({
 id: corporate.id,
 name: corporate.company_name
 })
 setShowDeleteModal(true)
 }

 const handleDeleteConfirm = async () => {
 if (!selectedDeleteCorporate) return

 setIsDeleteLoading(true)
 try {
 await onDeleteCorporate(selectedDeleteCorporate.id)
 setShowDeleteModal(false)
 setSelectedDeleteCorporate(null)
 } catch (error) {
 console.error('Failed to delete corporate:', error)
 // Don't close modal on error, let user retry
 } finally {
 setIsDeleteLoading(false)
 }
 }

 const handleDeleteCancel = () => {
 setShowDeleteModal(false)
 setSelectedDeleteCorporate(null)
 }

 // Profile modal handlers
const handleViewClick = async (corporate: CorporateListItem) => {
 setSelectedProfileCorporate(corporate)
 setShowProfileModal(true)
 setIsLoadingProfile(true)

 try {
 // Fetch full corporate profile for more details
const fullProfile = await corporateManagementService.getCorporateProfile(corporate.id)
 setFullProfileData(fullProfile)
 } catch (error: any) {
 console.error('Failed to fetch corporate profile:', error)
 toast.error(getErrorMessage(error))
 // Fallback to using basic corporate data
const basicProfile = {
 ...corporate,
 name: corporate.company_name,
 bio: corporate.bio ||'',
 profile_picture: corporate.profile_picture ||'',
 email_verified: corporate.email_verified || false,
 phone_verified: corporate.phone_verified || false,
 status: corporate.status ||'active'}
 setFullProfileData(basicProfile)
 } finally {
 setIsLoadingProfile(false)
 }
 }

 const handleProfileClose = () => {
 setShowProfileModal(false)
 setSelectedProfileCorporate(null)
 setFullProfileData(null)
 }

 // Loading state
 if (isLoading) {
 return (
 <div className="rounded-none-none overflow-hidden border border-slate-200 bg-white shadow-none">
 <div className="p-8 text-center">
 <div className="animate-spin h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
 <p className="text-muted-foreground">Loading employers...</p>
 </div>
 </div>
 )
 }

 // Error state
 if (error) {
 return (
 <div className="rounded-none-none overflow-hidden border border-slate-200 bg-white shadow-none">
 <div className="p-8 text-center">
 <div className="text-red-500 mb-4">
 <svg className="w-12 h-12 mx-auto"fill="none"stroke="currentColor"viewBox="0 0 24 24">
 <path strokeLinecap="round"strokeLinejoin="round"strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
 </svg>
 </div>
 <h3 className="text-lg font-semibold text-foreground mb-2">Error Loading Employers</h3>
 <p className="text-muted-foreground mb-4">{error}</p>
 <button
 onClick={onRetry}
 className="px-4 py-2 bg-primary text-primary-foreground rounded-none-none hover:opacity-90 transition-colors duration-200">
 Try Again
 </button>
 </div>
 </div>
 )
 }

 // Empty state
 if (corporates.length === 0) {
 return (
 <div className="rounded-none-none overflow-hidden border border-slate-200 bg-white shadow-none">
 <div className="p-8 text-center">
 <div className="text-muted-foreground mb-4">
 <Building2 className="w-12 h-12 mx-auto"/>
 </div>
 <h3 className="text-lg font-semibold text-foreground mb-2">No Employers Found</h3>
 <p className="text-muted-foreground">No employers match the current filters.</p>
 </div>
 </div>
 )
 }

 return (
 <>
 <div className="rounded-none-none overflow-hidden border border-slate-200 bg-white shadow-none">
 {/* Table Header */}
 <div className="overflow-x-auto">
 <table className="w-full">
 <thead className="border-b border-slate-200 bg-white">
 <tr>
 <th
 className="px-6 py-4 text-left text-xs font-semibold text-muted-foreground uppercase tracking-[0.14em] cursor-pointer transition-colors duration-200"onClick={() => handleSort('company_name')}
 >
 <div className="flex items-center space-x-1">
 <span>Employer</span>
 {getSortIcon('company_name')}
 </div>
 </th>
 <th
 className="px-6 py-4 text-left text-xs font-semibold text-muted-foreground uppercase tracking-[0.14em] cursor-pointer transition-colors duration-200"onClick={() => handleSort('email')}
 >
 <div className="flex items-center space-x-1">
 <span>Contact</span>
 {getSortIcon('email')}
 </div>
 </th>
 <th
 className="px-6 py-4 text-left text-xs font-semibold text-muted-foreground uppercase tracking-[0.14em] cursor-pointer transition-colors duration-200"onClick={() => handleSort('industry')}
 >
 <div className="flex items-center space-x-1">
 <span>Industry</span>
 {getSortIcon('industry')}
 </div>
 </th>
 <th
 className="px-6 py-4 text-left text-xs font-semibold text-muted-foreground uppercase tracking-[0.14em] cursor-pointer transition-colors duration-200"onClick={() => handleSort('verified')}
 >
 <div className="flex items-center space-x-1">
 <span>Verification</span>
 {getSortIcon('verified')}
 </div>
 </th>
 <th
 className="px-6 py-4 text-left text-xs font-semibold text-muted-foreground uppercase tracking-[0.14em] cursor-pointer transition-colors duration-200"onClick={() => handleSort('status')}
 >
 <div className="flex items-center space-x-1">
 <span>Status</span>
 {getSortIcon('status')}
 </div>
 </th>
 <th
 className="px-6 py-4 text-left text-xs font-semibold text-muted-foreground uppercase tracking-[0.14em] cursor-pointer transition-colors duration-200"onClick={() => handleSort('total_jobs')}
 >
 <div className="flex items-center space-x-1">
 <span>Jobs</span>
 {getSortIcon('total_jobs')}
 </div>
 </th>
 <th
 className="px-6 py-4 text-left text-xs font-semibold text-muted-foreground uppercase tracking-[0.14em] cursor-pointer transition-colors duration-200"onClick={() => handleSort('created_at')}
 >
 <div className="flex items-center space-x-1">
 <span>Created</span>
 {getSortIcon('created_at')}
 </div>
 </th>
 <th className="px-6 py-4 text-right text-xs font-semibold text-muted-foreground uppercase tracking-[0.14em]">
 Actions
 </th>
 </tr>
 </thead>
 <tbody className="divide-y divide-slate-200 bg-white">
 {paginatedCorporates.map((corporate, index) => (
 <motion.tr
 key={corporate.id}
 className="transition-colors duration-200 cursor-pointer"initial={{ opacity: 0, y: 20 }}
 animate={{ opacity: 1, y: 0 }}
 transition={{ duration: 0.2, delay: index * 0.05 }}
 onClick={() => handleViewClick(corporate)}
 >
 {/* Corporate Name */}
 <td className="px-6 py-4 whitespace-nowrap">
 <div className="flex items-center">
 <div className="flex-shrink-0 h-10 w-10">
 <div className="h-10 w-10 rounded-none-none flex items-center justify-center">
 <Building2 className="h-5 w-5 text-white"/>
 </div>
 </div>
 <div className="ml-4">
 <div className="text-sm font-medium text-foreground">
 {corporate.company_name}
 </div>
 <div className="text-sm text-muted-foreground">
 {corporate.company_type ||'Not specified'}
 </div>
 </div>
 </div>
 </td>

 {/* Contact Info */}
 <td className="px-6 py-4 whitespace-nowrap">
 <div className="space-y-1">
 <div className="flex items-center text-sm text-foreground">
 <Mail className="h-4 w-4 text-muted-foreground mr-2"/>
 {corporate.email}
 </div>
 {corporate.phone && (
 <div className="flex items-center text-sm text-muted-foreground">
 <Phone className="h-4 w-4 text-muted-foreground mr-2"/>
 {corporate.phone}
 </div>
 )}
 {corporate.address && (
 <div className="flex items-center text-sm text-muted-foreground">
 <MapPin className="h-4 w-4 text-muted-foreground mr-2"/>
 <span className="truncate max-w-[200px]">{corporate.address}</span>
 </div>
 )}
 </div>
 </td>

 {/* Industry */}
 <td className="px-6 py-4 whitespace-nowrap">
 <span className="text-sm text-foreground">
 {corporate.industry ||'Not specified'}
 </span>
 </td>

 {/* Verification Status */}
 <td className="px-6 py-4 whitespace-nowrap">
 <span className={`inline-flex items-center border px-2.5 py-0.5 text-xs font-medium ${getVerifiedColor(corporate.verified)}`}>
 <Shield className="h-3 w-3 mr-1"/>
 {corporate.verified ?'Verified':'Unverified'}
 </span>
 </td>

 {/* Status */}
 <td className="px-6 py-4 whitespace-nowrap">
 <span className={`inline-flex items-center border px-2.5 py-0.5 text-xs font-medium ${getStatusColor(corporate.status)}`}>
 {corporate.status}
 </span>
 </td>

 {/* Job Count */}
 <td className="px-6 py-4 whitespace-nowrap">
 <div className="flex items-center">
 <Briefcase className="h-4 w-4 text-muted-foreground mr-2"/>
 <span className="text-sm text-foreground">
 {corporate.total_jobs || 0}
 </span>
 </div>
 </td>

 {/* Created Date */}
 <td className="px-6 py-4 whitespace-nowrap">
 <div className="flex items-center text-sm text-muted-foreground">
 <Calendar className="h-4 w-4 mr-2"/>
 {formatDate(corporate.created_at)}
 </div>
 </td>

 {/* Actions */}
 <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
 <div className="flex items-center justify-end space-x-2">
 <button
 onClick={(e) => {
 e.stopPropagation()
 onEditCorporate(corporate)
 }}
 className="p-2 rounded-none-none transition-colors duration-200 text-primary"title="Edit Corporate">
 <Edit className="h-4 w-4"/>
 </button>
 <button
 onClick={(e) => {
 e.stopPropagation()
 handleArchiveClick(corporate)
 }}
 className={`p-2 rounded-none-none transition-colors duration-200 ${corporate.is_archived
 ?'text-green-600':'text-amber-600'}`}
 title={corporate.is_archived ?'Unarchive Corporate':'Archive Corporate'}
 >
 {corporate.is_archived ? <Eye className="h-4 w-4"/> : <EyeOff className="h-4 w-4"/>}
 </button>
 <button
 onClick={(e) => {
 e.stopPropagation()
 handleDeleteClick(corporate)
 }}
 className="p-2 rounded-none-none transition-colors duration-200 text-destructive"title="Delete Corporate">
 <Trash2 className="h-4 w-4"/>
 </button>
 </div>
 </td>
 </motion.tr>
 ))}
 </tbody>
 </table>
 </div>

 {/* Pagination */}
 {totalPages > 1 && (
 <div className="border-t border-slate-200 bg-white px-4 py-3 sm:px-6">
 <div className="flex items-center justify-between">
 <div className="flex-1 flex justify-between sm:hidden">
 <button
 onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
 disabled={currentPage === 1}
 className="relative inline-flex items-center rounded-none-none border border-border bg-background px-4 py-2 text-sm font-medium text-foreground hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed">
 Previous
 </button>
 <button
 onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
 disabled={currentPage === totalPages}
 className="ml-3 relative inline-flex items-center rounded-none-none border border-border bg-background px-4 py-2 text-sm font-medium text-foreground hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed">
 Next
 </button>
 </div>
 <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
 <div>
 <p className="text-sm text-muted-foreground">
 Showing{''}
 <span className="font-medium">
 {(currentPage - 1) * itemsPerPage + 1}
 </span>{''}
 to{''}
 <span className="font-medium">
 {Math.min(currentPage * itemsPerPage, corporates.length)}
 </span>{''}
 of{''}
 <span className="font-medium">{corporates.length}</span>{''}
 results
 </p>
 </div>
 <div>
 <nav className="relative z-0 inline-flex rounded-none-none -space-x-px">
 <button
 onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
 disabled={currentPage === 1}
 className="relative inline-flex items-center rounded-none-none border border-border bg-background px-2 py-2 text-sm font-medium text-muted-foreground hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed">
 Previous
 </button>
 {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
 <button
 key={page}
 onClick={() => setCurrentPage(page)}
 className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${page === currentPage
 ?'z-10 text-primary':'border-border bg-background text-muted-foreground hover:bg-muted'}`}
 >
 {page}
 </button>
 ))}
 <button
 onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
 disabled={currentPage === totalPages}
 className="relative inline-flex items-center rounded-none-none border border-border bg-background px-2 py-2 text-sm font-medium text-muted-foreground hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed">
 Next
 </button>
 </nav>
 </div>
 </div>
 </div>
 </div>
 )}
 </div>

 {/* Archive Confirmation Modal */}
 <ArchiveConfirmationModal
 isOpen={showArchiveModal}
 onClose={handleArchiveCancel}
 onConfirm={() => {
 handleArchiveConfirm()
 }}
 isLoading={isArchiveLoading}
 studentName={selectedCorporate?.name ||''}
 isArchiving={!selectedCorporate?.isArchived}
 />

 {/* Delete Confirmation Modal */}
 <CorporateDeleteConfirmationModal
 isOpen={showDeleteModal}
 onClose={handleDeleteCancel}
 onConfirm={handleDeleteConfirm}
 companyName={selectedDeleteCorporate?.name ||''}
 isDeleting={isDeleteLoading}
 />

 {/* Profile Modal */}
 <CorporateProfileModal
 isOpen={showProfileModal}
 onClose={handleProfileClose}
 corporate={selectedProfileCorporate}
 fullProfile={fullProfileData}
 isLoading={isLoadingProfile}
 />
 </>
 )
}

