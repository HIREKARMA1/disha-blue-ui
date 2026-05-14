"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import { toast } from "react-hot-toast"
import { apiClient } from "@/lib/api"
import { getErrorMessage } from "@/lib/error-handler"
import type {
  ApplicationData,
  ApplicationStatusUpdatePayload,
} from "@/components/corporate/applications/corporate-application-types"

export function useCorporateApplications() {
  const [applications, setApplications] = useState<ApplicationData[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showStatusModal, setShowStatusModal] = useState(false)
  const [showOfferLetterModal, setShowOfferLetterModal] = useState(false)
  const [selectedApplication, setSelectedApplication] = useState<ApplicationData | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterStatus, setFilterStatus] = useState("all")
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalCount, setTotalCount] = useState(0)

  const handleFilterChange = useCallback((status: string) => {
    setFilterStatus(status)
    setCurrentPage(1)
  }, [])

  const fetchApplications = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const response = await apiClient.getCorporateApplications({
        status: filterStatus === "all" ? undefined : filterStatus,
        page: currentPage,
        limit: 20,
      })
      setApplications(response.applications)
      setTotalPages(response.total_pages)
      setTotalCount(response.total_count)
    } catch (err) {
      console.error("Failed to fetch applications:", err)
      setError("Failed to load applications. Please try again.")
      toast.error("Failed to load applications.")
    } finally {
      setIsLoading(false)
    }
  }, [filterStatus, currentPage])

  useEffect(() => {
    void fetchApplications()
  }, [fetchApplications])

  const filteredApplications = useMemo(
    () =>
      applications.filter((application) => {
        const q = searchTerm.toLowerCase()
        return (
          application.student_name.toLowerCase().includes(q) ||
          application.job_title.toLowerCase().includes(q) ||
          application.student_email.toLowerCase().includes(q)
        )
      }),
    [applications, searchTerm],
  )

  const handleStatusUpdate = useCallback(
    async (applicationId: string, statusData: ApplicationStatusUpdatePayload) => {
      try {
        await apiClient.updateApplicationStatus(applicationId, statusData)
        toast.success("Application status updated. The student will be notified by email.")
        await fetchApplications()
      } catch (err) {
        console.error("Failed to update status:", err)
        toast.error(getErrorMessage(err as any))
        throw err
      }
    },
    [fetchApplications],
  )

  const handleOfferLetterUpload = useCallback(
    async (applicationId: string, file: File) => {
      try {
        await apiClient.uploadOfferLetter(applicationId, file)
        toast.success("Offer letter uploaded successfully")
        await fetchApplications()
      } catch (err) {
        console.error("Failed to upload offer letter:", err)
        toast.error(getErrorMessage(err as any))
        throw err
      }
    },
    [fetchApplications],
  )

  const openStatusModal = useCallback((application: ApplicationData) => {
    setSelectedApplication(application)
    setShowStatusModal(true)
  }, [])

  const openOfferLetterModal = useCallback((application: ApplicationData) => {
    setSelectedApplication(application)
    setShowOfferLetterModal(true)
  }, [])

  const closeStatusModal = useCallback(() => {
    setShowStatusModal(false)
    setSelectedApplication(null)
  }, [])

  const closeOfferLetterModal = useCallback(() => {
    setShowOfferLetterModal(false)
    setSelectedApplication(null)
  }, [])

  return {
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
  }
}
