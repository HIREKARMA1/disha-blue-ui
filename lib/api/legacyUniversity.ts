import apiClient from '@/lib/api'
import type { UniversityRegisterRequest } from '@/types/legacy-auth'

// Legacy-only university API namespace.
// Active product flows should not consume this module.
export const legacyUniversityApiClient = {
  registerUniversity: (data: UniversityRegisterRequest) => apiClient.registerUniversity(data),
  verifyOtpAndRegisterUniversity: (code: string, data: UniversityRegisterRequest) =>
    apiClient.verifyOtpAndRegisterUniversity(code, data),
  getUniversityProfile: () => apiClient.getUniversityProfile(),
  updateUniversityProfile: (data: any) => apiClient.updateUniversityProfile(data),
  getUniversityDashboard: () => apiClient.getUniversityDashboard(),
  getUniversityStudents: (includeArchived = false) => apiClient.getUniversityStudents(includeArchived),
  createStudent: (data: any) => apiClient.createStudent(data),
  bulkCreateStudents: (students: any[]) => apiClient.bulkCreateStudents(students),
  uploadStudentsCSV: (file: File) => apiClient.uploadStudentsCSV(file),
  getStudentTemplate: () => apiClient.getStudentTemplate(),
  archiveStudent: (studentId: string, archive = true) => apiClient.archiveStudent(studentId, archive),
  deleteStudent: (studentId: string) => apiClient.deleteStudent(studentId),
  getUniversityJobs: () => apiClient.getUniversityJobs(),
  approveUniversityJob: (jobId: string) => apiClient.approveUniversityJob(jobId),
  rejectUniversityJob: (jobId: string) => apiClient.rejectUniversityJob(jobId),
  createUniversityJob: (jobData: any) => apiClient.createUniversityJob(jobData),
  updateJobUniversity: (jobId: string, jobData: any) => apiClient.updateJobUniversity(jobId, jobData),
  deleteJobUniversity: (jobId: string) => apiClient.deleteJobUniversity(jobId),
  getAppliedStudentsUniversity: (jobId: string) => apiClient.getAppliedStudentsUniversity(jobId),
  getUniversityApplications: (params: any = {}) => apiClient.getUniversityApplications(params),
  exportUniversityApplications: (params: any = {}) => apiClient.exportUniversityApplications(params),
  updateUniversityApplicationStatus: (
    applicationId: string,
    status: string,
    notes?: string,
    interviewDate?: string,
    interviewLocation?: string
  ) => apiClient.updateUniversityApplicationStatus(applicationId, status, notes, interviewDate, interviewLocation),
  getUniversityLicenses: () => apiClient.getUniversityLicenses(),
  getUniversityLicenseRequests: () => apiClient.getUniversityLicenseRequests(),
  checkBatchEligibility: (batch: string, degree?: string | string[], branches?: string[]) =>
    apiClient.checkBatchEligibility(batch, degree, branches),
}

export default legacyUniversityApiClient
