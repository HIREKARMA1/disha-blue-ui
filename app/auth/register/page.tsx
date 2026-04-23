"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { apiClient } from "@/lib/api"
import { toast } from "react-hot-toast"

export default function RegisterRedirect() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [form, setForm] = useState({
    company_name: "",
    email: "",
    password: "",
    contact_person: "",
    phone: "",
    industry: "",
  })
  const [loading, setLoading] = useState(false)
  const userType = searchParams.get("type")

  useEffect(() => {
    if (userType === "student" || userType !== "corporate") {
      router.replace("/signup/step-1")
      return
    }
  }, [router, userType])

  if (userType !== "corporate") return null

  const onSubmit = async () => {
    setLoading(true)
    try {
      await apiClient.registerCorporate({
        company_name: form.company_name,
        email: form.email,
        password: form.password,
        contact_person: form.contact_person || undefined,
        phone: form.phone || undefined,
        industry: form.industry || undefined,
      })
      toast.success("Corporate account created. Please log in.")
      router.replace("/auth/login?type=corporate&registered=true")
    } catch (error: any) {
      toast.error(String(error?.response?.data?.detail || "Registration failed"))
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className="mx-auto mt-10 max-w-lg rounded-2xl border bg-white p-6 shadow-sm dark:bg-zinc-900">
      <h1 className="text-2xl font-semibold">Corporate Signup</h1>
      <p className="mt-1 text-sm text-muted-foreground">Create your hiring account.</p>
      <div className="mt-5 space-y-3">
        <Input
          className="rounded-xl border px-4 py-3"
          placeholder="Company name"
          value={form.company_name}
          onChange={(e) => setForm((p) => ({ ...p, company_name: e.target.value }))}
        />
        <Input
          className="rounded-xl border px-4 py-3"
          placeholder="Work email"
          value={form.email}
          onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
        />
        <Input
          className="rounded-xl border px-4 py-3"
          placeholder="Password"
          type="password"
          value={form.password}
          onChange={(e) => setForm((p) => ({ ...p, password: e.target.value }))}
        />
        <Input
          className="rounded-xl border px-4 py-3"
          placeholder="Contact person"
          value={form.contact_person}
          onChange={(e) => setForm((p) => ({ ...p, contact_person: e.target.value }))}
        />
        <Input
          className="rounded-xl border px-4 py-3"
          placeholder="Phone"
          value={form.phone}
          onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value }))}
        />
        <Input
          className="rounded-xl border px-4 py-3"
          placeholder="Industry"
          value={form.industry}
          onChange={(e) => setForm((p) => ({ ...p, industry: e.target.value }))}
        />
        <Button className="h-12 w-full rounded-xl" loading={loading} onClick={onSubmit}>
          Create Corporate Account
        </Button>
      </div>
    </section>
  )
}
