"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Building2, Globe, Mail } from "lucide-react"
import { toast } from "react-hot-toast"
import { Button } from "@/components/ui/button"
import { apiClient } from "@/lib/api"
import { resetOnboarding } from "@/lib/onboarding"
import type { CorporateRegisterRequest } from "@/types/auth"
import { SignupOtpModal } from "./SignupOtpModal"
import { SignupLabeledField } from "./fields/SignupLabeledField"
import { DualPasswordFields } from "./fields/DualPasswordFields"
import { signupCardClass, signupPrimaryButtonClass } from "./signupStyles"

function isValidEmail(s: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s.trim())
}

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

  const validate = () => {
    const e: Record<string, string> = {}
    if (!companyName.trim()) e.company = "Company name is required"
    if (website.trim() && !isReasonableUrl(website)) e.website = "Enter a valid URL (e.g. https://company.com)"
    if (!email.trim()) e.email = "Email is required"
    else if (!isValidEmail(email)) e.email = "Enter a valid email"
    if (password.length < 8) e.password = "Use at least 8 characters"
    if (password !== confirm) e.confirm = "Passwords do not match"
    setFieldErrors(e)
    return Object.keys(e).length === 0
  }

  const buildPayload = (): CorporateRegisterRequest => ({
    company_name: companyName.trim(),
    email: email.trim().toLowerCase(),
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
      await apiClient.verifyOtpAndRegisterCorporate(code, buildPayload())
      resetOnboarding()
      toast.success("Account created. Sign in to continue.")
      setOtpOpen(false)
      router.replace("/auth/login?type=corporate&registered=true")
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
      <h1 className="text-xl font-semibold tracking-tight text-slate-900 dark:text-white sm:text-2xl">Corporate signup</h1>
      <p className="mt-1 text-sm text-slate-600 dark:text-blue-200/85">Create your hiring account with email verification.</p>

      <div className="mt-6 space-y-4 sm:space-y-5">
        <SignupLabeledField
          id="co-name"
          label="Company Name"
          required
          icon={Building2}
          autoComplete="organization"
          placeholder="Enter company name"
          value={companyName}
          onChange={setCompanyName}
          error={fieldErrors.company}
          disabled={sending || verifying}
        />
        <SignupLabeledField
          id="co-web"
          label="Website URL"
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
          label="Email Address"
          required
          icon={Mail}
          type="email"
          autoComplete="email"
          placeholder="Enter your email address"
          value={email}
          onChange={setEmail}
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
        Send OTP
      </Button>

      <p className="mt-5 text-center text-sm text-slate-600 dark:text-blue-200/85">
        Already have an account?{" "}
        <Link href={loginHref} className="font-semibold text-blue-700 hover:underline dark:text-blue-400">
          Sign in
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
