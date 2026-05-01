import { NextRequest, NextResponse } from "next/server"

type VoiceMessage = {
  role: "assistant" | "user"
  content: string
}

function buildFallbackReply(answer: string, language: string) {
  if (language === "hi-IN") {
    return `अच्छा जवाब। "${answer}" के संदर्भ में कोई वास्तविक उदाहरण साझा कर सकते हैं?`
  }
  return `Thanks for sharing. Based on "${answer}", can you walk me through a real example?`
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as {
      answer?: string
      history?: VoiceMessage[]
      language?: "en-US" | "hi-IN"
    }
    const answer = String(body?.answer || "").trim()
    const history = Array.isArray(body?.history) ? body.history : []
    const language = body?.language === "hi-IN" ? "hi-IN" : "en-US"

    if (!answer) {
      return NextResponse.json({ reply: language === "hi-IN" ? "कृपया अपना उत्तर दोबारा बोलें।" : "Please repeat your answer." }, { status: 400 })
    }

    const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000"
    const nextEndpoint = `${apiBase}/api/v1/interview-session/next`

    try {
      const upstream = await fetch(nextEndpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(request.headers.get("authorization") ? { Authorization: request.headers.get("authorization") as string } : {}),
        },
        body: JSON.stringify({
          session_id: "voice-local-session",
          language: language === "hi-IN" ? "hi" : "en",
          role: "General Professional",
          experience_level: "fresher",
          interview_mode: "hr",
          personality: "friendly_mentor",
          history: history.map((item) => ({
            role: item.role,
            content: item.content,
            timestamp: new Date().toISOString(),
          })),
          transcript: answer,
          interviewer_prompt:
            "You are an AI career evaluator. In addition to scoring each answer, classify communication, technical knowledge, and confidence. At the end, generate a structured performance report with strengths, weaknesses, and actionable improvements. For each user answer: 1. Give a score out of 10 2. Provide 1-line constructive feedback 3. Ask the next relevant question. Keep responses short and conversational.",
        }),
      })

      if (upstream.ok) {
        const data = (await upstream.json()) as { next_question?: string | null }
        const reply = String(data?.next_question || "").trim()
        if (reply) return NextResponse.json({ reply })
      }
    } catch {
      // Fall back to local deterministic prompt when upstream is unavailable.
    }

    return NextResponse.json({ reply: buildFallbackReply(answer, language) })
  } catch {
    return NextResponse.json({ reply: "I didn't catch that, please repeat." }, { status: 500 })
  }
}
