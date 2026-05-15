import { apiClient } from "@/lib/api"
import type { ActiveUserType } from "@/types/auth"
import type { User } from "@/hooks/useAuth"

export const SIGNUP_DASHBOARD_PATH: Record<"student" | "corporate", string> = {
  student: "/dashboard/student",
  corporate: "/dashboard/corporate",
}

export async function loginAfterSignup(params: {
  email: string
  password: string
  userType: "student" | "corporate"
  displayName?: string
}): Promise<{ user: User; accessToken: string; refreshToken: string }> {
  const response = await apiClient.login({
    email: params.email,
    password: params.password,
    user_type: params.userType,
  })

  apiClient.setAuthTokens(response.access_token, response.refresh_token)

  const userType = (response.user?.user_type ?? params.userType) as ActiveUserType

  return {
    accessToken: response.access_token,
    refreshToken: response.refresh_token,
    user: {
      id: response.user?.id ?? "temp-id",
      email: response.user?.email ?? params.email,
      user_type: userType,
      name: response.user?.name ?? params.displayName ?? params.email,
    },
  }
}
