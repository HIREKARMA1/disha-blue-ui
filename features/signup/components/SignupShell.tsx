"use client"

import { Navbar } from "@/components/ui/navbar"

export function SignupShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-svh bg-slate-100 text-slate-900 dark:bg-slate-950 dark:text-blue-50">
      <Navbar variant="transparent" />
      <main className="mx-auto flex w-full max-w-lg flex-col px-4 pb-16 pt-24 sm:max-w-xl sm:pt-28">{children}</main>
    </div>
  )
}
