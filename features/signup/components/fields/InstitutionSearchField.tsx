"use client"

import { useMemo, useState } from "react"
import { Building2, ChevronDown } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { signupFieldClass, signupLabelClass } from "../signupStyles"

type Item = { id: string; name: string }

type Props = {
  id?: string
  label?: string
  placeholder?: string
  value: string
  onChange: (v: string) => void
  suggestions: Item[]
  loading?: boolean
  disabled?: boolean
  error?: string
}

/**
 * College / institution: free text with optional client-side filter over `suggestions`
 * (e.g. admin lookup when available). Works without auth by degrading to plain text.
 */
export function InstitutionSearchField({
  id = "signup-institution",
  label = "College / Institution",
  placeholder = "Search for your college…",
  value,
  onChange,
  suggestions,
  loading,
  disabled,
  error,
}: Props) {
  const [open, setOpen] = useState(false)

  const filtered = useMemo(() => {
    const q = value.trim().toLowerCase()
    if (!q) return suggestions.slice(0, 8)
    return suggestions.filter((s) => s.name.toLowerCase().includes(q)).slice(0, 8)
  }, [suggestions, value])

  return (
    <div className="relative space-y-1">
      <label htmlFor={id} className={signupLabelClass}>
        {label}
      </label>
      <div className="relative">
        <Input
          id={id}
          role="combobox"
          aria-expanded={open}
          aria-autocomplete="list"
          autoComplete="organization"
          placeholder={placeholder}
          value={value}
          disabled={disabled}
          onChange={(e) => {
            onChange(e.target.value)
            setOpen(true)
          }}
          onFocus={() => setOpen(true)}
          onBlur={() => {
            window.setTimeout(() => setOpen(false), 180)
          }}
          leftIcon={<Building2 className="h-4 w-4 shrink-0 opacity-70" aria-hidden />}
          rightIcon={
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-slate-500 hover:bg-transparent dark:text-blue-300"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => setOpen((o) => !o)}
              aria-label="Toggle suggestions"
            >
              <ChevronDown className={cn("h-4 w-4 transition-transform", open && "rotate-180")} />
            </Button>
          }
          error={Boolean(error)}
          className={cn(signupFieldClass, "text-base sm:text-sm")}
        />
        {open && filtered.length > 0 ? (
          <ul
            className="absolute z-20 mt-1 max-h-48 w-full overflow-auto rounded-xl border border-slate-200 bg-white py-1 text-sm shadow-lg dark:border-blue-900 dark:bg-slate-900"
            role="listbox"
          >
            {filtered.map((s) => (
              <li key={s.id} role="option">
                <button
                  type="button"
                  className="flex w-full px-3 py-2.5 text-left text-slate-800 hover:bg-slate-50 dark:text-blue-100 dark:hover:bg-blue-900/50"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => {
                    onChange(s.name)
                    setOpen(false)
                  }}
                >
                  {s.name}
                </button>
              </li>
            ))}
          </ul>
        ) : null}
      </div>
      {loading ? <p className="text-xs text-slate-500 dark:text-blue-400">Loading colleges…</p> : null}
      {error ? <p className="text-xs text-red-600 dark:text-red-400">{error}</p> : null}
    </div>
  )
}
