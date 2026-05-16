"use client"

import Image from "next/image"
import Link from "next/link"
import { BRANDING } from "@/config/branding"
import { getSignupImages } from "@/lib/signup-images"
import { LanguageSwitcher } from "@/components/ui/language-switcher"
import { signupJobsUpi } from "../signupTheme"

type SignupRole = "student" | "corporate"

type Props = {
  role: SignupRole
  children: React.ReactNode
}

export function SignupMarketingLayout({ role, children }: Props) {
  const images = getSignupImages(role)

  return (
    <div className="min-h-svh" style={{ backgroundColor: signupJobsUpi.pageBg }}>
      <header className="absolute right-0 top-0 z-20 p-4 sm:p-6">
        <LanguageSwitcher variant="marketing" />
      </header>

      <div className="mx-auto flex min-h-svh w-full max-w-[1180px] flex-col lg:flex-row lg:items-stretch">
        <section className="relative flex flex-1 flex-col justify-center px-6 pb-6 pt-20 sm:px-12 lg:min-h-svh lg:px-14 lg:py-20">
          <div className="relative z-10 max-w-md lg:max-w-lg">
            <h1
              className="text-[2rem] font-bold leading-[1.15] tracking-tight sm:text-[2.35rem] lg:text-[2.5rem]"
              style={{ color: signupJobsUpi.headline }}
            >
              {images.headline}
            </h1>
            <p
              className="mt-4 max-w-md text-base leading-relaxed sm:text-[1.05rem]"
              style={{ color: signupJobsUpi.subheadline }}
            >
              {images.subheadline}
            </p>
          </div>
        </section>

        <section className="flex flex-1 items-center justify-center px-4 pb-10 pt-2 sm:px-8 lg:min-h-svh lg:px-10 lg:py-12">
          <div
            className="w-full max-w-[400px] rounded-2xl bg-white px-6 py-7 sm:px-8 sm:py-8"
            style={{ boxShadow: signupJobsUpi.cardShadow }}
          >
            <div className="flex flex-col items-center text-center">
              <Link href="/" className="inline-flex">
                <Image
                  src={BRANDING.logoLight}
                  alt={BRANDING.appName}
                  width={168}
                  height={52}
                  className="h-10 w-auto object-contain sm:h-11"
                  priority
                />
              </Link>
              <p className="mt-2 text-sm font-medium text-slate-600">{images.cardTagline}</p>
            </div>

            <div className="mt-6">{children}</div>
          </div>
        </section>
      </div>
    </div>
  )
}
