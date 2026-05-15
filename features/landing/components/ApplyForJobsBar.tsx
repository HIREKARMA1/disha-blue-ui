"use client"

import { useCallback, useState } from "react"
import { useRouter } from "next/navigation"
import { ArrowRight, MapPin } from "lucide-react"
import { cn } from "@/lib/utils"
import { jobsUrlWithLocation } from "../constants"

type ApplyForJobsBarProps = {
  className?: string
  /** `hero` embeds the bar inside the landing hero; `default` is a standalone section */
  variant?: "default" | "hero"
}

/**
 * Location search + job browse CTA.
 * Redirects to the public jobs page (`/jobs`), optionally with `?location=`.
 */
export function ApplyForJobsBar({ className, variant = "default" }: ApplyForJobsBarProps) {
  const router = useRouter()
  const [location, setLocation] = useState("")
  const isHero = variant === "hero"

  const goToJobs = useCallback(() => {
    router.push(jobsUrlWithLocation(location))
  }, [location, router])

  return (
    <section
      className={cn(
        "apply-jobs-section",
        isHero && "apply-jobs-section--hero",
        className,
      )}
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
          {isHero ? (
            <label htmlFor="apply-jobs-location" className="apply-jobs-hero-label">
              Where would you like to work?
            </label>
          ) : (
            <label className="sr-only" htmlFor="apply-jobs-location">
              Enter your location
            </label>
          )}

          <div className="apply-jobs-bar__controls">
            <div className="apply-jobs-bar__field">
              {isHero ? (
                <MapPin className="apply-jobs-bar__pin" aria-hidden />
              ) : null}
              <input
                id="apply-jobs-location"
                type="text"
                name="location"
                autoComplete="address-level2"
                placeholder={isHero ? "e.g. Bangalore, Maharashtra" : "Enter your location"}
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="apply-jobs-bar__input"
              />
            </div>
            <button type="submit" className="apply-jobs-bar__cta">
              <span className="apply-jobs-bar__cta-text">
                {isHero ? "Browse jobs" : "Apply for jobs now"}
              </span>
              <ArrowRight className="apply-jobs-bar__cta-icon" aria-hidden />
            </button>
          </div>
        </form>
      </div>
    </section>
  )
}
