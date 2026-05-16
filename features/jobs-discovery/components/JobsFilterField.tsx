"use client"

import { ChevronDown } from "lucide-react"
import { jobsFieldInput, jobsFieldLabel, jobsFieldSelect } from "../jobsDiscoveryTheme"

type SelectOption = { value: string; label: string }

type SelectProps = {
  id: string
  label: string
  value: string
  onChange: (value: string) => void
  options: SelectOption[]
  className?: string
}

export function JobsFilterSelect({ id, label, value, onChange, options, className }: SelectProps) {
  return (
    <div className={className}>
      <label className={jobsFieldLabel} htmlFor={id}>
        {label}
      </label>
      <div className="relative">
        <select
          id={id}
          className={jobsFieldSelect()}
          value={value}
          onChange={(e) => onChange(e.target.value)}
        >
          {options.map((opt) => (
            <option key={opt.value || "__any"} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        <ChevronDown
          className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#7a85a8]"
          aria-hidden
        />
      </div>
    </div>
  )
}

type InputProps = {
  id: string
  label: string
  value: string
  onChange: (value: string) => void
  placeholder?: string
  className?: string
}

export function JobsFilterInput({ id, label, value, onChange, placeholder, className }: InputProps) {
  return (
    <div className={className}>
      <label className={jobsFieldLabel} htmlFor={id}>
        {label}
      </label>
      <input
        id={id}
        className={jobsFieldInput()}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  )
}
