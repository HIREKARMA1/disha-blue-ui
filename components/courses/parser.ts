import { ParsedUserProfile } from "@/components/courses/types"

const SKILL_KEYWORDS = [
  "electrician",
  "plumber",
  "welder",
  "driving",
  "driver",
  "delivery",
  "mechanic",
  "tailoring",
  "beautician",
  "carpenter",
]

function detectEducation(input: string): ParsedUserProfile["education"] {
  const text = input.toLowerCase()
  if (text.includes("10th") || text.includes("10th pass") || text.includes("class 10")) return "10th pass"
  if (text.includes("12th") || text.includes("12th pass") || text.includes("class 12")) return "12th pass"
  if (text.includes("dropout") || text.includes("drop out")) return "dropout"
  if (text.includes("iti")) return "iti"
  if (text.includes("diploma")) return "diploma"
  return "unknown"
}

function detectSkills(input: string): string[] {
  const text = input.toLowerCase()
  return SKILL_KEYWORDS.filter((skill) => text.includes(skill))
}

function detectGoal(input: string, skills: string[]): string {
  const text = input.toLowerCase()
  if (text.includes("job")) return skills[0] ? `${skills[0]} job` : "job"
  if (text.includes("earn")) return skills[0] ? `${skills[0]} work` : "earn money quickly"
  if (text.includes("skill")) return "skill upgrade"
  return skills[0] ? `${skills[0]} training` : "new job opportunity"
}

function detectIntent(input: string): string {
  const text = input.toLowerCase()
  if (text.includes("quick") || text.includes("jaldi")) return "earn quickly"
  if (text.includes("better salary") || text.includes("more money")) return "better income"
  if (text.includes("part time")) return "part-time work"
  return "job-ready skills"
}

function detectLanguage(input: string): "en" | "hi" {
  const hasDevanagari = /[\u0900-\u097F]/.test(input)
  return hasDevanagari ? "hi" : "en"
}

export function parseUserInput(rawText: string): ParsedUserProfile {
  const normalized = rawText.trim()
  const skills = detectSkills(normalized)
  return {
    education: detectEducation(normalized),
    skills,
    goal: detectGoal(normalized, skills),
    intent: detectIntent(normalized),
    rawText: normalized,
    language: detectLanguage(normalized),
  }
}
