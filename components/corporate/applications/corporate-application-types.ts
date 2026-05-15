export interface ApplicationData {
  id: string
  job_id: string
  student_id: string
  university_id?: string
  status: string
  applied_at: string
  updated_at?: string
  cover_letter?: string
  expected_salary?: number
  availability_date?: string
  corporate_notes?: string
  interview_date?: string
  interview_location?: string
  offer_letter_url?: string
  offer_letter_uploaded_at?: string
  job_title: string
  student_name: string
  student_email: string
  corporate_name: string
}

export interface ApplicationsResponse {
  applications: ApplicationData[]
  total_count: number
  page: number
  limit: number
  total_pages: number
}

export interface ApplicationStatusUpdatePayload {
  status: string
  corporate_notes?: string
  interview_date?: string
  interview_location?: string
}
