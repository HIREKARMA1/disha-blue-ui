"use client"

import { useCallback, useState } from "react"
import { useRouter } from "next/navigation"
import { ArrowRight } from "lucide-react"
import { cn } from "@/lib/utils"
import { jobsUrlWithLocation } from "../constants"

type ApplyForJobsBarProps = {
  className?: string
}

/**
 * Location search + “Apply for jobs now” below the hero.
 * Redirects to the public jobs page (`/jobs`), optionally with `?location=`.
 */
export function ApplyForJobsBar({ className }: ApplyForJobsBarProps) {
  const router = useRouter()
  const [location, setLocation] = useState("")

  const goToJobs = useCallback(() => {
    router.push(jobsUrlWithLocation(location))
  }, [location, router])

  return (
    <section
      className={cn("apply-jobs-section", className)}
      aria-label="Search jobs by location"
    >
      <div className="apply-jobs-section__inner">
        <form
          className="apply-jobs-bar"
          onSubmit={(e) => {
            e.preventDefault()
            goToJobs()
          }}
        >
          <label className="sr-only" htmlFor="apply-jobs-location">
            Enter your location
          </label>
          <input
            id="apply-jobs-location"
            type="text"
            name="location"
            autoComplete="address-level2"
            placeholder="Enter your location"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            className="apply-jobs-bar__input"
          />
          <button type="submit" className="apply-jobs-bar__cta">
            <span className="apply-jobs-bar__cta-text">Apply for jobs now</span>
            <ArrowRight className="apply-jobs-bar__cta-icon" aria-hidden />
          </button>
        </form>
      </div>
    </section>
  )
}
