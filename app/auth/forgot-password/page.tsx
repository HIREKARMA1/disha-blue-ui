"use client"

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'react-hot-toast'
import { Mail, Lock, ArrowLeft, Eye, EyeOff, Shield, ShieldCheck, RotateCcw, User, Building2 } from 'lucide-react'
import Link from 'next/link'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { apiClient } from '@/lib/api'
import { UserType } from '@/types/auth'
import { AuthShell } from '@/components/auth/AuthShell'
import {
    authCtaButtonClass,
    authFormCardClass,
    authLabelClass,
    authOtpDigitClassNames,
    authRoleTileClassNames,
} from '@/components/auth/auth-styles'
import { cn } from '@/lib/utils'
import { getClientLocale, t, type SupportedLocale } from '@/lib/i18n'

const forgotUserTypeOptions = (locale: SupportedLocale): { value: UserType; label: string }[] => [
    { value: 'student', label: t(locale, 'auth.student') },
    { value: 'corporate', label: t(locale, 'auth.corporate') },
    { value: 'admin', label: t(locale, 'auth.admin') },
]

const forgotUserTypeIcons = {
    student: User,
    corporate: Building2,
    admin: Shield,
} as const

// Step 1: Email input schema
const emailSchema = z.object({
    email: z.string().email('Please enter a valid email address')
})

// Step 2: OTP verification schema
const otpSchema = z.object({
    otp: z.string().length(6, 'OTP must be 6 digits').regex(/^\d+$/, 'OTP must contain only numbers')
})

// Step 3: New password schema
const passwordSchema = z.object({
    password: z.string()
        .min(8, 'Password must be at least 8 characters')
        .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
        .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
        .regex(/[0-9]/, 'Password must contain at least one number')
        .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character'),
    confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"]
})

type EmailFormData = z.infer<typeof emailSchema>
type OtpFormData = z.infer<typeof otpSchema>
type PasswordFormData = z.infer<typeof passwordSchema>

type Step = 'email' | 'otp' | 'password' | 'success'

export default function ForgotPasswordPage() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const [currentStep, setCurrentStep] = useState<Step>('email')
    const [isLoading, setIsLoading] = useState(false)
    const [userType, setUserType] = useState<UserType>('student')
    const [email, setEmail] = useState('')
    const [otp, setOtp] = useState('')
    const [showPassword, setShowPassword] = useState(false)
    const [showConfirmPassword, setShowConfirmPassword] = useState(false)
    const [countdown, setCountdown] = useState(0)
    const [isResendCooldown, setIsResendCooldown] = useState(false) // Track if we're in resend cooldown period
    const [resendCount, setResendCount] = useState(0) // Track number of resends
    const [locale, setLocale] = useState<SupportedLocale>('en')

    useEffect(() => {
        setLocale(getClientLocale())
    }, [])

    // Initialize user type from URL
    useEffect(() => {
        const type = searchParams.get('type') as UserType
        if (type && ['student', 'corporate', 'admin'].includes(type)) {
            setUserType(type)
        }
    }, [searchParams])

    const handleUserTypeChange = (type: UserType) => {
        setUserType(type)
        router.replace(`/auth/forgot-password?type=${type}`)
    }

    // Countdown timer for resend OTP
    useEffect(() => {
        if (countdown > 0) {
            const timer = setTimeout(() => setCountdown(countdown - 1), 1000)
            return () => clearTimeout(timer)
        } else if (countdown === 0 && isResendCooldown) {
            // Reset cooldown flag when countdown reaches 0
            setIsResendCooldown(false)
        }
    }, [countdown, isResendCooldown])

    // Auto-redirect to login immediately when password reset is successful
    useEffect(() => {
        if (currentStep === 'success') {
            // Redirect immediately without delay
            router.push(`/auth/login?type=${userType}`)
        }
    }, [currentStep, router, userType])

    // Form handlers
    const emailForm = useForm<EmailFormData>({
        resolver: zodResolver(emailSchema)
    })

    const otpForm = useForm<OtpFormData>({
        resolver: zodResolver(otpSchema)
    })

    const passwordForm = useForm<PasswordFormData>({
        resolver: zodResolver(passwordSchema)
    })

    // Step 1: Submit email
    const onSubmitEmail = async (data: EmailFormData) => {
        setIsLoading(true)
        try {
            await apiClient.client.post('/auth/password-reset/request', {
                email: data.email,
                user_type: userType
            })
            
            setEmail(data.email)
            setCurrentStep('otp')
            setCountdown(0) // No cooldown for first OTP request
            setIsResendCooldown(false)
            setResendCount(0) // Reset resend count for new email
            toast.success(t(locale, 'auth.toast.otpSent'))
        } catch (error: any) {
            const message = error.response?.data?.detail || t(locale, 'auth.errors.sendOtpFailed')
            toast.error(message)
        } finally {
            setIsLoading(false)
        }
    }

    // Resend OTP
    const handleResendOtp = async () => {
        if (countdown > 0) return
        
        setIsLoading(true)
        try {
            await apiClient.client.post('/auth/password-reset/request', {
                email: email,
                user_type: userType
            })
            
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

    // Step 2: Verify OTP
    const onSubmitOtp = async (data: OtpFormData) => {
        setIsLoading(true)
        try {
            await apiClient.client.post('/auth/password-reset/verify-otp', {
                email: email,
                user_type: userType,
                code: data.otp
            })
            
            setOtp(data.otp)
            setCurrentStep('password')
            toast.success(t(locale, 'auth.toast.otpVerified'))
        } catch (error: any) {
            const message = error.response?.data?.detail || t(locale, 'auth.errors.invalidOtp')
            toast.error(message)
        } finally {
            setIsLoading(false)
        }
    }

    // Step 3: Reset password
    const onSubmitPassword = async (data: PasswordFormData) => {
        setIsLoading(true)
        try {
            await apiClient.client.post('/auth/password-reset/reset', {
                email: email,
                user_type: userType,
                code: otp,
                new_password: data.password
            })
            
            setCurrentStep('success')
            toast.success(t(locale, 'auth.toast.passwordResetSuccess'))
        } catch (error: any) {
            const message = error.response?.data?.detail || t(locale, 'auth.errors.resetPasswordFailed')
            toast.error(message)
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <AuthShell
            brandHeadline={t(locale, 'auth.forgot.brandHeadline')}
            brandSub={t(locale, 'auth.forgot.brandSub')}
            brandBullets={[
                t(locale, 'auth.forgot.brandBullet1'),
                t(locale, 'auth.forgot.brandBullet2'),
                t(locale, 'auth.forgot.brandBullet3'),
            ]}
        >
            <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.45 }}
                className="w-full"
            >
                {currentStep !== 'otp' && currentStep !== 'success' && (
                    <div className="mb-8 space-y-3">
                        <p className="font-display text-xs font-semibold uppercase tracking-[0.18em] text-primary">
                            {t(locale, 'auth.forgot.accountRecovery')}
                        </p>
                        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-primary-500 to-secondary-500 shadow-lg shadow-primary/20">
                            <Lock className="h-6 w-6 text-white" />
                        </div>
                        <h1 className="font-display text-balance text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                            {t(locale, 'auth.forgot.resetPasswordTitle')}
                        </h1>
                        <p className="text-pretty text-sm leading-relaxed text-muted-foreground sm:text-base">
                            {currentStep === 'email' &&
                                t(locale, 'auth.forgot.emailStepSubtitle')}
                            {currentStep === 'password' && t(locale, 'auth.forgot.passwordStepSubtitle')}
                        </p>
                    </div>
                )}

                {currentStep !== 'success' && currentStep !== 'otp' && (
                    <div className="mb-8 flex items-center justify-center gap-2">
                        <div
                            className={cn(
                                'h-1.5 w-10 rounded-full sm:w-14',
                                currentStep === 'email' ? 'bg-primary' : 'bg-primary/35',
                            )}
                        />
                        <div
                            className={cn(
                                'h-1.5 w-10 rounded-full sm:w-14',
                                currentStep === 'password' ? 'bg-primary' : 'bg-muted-foreground/25',
                            )}
                        />
                    </div>
                )}

                <div className={cn(authFormCardClass, currentStep === 'otp' && 'sm:p-6')}>
                    <AnimatePresence mode="wait">
                        {currentStep === 'email' && (
                            <motion.div
                                key="email"
                                initial={{ opacity: 0, x: 16 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -16 }}
                                transition={{ duration: 0.3 }}
                            >
                                <form onSubmit={emailForm.handleSubmit(onSubmitEmail)} className="space-y-5">
                                    <div>
                                        <label className={cn(authLabelClass, 'mb-3')}>{t(locale, 'auth.forgot.signingInAs')}</label>
                                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                                            {forgotUserTypeOptions(locale).map((option) => {
                                                const Icon = forgotUserTypeIcons[option.value]
                                                const isSelected = userType === option.value
                                                return (
                                                    <button
                                                        key={option.value}
                                                        type="button"
                                                        onClick={() => handleUserTypeChange(option.value)}
                                                        className={authRoleTileClassNames(isSelected)}
                                                    >
                                                        <Icon
                                                            className={cn(
                                                                'h-5 w-5',
                                                                isSelected
                                                                    ? 'text-primary'
                                                                    : 'text-muted-foreground group-hover:text-foreground',
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

                                    <div>
                                        <label htmlFor="email" className={authLabelClass}>
                                            {t(locale, 'auth.labels.email')}
                                        </label>
                                        <Input
                                            id="email"
                                            type="email"
                                            placeholder={t(locale, 'auth.placeholders.email')}
                                            leftIcon={<Mail className="h-4 w-4 text-muted-foreground" />}
                                            error={!!emailForm.formState.errors.email}
                                            {...emailForm.register('email')}
                                        />
                                        {emailForm.formState.errors.email && (
                                            <p className="mt-1 text-sm text-destructive">
                                                {emailForm.formState.errors.email.message}
                                            </p>
                                        )}
                                    </div>

                                    <Button
                                        type="submit"
                                        variant="gradient"
                                        className={authCtaButtonClass}
                                        loading={isLoading}
                                    >
                                        {t(locale, 'auth.forgot.sendVerificationCode')}
                                    </Button>

                                    <div className="text-center">
                                        <Link
                                            href={`/auth/login?type=${userType}`}
                                            className="inline-flex items-center justify-center gap-1.5 text-sm font-semibold text-primary hover:text-primary/85"
                                        >
                                            <ArrowLeft className="h-4 w-4" />
                                            {t(locale, 'auth.forgot.backToSignIn')}
                                        </Link>
                                    </div>
                                </form>
                            </motion.div>
                        )}

                        {currentStep === 'otp' && (
                            <motion.div
                                key="otp"
                                initial={{ opacity: 0, y: 16 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -16 }}
                                transition={{ duration: 0.35 }}
                                className="space-y-5 sm:space-y-6"
                            >
                                <div className="text-center">
                                    <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-primary-500 to-secondary-500 shadow-lg shadow-primary/20 sm:h-16 sm:w-16 sm:rounded-3xl">
                                        <ShieldCheck className="h-7 w-7 text-white sm:h-8 sm:w-8" />
                                    </div>
                                    <p className="font-display text-xs font-semibold uppercase tracking-[0.18em] text-primary">
                                        Verify code
                                    </p>
                                    <h2 className="font-display mt-2 text-xl font-bold tracking-tight text-foreground sm:text-2xl">
                                        Check your inbox
                                    </h2>
                                    <p className="mt-2 text-sm text-muted-foreground">
                                        We sent a 6-digit code to
                                    </p>
                                    <div className="mt-3 flex w-full justify-center px-1">
                                        <div className="inline-flex max-w-full items-center gap-2 rounded-xl border border-primary/25 bg-primary/5 px-4 py-2 dark:bg-primary/10">
                                            <Mail className="h-4 w-4 shrink-0 text-primary" />
                                            <p className="min-w-0 truncate text-sm font-semibold text-primary">{email}</p>
                                        </div>
                                    </div>
                                </div>

                                <form onSubmit={otpForm.handleSubmit(onSubmitOtp)} className="space-y-5 sm:space-y-6">
                                    <div>
                                        <label htmlFor="otp" className={authLabelClass}>
                                            Verification code
                                        </label>
                                        <div className="mb-2 flex justify-center gap-2 sm:gap-3">
                                            {[0, 1, 2, 3, 4, 5].map((index) => (
                                                <input
                                                    key={index}
                                                    type="text"
                                                    inputMode="numeric"
                                                    maxLength={1}
                                                    value={otpForm.watch('otp')?.[index] || ''}
                                                    onChange={(e) => {
                                                        const value = e.target.value.replace(/\D/g, '')
                                                        if (value.length <= 1) {
                                                            const currentOtp = otpForm.watch('otp') || ''
                                                            const newOtp = currentOtp.split('')
                                                            newOtp[index] = value
                                                            const updatedOtp = newOtp.join('').slice(0, 6)
                                                            otpForm.setValue('otp', updatedOtp, { shouldValidate: true })

                                                            if (value && index < 5) {
                                                                const nextInput = document.querySelector(
                                                                    `input[data-otp-index="${index + 1}"]`,
                                                                ) as HTMLInputElement
                                                                nextInput?.focus()
                                                            }
                                                        }
                                                    }}
                                                    onKeyDown={(e) => {
                                                        if (
                                                            e.key === 'Backspace' &&
                                                            !otpForm.watch('otp')?.[index] &&
                                                            index > 0
                                                        ) {
                                                            const prevInput = document.querySelector(
                                                                `input[data-otp-index="${index - 1}"]`,
                                                            ) as HTMLInputElement
                                                            prevInput?.focus()
                                                        }
                                                    }}
                                                    onPaste={(e) => {
                                                        e.preventDefault()
                                                        const pastedData = e.clipboardData
                                                            .getData('text')
                                                            .replace(/\D/g, '')
                                                            .slice(0, 6)
                                                        if (pastedData) {
                                                            otpForm.setValue('otp', pastedData, { shouldValidate: true })
                                                            const lastIndex = Math.min(index + pastedData.length - 1, 5)
                                                            const lastInput = document.querySelector(
                                                                `input[data-otp-index="${lastIndex}"]`,
                                                            ) as HTMLInputElement
                                                            lastInput?.focus()
                                                        }
                                                    }}
                                                    data-otp-index={index}
                                                    className={authOtpDigitClassNames(!!otpForm.formState.errors.otp)}
                                                    autoFocus={index === 0}
                                                />
                                            ))}
                                        </div>
                                        {otpForm.formState.errors.otp && (
                                            <p className="mt-1 text-center text-xs text-destructive sm:text-sm">
                                                {otpForm.formState.errors.otp.message}
                                            </p>
                                        )}
                                        <p className="mt-2 px-2 text-center text-xs text-muted-foreground">
                                            Paste the code from your email. Codes expire shortly.
                                        </p>
                                    </div>

                                    <div className="rounded-xl border border-border/80 bg-muted/40 p-4 text-sm text-muted-foreground">
                                        <p>
                                            Sending to <span className="font-semibold text-foreground">{email}</span>
                                        </p>
                                        <p className="mt-1 text-xs">If you do not see it, check spam or promotions.</p>
                                    </div>

                                    <Button
                                        type="submit"
                                        variant="gradient"
                                        className={authCtaButtonClass}
                                        loading={isLoading}
                                        disabled={
                                            !otpForm.watch('otp') ||
                                            otpForm.watch('otp')?.length !== 6 ||
                                            isLoading
                                        }
                                    >
                                        Verify code
                                    </Button>

                                    <div className="border-t border-border pt-4">
                                        <div className="flex flex-col items-center justify-center gap-1 sm:flex-row sm:gap-2">
                                            <p className="text-xs text-muted-foreground sm:text-sm">
                                                Didn&apos;t receive the code?
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
                                                <RotateCcw
                                                    className={cn(
                                                        'h-3.5 w-3.5 sm:h-4 sm:w-4',
                                                        countdown > 0 ? 'animate-spin' : '',
                                                    )}
                                                />
                                                {countdown > 0
                                                    ? countdown >= 60
                                                        ? `Resend in ${Math.floor(countdown / 60)}m ${countdown % 60}s`
                                                        : `Resend in ${countdown}s`
                                                    : 'Resend code'}
                                            </button>
                                        </div>
                                    </div>
                                </form>
                            </motion.div>
                        )}

                        {currentStep === 'password' && (
                            <motion.div
                                key="password"
                                initial={{ opacity: 0, x: 16 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -16 }}
                                transition={{ duration: 0.3 }}
                            >
                                <form onSubmit={passwordForm.handleSubmit(onSubmitPassword)} className="space-y-5">
                                    <div>
                                        <label htmlFor="password" className={authLabelClass}>
                                            New password
                                        </label>
                                        <Input
                                            id="password"
                                            type={showPassword ? 'text' : 'password'}
                                            placeholder="Create a strong password"
                                            leftIcon={<Lock className="h-4 w-4 text-muted-foreground" />}
                                            rightIcon={
                                                <button
                                                    type="button"
                                                    onClick={() => setShowPassword(!showPassword)}
                                                    className="text-muted-foreground transition-colors hover:text-foreground"
                                                >
                                                    {showPassword ? (
                                                        <EyeOff className="h-4 w-4" />
                                                    ) : (
                                                        <Eye className="h-4 w-4" />
                                                    )}
                                                </button>
                                            }
                                            error={!!passwordForm.formState.errors.password}
                                            {...passwordForm.register('password')}
                                        />
                                        {passwordForm.formState.errors.password && (
                                            <p className="mt-1 text-sm text-destructive">
                                                {passwordForm.formState.errors.password.message}
                                            </p>
                                        )}
                                    </div>

                                    <div>
                                        <label htmlFor="confirmPassword" className={authLabelClass}>
                                            Confirm new password
                                        </label>
                                        <Input
                                            id="confirmPassword"
                                            type={showConfirmPassword ? 'text' : 'password'}
                                            placeholder="Repeat your password"
                                            leftIcon={<Lock className="h-4 w-4 text-muted-foreground" />}
                                            rightIcon={
                                                <button
                                                    type="button"
                                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                                    className="text-muted-foreground transition-colors hover:text-foreground"
                                                >
                                                    {showConfirmPassword ? (
                                                        <EyeOff className="h-4 w-4" />
                                                    ) : (
                                                        <Eye className="h-4 w-4" />
                                                    )}
                                                </button>
                                            }
                                            error={!!passwordForm.formState.errors.confirmPassword}
                                            {...passwordForm.register('confirmPassword')}
                                        />
                                        {passwordForm.formState.errors.confirmPassword && (
                                            <p className="mt-1 text-sm text-destructive">
                                                {passwordForm.formState.errors.confirmPassword.message}
                                            </p>
                                        )}
                                    </div>

                                    <div className="rounded-xl border border-border/80 bg-muted/35 p-4">
                                        <p className="mb-2 text-xs font-semibold text-foreground">Password requirements</p>
                                        <ul className="space-y-1 text-xs text-muted-foreground">
                                            <li>At least 8 characters</li>
                                            <li>Upper and lowercase letters</li>
                                            <li>At least one number</li>
                                            <li>At least one special character</li>
                                        </ul>
                                    </div>

                                    <Button
                                        type="submit"
                                        variant="gradient"
                                        className={authCtaButtonClass}
                                        loading={isLoading}
                                    >
                                        Update password
                                    </Button>
                                </form>
                            </motion.div>
                        )}

                        {currentStep === 'success' && <div className="hidden" />}
                    </AnimatePresence>
                </div>

                {currentStep !== 'success' && currentStep !== 'otp' && (
                    <p className="mt-6 flex items-center justify-center gap-1.5 text-center text-xs text-muted-foreground">
                        <Shield className="h-3.5 w-3.5 shrink-0 text-primary/80" />
                        Encrypted in transit · Privacy-first recovery
                    </p>
                )}
            </motion.div>
        </AuthShell>
    )
}

