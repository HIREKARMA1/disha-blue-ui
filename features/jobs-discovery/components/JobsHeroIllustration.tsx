"use client"

/** Decorative hero illustration — JobsUPI-style professional figure */
export function JobsHeroIllustration({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 160 160"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden
    >
      <circle cx="80" cy="80" r="78" fill="white" fillOpacity="0.12" />
      <circle cx="80" cy="80" r="62" fill="white" fillOpacity="0.08" />
      <ellipse cx="80" cy="128" rx="36" ry="8" fill="white" fillOpacity="0.15" />
      <path
        d="M80 42c-10 0-18 8-18 18v6h36v-6c0-10-8-18-18-18z"
        fill="#93c5fd"
      />
      <path
        d="M62 66c0-10 8-18 18-18s18 8 18 18v52H62V66z"
        fill="#3b82f6"
      />
      <path d="M56 118h48v10H56v-10z" fill="#1d4ed8" />
      <rect x="98" y="78" width="28" height="36" rx="4" fill="white" fillOpacity="0.95" />
      <rect x="102" y="84" width="20" height="14" rx="2" fill="#dbeafe" />
      <rect x="102" y="102" width="14" height="3" rx="1" fill="#93c5fd" />
      <rect x="102" y="108" width="18" height="3" rx="1" fill="#bfdbfe" />
    </svg>
  )
}

export function JobsNeedHelpIllustration({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 80 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden
    >
      <circle cx="40" cy="28" r="14" fill="#e8f0ff" />
      <path
        d="M28 52c2-8 8-12 12-12s10 4 12 12"
        stroke="#0070f3"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <circle cx="36" cy="26" r="1.5" fill="#0052cc" />
      <circle cx="44" cy="26" r="1.5" fill="#0052cc" />
      <path d="M37 31c1.5 1.5 4.5 1.5 6 0" stroke="#0052cc" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  )
}
