import { NextRequest, NextResponse } from "next/server"
import { CourseItem, ParsedUserProfile } from "@/components/courses/types"

interface RecommendCoursesRequest {
  userInput?: string
  parsedData?: ParsedUserProfile
}

const FALLBACK_COURSES: CourseItem[] = [
  {
    title: "Basic Electrician Training",
    duration: "3 months",
    level: "Beginner",
    jobRole: "Electrician",
    platform: "Skill India + YouTube",
    link: "https://www.youtube.com/results?search_query=basic+electrician+course+india",
    description: "Hands-on basics: wiring, tools, safety, and home electrical repairs.",
    cost: "Free",
    ctaLabel: "Watch",
  },
  {
    title: "Plumbing Foundation Course",
    duration: "2 months",
    level: "Beginner",
    jobRole: "Plumber",
    platform: "PMKVY / NSDC",
    link: "https://www.skillindia.gov.in/",
    description: "Learn fitting, leakage repair, pipe joints, and field-ready plumbing tasks.",
    cost: "Low-cost",
    ctaLabel: "Enroll",
  },
  {
    title: "Commercial Driving Preparation",
    duration: "1.5 months",
    level: "Beginner",
    jobRole: "Driver",
    platform: "YouTube + Local driving school",
    link: "https://www.youtube.com/results?search_query=commercial+driving+training+india",
    description: "Prepare for gig-driving roles with safety, route handling, and customer etiquette.",
    cost: "Low-cost",
    ctaLabel: "Start",
  },
  {
    title: "Delivery Partner Job-Ready Program",
    duration: "4 weeks",
    level: "All Levels",
    jobRole: "Delivery Associate",
    platform: "YouTube + platform onboarding",
    link: "https://www.youtube.com/results?search_query=delivery+job+training+india",
    description: "Focus on app usage, navigation, customer behavior, and earnings optimization.",
    cost: "Free",
    ctaLabel: "Watch",
  },
  {
    title: "Beginner Welding Skills",
    duration: "3 months",
    level: "Beginner",
    jobRole: "Welder",
    platform: "Skill India + ITI modules",
    link: "https://www.youtube.com/results?search_query=beginner+welding+course+india",
    description: "Practice arc welding basics, machine handling, and workshop safety.",
    cost: "Low-cost",
    ctaLabel: "Enroll",
  },
  {
    title: "Two-Wheeler and Auto Mechanic Basics",
    duration: "2-4 months",
    level: "Beginner",
    jobRole: "Mechanic",
    platform: "YouTube + Local training centers",
    link: "https://www.youtube.com/results?search_query=two+wheeler+mechanic+course+india",
    description: "Learn engine basics, service routines, and common repair troubleshooting.",
    cost: "Low-cost",
    ctaLabel: "Start",
  },
  {
    title: "House Wiring and Electrical Safety",
    duration: "6 weeks",
    level: "Beginner",
    jobRole: "Electrician",
    platform: "YouTube Practical Series",
    link: "https://www.youtube.com/results?search_query=house+wiring+course+hindi",
    description: "Understand wiring diagrams, MCBs, earthing, and safe installation practices.",
    cost: "Free",
    ctaLabel: "Watch",
  },
  {
    title: "Sanitary and Bathroom Fitting Course",
    duration: "2 months",
    level: "Beginner",
    jobRole: "Plumber",
    platform: "NSDC-aligned resources",
    link: "https://www.youtube.com/results?search_query=sanitary+fitting+course+india",
    description: "Master tap fitting, drainage fixes, and installation for household projects.",
    cost: "Low-cost",
    ctaLabel: "Enroll",
  },
  {
    title: "Gig Driver Earning Skills",
    duration: "4 weeks",
    level: "All Levels",
    jobRole: "Driver",
    platform: "YouTube + app onboarding guides",
    link: "https://www.youtube.com/results?search_query=rapido+driver+training+india",
    description: "Improve trip acceptance, customer handling, and daily earning optimization.",
    cost: "Free",
    ctaLabel: "Start",
  },
  {
    title: "Delivery App Operations Masterclass",
    duration: "3-5 weeks",
    level: "Beginner",
    jobRole: "Delivery Associate",
    platform: "Free online videos",
    link: "https://www.youtube.com/results?search_query=blinkit+delivery+job+training",
    description: "Learn app flow, efficient route planning, and safe parcel handling.",
    cost: "Free",
    ctaLabel: "Watch",
  },
]

function sanitizeCourses(raw: unknown): CourseItem[] {
  if (!Array.isArray(raw)) return []
  return raw
    .map((item) => {
      const data = item as Partial<CourseItem>
      return {
        title: String(data.title || "").trim(),
        duration: String(data.duration || "1-3 months").trim(),
        level: (data.level === "Intermediate" || data.level === "All Levels" ? data.level : "Beginner") as
          | "Beginner"
          | "Intermediate"
          | "All Levels",
        jobRole: String(data.jobRole || "Skilled Worker").trim(),
        platform: String(data.platform || "Online").trim(),
        link: String(data.link || "https://www.skillindia.gov.in/").trim(),
        description: String(data.description || "").trim(),
        cost: (data.cost === "Low-cost" || data.cost === "Paid" ? data.cost : "Free") as
          | "Free"
          | "Low-cost"
          | "Paid",
        ctaLabel: data.ctaLabel ? String(data.ctaLabel) : "Watch / Enroll",
      }
    })
    .filter((course) => course.title && course.description && course.link)
}

function buildPrompt(userInput: string, parsedData?: ParsedUserProfile) {
  return `
You are a vocational learning assistant for blue-collar job seekers in India.
Recommend only practical, short-term (1-6 months), low-cost/free courses.

Priority job roles:
- Electrician
- Plumber
- Welder
- Driver (Rapido/Blinkit/Logistics)
- Delivery jobs
- Mechanic

User raw input:
${userInput}

Parsed user profile:
${JSON.stringify(parsedData || {}, null, 2)}

Return strict JSON only:
{
  "courses": [
    {
      "title": "string",
      "duration": "string",
      "level": "Beginner|Intermediate|All Levels",
      "jobRole": "string",
      "platform": "string",
      "link": "https://...",
      "description": "string",
      "cost": "Free|Low-cost|Paid",
      "ctaLabel": "Watch|Enroll|Start"
    }
  ]
}

Keep results beginner friendly and easy to understand for 10th/12th pass or dropout learners.
Limit to 10 course suggestions.
`.trim()
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as RecommendCoursesRequest
    const userInput = String(body?.userInput || "").trim()
    const parsedData = body?.parsedData

    if (!userInput) {
      return NextResponse.json({ error: "User input is required." }, { status: 400 })
    }

    const apiKey = process.env.OPENAI_API_KEY || process.env.AI_API_KEY
    if (!apiKey) {
      return NextResponse.json({ courses: FALLBACK_COURSES })
    }

    const upstream = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: process.env.OPENAI_MODEL || "gpt-4o-mini",
        temperature: 0.2,
        response_format: { type: "json_object" },
        messages: [
          {
            role: "system",
            content: "You return only valid JSON and prioritize practical job-focused recommendations.",
          },
          {
            role: "user",
            content: buildPrompt(userInput, parsedData),
          },
        ],
      }),
    })

    if (!upstream.ok) {
      return NextResponse.json({ courses: FALLBACK_COURSES })
    }

    const response = await upstream.json()
    const content = String(response?.choices?.[0]?.message?.content || "").trim()
    const parsed = content ? JSON.parse(content) : {}
    const courses = sanitizeCourses(parsed?.courses)

    return NextResponse.json({ courses: courses.length ? courses : FALLBACK_COURSES })
  } catch {
    return NextResponse.json({ courses: FALLBACK_COURSES })
  }
}
