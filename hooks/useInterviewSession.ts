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

function buildFallbackNextQuestion(
  language: InterviewLanguage,
  role: string,
  mode: InterviewMode,
  latestAnswer?: string,
  turnIndex = 1,
) {
  const answer = (latestAnswer || "").trim()
  const compact = answer.split(/\s+/).slice(0, 8).join(" ")
  const stage = turnIndex % 4

  if (language === "hi") {
    if (mode === "technical" && stage === 0) {
      return `${role} role में आपने हाल ही में कौन-सा practical technical task किया और result क्या रहा?`
    }
    if (stage === 1) {
      return `आपने "${compact || "अपने अनुभव"}" बताया। अब STAR format में explain करें: situation, action, result.`
    }
    if (stage === 2) {
      return "अच्छा। अब बताइए उस काम में सबसे बड़ा challenge क्या था और आपने उसे कैसे solve किया?"
    }
    if (stage === 3) {
      return "टीम के साथ काम करते समय आपने communication कैसे manage किया? एक real example दीजिए।"
    }
    return "बहुत बढ़िया। अब एक measurable outcome बताइए जिससे impact clear हो।"
  }
  if (mode === "technical" && stage === 0) {
    return `For the ${role} role, describe one recent technical task you solved and the measurable outcome.`
  }
  if (stage === 1) {
    return `You mentioned "${compact || "your background"}". Reframe it in STAR format: situation, action, and result.`
  }
  if (stage === 2) {
    return "What was the hardest challenge in that experience, and what exact steps did you take to resolve it?"
  }
  if (stage === 3) {
    return "How did you communicate with your team/stakeholders during that work? Give one real example."
  }
  return "Good answer. Add one quantifiable impact (time saved, accuracy improved, cost reduced, etc.)."
}

function sanitizeNextQuestion(
  nextQuestion: string | null | undefined,
  language: InterviewLanguage,
  role: string,
  mode: InterviewMode,
  latestAnswer?: string,
  turnIndex = 1,
) {
  const cleaned = String(nextQuestion || "").trim()
  if (!cleaned) return buildFallbackNextQuestion(language, role, mode, latestAnswer, turnIndex)
  return cleaned
}

function buildLocalInterviewFallbackFeedback(language: InterviewLanguage): InterviewFeedback {
  const hindi = language === "hi"
  return {
    score: 68,
    overall_score: 68,
    communication: 70,
    confidence: 66,
    technical: 67,
    problem_solving: 66,
    communication_avg: 6.9,
    technical_avg: 6.7,
    confidence_avg: 6.6,
    emotional_state: "balanced",
    strengths: hindi
      ? ["स्पष्ट बोलने का प्रयास", "संवाद जारी रखने की क्षमता"]
      : ["Consistent speaking effort", "Good conversational continuity"],
    weaknesses: hindi
      ? ["कुछ उत्तर छोटे रहे", "उदाहरण और ठोस हो सकते हैं"]
      : ["Some answers were short", "Examples can be more concrete"],
    suggestions: hindi
      ? ["STAR format में जवाब दें", "हर उत्तर में एक उदाहरण दें", "छोटे और structured points बोलें"]
      : ["Use STAR format", "Add one concrete example per answer", "Keep answers short and structured"],
    timeline: [62, 64, 66, 67, 68],
    improvement_areas: hindi ? ["उत्तर की गहराई", "तकनीकी स्पष्टता"] : ["Answer depth", "Technical clarity"],
    learning_path: hindi
      ? ["रोज 15 मिनट mock interview practice", "Role-specific scenario drills"]
      : ["Daily 15-minute mock interview practice", "Role-specific scenario drills"],
    performance_personality: hindi ? "विकसित हो रहा कम्युनिकेटर" : "Emerging Structured Communicator",
    key_strength_summary: hindi
      ? "आपने वार्तालाप में निरंतरता रखी और जवाब देने की कोशिश की।"
      : "You maintained good interview continuity and attempted each response.",
    top_priorities: hindi ? ["उदाहरण-आधारित जवाब", "स्पष्ट संरचना", "आत्मविश्वास"] : ["Example-driven answers", "Clear structure", "Confidence"],
  }
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

  const submitAnswer = async (answer: string): Promise<{ nextQuestion: string | null; isEnd: boolean }> => {
    if (!state.sessionId || !answer.trim()) {
      return { nextQuestion: null, isEnd: false }
    }
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
        return { nextQuestion: null, isEnd: true }
      }

      const nextQuestion = sanitizeNextQuestion(
        response.next_question,
        config.language,
        config.role,
        config.interviewMode,
        answer.trim(),
        outgoingHistory.filter((item) => item.role === "user").length,
      )
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
      return { nextQuestion, isEnd: false }
    } catch (error: any) {
      const fallbackQuestion = buildFallbackNextQuestion(
        config.language,
        config.role,
        config.interviewMode,
        answer.trim(),
        outgoingHistory.filter((item) => item.role === "user").length,
      )
      const questionMessage: InterviewMessage = {
        role: "assistant",
        content: fallbackQuestion,
        timestamp: new Date().toISOString(),
      }
      setState((prev) => ({
        ...prev,
        status: "active",
        currentQuestion: fallbackQuestion,
        spokenPrompt: fallbackQuestion,
        currentQuestionPreview: fallbackQuestion,
        questionIndex: Math.max(prev.questionIndex + 1, 2),
        phase: prev.phase,
        questionType: "follow_up",
        conversationHistory: trimHistory([...outgoingHistory, questionMessage]),
        error: error?.response?.data?.detail || "AI provider unavailable, continuing in fallback mode.",
      }))
      return { nextQuestion: fallbackQuestion, isEnd: false }
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
      const fallbackFeedback = buildLocalInterviewFallbackFeedback(config.language)
      setState((prev) => ({
        ...prev,
        status: "ended",
        score: fallbackFeedback.score,
        feedback: fallbackFeedback,
        phase: "wrap_up",
        questionType: "wrap_up",
        error: error?.response?.data?.detail || "Interview ended with local fallback feedback.",
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
