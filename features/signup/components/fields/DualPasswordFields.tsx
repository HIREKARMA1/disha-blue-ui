"use client"

import { SignupPasswordField } from "./SignupPasswordField"

type Props = {
  password: string
  confirm: string
  onPasswordChange: (v: string) => void
  onConfirmChange: (v: string) => void
  passwordError?: string
  confirmError?: string
  disabled?: boolean
}

export function DualPasswordFields({
  password,
  confirm,
  onPasswordChange,
  onConfirmChange,
  passwordError,
  confirmError,
  disabled,
}: Props) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5">
      <SignupPasswordField
        id="signup-password"
        label="Password"
        required
        autoComplete="new-password"
        placeholder="Create a strong password"
        value={password}
        onChange={onPasswordChange}
        error={passwordError}
        disabled={disabled}
      />
      <SignupPasswordField
        id="signup-password-confirm"
        label="Confirm Password"
        required
        autoComplete="new-password"
        placeholder="Confirm your password"
        value={confirm}
        onChange={onConfirmChange}
        error={confirmError}
        disabled={disabled}
      />
    </div>
  )
}
