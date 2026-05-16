import { Suspense } from "react"
import { CorporateSignupPageView } from "@/features/signup/components/CorporateSignupPageView"

export default function CorporateSignupPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-svh items-center justify-center bg-[#fdfaf3]">
          <div className="h-12 w-12 animate-pulse rounded-full bg-primary-200" />
        </div>
      }
    >
      <CorporateSignupPageView />
    </Suspense>
  )
}
