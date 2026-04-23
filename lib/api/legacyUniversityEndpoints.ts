import type { AxiosInstance, AxiosResponse } from 'axios'
import type { UniversityRegisterRequest } from '@/types/legacy-auth'

// Centralized legacy university endpoint map.
// Active product flows should not add new usage to this surface.
export const legacyUniversityEndpoints = {
  registerUniversity: async (client: AxiosInstance, data: UniversityRegisterRequest) => {
  const response: AxiosResponse = await client.post('/auth/register/university', data)
  return response.data
  },
  verifyOtpAndRegisterUniversity: async (client: AxiosInstance, code: string, data: UniversityRegisterRequest) => {
  const response: AxiosResponse = await client.post(`/auth/register/university/verify-otp?code=${code}`, data)
  return response.data
  },
  getUniversityApplications: async (client: AxiosInstance, params: any = {}) => {
  const response: AxiosResponse = await client.get('/universities/applications', { params })
  return response.data
  },
  exportUniversityApplications: async (client: AxiosInstance, params: any = {}) => {
  const response: AxiosResponse<Blob> = await client.get('/universities/applications/export', { params, responseType: 'blob' })
  return response.data
  },
  updateUniversityApplicationStatus: async (
  client: AxiosInstance,
  applicationId: string,
  status: string,
  notes?: string,
  interviewDate?: string,
  interviewLocation?: string
  ) => {
  const query = new URLSearchParams()
  query.append('status', status)
  if (notes) query.append('notes', notes)
  if (interviewDate) query.append('interview_date', interviewDate)
  if (interviewLocation) query.append('interview_location', interviewLocation)
  const response: AxiosResponse = await client.put(`/universities/applications/${applicationId}/status?${query.toString()}`)
  return response.data
  },
  getUniversityProfile: async (client: AxiosInstance) => (await client.get('/universities/profile')).data,
  updateUniversityProfile: async (client: AxiosInstance, data: any) => (await client.put('/universities/profile', data)).data,
  getUniversityDashboard: async (client: AxiosInstance) => (await client.get('/universities/dashboard')).data,
  getUniversityStudents: async (client: AxiosInstance, includeArchived = false) =>
  (await client.get('/universities/students', { params: { include_archived: includeArchived } })).data,
  createStudent: async (client: AxiosInstance, studentData: any) => (await client.post('/universities/students/create', studentData)).data,
  bulkCreateStudents: async (client: AxiosInstance, studentsData: any[]) =>
  (await client.post('/universities/students/bulk-create', { students: studentsData })).data,
  uploadStudentsCSV: async (client: AxiosInstance, file: File) => {
  const formData = new FormData()
  formData.append('file', file)
  const response: AxiosResponse = await client.post('/universities/students/upload-csv', formData, {
  headers: { 'Content-Type': 'multipart/form-data' },
  })
  return response.data
  },
  getStudentTemplate: async (client: AxiosInstance) => (await client.get('/universities/students/template')).data,
  archiveStudent: async (client: AxiosInstance, studentId: string, archive = true) =>
  (await client.post(`/universities/students/${studentId}/archive`, { archive })).data,
  deleteStudent: async (client: AxiosInstance, studentId: string) => (await client.delete(`/universities/students/${studentId}`)).data,
  getUniversityJobs: async (client: AxiosInstance) => (await client.get('/universities/jobs')).data,
  approveUniversityJob: async (client: AxiosInstance, jobId: string) => (await client.post(`/universities/jobs/${jobId}/approve`)).data,
  rejectUniversityJob: async (client: AxiosInstance, jobId: string) => (await client.post(`/universities/jobs/${jobId}/reject`)).data,
  createUniversityJob: async (client: AxiosInstance, jobData: any) => (await client.post('/jobs/university/create', jobData)).data,
  updateJobUniversity: async (client: AxiosInstance, jobId: string, jobData: any) =>
  (await client.put(`/jobs/university/${jobId}`, jobData)).data,
  deleteJobUniversity: async (client: AxiosInstance, jobId: string) => (await client.delete(`/jobs/university/${jobId}`)).data,
  getAppliedStudentsUniversity: async (client: AxiosInstance, jobId: string) =>
  (await client.get(`/universities/jobs/${jobId}/applied-students`)).data,
  getUniversityLicenses: async (client: AxiosInstance) => (await client.get('/universities/licenses')).data,
  checkBatchEligibility: async (client: AxiosInstance, batch: string, degree?: string | string[], branches?: string[]) => {
  const params: Record<string, string | string[]> = {}
  if (degree) params.degree = degree
  if (branches && branches.length > 0) params.branches = branches
  const response: AxiosResponse = await client.get(`/universities/licenses/batch/${batch}/eligibility`, { params })
  return response.data
  },
  getUniversityLicenseRequests: async (client: AxiosInstance) => (await client.get('/universities/license-requests')).data,
}
