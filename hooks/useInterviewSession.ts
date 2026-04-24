"use client"

import { useMemo, useState } from "react"
import {
  aiInterviewService,
  ExperienceLevel,
  InterviewFeedback,
  InterviewLanguage,
  InterviewMessage,
  InterviewMode,
  InterviewPersonality,
  InterviewPhase,
  InterviewQuestionType,
} from "@/services/aiInterviewService"

export type InterviewStatus = "idle" | "loading" | "active" | "ended" | "error"

interface SessionState {
  sessionId: string | null
  status: InterviewStatus
  conversationHistory: InterviewMessage[]
  currentQuestion: string
  spokenPrompt: string
  currentQuestionPreview: string
  questionIndex: number
  maxQuestions: number
  score: number | null
  feedback: InterviewFeedback | null
  coachingHint: string | null
  contextHint: string | null
  responseQualityHint: string | null
  answerScore: number | null
  answerFeedback: string | null
  phase: InterviewPhase
  questionType: InterviewQuestionType
  error: string | null
}

const initialState: SessionState = {
  sessionId: null,
  status: "idle",
  conversationHistory: [],
  currentQuestion: "",
  spokenPrompt: "",
  currentQuestionPreview: "",
  questionIndex: 0,
  maxQuestions: 5,
  score: null,
  feedback: null,
  coachingHint: null,
  contextHint: null,
  responseQualityHint: null,
  answerScore: null,
  answerFeedback: null,
  phase: "introduction",
  questionType: "intro",
  error: null,
}

const MAX_HISTORY_MESSAGES = 10

function trimHistory(history: InterviewMessage[]) {
  return history.slice(-MAX_HISTORY_MESSAGES)
}

function resolveMaxQuestions(mode: InterviewMode) {
  if (mode === "rapid_fire") return 8
  if (mode === "hr") return 6
  return 7
}

interface SessionConfig {
  language: InterviewLanguage
  role: string
  experienceLevel: ExperienceLevel
  interviewMode: InterviewMode
  personality: InterviewPersonality
}

function buildInterviewerPrompt() {
  return (
    "You are an AI career evaluator. In addition to scoring each answer, classify communication, technical knowledge, and confidence. " +
    "At the end, generate a structured performance report with strengths, weaknesses, and actionable improvements. " +
    "For each user answer: 1. Give a score out of 10 2. Provide 1-line constructive feedback 3. Ask the next relevant question. " +
    "Keep responses short and conversational."
  )
}

function buildSpokenReply(
  language: InterviewLanguage,
  personality: InterviewPersonality,
  nextQuestion: string,
  score?: number | null,
  tip?: string | null,
) {
  if (score == null && !tip) return nextQuestion
  if (language === "hi") {
    if (personality === "strict_hr") {
      return `स्कोर ${score ?? 0} में से 10। ${tip || "अगले उत्तर में और स्पष्ट रहें।"} अगला प्रश्न: ${nextQuestion}`
    }
    return `अच्छा उत्तर। मैं इसे ${score ?? 0} में से 10 दूंगा। ${tip || "अगली बार और विशिष्ट उदाहरण दें।"} अगला प्रश्न: ${nextQuestion}`
  }
  if (personality === "strict_hr") {
    return `Score: ${score ?? 0} out of 10. ${tip || "Be more specific."} Next question: ${nextQuestion}`
  }
  return `Good answer. I would rate it ${score ?? 0} out of 10. ${tip || "Try adding a concrete example."} Next question: ${nextQuestion}`
}

export function useInterviewSession(config: SessionConfig) {
  const [state, setState] = useState<SessionState>(initialState)

  const startInterview = async () => {
    setState((prev) => ({ ...prev, status: "loading", error: null }))
    try {
      console.log("Start interview triggered")
      const response = await aiInterviewService.submitAnswer({
        session_id: "",
        language: config.language,
        role: config.role,
        experience_level: config.experienceLevel,
        interview_mode: config.interviewMode,
        personality: config.personality,
        history: [],
        transcript: "",
        is_start: true,
        interviewer_prompt: buildInterviewerPrompt(),
      })
      console.log("AI first response:", response)
      const questionMessage: InterviewMessage = {
        role: "assistant",
        content: response.next_question || "",
        timestamp: new Date().toISOString(),
      }

      setState({
        sessionId: "active-session",
        status: "active",
        conversationHistory: [questionMessage],
        currentQuestion: response.next_question || "",
        spokenPrompt: response.next_question || "",
        currentQuestionPreview: response.next_question_preview || "",
        questionIndex: 1,
        maxQuestions: resolveMaxQuestions(config.interviewMode),
        score: null,
        feedback: null,
        coachingHint: response.coaching_hint ?? null,
        contextHint: response.context_hint ?? null,
        responseQualityHint: response.response_quality_hint ?? null,
        answerScore: null,
        answerFeedback: null,
        phase: response.phase ?? "introduction",
        questionType: response.question_type ?? "intro",
        error: null,
      })
      return response.next_question || ""
    } catch (error: any) {
      setState((prev) => ({
        ...prev,
        status: "error",
        error: error?.response?.data?.detail || "Failed to start interview session.",
      }))
      return null
    }
  }

  const submitAnswer = async (answer: string) => {
    if (!state.sessionId || !answer.trim()) return null
    const userMessage: InterviewMessage = {
      role: "user",
      content: answer.trim(),
      timestamp: new Date().toISOString(),
    }
    const outgoingHistory = trimHistory([...state.conversationHistory, userMessage])
    setState((prev) => ({
      ...prev,
      status: "loading",
      conversationHistory: outgoingHistory,
      error: null,
    }))

    try {
      const response = await aiInterviewService.submitAnswer({
        session_id: state.sessionId,
        language: config.language,
        role: config.role,
        experience_level: config.experienceLevel,
        interview_mode: config.interviewMode,
        personality: config.personality,
        history: trimHistory(state.conversationHistory),
        transcript: answer.trim(),
        interviewer_prompt: buildInterviewerPrompt(),
      })

      if (response.is_end && response.feedback) {
        setState((prev) => ({
          ...prev,
          status: "ended",
          score: response.feedback?.score ?? null,
          feedback: response.feedback ?? null,
          coachingHint: null,
          contextHint: null,
          responseQualityHint: response.response_quality_hint ?? null,
          answerScore: response.answer_score ?? null,
          answerFeedback: response.answer_feedback ?? null,
          phase: "wrap_up",
          questionType: "wrap_up",
          conversationHistory: trimHistory(outgoingHistory),
        }))
        return null
      }

      const nextQuestion = response.next_question || ""
      const spokenPrompt = buildSpokenReply(
        config.language,
        config.personality,
        nextQuestion,
        response.answer_score ?? null,
        response.answer_feedback ?? null,
      )
      const questionMessage: InterviewMessage = {
        role: "assistant",
        content: nextQuestion,
        timestamp: new Date().toISOString(),
      }
      setState((prev) => ({
        ...prev,
        status: "active",
        currentQuestion: nextQuestion,
        spokenPrompt,
        currentQuestionPreview: response.next_question_preview || "",
        questionIndex: response.question_index,
        coachingHint: response.coaching_hint ?? null,
        contextHint: response.context_hint ?? null,
        responseQualityHint: response.response_quality_hint ?? null,
        answerScore: response.answer_score ?? null,
        answerFeedback: response.answer_feedback ?? null,
        phase: response.phase ?? prev.phase,
        questionType: response.question_type ?? prev.questionType,
        conversationHistory: trimHistory([...outgoingHistory, questionMessage]),
      }))
      return nextQuestion
    } catch (error: any) {
      setState((prev) => ({
        ...prev,
        status: "error",
        error: error?.response?.data?.detail || "Unable to process your answer.",
      }))
      return null
    }
  }

  const endInterviewWithHistory = async (history: InterviewMessage[]) => {
    if (!state.sessionId) return
    setState((prev) => ({ ...prev, status: "loading", error: null }))
    try {
      const response = await aiInterviewService.submitAnswer({
        session_id: state.sessionId,
        language: config.language,
        role: config.role,
        experience_level: config.experienceLevel,
        interview_mode: config.interviewMode,
        personality: config.personality,
        history: trimHistory(history),
        transcript: "",
        force_end: true,
        interviewer_prompt: buildInterviewerPrompt(),
      })
      setState((prev) => ({
        ...prev,
        status: "ended",
        score: response.feedback?.score ?? null,
        feedback: response.feedback ?? null,
        coachingHint: null,
        contextHint: null,
        responseQualityHint: null,
        answerScore: null,
        answerFeedback: null,
        phase: "wrap_up",
        questionType: "wrap_up",
      }))
    } catch (error: any) {
      setState((prev) => ({
        ...prev,
        status: "error",
        error: error?.response?.data?.detail || "Unable to generate interview feedback.",
      }))
    }
  }

  const endInterview = async () => {
    await endInterviewWithHistory(state.conversationHistory)
  }

  const resetInterview = () => {
    setState(initialState)
  }

  return useMemo(
    () => ({
      ...state,
      startInterview,
      submitAnswer,
      endInterview,
      resetInterview,
    }),
    [state, config.language, config.role, config.experienceLevel, config.interviewMode, config.personality],
  )
}
