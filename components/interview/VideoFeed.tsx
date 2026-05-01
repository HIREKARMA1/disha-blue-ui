"use client"

import { useEffect, useRef } from "react"

interface Props {
  stream: MediaStream | null
}

export function VideoFeed({ stream }: Props) {
  const videoRef = useRef<HTMLVideoElement | null>(null)

  useEffect(() => {
    if (!videoRef.current) return
    videoRef.current.srcObject = stream
  }, [stream])

  return (
    <div className="relative h-[320px] overflow-hidden rounded-2xl border border-slate-200/90 bg-slate-900 dark:border-emerald-800">
      <video ref={videoRef} autoPlay playsInline muted className="h-full w-full object-cover" />
      {!stream && <div className="absolute inset-0 grid place-items-center text-sm text-slate-200">Camera preview unavailable</div>}
    </div>
  )
}
