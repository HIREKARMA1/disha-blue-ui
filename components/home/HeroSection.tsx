"use client"

import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { getOnboardingEntryRoute } from "@/lib/onboarding"

export default function HeroSection() {
  const router = useRouter()

  const handleFindJobsClick = () => {
    router.push(getOnboardingEntryRoute())
  }

  return (
    <section className="relative overflow-hidden bg-sage/10 dark:bg-emerald-950">
      {/* Hero media starts at section top (no pt-* on section) so overlays reach the top — nav offset lives on copy only */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative isolate w-full min-h-[clamp(30rem,92svh,54rem)] max-sm:landscape:min-h-[min(100dvh,36rem)] sm:min-h-[min(76vh,58rem)] md:min-h-[min(80vh,60rem)] lg:min-h-[min(calc(100dvh-6rem),62rem)]"
      >
        {/* Full-bleed photo — focal points scale by breakpoint */}
        <div className="absolute inset-x-0 -top-px -bottom-px min-h-[calc(100%+2px)]">
          <Image
            src="/images/hero-handshake.png"
            alt="Employer and candidate shaking hands across a desk in a bright office"
            fill
            priority
            className="object-cover object-[50%_36%] min-[400px]:object-[49%_37%] sm:scale-[1.08] sm:object-[48%_44%] md:object-[47%_42%] lg:scale-[1.12] lg:object-[42%_38%]"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 100vw, 100vw"
          />
        </div>

        {/* Diagonal theme panel — steeper on narrow phones; opens up from sm */}
        <div
          className="pointer-events-none absolute inset-0 z-[1] bg-[linear-gradient(168deg,rgba(61,79,50,0.96)_0%,rgba(61,79,50,0.88)_30%,rgba(61,79,50,0.52)_46%,rgba(61,79,50,0.15)_64%,transparent_78%)] dark:bg-[linear-gradient(168deg,hsla(150,14%,11%,0.96)_0%,hsla(150,12%,12%,0.72)_42%,hsla(150,12%,8%,0.28)_62%,transparent_78%)] min-[480px]:bg-[linear-gradient(128deg,rgba(61,79,50,0.94)_0%,rgba(61,79,50,0.76)_30%,rgba(61,79,50,0.35)_46%,rgba(61,79,50,0.1)_52%,transparent_57%)] min-[480px]:dark:bg-[linear-gradient(128deg,hsla(150,14%,11%,0.94)_0%,hsla(150,12%,14%,0.72)_32%,hsla(150,12%,10%,0.32)_46%,transparent_54%)] lg:bg-[linear-gradient(118deg,rgba(61,79,50,0.93)_0%,rgba(61,79,50,0.74)_28%,rgba(61,79,50,0.38)_42%,rgba(61,79,50,0.12)_50%,transparent_55%)] lg:dark:bg-[linear-gradient(118deg,hsla(150,14%,11%,0.94)_0%,hsla(150,12%,14%,0.72)_30%,hsla(150,12%,10%,0.32)_44%,transparent_54%)] max-sm:landscape:bg-[linear-gradient(95deg,rgba(61,79,50,0.92)_0%,rgba(61,79,50,0.65)_48%,rgba(61,79,50,0.2)_62%,transparent_72%)] max-sm:landscape:dark:bg-[linear-gradient(95deg,hsla(150,14%,11%,0.92)_0%,hsla(150,12%,12%,0.55)_52%,transparent_72%)]"
          aria-hidden
        />

        {/* Top — full-width dark tint (same family as diagonal). Light sage layer was z-2 and looked like a pale strip. */}
        <div
          className="pointer-events-none absolute inset-x-0 top-0 z-[2] h-[min(44%,24rem)] bg-[linear-gradient(to_bottom,rgba(61,79,50,0.9)_0%,rgba(61,79,50,0.9)_14%,rgba(61,79,50,0.55)_32%,rgba(61,79,50,0.2)_52%,rgba(61,79,50,0.04)_72%,transparent_100%)] dark:bg-[linear-gradient(to_bottom,hsla(150,14%,11%,0.94)_0%,hsla(150,14%,11%,0.94)_16%,hsla(150,12%,12%,0.62)_34%,hsla(150,12%,10%,0.22)_54%,hsla(150,12%,8%,0.06)_74%,transparent_100%)] sm:h-[min(40%,26rem)] md:h-[min(38%,28rem)] lg:h-[min(34%,28rem)]"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute inset-x-0 top-0 z-[2] h-1 bg-[rgb(61,79,50)]/92 dark:bg-[hsl(150_14%_10%)]/94"
          aria-hidden
        />

        {/* Bottom blend — longer opaque foot + bridge strip (kills 1px image / grey seam) */}
        <div
          className="pointer-events-none absolute inset-x-0 bottom-0 z-[2] h-[min(48%,28rem)] bg-[linear-gradient(to_top,rgba(163,177,138,0.5)_0%,rgba(163,177,138,0.5)_18%,rgba(163,177,138,0.28)_30%,rgba(163,177,138,0.1)_48%,rgba(163,177,138,0.02)_65%,transparent_100%)] dark:bg-[linear-gradient(to_top,hsl(150_12%_8%)_0%,hsl(150_12%_8%)_22%,hsla(150,12%,8%,0.9)_34%,hsla(150,12%,8%,0.45)_50%,hsla(150,12%,8%,0.1)_68%,transparent_100%)] sm:h-[min(46%,30rem)] sm:bg-[linear-gradient(to_top,rgba(163,177,138,0.48)_0%,rgba(163,177,138,0.46)_16%,rgba(163,177,138,0.24)_28%,rgba(163,177,138,0.09)_44%,transparent_90%)] sm:dark:bg-[linear-gradient(to_top,hsl(150_12%_8%)_0%,hsl(150_12%_8%)_18%,hsla(150,12%,8%,0.85)_30%,hsla(150,12%,8%,0.35)_46%,transparent_92%)] md:h-[min(44%,32rem)] lg:h-[min(42%,34rem)]"
          aria-hidden
        />
        {/* Hard same-color cap — must match ConnectionStories + main dark bg */}
        <div
          className="pointer-events-none absolute inset-x-0 bottom-0 z-[2] h-[3px] bg-sage/10 dark:bg-emerald-950"
          aria-hidden
        />

        {/* Copy — top bias on small screens (readable + scroll); centered from sm */}
        <div className="absolute inset-0 z-[3] flex items-start justify-start overflow-y-auto px-4 pb-[max(1.5rem,env(safe-area-inset-bottom))] pt-[calc(4.25rem+env(safe-area-inset-top))] min-[480px]:items-center min-[480px]:overflow-visible min-[480px]:px-6 min-[480px]:pt-[calc(5rem+env(safe-area-inset-top))] sm:px-8 sm:pt-[calc(5.5rem+env(safe-area-inset-top))] md:px-12 md:pt-[calc(6rem+env(safe-area-inset-top))] lg:px-16">
          <motion.div
            initial={{ opacity: 0, x: -16 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.06 }}
            className="pointer-events-auto w-full max-w-[min(100%,34rem)] text-left text-white sm:max-w-lg md:max-w-xl"
          >
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-white/85 min-[400px]:text-[11px] min-[400px]:tracking-[0.24em] sm:text-xs sm:tracking-[0.28em]">
              Career growth simplified
            </p>
            <h1 className="mt-2 font-display text-2xl font-bold uppercase leading-[1.06] tracking-tight text-balance min-[400px]:mt-3 min-[400px]:text-3xl sm:mt-4 sm:text-5xl sm:leading-[1.02] md:text-6xl lg:text-7xl">
              <span className="block">Find Your</span>
              <span className="block">Next Opportunity</span>
            </h1>
            <p className="mt-3 max-w-[55ch] text-[13px] leading-relaxed text-white/90 min-[400px]:text-sm sm:mt-5 sm:mt-6 sm:max-w-md sm:text-base md:text-lg">
              Disha helps students discover better-fit jobs and helps employers hire with a cleaner, faster workflow.
            </p>

            <div className="mt-5 flex w-full min-w-0 flex-col gap-2.5 min-[400px]:mt-6 min-[400px]:gap-3 sm:mt-8 sm:max-w-xl sm:flex-row sm:flex-wrap sm:items-stretch sm:gap-3 md:mt-10 md:gap-4">
              <div className="w-full min-w-0 sm:w-auto sm:min-w-[9.5rem]">
                <Button
                  onClick={handleFindJobsClick}
                  className="h-11 min-h-[44px] w-full rounded-none border-0 bg-emerald-100 px-5 text-sm font-semibold text-sage-deep shadow-none ring-0 ring-offset-0 hover:bg-emerald-50 focus-visible:ring-2 focus-visible:ring-emerald-300/80 focus-visible:ring-offset-0 dark:bg-emerald-200 dark:text-emerald-950 dark:hover:bg-emerald-100 sm:w-auto sm:px-6 md:min-h-[3rem] md:px-8 md:text-base"
                >
                  🎓 Find Jobs (Student)
                </Button>
              </div>
              <Link href="/auth/register?type=corporate" className="w-full min-w-0 sm:w-auto sm:min-w-[9.5rem]">
                <Button
                  variant="outline"
                  className="h-11 min-h-[44px] w-full rounded-none border-2 border-emerald-200/85 bg-transparent px-5 text-sm font-semibold text-white shadow-none ring-0 ring-offset-0 hover:bg-emerald-500/15 focus-visible:ring-2 focus-visible:ring-emerald-300/70 focus-visible:ring-offset-0 dark:border-emerald-400/85 dark:bg-emerald-950/25 dark:text-emerald-50 dark:hover:bg-emerald-800/45 sm:w-auto sm:px-6 md:min-h-[3rem] md:px-8 md:text-base"
                >
                  🏢 Hire Talent (Corporate)
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </motion.div>
    </section>
  )
}
