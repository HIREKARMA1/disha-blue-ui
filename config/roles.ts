import type { ActiveUserType } from '@/types/auth'

export const ACTIVE_ROLES: ActiveUserType[] = ['student', 'corporate', 'admin']

export const ROLE_LABELS: Record<ActiveUserType, string> = {
  student: 'Student',
  corporate: 'Employer',
  admin: 'Admin',
}
