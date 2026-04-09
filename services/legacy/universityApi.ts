import legacyUniversityApiClient from '@/lib/api/legacyUniversity'

// Legacy university compatibility surface.
// Active platform flows should use student/corporate/admin APIs directly.
export const legacyUniversityApi = {
  ...legacyUniversityApiClient,
}

export default legacyUniversityApi
