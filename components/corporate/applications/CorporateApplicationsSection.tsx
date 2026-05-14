"use client"

import { ApplicationManagementHeader } from "@/components/corporate/ApplicationManagementHeader"
import { ApplicationTable } from "@/components/corporate/ApplicationTable"
import { StatusUpdateModal } from "@/components/corporate/StatusUpdateModal"
import { OfferLetterUploadModal } from "@/components/corporate/OfferLetterUploadModal"
import { useCorporateApplications } from "@/hooks/corporate/useCorporateApplications"

export function CorporateApplicationsSection() {
  const {
    applications,
    filteredApplications,
    isLoading,
    error,
    showStatusModal,
    showOfferLetterModal,
    selectedApplication,
    searchTerm,
    setSearchTerm,
    filterStatus,
    handleFilterChange,
    currentPage,
    totalPages,
    totalCount,
    setCurrentPage,
    fetchApplications,
    handleStatusUpdate,
    handleOfferLetterUpload,
    openStatusModal,
    openOfferLetterModal,
    closeStatusModal,
    closeOfferLetterModal,
  } = useCorporateApplications()

  return (
    <div className="space-y-6">
      <ApplicationManagementHeader
        totalApplications={totalCount}
        pendingApplications={applications.filter((a) => a.status === "applied").length}
        shortlistedApplications={applications.filter((a) => a.status === "shortlisted").length}
        selectedApplications={applications.filter((a) => a.status === "selected").length}
        rejectedApplications={applications.filter((a) => a.status === "rejected").length}
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        filterStatus={filterStatus}
        onFilterChange={handleFilterChange}
      />

      {!isLoading && (
        <div className="-mt-1 rounded-none-none border border-border px-4 py-2.5 text-xs font-medium text-muted-foreground">
          Showing {filteredApplications.length} on this page · {totalCount} total in pipeline
        </div>
      )}

      <ApplicationTable
        applications={filteredApplications}
        isLoading={isLoading}
        error={error}
        onStatusUpdate={openStatusModal}
        onOfferLetterUpload={openOfferLetterModal}
        onRetry={fetchApplications}
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
      />

      <StatusUpdateModal
        isOpen={showStatusModal}
        onClose={closeStatusModal}
        application={selectedApplication}
        onSubmit={handleStatusUpdate}
      />

      <OfferLetterUploadModal
        isOpen={showOfferLetterModal}
        onClose={closeOfferLetterModal}
        application={selectedApplication}
        onSubmit={handleOfferLetterUpload}
      />
    </div>
  )
}
