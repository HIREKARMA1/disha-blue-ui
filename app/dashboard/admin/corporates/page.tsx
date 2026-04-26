"use client"

import { useState, useEffect } from 'react'
import { AdminDashboardLayout } from '@/components/dashboard/AdminDashboardLayout'
import { CorporateManagementHeader } from '@/components/dashboard/CorporateManagementHeader'
import { CorporateTable } from '@/components/dashboard/CorporateTable'
import { CreateCorporateModal } from '@/components/dashboard/CreateCorporateModal'
import { EditCorporateModal } from '@/components/dashboard/EditCorporateModal'
import { corporateManagementService } from '@/services/corporateManagementService'
import { CorporateListResponse, CorporateListItem, CorporateProfile, UpdateCorporateRequest } from '@/types/corporate'
import { toast } from 'react-hot-toast'
import { getErrorMessage } from '@/lib/error-handler'
import { Plus, Download, Upload } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function AdminCorporates() {
  const [corporates, setCorporates] = useState<CorporateListItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [selectedCorporate, setSelectedCorporate] = useState<CorporateProfile | null>(null)
  const [includeArchived, setIncludeArchived] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')

  const fetchCorporates = async () => {
  setIsLoading(true)
  setError(null)
  try {
  const response = await corporateManagementService.getCorporates(includeArchived)
  setCorporates(response.corporates)
  } catch (err) {
  console.error('Failed to fetch corporates:', err)
  setError('Failed to load corporates. Please try again.')
  toast.error('Failed to load corporates.')
  } finally {
  setIsLoading(false)
  }
  }

  useEffect(() => {
  fetchCorporates()
  }, [includeArchived])

  const filteredCorporates = corporates.filter((corporate) => {
  const matchesSearch =
  searchTerm === '' ||
  corporate.company_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
  corporate.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
  (corporate.phone && corporate.phone.toLowerCase().includes(searchTerm.toLowerCase())) ||
  (corporate.address && corporate.address.toLowerCase().includes(searchTerm.toLowerCase()))

  const matchesStatus =
  filterStatus === 'all' ||
  (filterStatus === 'verified' && corporate.verified) ||
  (filterStatus === 'unverified' && !corporate.verified) ||
  (filterStatus === 'active' && corporate.status === 'active') ||
  (filterStatus === 'inactive' && corporate.status === 'inactive')

  return matchesSearch && matchesStatus
  })

  const handleCreateCorporate = async (corporateData: any) => {
  try {
  const result = await corporateManagementService.createCorporate(corporateData)
  toast.success('Corporate created successfully!')
  setShowCreateModal(false)
  fetchCorporates()
  return result
  } catch (error: any) {
  console.error('Failed to create corporate:', error)
  toast.error(getErrorMessage(error))
  throw error
  }
  }

  const handleArchiveCorporate = async (corporateId: string, archive: boolean) => {
  try {
  await corporateManagementService.archiveCorporate(corporateId, archive)
  toast.success(`Corporate ${archive ? 'archived' : 'unarchived'} successfully!`)
  fetchCorporates()
  } catch (error: any) {
  console.error('Failed to archive/unarchive corporate:', error)
  toast.error(getErrorMessage(error))
  }
  }

  const handleDeleteCorporate = async (corporateId: string) => {
  try {
  await corporateManagementService.deleteCorporate(corporateId)
  toast.success('Corporate and all associated data deleted successfully!')
  fetchCorporates()
  } catch (error: any) {
  console.error('Failed to delete corporate:', error)
  toast.error(getErrorMessage(error))
  throw error
  }
  }

  const handleEditCorporate = async (corporate: CorporateListItem) => {
  try {
  const profile = await corporateManagementService.getCorporateProfile(corporate.id)
  setSelectedCorporate(profile)
  setShowEditModal(true)
  } catch (error: any) {
  console.error('Failed to fetch corporate profile:', error)
  toast.error(getErrorMessage(error))
  }
  }

  const handleUpdateCorporate = async (
  corporateId: string,
  data: UpdateCorporateRequest
  ): Promise<CorporateProfile> => {
  try {
  const updated = await corporateManagementService.updateCorporate(corporateId, data)
  toast.success('Corporate updated successfully!')
  setShowEditModal(false)
  setSelectedCorporate(null)
  fetchCorporates()
  return updated
  } catch (error: any) {
  console.error('Failed to update corporate:', error)
  toast.error(getErrorMessage(error))
  throw error
  }
  }

  const handleExportCorporates = async () => {
  try {
  const blob = await corporateManagementService.exportCorporates(includeArchived)
  const url = window.URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `corporates_export_${new Date().toISOString().split('T')[0]}.csv`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  window.URL.revokeObjectURL(url)
  toast.success('Corporates exported successfully!')
  } catch (error: any) {
  console.error('Failed to export corporates:', error)
  toast.error(getErrorMessage(error))
  }
  }

  const handleImportCorporates = async () => {
  try {
  // TODO: Implement import functionality
  toast('Import functionality coming soon!')
  } catch (error: any) {
  console.error('Failed to import corporates:', error)
  toast.error('Failed to import corporates.')
  }
  }

  return (
  <AdminDashboardLayout>
  <div className="space-y-6">
  <div className="rounded-none border border-border p-6 shadow-soft">
  <div className="flex min-w-0 flex-1 flex-col gap-4 lg:flex-row lg:items-center lg:justify-between lg:gap-6">
  <div className="min-w-0 flex-1">
  <h1 className="mb-2 font-display text-2xl font-semibold tracking-tight text-foreground md:text-3xl">
  Employer Management
  </h1>
  <p className="mb-3 text-base text-muted-foreground md:text-lg">
  Manage employers, verification status, and hiring participation.
  </p>
  <div className="flex flex-wrap gap-2">
  <span className="inline-flex items-center border px-3 py-1 text-xs font-medium text-primary">
  {corporates.length} total employers
  </span>
  <span className="inline-flex items-center border px-3 py-1 text-xs font-medium text-blue-700">
  {corporates.filter((c) => c.verified).length} verified
  </span>
  <span className="inline-flex items-center border px-3 py-1 text-xs font-medium text-secondary-700">
  {corporates.reduce((sum, c) => sum + (c.total_jobs || 0), 0)} linked jobs
  </span>
  </div>
  </div>
  </div>
  </div>

  <div className="flex flex-col gap-3 sm:flex-row">
  <Button
  onClick={() => setShowCreateModal(true)}
  className="h-11 justify-center gap-2 rounded-none text-primary-foreground"
  >
  <Plus className="h-5 w-5" />
  <span>Add Employer</span>
  </Button>

  <Button
  variant="outline"
  onClick={handleExportCorporates}
  className="h-11 justify-center gap-2 rounded-none border-2"
  >
  <Download className="h-5 w-5" />
  <span>Export Data</span>
  </Button>

  <Button
  variant="outline"
  onClick={handleImportCorporates}
  className="h-11 justify-center gap-2 rounded-none border-2"
  >
  <Upload className="h-5 w-5" />
  <span>Import Data</span>
  </Button>
  </div>

  <CorporateManagementHeader
  totalCorporates={corporates.length}
  activeCorporates={corporates.filter((c) => !c.is_archived).length}
  archivedCorporates={corporates.filter((c) => c.is_archived).length}
  searchTerm={searchTerm}
  onSearchChange={setSearchTerm}
  filterStatus={filterStatus}
  onFilterChange={setFilterStatus}
  includeArchived={includeArchived}
  onIncludeArchivedChange={setIncludeArchived}
  />

  <CorporateTable
  corporates={filteredCorporates}
  isLoading={isLoading}
  error={error}
  onArchiveCorporate={handleArchiveCorporate}
  onDeleteCorporate={handleDeleteCorporate}
  onEditCorporate={handleEditCorporate}
  onRetry={fetchCorporates}
  />

  <CreateCorporateModal
  isOpen={showCreateModal}
  onClose={() => setShowCreateModal(false)}
  onSubmit={handleCreateCorporate}
  />
  <EditCorporateModal
  isOpen={showEditModal}
  onClose={() => {
  setShowEditModal(false)
  setSelectedCorporate(null)
  }}
  onSubmit={handleUpdateCorporate}
  corporate={selectedCorporate}
  />
  </div>
  </AdminDashboardLayout>
  )
}

