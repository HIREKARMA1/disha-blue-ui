"use client"

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { motion } from 'framer-motion'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'react-hot-toast'
import { Eye, EyeOff, Mail, Lock, User, Building2, Shield, ArrowLeft } from 'lucide-react'
import Link from 'next/link'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'
import { Modal, TermsModalContent } from '@/components/ui/modal'
import { apiClient } from '@/lib/api'
import { UserType } from '@/types/auth'
import { useAuth } from '@/hooks/useAuth'
import { getClientLocale, t, type SupportedLocale } from '@/lib/i18n'
import { AuthShell } from '@/components/auth/AuthShell'
import {
    authCtaButtonClass,
    authFormCardClass,
    authLabelClass,
    authRoleTileClassNames,
} from '@/components/auth/auth-styles'
import { cn } from '@/lib/utils'

const getLoginSchema = (locale: SupportedLocale) =>
    z.object({
        email: z.string().email(t(locale, 'auth.errors.validEmail')),
        password: z.string().min(1, t(locale, 'auth.errors.passwordRequired')),
        user_type: z.enum(['student', 'corporate', 'admin'] as const)
    })

type LoginFormData = z.infer<ReturnType<typeof getLoginSchema>>

const userTypeOptions = (locale: SupportedLocale) => [
    { value: 'student', label: t(locale, 'auth.student') },
    { value: 'corporate', label: t(locale, 'auth.corporate') },
    // { value: 'admin', label: 'Admin' }
]

const userTypeIcons = {
    student: User,
    corporate: Building2,
    admin: Shield
}

export default function LoginPage() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const { redirectIfAuthenticated, login } = useAuth()
    const [showPassword, setShowPassword] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const [selectedUserType, setSelectedUserType] = useState<UserType>('student')
    const [termsAndPrivacyAccepted, setTermsAndPrivacyAccepted] = useState(false)
    const [showTermsModal, setShowTermsModal] = useState(false)
    const [registerLink, setRegisterLink] = useState(`/auth/register?type=student`)
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

    const {
        register,
        handleSubmit,
        setValue,
        reset,
        formState: { errors }
    } = useForm<LoginFormData>({
        resolver: zodResolver(getLoginSchema(locale)),
        defaultValues: {
            user_type: 'student'
        }
    })

    useEffect(() => {
        reset(undefined, { keepValues: true })
    }, [locale, reset])

    useEffect(() => {
        const type = searchParams.get('type') as UserType
        const registered = searchParams.get('registered')

        if (type && ['student', 'corporate', 'admin'].includes(type)) {
            console.log('Setting user type from URL:', type) // Debug log
            setSelectedUserType(type)
            setValue('user_type', type)
        }

        // Show success message if user just registered
        if (registered === 'true') {
            toast.success(t(locale, 'auth.toast.registrationSuccessful'))
        }
    }, [searchParams, setValue])

    // Additional effect to ensure form value stays in sync
    useEffect(() => {
        setValue('user_type', selectedUserType)
    }, [selectedUserType, setValue])

    // Compute register link with redirect URL (client-side only)
    useEffect(() => {
        if (typeof window !== 'undefined') {
            const redirectUrl = searchParams.get('redirect') || localStorage.getItem('redirect_after_login')
            const link = redirectUrl
                ? `/auth/register?type=${selectedUserType}&redirect=${encodeURIComponent(redirectUrl)}`
                : `/auth/register?type=${selectedUserType}`
            setRegisterLink(link)
        }
    }, [searchParams, selectedUserType])

    const onSubmit = async (data: LoginFormData) => {
        // Check if terms and conditions are accepted
        if (!termsAndPrivacyAccepted) {
            toast.error(t(locale, 'auth.toast.acceptTermsRequired'))
            return
        }

        setIsLoading(true)
        try {
            const response = await apiClient.login(data)

            // Store tokens and user data
            apiClient.setAuthTokens(response.access_token, response.refresh_token)

            // Use the auth hook to manage login state
            login({
                id: response.user_id || 'temp-id',
                email: data.email,
                user_type: data.user_type,
                name: data.email
            }, response.access_token, response.refresh_token)

            toast.success(t(locale, 'auth.toast.loginSuccessful'))

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
            switch (data.user_type) {
                case 'student':
                    router.push('/dashboard/student')
                    break
                case 'corporate':
                    router.push('/dashboard/corporate')
                    break
                case 'admin':
                    router.push('/dashboard/admin')
                    break
                default:
                    router.push('/dashboard')
            }
        } catch (error: any) {
            let message = t(locale, 'auth.errors.loginFailed')

            if (error.response) {
                const status = error.response.status
                const detail = error.response.data?.detail

                if (status === 401) {
                    message = t(locale, 'auth.errors.invalidPassword')
                } else if (status === 404) {
                    message = t(locale, 'auth.errors.emailNotRegistered')
                } else if (status === 400) {
                    message = detail || t(locale, 'auth.errors.invalidLoginRequest')
                } else {
                    message = detail || message
                }
            }

            toast.error(message)
        }
        finally {
            setIsLoading(false)
        }
    }

    const handleUserTypeChange = (value: string) => {
        const userType = value as UserType
        console.log('Changing user type to:', userType) // Debug log
        setSelectedUserType(userType)
        setValue('user_type', userType)

        // Preserve redirect parameter when updating URL
        const redirectUrl = searchParams.get('redirect')
        const newUrl = redirectUrl
            ? `/auth/login?type=${userType}&redirect=${redirectUrl}`
            : `/auth/login?type=${userType}`
        router.replace(newUrl)

        // Force form to recognize the change
        setTimeout(() => {
            setValue('user_type', userType)
        }, 0)
    }

    const handleTermsAndPrivacyAccept = () => {
        setTermsAndPrivacyAccepted(true)
        setShowTermsModal(false)
    }

    return (
        <>
            <AuthShell
                brandHeadline={t(locale, 'auth.login.brandHeadline')}
                brandSub={t(locale, 'auth.login.brandSub')}
                brandBullets={[
                    t(locale, 'auth.login.brandBullet1'),
                    t(locale, 'auth.login.brandBullet2'),
                    t(locale, 'auth.login.brandBullet3'),
                ]}
            >
                <motion.div
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.45 }}
                    className="w-full"
                >
                    <div className="mb-8 space-y-2">
                        <p className="font-display text-xs font-semibold uppercase tracking-[0.18em] text-primary">
                            {t(locale, 'auth.login.signInTag')}
                        </p>
                        <h1 className="font-display text-balance text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                            {t(locale, 'auth.welcomeBack')}
                        </h1>
                        <p className="text-pretty text-sm leading-relaxed text-muted-foreground sm:text-base">
                            {t(locale, 'auth.continueJourney')}
                        </p>
                    </div>

                    <div className="mb-8">
                        <label className={cn(authLabelClass, 'mb-3')}>{t(locale, 'auth.iAmA')}</label>
                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                            {userTypeOptions(locale).map((option) => {
                                const Icon = userTypeIcons[option.value as UserType]
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
                                                'h-5 w-5 transition-colors',
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

                    <div className={authFormCardClass}>
                        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                            <input type="hidden" {...register('user_type')} />

                            <div>
                                <label htmlFor="email" className={authLabelClass}>
                                    {t(locale, 'auth.labels.email')}
                                </label>
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder={t(locale, 'auth.placeholders.email')}
                                    leftIcon={<Mail className="w-4 h-4 text-muted-foreground" />}
                                    error={!!errors.email}
                                    {...register('email')}
                                />
                                {errors.email && (
                                    <p className="mt-1 text-sm text-destructive">{errors.email.message}</p>
                                )}
                            </div>

                            <div>
                                <label htmlFor="password" className={authLabelClass}>
                                    {t(locale, 'auth.labels.password')}
                                </label>
                                <Input
                                    id="password"
                                    type={showPassword ? 'text' : 'password'}
                                    placeholder="••••••••"
                                    leftIcon={<Lock className="w-4 h-4 text-muted-foreground" />}
                                    rightIcon={
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="text-muted-foreground transition-colors hover:text-foreground"
                                        >
                                            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                        </button>
                                    }
                                    error={!!errors.password}
                                    {...register('password')}
                                />
                                {errors.password && (
                                    <p className="mt-1 text-sm text-destructive">{errors.password.message}</p>
                                )}
                            </div>

                            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                                <div className="cursor-pointer flex-1" onClick={() => setShowTermsModal(true)}>
                                    <Checkbox
                                        id="terms-privacy"
                                        checked={termsAndPrivacyAccepted}
                                        onChange={() => setShowTermsModal(true)}
                                        label={
                                            <span className="text-sm text-foreground/90">
                                                <span className="font-medium text-primary">{t(locale, 'auth.labels.termsAndConditions')}</span>
                                                {!termsAndPrivacyAccepted && (
                                                    <span className="ml-1 text-destructive">*</span>
                                                )}
                                            </span>
                                        }
                                    />
                                </div>

                                {selectedUserType !== 'admin' && (
                                    <Link
                                        href={`/auth/forgot-password?type=${selectedUserType}`}
                                        className="shrink-0 text-sm font-semibold text-primary transition-colors hover:text-primary/80"
                                    >
                                        {t(locale, 'auth.login.forgotPassword')}
                                    </Link>
                                )}
                            </div>

                            <Button
                                type="submit"
                                variant="gradient"
                                className={authCtaButtonClass}
                                loading={isLoading}
                            >
                                {t(locale, 'auth.login.signInCta')}
                            </Button>
                        </form>

                        {selectedUserType !== 'admin' && (
                            <div className="mt-8 border-t border-border/80 pt-6 text-center">
                                <p className="text-sm text-muted-foreground">
                                    {t(locale, 'auth.login.newToPlatform')}{' '}
                                    <Link href={registerLink} className="font-semibold text-primary hover:text-primary/90">
                                        {t(locale, 'auth.login.createAccount')}
                                    </Link>
                                </p>
                            </div>
                        )}

                        {selectedUserType === 'admin' && (
                            <div className="mt-8 rounded-xl border border-border/60 bg-muted/30 px-4 py-3 text-center">
                                <p className="text-sm text-muted-foreground">
                                    <Shield className="mx-auto mb-2 h-5 w-5 text-primary" aria-hidden />
                                    {t(locale, 'auth.login.adminAccessNotice')}
                                </p>
                            </div>
                        )}

                        <p className="mt-6 flex items-center justify-center gap-1.5 text-center text-xs text-muted-foreground">
                            <Shield className="h-3.5 w-3.5 shrink-0 text-primary/80" aria-hidden />
                            {t(locale, 'auth.login.encryptedNotice')}
                        </p>
                    </div>
                </motion.div>
            </AuthShell>

            <Modal
                isOpen={showTermsModal}
                onClose={() => setShowTermsModal(false)}
                title={t(locale, 'auth.modal.termsTitle')}
                maxWidth="2xl"
            >
                <TermsModalContent />

                <div className="mt-6 flex justify-end">
                    <Button onClick={handleTermsAndPrivacyAccept} variant="gradient">
                        {t(locale, 'auth.modal.acceptTerms')}
                    </Button>
                </div>
            </Modal>
        </>
    )
}
