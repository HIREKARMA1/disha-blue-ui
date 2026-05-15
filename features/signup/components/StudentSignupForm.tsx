"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Mail, Phone, UserRound } from "lucide-react"
import { toast } from "react-hot-toast"
import { Button } from "@/components/ui/button"
import { apiClient } from "@/lib/api"
import { resetOnboarding } from "@/lib/onboarding"
import { useAuth } from "@/hooks/useAuth"
import { useColleges } from "@/hooks/useLookup"
import type { StudentRegisterRequest } from "@/types/auth"
import { SignupOtpModal } from "./SignupOtpModal"
import { SignupLabeledField } from "./fields/SignupLabeledField"
import { DualPasswordFields } from "./fields/DualPasswordFields"
import { InstitutionSearchField } from "./fields/InstitutionSearchField"
import { signupCardClass, signupPrimaryButtonClass } from "./signupStyles"
import {
  sanitizeEmailInput,
  sanitizePersonName,
  sanitizePhoneInput,
  validateEmail,
  validatePersonName,
  validatePhone,
} from "../utils/validation"
import { loginAfterSignup, SIGNUP_DASHBOARD_PATH } from "../utils/postSignupAuth"

type Props = {
  loginHref: string
}

export function StudentSignupForm({ loginHref }: Props) {
  const router = useRouter()
  const { login } = useAuth()
  const { data: colleges, loading: collegesLoading } = useColleges({ limit: 500 })

  const suggestions = useMemo(
    () => colleges.map((c) => ({ id: c.id, name: c.name })).filter((c) => c.name),
    [colleges],
  )

  const [name, setName] = useState("")
  const [phone, setPhone] = useState("")
  const [institution, setInstitution] = useState("")
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
    setName((n) => sanitizePersonName(n))
    setPhone((p) => sanitizePhoneInput(p))
    setEmail((e) => sanitizeEmailInput(e))
  }, [])

  const validate = () => {
    const e: Record<string, string> = {}
    const nameErr = validatePersonName(name)
    if (nameErr) e.name = nameErr
    const phoneErr = validatePhone(phone, true)
    if (phoneErr) e.phone = phoneErr
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

  const buildPayload = (): StudentRegisterRequest => ({
    name: sanitizePersonName(name).trim(),
    email: sanitizeEmailInput(email),
    password,
    phone: sanitizePhoneInput(phone) || undefined,
    institution: institution.trim() || undefined,
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
      await apiClient.verifyOtpAndRegisterStudent(code, payload)
      const session = await loginAfterSignup({
        email: payload.email,
        password: payload.password,
        userType: "student",
        displayName: payload.name,
      })
      login(session.user, session.accessToken, session.refreshToken)
      resetOnboarding()
      toast.success("Welcome! Your account is ready.")
      setOtpOpen(false)
      router.replace(SIGNUP_DASHBOARD_PATH.student)
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
      <h1 className="text-xl font-semibold tracking-tight text-slate-900 dark:text-white sm:text-2xl">Create student account</h1>
      <p className="mt-1 text-sm text-slate-600 dark:text-blue-200/85">Join with email verification in one step.</p>

      <div className="mt-6 space-y-4 sm:space-y-5">
        <SignupLabeledField
          id="su-name"
          label="Full Name"
          required
          icon={UserRound}
          filter="personName"
          autoComplete="name"
          placeholder="Enter your full name"
          value={name}
          onChange={(v) => {
            setName(v)
            clearError("name")
          }}
          error={fieldErrors.name}
          disabled={sending || verifying}
        />
        <SignupLabeledField
          id="su-phone"
          label="Phone Number"
          required
          icon={Phone}
          filter="phone"
          autoComplete="tel-national"
          placeholder="10-digit mobile number (e.g. 9876543210)"
          value={phone}
          onChange={(v) => {
            setPhone(v)
            clearError("phone")
          }}
          error={fieldErrors.phone}
          disabled={sending || verifying}
        />
        <InstitutionSearchField
          value={institution}
          onChange={setInstitution}
          suggestions={suggestions}
          loading={collegesLoading}
          disabled={sending || verifying}
        />
        <SignupLabeledField
          id="su-email"
          label="Email Address"
          required
          icon={Mail}
          type="email"
          autoComplete="email"
          placeholder="Enter your email address"
          value={email}
          filter="email"
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
