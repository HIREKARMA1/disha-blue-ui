"use client"

import { useState, useEffect } from 'react'
import { AdminDashboardLayout } from '@/components/dashboard/AdminDashboardLayout'
import { UniversityManagementHeader } from '@/components/dashboard/UniversityManagementHeader'
import { UniversityTable } from '@/components/dashboard/UniversityTable'
import { CreateUniversityModal } from '@/components/dashboard/CreateUniversityModal'
import { EditUniversityModal } from '@/components/dashboard/EditUniversityModal'
import { BulkUploadModal } from '@/components/dashboard/BulkUploadModal'
import { universityManagementService } from '@/services/universityManagementService'
import { UniversityListResponse, UniversityListItem, UniversityProfile, UpdateUniversityRequest } from '@/types/university'
import { toast } from 'react-hot-toast'
import { getErrorMessage } from '@/lib/error-handler'
import { Plus, Download, Upload } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function AdminUniversities() {
 const [universities, setUniversities] = useState<UniversityListItem[]>([])
 const [isLoading, setIsLoading] = useState(true)
 const [error, setError] = useState<string | null>(null)
 const [showCreateModal, setShowCreateModal] = useState(false)
 const [showEditModal, setShowEditModal] = useState(false)
 const [showBulkUploadModal, setShowBulkUploadModal] = useState(false)
 const [selectedUniversity, setSelectedUniversity] = useState<UniversityProfile | null>(null)
 const [includeArchived, setIncludeArchived] = useState(false)
 const [searchTerm, setSearchTerm] = useState('')
 const [filterStatus, setFilterStatus] = useState('all')

 const fetchUniversities = async () => {
 setIsLoading(true)
 setError(null)
 try {
 const response = await universityManagementService.getUniversities(includeArchived)
 setUniversities(response.universities)
 } catch (err) {
 console.error('Failed to fetch universities:', err)
 setError('Failed to load universities. Please try again.')
 toast.error('Failed to load universities.')
 } finally {
 setIsLoading(false)
 }
 }

 useEffect(() => {
 fetchUniversities()
 }, [includeArchived])

 const filteredUniversities = universities.filter(university => {
 const matchesSearch = searchTerm ===''||
 university.university_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
 university.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
 (university.phone && university.phone.toLowerCase().includes(searchTerm.toLowerCase())) ||
 (university.address && university.address.toLowerCase().includes(searchTerm.toLowerCase()))

 const matchesStatus = filterStatus ==='all'||
 (filterStatus ==='verified'&& university.verified) ||
 (filterStatus ==='unverified'&& !university.verified) ||
 (filterStatus ==='active'&& university.status ==='active') ||
 (filterStatus ==='inactive'&& university.status ==='inactive')

 return matchesSearch && matchesStatus
 })

 const handleCreateUniversity = async (universityData: any) => {
 try {
 const result = await universityManagementService.createUniversity(universityData)
 toast.success('University created successfully!')
 setShowCreateModal(false)
 fetchUniversities() // Refresh the list
 return result
 } catch (error: any) {
 console.error('Failed to create university:', error)
 toast.error(getErrorMessage(error))
 throw error
 }
 }

 const handleArchiveUniversity = async (universityId: string, archive: boolean) => {
 try {
 await universityManagementService.archiveUniversity(universityId, archive)
 toast.success(`University ${archive ?'archived':'unarchived'} successfully!`)
 fetchUniversities() // Refresh the list
 } catch (error: any) {
 console.error('Failed to archive/unarchive university:', error)
 toast.error(getErrorMessage(error))
 }
 }

 const handleDeleteUniversity = async (universityId: string) => {
 try {
 await universityManagementService.deleteUniversity(universityId)
 toast.success('University and all associated data deleted successfully!')
 fetchUniversities() // Refresh the list
 } catch (error: any) {
 console.error('Failed to delete university:', error)
 toast.error(getErrorMessage(error))
 throw error // Re-throw to let the modal handle it
 }
 }

 const handleEditUniversity = async (university: UniversityListItem) => {
 try {
 // Fetch full university profile
const profile = await universityManagementService.getUniversityProfile(university.id)
 setSelectedUniversity(profile)
 setShowEditModal(true)
 } catch (error: any) {
 console.error('Failed to fetch university profile:', error)
 toast.error(getErrorMessage(error))
 }
 }

 const handleUpdateUniversity = async (universityId: string, data: UpdateUniversityRequest): Promise<UniversityProfile> => {
 try {
 const updated = await universityManagementService.updateUniversity(universityId, data)
 toast.success('University updated successfully!')
 setShowEditModal(false)
 setSelectedUniversity(null)
 fetchUniversities() // Refresh the list
 return updated
 } catch (error: any) {
 console.error('Failed to update university:', error)
 toast.error(getErrorMessage(error))
 throw error
 }
 }

 const handleExportUniversities = async () => {
 try {
 const blob = await universityManagementService.exportUniversities(includeArchived)
 
 // Create download link
const url = window.URL.createObjectURL(blob)
 const link = document.createElement('a')
 link.href = url
 link.download = `universities_export_${new Date().toISOString().split('T')[0]}.csv`
 document.body.appendChild(link)
 link.click()
 document.body.removeChild(link)
 window.URL.revokeObjectURL(url)
 
 toast.success('Universities exported successfully!')
 } catch (error: any) {
 console.error('Failed to export universities:', error)
 toast.error(getErrorMessage(error))
 }
 }

 const handleImportUniversities = () => {
 setShowBulkUploadModal(true)
 }

 const handleBulkUploadUniversities = async (file: File) => {
 const toastId = toast.loading('Importing universities from CSV...')
 try {
 const result = await universityManagementService.importUniversities(file)

 toast.success(
 `Imported ${result.successful} of ${result.total_processed} universities`,
 { id: toastId }
 )

 if (result.errors && result.errors.length > 0) {
 console.warn('Some rows failed during university import:', result.errors)
 }

 setShowBulkUploadModal(false)
 await fetchUniversities()
 } catch (error: any) {
 console.error('Failed to import universities:', error)
 toast.error(getErrorMessage(error), { id: toastId })
 }
 }

 return (
 <AdminDashboardLayout>
 <div className="space-y-6">
 {/* Header Section */}
 <div className="rounded-none-none border border-border p-6 shadow-soft">
 <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 lg:gap-6">
 <div className="flex-1 min-w-0">
 <h1 className="font-display text-2xl md:text-3xl font-semibold tracking-tight text-foreground mb-2">
 University Management
 </h1>
 <p className="text-muted-foreground text-base md:text-lg mb-3">
 Manage institutions, verification, and student ecosystem participation.
 </p>
 <div className="flex flex-wrap gap-2">
 <span className="inline-flex items-center border px-3 py-1 text-xs font-medium text-primary">
 {universities.length} total universities
 </span>
 <span className="inline-flex items-center border px-3 py-1 text-xs font-medium text-green-700">
 {universities.filter(u => u.verified).length} verified
 </span>
 <span className="inline-flex items-center border px-3 py-1 text-xs font-medium text-secondary-700">
 {universities.reduce((sum, u) => sum + (u.total_students || 0), 0)} total students
 </span>
 </div>
 </div>
 </div>
 </div>

 {/* Action Buttons */}
 <div className="flex flex-col sm:flex-row gap-3">
 <Button onClick={() => setShowCreateModal(true)} className="h-11 justify-center gap-2 rounded-none-none text-primary-foreground">
 <Plus className="w-5 h-5"/>
 <span>Add University</span>
 </Button>

 <Button variant="outline"onClick={handleExportUniversities} className="h-11 justify-center gap-2 rounded-none-none border-2">
 <Download className="w-5 h-5"/>
 <span>Export Data</span>
 </Button>

 <Button variant="outline"onClick={handleImportUniversities} className="h-11 justify-center gap-2 rounded-none-none border-2">
 <Upload className="w-5 h-5"/>
 <span>Import Data</span>
 </Button>
 </div>

 {/* University Management Header (search, filters) */}
 <UniversityManagementHeader
 totalUniversities={universities.length}
 activeUniversities={universities.filter(u => !u.is_archived).length}
 archivedUniversities={universities.filter(u => u.is_archived).length}
 searchTerm={searchTerm}
 onSearchChange={setSearchTerm}
 filterStatus={filterStatus}
 onFilterChange={setFilterStatus}
 includeArchived={includeArchived}
 onIncludeArchivedChange={setIncludeArchived}
 />

 {/* University Table */}
 <UniversityTable
 universities={filteredUniversities}
 isLoading={isLoading}
 error={error}
 onArchiveUniversity={handleArchiveUniversity}
 onDeleteUniversity={handleDeleteUniversity}
 onEditUniversity={handleEditUniversity}
 onRetry={fetchUniversities}
 />

 {/* Modals */}
 <CreateUniversityModal
 isOpen={showCreateModal}
 onClose={() => setShowCreateModal(false)}
 onSubmit={handleCreateUniversity}
 />
 <EditUniversityModal
 isOpen={showEditModal}
 onClose={() => {
 setShowEditModal(false)
 setSelectedUniversity(null)
 }}
 onSubmit={handleUpdateUniversity}
 university={selectedUniversity}
 />
 <BulkUploadModal
 isOpen={showBulkUploadModal}
 onClose={() => setShowBulkUploadModal(false)}
 onSubmit={handleBulkUploadUniversities}
 mode="universities"/>
 </div>
 </AdminDashboardLayout>
 )
}


