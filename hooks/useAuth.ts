import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import type { ActiveUserType } from '@/types/auth'
import { apiClient } from '@/lib/api'

export interface User {
  id: string
  email: string
  user_type: ActiveUserType
  name?: string
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const router = useRouter()

  useEffect(() => {
  void checkAuthStatus()
  }, [])

  const checkAuthStatus = async () => {
  setIsLoading(true)
  try {
  const token =
  localStorage.getItem("access_token") ||
  localStorage.getItem("token")
  const refreshToken = localStorage.getItem('refresh_token')
  const hasToken = !!token
  setIsAuthenticated(hasToken)
  
  if (token && refreshToken) {
  // Check if these are temporary tokens (from registration)
  if (token === 'temp-access-token' && refreshToken === 'temp-refresh-token') {
  // Handle temporary authentication from registration
  const tempUserData = localStorage.getItem('temp_user_data')
  if (tempUserData) {
  try {
  const parsedUser = JSON.parse(tempUserData)
  setUser(parsedUser)
  setIsAuthenticated(true)
  } catch (error) {
  console.error('Error parsing temporary user data:', error)
  setIsAuthenticated(false)
  setUser(null)
  }
  } else {
  setIsAuthenticated(false)
  setUser(null)
  }
  setIsLoading(false)
  return
  }

  try {
  const me = await apiClient.getCurrentUser()
  setUser({
  id: me.id,
  email: me.email,
  user_type: me.user_type as ActiveUserType,
  name: me.name
  })
  setIsAuthenticated(true)
  } catch (error) {
  console.error('Error fetching current user:', error)
  localStorage.removeItem('access_token')
  localStorage.removeItem('token')
  localStorage.removeItem('refresh_token')
  setUser(null)
  setIsAuthenticated(false)
  }
  } else {
  setIsAuthenticated(false)
  setUser(null)
  }
  } catch (error) {
  console.error('Error checking auth status:', error)
  localStorage.removeItem('access_token')
  localStorage.removeItem('token')
  localStorage.removeItem('refresh_token')
  setUser(null)
  setIsAuthenticated(false)
  } finally {
  setIsLoading(false)
  }
  }

  const login = (userData: User, accessToken: string, refreshToken: string) => {
  localStorage.setItem('access_token', accessToken)
  localStorage.setItem('token', accessToken)
  localStorage.setItem('refresh_token', refreshToken)
  setUser(userData)
  setIsAuthenticated(true)
  }

  const logout = () => {
  localStorage.removeItem('access_token')
  localStorage.removeItem('token')
  localStorage.removeItem('refresh_token')
  localStorage.removeItem('temp_user_data')
  localStorage.removeItem('temp_user_type')
  setUser(null)
  setIsAuthenticated(false)
  router.push('/auth/login')
  }

  const redirectIfAuthenticated = (redirectPath: string = '/dashboard') => {
  if (isAuthenticated && user) {
  // Redirect to appropriate dashboard based on user type
  const dashboardPath = `/dashboard/${user.user_type}`
  router.push(dashboardPath)
  return true
  }
  return false
  }

  const requireAuth = (redirectPath: string = '/auth/login') => {
  const pathname = typeof window !== "undefined" ? window.location.pathname : ""
  const isOnboardingRoute = pathname.startsWith("/signup/")
  if (!isAuthenticated && !isOnboardingRoute) {
  router.push('/auth/login')
  return false
  }
  if (!isAuthenticated && isOnboardingRoute) {
  return true
  }
  if (!isAuthenticated) {
  router.push(redirectPath)
  return false
  }
  return true
  }

  const isTemporaryAuth = () => {
  const accessToken = localStorage.getItem('access_token')
  const refreshToken = localStorage.getItem('refresh_token')
  return accessToken === 'temp-access-token' && refreshToken === 'temp-refresh-token'
  }

  const getToken = () => {
  return localStorage.getItem('access_token') || localStorage.getItem('token')
  }

  const userType = user?.user_type ?? null

  return {
  user,
  userType,
  isAuthenticated,
  isLoading,
  login,
  logout,
  redirectIfAuthenticated,
  requireAuth,
  checkAuthStatus,
  isTemporaryAuth,
  getToken
  }
}
