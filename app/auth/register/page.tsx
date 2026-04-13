"use client"

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { motion } from 'framer-motion'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'react-hot-toast'
import { Eye, EyeOff, Mail, Lock, User, Building2, ShieldCheck, Phone, Globe, RotateCcw } from 'lucide-react'
import Link from 'next/link'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { AsyncSearchableSelect, AsyncSelectOption } from '@/components/ui/async-searchable-select'
import { apiClient } from '@/lib/api'
import { UserType, StudentRegisterRequest, CorporateRegisterRequest, AdminRegisterRequest } from '@/types/auth'

// Union type for all possible form data
type FormData = {
  email: string
  password: string
  confirmPassword: string
  user_type: UserType
} & (
  | { name: string; phone?: string; dob?: string; gender?: string; graduation_year?: number; institution?: string; college_id?: string; degree?: string; branch?: string; technical_skills?: string }
  | { company_name: string; website_url?: string; industry?: string; company_size?: string; founded_year?: number; contact_person?: string; contact_designation?: string; address?: string; phone?: string }
  | { name: string; role?: string }
  )
import { useAuth } from '@/hooks/useAuth'
import { getClientLocale, t, type SupportedLocale } from '@/lib/i18n'
import { AuthShell } from '@/components/auth/AuthShell'
import {
  authCtaButtonClass,
  authFormCardClass,
  authLabelClass,
  authOtpDigitClassNames,
  authRoleTileClassNames,
} from '@/components/auth/auth-styles'
import { cn } from '@/lib/utils'

const userTypeOptions = (locale: SupportedLocale) => [
  { value: 'student', label: t(locale, 'auth.student') },
  { value: 'corporate', label: t(locale, 'auth.corporate') }
  // Admin option removed for security - admin accounts must be created manually
]

const userTypeIcons = {
  student: User,
  corporate: Building2
  // Admin icon removed for security
}

// for the error message input
const getInputStatus = (name: keyof FormData, errors: any, value: any) => {
  if (errors[name]) return "error";  // red border
  if (value) return "success";  // green border if filled correctly
  return "default";  // gray border initially
}


// Create schemas independently to avoid .extend() issues
const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .superRefine((val, ctx) => {
  if (!/^[A-Z]/.test(val)) {
  ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Password must start with an uppercase letter' })
  }
  if (!/[^A-Za-z0-9]/.test(val)) {
  ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Password must include at least one special character' })
  }
  const digitCount = (val.match(/\d/g) || []).length
  if (digitCount < 3) {
  ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Password must include at least three digits' })
  }
  })

const emailSchema = z
  .string()
  .trim()
  .min(5, "Email must be at least 5 characters long")
  .max(100, "Email must be less than 100 characters")
  .email("Please enter a valid email address")
  .refine((val) => {
  const domain = val.split('@')[1]
  if (!domain) return false
  const domainParts = domain.split('.')
  if (domainParts.length < 2) return false
  const tld = domainParts.pop()
  if (!tld || !/^[A-Za-z]{2,6}$/.test(tld)) return false
  return domainParts.every((part) => /^[A-Za-z0-9-]+$/.test(part) && !part.startsWith('-') && !part.endsWith('-'))
  }, "Please enter a valid email address");

const isValidPublicUrl = (value: string) => {
  try {
  const trimmed = value.trim()
  const url = new URL(trimmed)
  if (!['http:', 'https:'].includes(url.protocol)) return false
  const hostname = url.hostname
  if (!hostname || hostname === 'localhost' || hostname.endsWith('.local')) return false
  if (!/^[A-Za-z0-9.-]+$/.test(hostname)) return false
  if (!hostname.includes('.')) return false
  const parts = hostname.split('.')
  const tld = parts.pop()
  if (!tld || !/^[A-Za-z]{2,6}$/.test(tld)) return false
  return parts.every((part) => /^[A-Za-z0-9-]+$/.test(part) && !part.startsWith('-') && !part.endsWith('-'))
  } catch (error) {
  return false
  }
}




const studentSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
  confirmPassword: z.string(),
  user_type: z.enum(['student', 'corporate', 'admin']),
  name: z
  .string()
  .min(1, 'Name is required')
  .regex(/^[A-Za-z\s]+$/, 'Name can only contain letters and spaces'),
  phone: z
  .string()
  .regex(/^\d+$/, 'Phone number must contain only digits')
  .refine(
  (val) => {
  if (val.length < 10) return false
  if (val.startsWith('91')) {
  return val.length === 12
  }
  return val.length === 10
  },
  {
  message:
  'Invalid phone number. Must be 10 digits, or start with 91 followed by 10 digits.',
  }
  )
  .optional(),
  dob: z.string().optional(),
  gender: z.string().optional(),
  graduation_year: z.number().optional(),
  institution: z.string().optional(),
  degree: z.string().optional(),
  branch: z.string().optional(),
  technical_skills: z.string().optional(),
  college_id: z.string().optional(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
})

const corporateSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
  confirmPassword: z.string(),
  user_type: z.enum(['student', 'corporate', 'admin']),
  company_name: z
  .string()
  .min(1, 'Company name is required')
  .regex(/^[A-Za-z\s]+$/, 'Company name can only contain letters and spaces'),
  website_url: z
  .string()
  .trim()
  .optional()
  .refine((val) => {
  if (val === undefined || val === '') return true
  return isValidPublicUrl(val)
  }, { message: 'Please enter a valid website URL' }),
  industry: z.string().optional(),
  company_size: z.string().optional(),
  founded_year: z.number().optional(),
  contact_person: z.string().optional(),
  contact_designation: z.string().optional(),
  address: z.string().optional(),
  phone: z
  .string()
  .regex(/^\d+$/, "Phone number must contain only digits")
  .refine(
  (val) => {
  // Must be at least 10 digits
  if (val.length < 10) return false;

  // Case 1: Starts with 91 -> should be 12 digits (91 + 10)
  if (val.startsWith("91")) {
  return val.length === 12;
  }

  // Case 2: Not starting with 91 -> must be exactly 10 digits
  return val.length === 10;
  },
  {
  message:
  "Invalid phone number. Must be 10 digits, or start with 91 followed by 10 digits.",
  }
  )
  .optional(),

}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
})

// Admin schema removed for security - admin accounts must be created manually

export default function RegisterPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { redirectIfAuthenticated, login } = useAuth()
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [selectedUserType, setSelectedUserType] = useState<UserType>('student')
  const [currentStep, setCurrentStep] = useState<'form' | 'otp'>('form')
  const [formData, setFormData] = useState<FormData | null>(null)
  const [otp, setOtp] = useState('')
  const [countdown, setCountdown] = useState(0)
  const [isResendCooldown, setIsResendCooldown] = useState(false) // Track if we're in resend cooldown period
  const [resendCount, setResendCount] = useState(0) // Track number of resends
  const [locale, setLocale] = useState<SupportedLocale>('en')

  useEffect(() => {
  setLocale(getClientLocale())
  }, [])

  // Redirect if user is already authenticated (but not if we have a redirect URL)
  useEffect(() => {
  // Check if there's a redirect URL - if so, don't auto-redirect
  const hasRedirectUrl = searchParams.get('redirect') || (typeof window !== 'undefined' && localStorage.getItem('redirect_after_login'))
  if (!hasRedirectUrl) {
  redirectIfAuthenticated()
  }
  }, [redirectIfAuthenticated, searchParams])

  // Get the appropriate schema for the current user type
  const getValidationSchema = (userType: UserType) => {
  switch (userType) {
  case 'student':
  return studentSchema
  case 'corporate':
  return corporateSchema
  default:
  return studentSchema
  }
  }

  // Get the appropriate schema for the current user type
  const validationSchema = getValidationSchema(selectedUserType)

  const {
  register,
  handleSubmit,
  setValue,
  reset,
  watch,
  formState: { errors }
  } = useForm<FormData>({
  resolver: zodResolver(validationSchema),
  defaultValues: {
  user_type: 'student'
  }
  })

  // Update validation schema when user type changes
  useEffect(() => {
  const newSchema = getValidationSchema(selectedUserType)
  // Reset form when changing user type to avoid validation conflicts
  reset()
  setValue('user_type', selectedUserType)
  }, [selectedUserType, reset, setValue])

  useEffect(() => {
  const type = searchParams.get('type') as UserType
  if (type && ['student', 'corporate'].includes(type)) {
  setSelectedUserType(type)
  setValue('user_type', type)
  }
  }, [searchParams, setValue])

  const handleUserTypeChange = (value: string) => {
  const userType = value as UserType
  setSelectedUserType(userType)
  setValue('user_type', userType)

  // Preserve redirect parameter when updating URL
  const redirectUrl = searchParams.get('redirect')
  const newUrl = redirectUrl
  ? `/auth/register?type=${userType}&redirect=${redirectUrl}`
  : `/auth/register?type=${userType}`
  router.replace(newUrl)

  // Reset form when changing user type
  reset()
  setValue('user_type', userType)
  }

  // Countdown timer for OTP resend
  useEffect(() => {
  if (countdown > 0) {
  const timer = setTimeout(() => setCountdown(countdown - 1), 1000)
  return () => clearTimeout(timer)
  } else if (countdown === 0 && isResendCooldown) {
  // Reset cooldown flag when countdown reaches 0
  setIsResendCooldown(false)
  }
  }, [countdown, isResendCooldown])

  const onSubmit = async (data: FormData) => {
  setIsLoading(true)
  try {
  // Step 1: Send OTP to email
  await apiClient.sendEmailOtp(data.email)
  setFormData(data)
  setCurrentStep('otp')
  setCountdown(0) // No cooldown for first OTP request
  setIsResendCooldown(false)
  setResendCount(0) // Reset resend count for new email
  toast.success(t(locale, 'auth.toast.otpSent'))
  } catch (error: any) {
  console.error('Send OTP error:', error)
  let message = t(locale, 'auth.errors.sendOtpFailed')

  if (error.response?.data?.detail) {
  message = error.response.data.detail
  } else if (error.message) {
  message = error.message
  }

  toast.error(message)
  } finally {
  setIsLoading(false)
  }
  }

  const handleResendOtp = async () => {
  if (countdown > 0 || !formData) return

  setIsLoading(true)
  try {
  await apiClient.sendEmailOtp(formData.email)

  // Increment resend count
  const newResendCount = resendCount + 1
  setResendCount(newResendCount)

  // After 3 resends, start 5-minute cooldown countdown
  if (newResendCount >= 3) {
  setCountdown(300) // 5 minutes = 300 seconds
  setIsResendCooldown(true)
  toast.success(t(locale, 'auth.toast.otpResentCooldown'))
  } else {
  // No cooldown for first 2 resends
  setCountdown(0)
  setIsResendCooldown(false)
  toast.success(t(locale, 'auth.toast.otpResent'))
  }
  } catch (error: any) {
  console.error('Resend OTP error:', error)
  const message = error.response?.data?.detail || t(locale, 'auth.errors.resendOtpFailed')
  toast.error(message)

  // If it's a cooldown error (backend enforced), extract the remaining time and set countdown
  if (message.includes('Too many OTP requests') || message.includes('Please wait')) {
  // Extract minutes and seconds from error message
  const minutesMatch = message.match(/(\d+)\s*minute/)
  const secondsMatch = message.match(/(\d+)\s*second/)

  let remainingSeconds = 0
  if (minutesMatch) {
  remainingSeconds += parseInt(minutesMatch[1]) * 60
  }
  if (secondsMatch) {
  remainingSeconds += parseInt(secondsMatch[1])
  }

  if (remainingSeconds > 0) {
  setCountdown(remainingSeconds)
  setIsResendCooldown(true)
  }
  }
  } finally {
  setIsLoading(false)
  }
  }

  const handleVerifyOtp = async () => {
  if (!otp || otp.length !== 6 || !formData) {
  toast.error(t(locale, 'auth.errors.validOtp'))
  return
  }

  setIsLoading(true)
  try {
  let response: any
  switch (selectedUserType) {
  case 'student':
  response = await apiClient.verifyOtpAndRegisterStudent(otp, formData as any)
  break
  case 'corporate':
  response = await apiClient.verifyOtpAndRegisterCorporate(otp, formData as any)
  break
  default:
  throw new Error(t(locale, 'auth.errors.invalidUserType'))
  }

  toast.success(t(locale, 'auth.toast.registrationSuccessfulSimple'))

  // Auto-login
  try {
  const loginResponse = await apiClient.login({
  email: formData.email,
  password: formData.password,
  user_type: selectedUserType
  })
  apiClient.setAuthTokens(loginResponse.access_token, loginResponse.refresh_token)
  login({
  id: loginResponse.user_id || 'temp-id',
  email: formData.email,
  user_type: selectedUserType,
  name: loginResponse.name || (formData as any).name || (formData as any).company_name || formData.email
  }, loginResponse.access_token, loginResponse.refresh_token)

  // Check for redirect URL (from query params or localStorage)
  let redirectUrl = searchParams.get('redirect') || (typeof window !== 'undefined' ? localStorage.getItem('redirect_after_login') : null)

  if (redirectUrl) {
  // Decode the redirect URL
  redirectUrl = decodeURIComponent(redirectUrl)
  console.log('Redirecting to:', redirectUrl) // Debug log

  // Clear the stored redirect URL
  if (typeof window !== 'undefined') {
  localStorage.removeItem('redirect_after_login')
  }
  // Use router.push for client-side navigation
  router.push(redirectUrl)
  return
  }

  // Redirect based on user type if no redirect URL
  switch (selectedUserType) {
  case 'student': router.push('/dashboard/student'); break
  case 'corporate': router.push('/dashboard/corporate'); break
  default: router.push('/dashboard')
  }
  } catch (loginError) {
  console.error('Auto-login failed:', loginError)
  toast.success(t(locale, 'auth.toast.registrationSuccessful'))
  // Preserve redirect URL when redirecting to login
  const redirectUrl = searchParams.get('redirect') || localStorage.getItem('redirect_after_login')
  const loginUrl = redirectUrl
  ? `/auth/login?type=${selectedUserType}&registered=true&redirect=${encodeURIComponent(redirectUrl)}`
  : `/auth/login?type=${selectedUserType}&registered=true`
  router.push(loginUrl)
  }
  } catch (error: any) {
  console.error('OTP verification error:', error)
  let message = t(locale, 'auth.errors.invalidOtp')

  if (error.response?.data?.detail) {
  message = error.response.data.detail
  } else if (error.message) {
  message = error.message
  }

  toast.error(message)
  } finally {
  setIsLoading(false)
  }
  }


  const renderStudentForm = () => (
  <div className="space-y-4">
  <div>
  <label htmlFor="name" className={authLabelClass}>
  Full Name *
  </label>
  <Input
  id="name"
  placeholder="Enter your full name"
  leftIcon={<User className="w-4 h-4" />}
  error={!!(errors as any).name}
  {...register('name', {
  onChange: (e) => {
  e.target.value = e.target.value.replace(/[^A-Za-z\s]/g, '')
  }
  })}
  />
  {(errors as any).name && (
  <p className="mt-1 text-sm text-red-600 dark:text-red-400">
  {typeof (errors as any).name.message === 'string' ? (errors as any).name.message : 'Name is required'}
  </p>
  )}
  </div>

  <div>
  <label htmlFor="phone" className={authLabelClass}>
  Phone Number
  </label>
  <Input
  id="phone"
  type="tel"
  placeholder="+91-9876543210"
  leftIcon={<Phone className="w-4 h-4" />}
  {...register('phone', {
  onChange: (e) => {
  e.target.value = e.target.value.replace(/\D/g, '')
  }
  })}
  />
  {(errors as any).phone && (
  <p className="mt-1 text-sm text-red-600 dark:text-red-400">
  {typeof (errors as any).phone.message === 'string' ? (errors as any).phone.message : 'Invalid phone number'}
  </p>
  )}
  </div>

  <div>
  <AsyncSearchableSelect
  label="College / Institution"
  placeholder="Search for your college..."
  fetchOptions={async (query): Promise<AsyncSelectOption[]> => {
  try {
  const response = await apiClient.get('/admin/lookups/colleges', {
  params: {
  search: query,
  limit: 100
  }
  })
  // Ensure we handle the response structure correctly
  const colleges = response.colleges || []
  return colleges.map((c: any) => {
  // Cleanup name: remove quotes but keep full name
  const cleanName = c.name ? c.name.replace(/['"]+/g, '').trim() : "Unknown College"
  return {
  value: c.id,
  label: cleanName
  }
  })
  } catch (error) {
  console.error('Failed to fetch colleges', error)
  return []
  }
  }}
  onChange={(value) => {
  setValue('college_id', value as any)
  }}
  value={watch('college_id' as any)}
  />
  </div>
  </div >
  )

  const renderCorporateForm = () => (
  <div className="space-y-4">
  <div>
  <label htmlFor="company_name" className={authLabelClass}>
  Company Name *
  </label>
  <Input
  id="company_name"
  placeholder="Enter company name"
  leftIcon={<Building2 className="w-4 h-4" />}
  error={!!(errors as any).company_name}
  {...register('company_name', {
  onChange: (e) => {
  e.target.value = e.target.value.replace(/[^A-Za-z\s]/g, '')
  }
  })}
  />
  {(errors as any).company_name && (
  <p className="mt-1 text-sm text-red-600 dark:text-red-400">
  {typeof (errors as any).company_name.message === 'string' ? (errors as any).company_name.message : 'Company name is required'}
  </p>
  )}
  </div>

  <div>
  <label htmlFor="website_url" className={authLabelClass}>
  Website URL
  </label>
  <Input
  id="website_url"
  placeholder="https://company.com"
  leftIcon={<Globe className="w-4 h-4" />}
  {...register('website_url', {
  onChange: (e) => {
  e.target.value = e.target.value.replace(/\s/g, '')
  },
  setValueAs: (value) => (typeof value === 'string' ? value.trim() : value)
  })}
  />
  {(errors as any).website_url && (
  <p className="mt-1 text-sm text-red-600 dark:text-red-400">
  {typeof (errors as any).website_url.message === 'string' ? (errors as any).website_url.message : 'Please enter a valid website URL'}
  </p>
  )}
  </div>
  </div>
  )

  const renderFormFields = () => {
  switch (selectedUserType) {
  case 'student':
  return renderStudentForm()
  case 'corporate':
  return renderCorporateForm()
  default:
  return renderStudentForm()
  }
  }

  return (
  <AuthShell
  wide
  brandHeadline={t(locale, 'auth.register.brandHeadline')}
  brandSub={t(locale, 'auth.register.brandSub')}
  brandBullets={[
  t(locale, 'auth.register.brandBullet1'),
  t(locale, 'auth.register.brandBullet2'),
  t(locale, 'auth.register.brandBullet3'),
  ]}
  >
  <motion.div
  initial={{ opacity: 0, y: 16 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.45 }}
  className="w-full"
  >
  {currentStep === 'form' && (
  <div className="mb-8 space-y-3 text-center sm:text-left">
  <p className="font-display text-xs font-semibold uppercase tracking-[0.18em] text-primary">
  {t(locale, 'auth.register.joinTag')}
  </p>
  <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-none border border-sage-deep/30 bg-sage-deep text-white shadow-none dark:border-emerald-600 dark:bg-emerald-700 sm:mx-0">
  {(() => {
  const IconComponent = userTypeIcons[selectedUserType as keyof typeof userTypeIcons]
  return <IconComponent className="h-7 w-7 text-white" />
  })()}
  </div>
  <h1 className="font-display text-balance text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
  {t(locale, 'auth.createAccount').replace('{{role}}', t(locale, `auth.${selectedUserType}`))}
  </h1>
  <p className="text-pretty text-sm leading-relaxed text-muted-foreground sm:text-base">
  {t(locale, 'auth.startJourney')}
  </p>
  </div>
  )}

  {currentStep === 'form' && (
  <div className="mb-8">
  <label className={cn(authLabelClass, 'mb-3')}>{t(locale, 'auth.iAmA')}</label>
  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
  {userTypeOptions(locale).map((option) => {
  const Icon = userTypeIcons[option.value as keyof typeof userTypeIcons]
  const isSelected = selectedUserType === option.value

  return (
  <button
  key={option.value}
  type="button"
  onClick={() => handleUserTypeChange(option.value)}
  className={authRoleTileClassNames(isSelected)}
  >
  <Icon
  className={cn(
  'h-6 w-6',
  isSelected ? 'text-primary' : 'text-muted-foreground group-hover:text-foreground',
  )}
  />
  <span
  className={cn(
  'text-sm font-semibold',
  isSelected ? 'text-foreground' : 'text-muted-foreground',
  )}
  >
  {option.label}
  </span>
  </button>
  )
  })}
  </div>
  </div>
  )}

  <div className={cn(authFormCardClass, currentStep === 'otp' && 'sm:p-6')}>
  {currentStep === 'form' ? (
  <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
  {/* Hidden user_type field */}
  <input type="hidden" {...register('user_type')} />

  {/* Dynamic Form Fields */}
  <motion.div
  key={selectedUserType}
  initial={{ opacity: 0, x: 20 }}
  animate={{ opacity: 1, x: 0 }}
  transition={{ duration: 0.3 }}
  >
  {renderFormFields()}
  </motion.div>

  {/* Common Fields */}
  <div className="space-y-4">
  <div>
  <label htmlFor="email" className={authLabelClass}>
  {t(locale, 'auth.labels.emailAddressRequired')}
  </label>
  <Input
  id="email"
  type="email"
  placeholder={t(locale, 'auth.placeholders.enterEmailAddress')}
  leftIcon={<Mail className="w-4 h-4" />}
  className={`${errors.email
  ? "border-red-500 focus:ring-red-500"
  : watch("email")
  ? "border-green-500 focus:ring-green-500"
  : "border-gray-300 focus:ring-primary-500"
  }`}
  {...register("email", {
  onChange: (e) => {
  e.target.value = e.target.value.replace(/\s+/g, '').toLowerCase()
  },
  setValueAs: (value) => (typeof value === 'string' ? value.trim().toLowerCase() : value)
  })}
  />

  {(errors as any).email && (
  <p className="mt-1 text-sm text-red-600 dark:text-red-400">
  {typeof (errors as any).email.message === 'string' ? (errors as any).email.message : 'Email is required'}
  </p>
  )}
  </div>

  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
  <div>
  <label htmlFor="password" className={authLabelClass}>
  {t(locale, 'auth.labels.passwordRequired')}
  </label>
  <Input
  id="password"
  type={showPassword ? 'text' : 'password'}
  placeholder={t(locale, 'auth.placeholders.createStrongPassword')}
  leftIcon={<Lock className="w-4 h-4" />}
  rightIcon={
  <button
  type="button"
  onClick={() => setShowPassword(!showPassword)}
  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
  >
  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
  </button>
  }
  error={!!(errors as any).password}

  {...register('password')}
  />
  {(errors as any).password && (
  <p className="mt-1 text-sm text-red-600 dark:text-red-400">
  {typeof (errors as any).password.message === 'string' ? (errors as any).password.message : 'Password is required'}
  </p>
  )}
  </div>

  <div>
  <label htmlFor="confirmPassword" className={authLabelClass}>
  {t(locale, 'auth.labels.confirmPasswordRequired')}
  </label>
  <Input
  id="confirmPassword"
  type={showConfirmPassword ? 'text' : 'password'}
  placeholder={t(locale, 'auth.placeholders.confirmPassword')}
  leftIcon={<Lock className="w-4 h-4" />}
  rightIcon={
  <button
  type="button"
  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
  >
  {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
  </button>
  }
  error={!!(errors as any).confirmPassword}

  {...register('confirmPassword')}
  />
  {(errors as any).confirmPassword && (
  <p className="mt-1 text-sm text-red-600 dark:text-red-400">
  {typeof (errors as any).confirmPassword.message === 'string' ? (errors as any).confirmPassword.message : 'Please confirm your password'}
  </p>
  )}
  </div>
  </div>
  </div>

  <Button
  type="submit"
  variant="default"
  className={authCtaButtonClass}
  loading={isLoading}
  >
  {t(locale, 'auth.register.sendVerificationCode')}
  </Button>
  </form>
  ) : (
  <motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.4 }}
  className="space-y-4 sm:space-y-6"
  >
  {/* Header with Icon */}
  <div className="text-center">
  <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-none border border-sage-deep/30 bg-sage-deep text-white shadow-none dark:border-emerald-600 dark:bg-emerald-700 sm:h-16 sm:w-16">
  <ShieldCheck className="h-7 w-7 text-white sm:h-8 sm:w-8" />
  </div>
  <p className="font-display text-xs font-semibold uppercase tracking-[0.18em] text-primary">
  {t(locale, 'auth.register.verifyEmailTag')}
  </p>
  <h2 className="font-display mt-2 text-xl font-bold tracking-tight text-foreground sm:text-2xl">
  {t(locale, 'auth.verifyEmail')}
  </h2>
  <p className="mt-2 text-sm text-muted-foreground">
  {t(locale, 'auth.register.weSentCode')}
  </p>
  <div className="mt-3 flex w-full justify-center px-1">
  <div className="inline-flex max-w-full items-center gap-2 rounded-xl border border-primary/25 bg-primary/5 px-4 py-2 dark:bg-primary/10">
  <Mail className="h-4 w-4 shrink-0 text-primary" />
  <p className="min-w-0 truncate text-sm font-semibold text-primary">{formData?.email}</p>
  </div>
  </div>
  </div>

  {/* OTP Input Field - Box Style */}
  <div>
  <label htmlFor="otp" className={authLabelClass}>
  {t(locale, 'auth.labels.verificationCode')}
  </label>
  <div className="flex justify-center gap-2 sm:gap-3 mb-2">
  {[0, 1, 2, 3, 4, 5].map((index) => (
  <input
  key={index}
  type="text"
  inputMode="numeric"
  maxLength={1}
  value={otp[index] || ''}
  onChange={(e) => {
  const value = e.target.value.replace(/\D/g, '')
  if (value.length <= 1) {
  const newOtp = otp.split('')
  newOtp[index] = value
  setOtp(newOtp.join('').slice(0, 6))

  // Auto-focus next input
  if (value && index < 5) {
  const nextInput = document.querySelector(`input[data-otp-index="${index + 1}"]`) as HTMLInputElement
  nextInput?.focus()
  }
  }
  }}
  onKeyDown={(e) => {
  if (e.key === 'Backspace' && !otp[index] && index > 0) {
  const prevInput = document.querySelector(`input[data-otp-index="${index - 1}"]`) as HTMLInputElement
  prevInput?.focus()
  }
  }}
  onPaste={(e) => {
  e.preventDefault()
  const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6)
  if (pastedData) {
  setOtp(pastedData)
  const lastIndex = Math.min(index + pastedData.length - 1, 5)
  const lastInput = document.querySelector(`input[data-otp-index="${lastIndex}"]`) as HTMLInputElement
  lastInput?.focus()
  }
  }}
  data-otp-index={index}
  className={authOtpDigitClassNames()}
  autoFocus={index === 0}
  />
  ))}
  </div>
  <p className="mt-2 px-2 text-center text-xs text-muted-foreground">
  {t(locale, 'auth.register.pasteCodeHint')}
  </p>
  </div>

  <div className="rounded-xl border border-border/80 bg-muted/40 p-4 text-sm text-muted-foreground">
  <p>
  {t(locale, 'auth.register.sendingTo')} <span className="font-semibold text-foreground">{formData?.email}</span>
  </p>
  <p className="mt-1 text-xs">{t(locale, 'auth.register.checkSpamHint')}</p>
  </div>

  <Button
  type="button"
  variant="default"
  className={authCtaButtonClass}
  onClick={handleVerifyOtp}
  loading={isLoading}
  disabled={otp.length !== 6 || isLoading}
  >
  {t(locale, 'auth.register.verifyAndRegister')}
  </Button>

  {/* Resend OTP Section */}
  <div className="pt-3 sm:pt-4 border-t border-border">
  <div className="flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2">
  <p className="text-xs sm:text-sm text-muted-foreground">
  {t(locale, 'auth.register.didNotReceiveCode')}
  </p>
  <button
  type="button"
  onClick={handleResendOtp}
  disabled={countdown > 0 || isLoading}
  className={cn(
  'inline-flex touch-manipulation items-center gap-1 text-xs font-semibold transition-colors sm:text-sm',
  countdown > 0 || isLoading
  ? 'cursor-not-allowed text-muted-foreground/60'
  : 'text-primary hover:text-primary/85',
  )}
  >
  <RotateCcw className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${countdown > 0 ? 'animate-spin' : ''}`} />
  {countdown > 0
  ? countdown >= 60
  ? `${t(locale, 'auth.register.resendIn')} ${Math.floor(countdown / 60)}m ${countdown % 60}s`
  : `${t(locale, 'auth.register.resendIn')} ${countdown}s`
  : t(locale, 'auth.register.resendOtp')}
  </button>
  </div>
  </div>
  </motion.div>
  )}

  <div className="mt-8 border-t border-border/80 pt-6 text-center">
  <p className="text-sm text-muted-foreground">
  {t(locale, 'auth.register.alreadyHaveAccount')}{' '}
  <Link
  href={`/auth/login?type=${selectedUserType}`}
  className="font-semibold text-primary hover:text-primary/90"
  >
  {t(locale, 'auth.login.signInCta')}
  </Link>
  </p>
  </div>
  </div>

  {currentStep === 'form' && (
  <p className="mt-8 text-center text-xs text-muted-foreground">
  {t(locale, 'auth.register.fairUseNotice')}
  </p>
  )}
  </motion.div>
  </AuthShell>
  )
}
