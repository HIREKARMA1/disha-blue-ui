import { apiClient } from "@/lib/api"

export type InterviewLanguage = "en" | "hi" | "or" | "bn" | "ta" | "te"
export type ExperienceLevel = "fresher" | "1-3" | "3+"
export type InterviewMode = "hr" | "technical" | "rapid_fire"
export type InterviewPersonality = "friendly_mentor" | "strict_hr" | "technical_expert"
export type InterviewPhase = "introduction" | "background_skills" | "technical_scenario" | "behavioral" | "wrap_up"
export type InterviewQuestionType = "intro" | "technical" | "behavioral" | "scenario" | "follow_up" | "wrap_up"

export interface InterviewMessage {
  role: "assistant" | "user"
  content: string
  timestamp: string
}

export interface InterviewFeedback {
  score: number
  overall_score?: number
  communication: number
  confidence: number
  technical: number
  problem_solving: number
  communication_avg?: number
  technical_avg?: number
  confidence_avg?: number
  emotional_state: "nervous" | "confident" | "balanced"
  strengths: string[]
  weaknesses: string[]
  suggestions: string[]
  improvement_plan?: string[]
  recommended_actions?: string[]
  phase_scores?: {
    intro: number
    technical: number
    behavioral: number
  }
  timeline: number[]
  improvement_areas: string[]
  learning_path: string[]
  performance_personality: string
  key_strength_summary: string
  top_priorities: string[]
}

export interface InterviewHistoryItem {
  role: string
  personality: string
  transcript: string
  score: number
  created_at: string
}

export interface InterviewStartResponse {
  session_id: string
  greeting: string
  first_question: string
  max_questions: number
}

export interface InterviewNextResponse {
  next_question: string | null
  next_question_preview?: string | null
  feedback?: InterviewFeedback
  answer_score?: number | null
  answer_feedback?: string | null
  answer_skill_breakdown?: {
    communication: number
    technical: number
    confidence: number
  } | null
  coaching_hint?: string | null
  context_hint?: string | null
  response_quality_hint?: string | null
  phase?: InterviewPhase
  question_type?: InterviewQuestionType
  is_end: boolean
  question_index: number
}

export interface InterviewCompleteResponse {
  score: number
  feedback: InterviewFeedback
}

export const aiInterviewService = {
  startSession: async (payload: {
    language: InterviewLanguage
    role: string
    experience_level: ExperienceLevel
    interview_mode: InterviewMode
    personality: InterviewPersonality
    profile_context?: string
  }) => {
    return apiClient.post("/interview-session/start", payload) as Promise<InterviewStartResponse>
  },

  submitAnswer: async (payload: {
    session_id: string
    language: InterviewLanguage
    role: string
    experience_level: ExperienceLevel
    interview_mode: InterviewMode
    personality: InterviewPersonality
    history: InterviewMessage[]
    transcript: string
    is_start?: boolean
    force_end?: boolean
    interviewer_prompt?: string
  }) => {
    return apiClient.post("/interview-session/next", payload) as Promise<InterviewNextResponse>
  },

  completeSession: async (payload: {
    session_id: string
    language: InterviewLanguage
    role: string
    experience_level: ExperienceLevel
    interview_mode: InterviewMode
    personality: InterviewPersonality
    conversation_history: InterviewMessage[]
  }) => {
    return apiClient.post("/interview-session/complete", payload) as Promise<InterviewCompleteResponse>
  },

  getHistory: async (limit = 10) => {
    return apiClient.get(`/interview-session/history?limit=${limit}`) as Promise<InterviewHistoryItem[]>
  },

  synthesizeSpeech: async (payload: {
    text: string
    language: InterviewLanguage
    personality: InterviewPersonality
  }) => {
    const token = localStorage.getItem("access_token")
    const response = await fetch(`${apiClient.client.defaults.baseURL}/interview-session/tts`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify(payload),
    })
    if (!response.ok) throw new Error("Premium TTS request failed")
    return response.blob()
  },
}
