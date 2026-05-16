import signupImagesJson from "@/config/signup-images.json"

/** Optional — add when you have S3 URLs in signup-images.json */
export type SignupAvatarConfig = {
  id: string
  label: string
  url: string
  position: { top: string; left: string }
}

export type SignupRoleImages = {
  headline: string
  subheadline: string
  cardTagline: string
  /** Card hero image (optional) */
  heroIllustration?: string
  /** Left-side profession circles (optional) */
  avatars?: SignupAvatarConfig[]
}

export type SignupImagesConfig = {
  student: SignupRoleImages
  corporate: SignupRoleImages
}

export const signupImages = signupImagesJson as SignupImagesConfig

export function getSignupImages(role: "student" | "corporate"): SignupRoleImages {
  return signupImages[role]
}
