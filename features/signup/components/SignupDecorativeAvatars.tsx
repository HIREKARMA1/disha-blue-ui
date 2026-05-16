"use client"

import type { SignupAvatarConfig } from "@/lib/signup-images"
import { cn } from "@/lib/utils"

type Props = {
  avatars: SignupAvatarConfig[]
  className?: string
}

export function SignupDecorativeAvatars({ avatars, className }: Props) {
  return (
    <div aria-hidden className={cn("pointer-events-none absolute inset-0 hidden lg:block", className)}>
      <svg
        className="absolute inset-0 h-full w-full text-[#C5CDD8]"
        viewBox="0 0 520 600"
        fill="none"
        preserveAspectRatio="xMidYMid slice"
      >
        <path
          d="M70 90 C140 120 200 80 280 130 S380 200 320 300 S120 380 200 480"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeDasharray="7 9"
          strokeLinecap="round"
        />
        <path
          d="M400 70 C340 180 420 220 360 340"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeDasharray="7 9"
          strokeLinecap="round"
          opacity="0.75"
        />
        <path
          d="M90 420 C180 460 260 440 340 500"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeDasharray="7 9"
          strokeLinecap="round"
          opacity="0.55"
        />
      </svg>
      {avatars.map((avatar) => (
        <div
          key={avatar.id}
          className="absolute"
          style={{ top: avatar.position.top, left: avatar.position.left }}
        >
          <div className="h-[4.75rem] w-[4.75rem] overflow-hidden rounded-full border-[3px] border-white bg-white shadow-[0_6px_20px_rgba(26,68,128,0.15)] sm:h-[5.25rem] sm:w-[5.25rem]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={avatar.url}
              alt=""
              className="h-full w-full object-cover"
              loading="lazy"
              decoding="async"
            />
          </div>
        </div>
      ))}
    </div>
  )
}
