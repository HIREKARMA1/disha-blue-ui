export type EducationLevel =
  | "10th pass"
  | "12th pass"
  | "dropout"
  | "iti"
  | "diploma"
  | "unknown"

export interface ParsedUserProfile {
  education: EducationLevel
  skills: string[]
  goal: string
  intent: string
  rawText: string
  language: "en" | "hi"
}

export interface CourseItem {
  title: string
  duration: string
  level: "Beginner" | "Intermediate" | "All Levels"
  jobRole: string
  platform: string
  link: string
  description: string
  cost: "Free" | "Low-cost" | "Paid"
  ctaLabel?: string
}
