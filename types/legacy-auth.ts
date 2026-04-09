import type { ActiveUserType } from '@/types/auth'

export type LegacyUserType = ActiveUserType | 'university'

export interface UniversityRegisterRequest {
  university_name: string
  email: string
  password: string
  website_url?: string
  institute_type?: string
  established_year?: number
  contact_person_name?: string
  contact_designation?: string
  phone?: string
  address?: string
  courses_offered?: string
  branch?: string
}
