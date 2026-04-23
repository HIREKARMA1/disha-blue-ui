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
  currentQuestionPreview: string
  questionIndex: number
  maxQuestions: number
  score: number | null
  feedback: InterviewFeedback | null
  coachingHint: string | null
  contextHint: string | null
  responseQualityHint: string | null
  phase: InterviewPhase
  questionType: InterviewQuestionType
  error: string | null
}

const initialState: SessionState = {
  sessionId: null,
  status: "idle",
  conversationHistory: [],
  currentQuestion: "",
  currentQuestionPreview: "",
  questionIndex: 0,
  maxQuestions: 5,
  score: null,
  feedback: null,
  coachingHint: null,
  contextHint: null,
  responseQualityHint: null,
  phase: "introduction",
  questionType: "intro",
  error: null,
}

interface SessionConfig {
  language: InterviewLanguage
  role: string
  experienceLevel: ExperienceLevel
  interviewMode: InterviewMode
  personality: InterviewPersonality
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
        currentQuestionPreview: response.next_question_preview || "",
        questionIndex: 1,
        maxQuestions: 7,
        score: null,
        feedback: null,
        coachingHint: response.coaching_hint ?? null,
        contextHint: response.context_hint ?? null,
        responseQualityHint: response.response_quality_hint ?? null,
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
    const outgoingHistory = [...state.conversationHistory, userMessage]
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
        history: state.conversationHistory,
        transcript: answer.trim(),
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
          phase: "wrap_up",
          questionType: "wrap_up",
          conversationHistory: outgoingHistory,
        }))
        return null
      }

      const nextQuestion = response.next_question || ""
      const questionMessage: InterviewMessage = {
        role: "assistant",
        content: nextQuestion,
        timestamp: new Date().toISOString(),
      }
      setState((prev) => ({
        ...prev,
        status: "active",
        currentQuestion: nextQuestion,
        currentQuestionPreview: response.next_question_preview || "",
        questionIndex: response.question_index,
        coachingHint: response.coaching_hint ?? null,
        contextHint: response.context_hint ?? null,
        responseQualityHint: response.response_quality_hint ?? null,
        phase: response.phase ?? prev.phase,
        questionType: response.question_type ?? prev.questionType,
        conversationHistory: [...outgoingHistory, questionMessage],
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
        history,
        transcript: "",
        force_end: true,
      })
      setState((prev) => ({
        ...prev,
        status: "ended",
        score: response.feedback?.score ?? null,
        feedback: response.feedback ?? null,
        coachingHint: null,
        contextHint: null,
        responseQualityHint: null,
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
