"use client"

import { FormEvent, useState } from "react"
import { Search } from "lucide-react"
import { Button } from "@/components/ui/button"

interface SearchInputProps {
  onSearch: (text: string) => void
  disabled?: boolean
}

export function SearchInput({ onSearch, disabled = false }: SearchInputProps) {
  const [value, setValue] = useState("")

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault()
    onSearch(value)
  }

  return (
    <form onSubmit={handleSubmit} className="flex gap-2">
      <div className="relative flex-1">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <input
          value={value}
          onChange={(event) => setValue(event.target.value)}
          placeholder="Type: 12th pass, want electrician job"
          className="w-full rounded-xl border border-slate-200 bg-white py-2 pl-10 pr-3 text-sm text-slate-900 outline-none focus:border-sage-deep dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-50"
        />
      </div>
      <Button
        type="submit"
        disabled={disabled}
        className="rounded-xl bg-sage-deep text-white hover:bg-sage-deep/90 dark:bg-emerald-600 dark:hover:bg-emerald-500"
      >
        Search
      </Button>
    </form>
  )
}
