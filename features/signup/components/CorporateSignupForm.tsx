"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Building2, Globe, Mail } from "lucide-react"
import { toast } from "react-hot-toast"
import { Button } from "@/components/ui/button"
import { apiClient } from "@/lib/api"
import { resetOnboarding } from "@/lib/onboarding"
import { useAuth } from "@/hooks/useAuth"
import { useTranslation } from "@/hooks/useTranslation"
import type { CorporateRegisterRequest } from "@/types/auth"
import { SignupOtpModal } from "./SignupOtpModal"
import { SignupLabeledField } from "./fields/SignupLabeledField"
import { DualPasswordFields } from "./fields/DualPasswordFields"
import { signupCardClass, signupPrimaryButtonClass } from "./signupStyles"
import {
  sanitizeEmailInput,
  sanitizeOrganizationName,
  validateEmail,
  validateOrganizationName,
} from "../utils/validation"
import { loginAfterSignup, SIGNUP_DASHBOARD_PATH } from "../utils/postSignupAuth"

function normalizeWebsite(raw: string): string | undefined {
  const t = raw.trim()
  if (!t) return undefined
  if (/^https?:\/\//i.test(t)) return t
  return `https://${t}`
}

function isReasonableUrl(raw: string): boolean {
  const t = raw.trim()
  if (!t) return true
  try {
    new URL(normalizeWebsite(t)!)
    return true
  } catch {
    return false
  }
}

type Props = {
  loginHref: string
}

export function CorporateSignupForm({ loginHref }: Props) {
  const router = useRouter()
  const { login } = useAuth()
  const { t } = useTranslation()
  const [companyName, setCompanyName] = useState("")
  const [website, setWebsite] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirm, setConfirm] = useState("")

  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})
  const [otpOpen, setOtpOpen] = useState(false)
  const [sending, setSending] = useState(false)
  const [verifying, setVerifying] = useState(false)
  const [resending, setResending] = useState(false)
  const [otpError, setOtpError] = useState("")

  useEffect(() => {
    setCompanyName((n) => sanitizeOrganizationName(n))
    setEmail((e) => sanitizeEmailInput(e))
  }, [])

  const validate = () => {
    const e: Record<string, string> = {}
    const companyErr = validateOrganizationName(companyName)
    if (companyErr) e.company = companyErr
    if (website.trim() && !isReasonableUrl(website)) e.website = "Enter a valid URL (e.g. https://company.com)"
    const emailErr = validateEmail(email)
    if (emailErr) e.email = emailErr
    if (password.length < 8) e.password = "Use at least 8 characters"
    if (password !== confirm) e.confirm = "Passwords do not match"
    setFieldErrors(e)
    return Object.keys(e).length === 0
  }

  const clearError = (key: string) => {
    setFieldErrors((prev) => {
      if (!prev[key]) return prev
      const next = { ...prev }
      delete next[key]
      return next
    })
  }

  const buildPayload = (): CorporateRegisterRequest => ({
    company_name: sanitizeOrganizationName(companyName).trim(),
    email: sanitizeEmailInput(email),
    password,
    website_url: website.trim() ? normalizeWebsite(website) : undefined,
  })

  const sendOtp = async () => {
    setOtpError("")
    if (!validate()) return
    setSending(true)
    try {
      await apiClient.sendEmailOtp(email.trim().toLowerCase())
      setOtpOpen(true)
      toast.success("OTP sent to your email")
    } catch (err: unknown) {
      const detail = (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail
      toast.error(String(detail || "Could not send OTP"))
    } finally {
      setSending(false)
    }
  }

  const resendOtp = async () => {
    setResending(true)
    setOtpError("")
    try {
      await apiClient.sendEmailOtp(email.trim().toLowerCase())
      toast.success("OTP resent")
    } catch (err: unknown) {
      const detail = (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail
      setOtpError(String(detail || "Resend failed"))
    } finally {
      setResending(false)
    }
  }

  const verifyAndRegister = async (otp: string) => {
    setVerifying(true)
    setOtpError("")
    try {
      const code = encodeURIComponent(otp)
      const payload = buildPayload()
      await apiClient.verifyOtpAndRegisterCorporate(code, payload)
      const session = await loginAfterSignup({
        email: payload.email,
        password: payload.password,
        userType: "corporate",
        displayName: payload.contact_person ?? payload.company_name,
      })
      login(session.user, session.accessToken, session.refreshToken)
      resetOnboarding()
      toast.success("Welcome! Your account is ready.")
      setOtpOpen(false)
      router.replace(SIGNUP_DASHBOARD_PATH.corporate)
    } catch (err: unknown) {
      const detail = (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail
      setOtpError(String(detail || "Verification failed"))
      throw err
    } finally {
      setVerifying(false)
    }
  }

  return (
    <div className={signupCardClass}>
      <h1 className="text-xl font-semibold tracking-tight text-slate-900 dark:text-white sm:text-2xl">{t("signup.corporate.title")}</h1>
      <p className="mt-1 text-sm text-slate-600 dark:text-blue-200/85">{t("signup.corporate.subtitle")}</p>

      <div className="mt-6 space-y-4 sm:space-y-5">
        <SignupLabeledField
          id="co-name"
          label={t("signup.corporate.companyName")}
          required
          icon={Building2}
          autoComplete="organization"
          placeholder={t("signup.corporate.companyPlaceholder")}
          filter="organization"
          value={companyName}
          onChange={(v) => {
            setCompanyName(v)
            clearError("company")
          }}
          error={fieldErrors.company}
          disabled={sending || verifying}
        />
        <SignupLabeledField
          id="co-web"
          label={t("signup.corporate.website")}
          icon={Globe}
          type="url"
          autoComplete="url"
          placeholder="https://company.com"
          value={website}
          onChange={setWebsite}
          error={fieldErrors.website}
          disabled={sending || verifying}
        />
        <SignupLabeledField
          id="co-email"
          label={t("signup.corporate.email")}
          required
          icon={Mail}
          type="email"
          autoComplete="email"
          placeholder={t("signup.corporate.emailPlaceholder")}
          filter="email"
          value={email}
          onChange={(v) => {
            setEmail(v)
            clearError("email")
          }}
          error={fieldErrors.email}
          disabled={sending || verifying}
        />
        <DualPasswordFields
          password={password}
          confirm={confirm}
          onPasswordChange={setPassword}
          onConfirmChange={setConfirm}
          passwordError={fieldErrors.password}
          confirmError={fieldErrors.confirm}
          disabled={sending || verifying}
        />
      </div>

      <Button type="button" className={signupPrimaryButtonClass + " mt-6"} loading={sending} disabled={verifying} onClick={() => void sendOtp()}>
        {t("signup.corporate.sendOtp")}
      </Button>

      <p className="mt-5 text-center text-sm text-slate-600 dark:text-blue-200/85">
        {t("signup.corporate.alreadyHaveAccount")}{" "}
        <Link href={loginHref} className="font-semibold text-blue-700 hover:underline dark:text-blue-400">
          {t("common.signIn")}
        </Link>
      </p>

      <SignupOtpModal
        open={otpOpen}
        email={email.trim()}
        onClose={() => setOtpOpen(false)}
        onSubmit={verifyAndRegister}
        onResend={resendOtp}
        submitting={verifying}
        resending={resending}
        error={otpError}
      />
    </div>
  )
}
