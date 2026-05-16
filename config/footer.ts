import { jobsUrlWithLocation } from "@/features/landing/constants"

export const FOOTER_LEGAL_NAME =
  process.env.NEXT_PUBLIC_COMPANY_LEGAL_NAME || "HIREKARMA PRIVATE LIMITED"

export const FOOTER_EMAIL =
  process.env.NEXT_PUBLIC_SUPPORT_EMAIL || "info@hirekarma.in"

export const FOOTER_ADDRESS = [
  "2nd Floor, SS Niwas",
  "Hirekarma Private Limited",
  "Raghunathpur, Bhubaneswar",
  "Odisha 751024",
] as const

export const FOOTER_LOCATION =
  "2nd Floor, SS Niwas, Hirekarma Private Limited, Raghunathpur, Bhubaneswar, Odisha 751024"

export const FOOTER_SUPPORT_PHONE =
  process.env.NEXT_PUBLIC_SUPPORT_PHONE || "+91 90786 83876"

export const FOOTER_SUPPORT_PHONE_TEL =
  process.env.NEXT_PUBLIC_SUPPORT_PHONE_TEL || "+919078683876"

export const FOOTER_QUICK_LINKS = [
  { label: "About", href: "/#about" },
  { label: "Blogs", href: "/resources" },
  { label: "Team", href: "/about" },
  { label: "Contact us", href: `mailto:${FOOTER_EMAIL}` },
  { label: "Terms & conditions", href: "/terms" },
  { label: "Privacy policies", href: "/privacy" },
] as const

export const FOOTER_POPULAR_SEARCHES = [
  { label: "Data collection jobs", query: "Data Collection" },
  { label: "In-store promoter jobs", query: "In-store Promoter" },
  { label: "Hospitality manager jobs", query: "Hospitality Manager" },
  { label: "Data entry jobs", query: "Data Entry" },
  { label: "Supervisor jobs", query: "Supervisor" },
  { label: "Store helper jobs", query: "Store Helper" },
] as const

export const FOOTER_CITIES = [
  "Delhi",
  "Mumbai",
  "Bangalore",
  "Patna",
  "Lucknow",
  "Gurugram",
] as const

export function jobsUrlWithKeyword(keyword: string) {
  return `/jobs?keyword=${encodeURIComponent(keyword)}`
}

export { jobsUrlWithLocation }

export type FooterSocialNetwork = "linkedin" | "facebook" | "instagram" | "x"

export const FOOTER_SOCIAL: readonly {
  label: string
  href: string
  network: FooterSocialNetwork
}[] = [
  {
    label: "LinkedIn",
    href:
      process.env.NEXT_PUBLIC_LINKEDIN_URL ||
      "https://www.linkedin.com/company/hirekarma-pvt-ltd/",
    network: "linkedin",
  },
  {
    label: "Facebook",
    href:
      process.env.NEXT_PUBLIC_FACEBOOK_URL || "https://www.facebook.com/Hirekarma/",
    network: "facebook",
  },
  {
    label: "Instagram",
    href:
      process.env.NEXT_PUBLIC_INSTAGRAM_URL || "https://www.instagram.com/hirekarma",
    network: "instagram",
  },
  {
    label: "X",
    href: process.env.NEXT_PUBLIC_X_URL || "https://x.com/hirekarma",
    network: "x",
  },
] as const
