"use client"

import { useState } from "react"
import { Modal } from "@/components/ui/modal"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { signupFieldClass } from "./signupStyles"
import { cn } from "@/lib/utils"

type Props = {
  open: boolean
  title?: string
  email: string
  onClose: () => void
  onSubmit: (otp: string) => Promise<void>
  onResend: () => Promise<void>
  submitting?: boolean
  resending?: boolean
  error?: string
}

export function SignupOtpModal({
  open,
  title = "Enter verification code",
  email,
  onClose,
  onSubmit,
  onResend,
  submitting,
  resending,
  error,
}: Props) {
  const [otp, setOtp] = useState("")

  const handleClose = () => {
    setOtp("")
    onClose()
  }

  return (
    <Modal isOpen={open} onClose={handleClose} title={title} maxWidth="sm">
      <p className="mb-4 text-sm text-slate-600 dark:text-blue-200/90">
        We sent a 6-digit code to <span className="font-medium text-slate-900 dark:text-white">{email}</span>
      </p>
      <label htmlFor="signup-otp" className="sr-only">
        One-time password
      </label>
      <Input
        id="signup-otp"
        inputMode="numeric"
        pattern="[0-9]*"
        maxLength={6}
        autoComplete="one-time-code"
        placeholder="Enter OTP"
        value={otp}
        onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
        className={cn(signupFieldClass, "text-center text-lg font-semibold tracking-widest")}
      />
      {error ? <p className="mt-2 text-sm text-red-600 dark:text-red-400">{error}</p> : null}
      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-end">
        <Button type="button" variant="outline" className="w-full sm:w-auto" onClick={() => void onResend()} loading={resending} disabled={submitting}>
          Resend code
        </Button>
        <Button
          type="button"
          className="w-full bg-blue-700 hover:bg-blue-800 sm:w-auto dark:bg-blue-600"
          loading={submitting}
          disabled={resending || otp.length < 6}
          onClick={async () => {
            try {
              await onSubmit(otp)
              setOtp("")
            } catch {
              // Error surfaced via `error` prop from parent
            }
          }}
        >
          Verify & create account
        </Button>
      </div>
    </Modal>
  )
}
