"use client"

import { useEffect, useState } from "react"

type SignupLanguage = "en" | "hi"

const KEY = "hk_language"

export function getSignupLanguage(): SignupLanguage {
  if (typeof window === "undefined") return "en"
  const raw = localStorage.getItem(KEY)
  return raw === "hi" ? "hi" : "en"
}

export function SignupLanguageSwitcher() {
  const [language, setLanguage] = useState<SignupLanguage>("en")

  useEffect(() => {
    setLanguage(getSignupLanguage())
  }, [])

  const switchLanguage = (next: SignupLanguage) => {
    setLanguage(next)
    localStorage.setItem(KEY, next)
    window.dispatchEvent(new CustomEvent("hk_language_changed", { detail: { language: next } }))
  }

  return (
    <div className="inline-flex rounded-full border p-1 text-xs">
      <button
        type="button"
        onClick={() => switchLanguage("en")}
        className={`rounded-full px-3 py-1 ${language === "en" ? "bg-primary text-primary-foreground" : ""}`}
      >
        English
      </button>
      <button
        type="button"
        onClick={() => switchLanguage("hi")}
        className={`rounded-full px-3 py-1 ${language === "hi" ? "bg-primary text-primary-foreground" : ""}`}
      >
        हिंदी
      </button>
    </div>
  )
}
