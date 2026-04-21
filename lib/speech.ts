"use client"

import { apiClient } from "@/lib/api"
import { getSignupLanguage } from "@/components/signup/LanguageSwitcher"

const hindiPrompts: Record<string, string> = {
  "You can speak your name": "आप अपना नाम बोल सकते हैं",
  "You can speak your skills": "आप अपने कौशल बता सकते हैं",
  "You can speak in Hindi or English": "आप हिंदी या अंग्रेजी में बोल सकते हैं",
  "You can speak or type your name": "आप अपना नाम बोल सकते हैं या टाइप कर सकते हैं",
  "You can speak your education details": "आप अपनी शिक्षा की जानकारी बोल सकते हैं",
  "Speak your skills like electrician, helper, or driver": "आप अपने कौशल बोल सकते हैं जैसे इलेक्ट्रीशियन, हेल्पर या ड्राइवर",
  "Share your work experience to improve job matching": "जॉब मैचिंग बेहतर करने के लिए अपना काम का अनुभव बताएं",
}

async function translateForSpeech(text: string, targetLang: "en" | "hi"): Promise<string> {
  const source = (text || "").trim()
  if (!source || targetLang === "en") return source
  // If text is already Hindi, speak it directly.
  if (/[\u0900-\u097F]/.test(source)) return source
  // Fast path for common onboarding prompts to avoid network latency.
  if (hindiPrompts[source]) return hindiPrompts[source]
  try {
    const response = await apiClient.client.post("/onboarding/translate-text", {
      text: source,
      target_language: "hi",
    })
    return String(response.data?.translated_text || source).trim()
  } catch {
    return source
  }
}

export async function speakText(text: string, lang?: "en" | "hi") {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return
  const selectedLang = lang || getSignupLanguage()
  const translated = await translateForSpeech(text, selectedLang)
  const utterance = new SpeechSynthesisUtterance(translated || text)
  const synth = window.speechSynthesis
  const voices = synth.getVoices()

  if (voices.length === 0) {
    synth.onvoiceschanged = () => {
      synth.onvoiceschanged = null
      void speakText(text, selectedLang)
    }
    return
  }

  let voice: SpeechSynthesisVoice | undefined
  if (selectedLang === "hi") {
    voice =
      voices.find((v) => v.lang.toLowerCase().includes("hi-in")) ||
      voices.find((v) => v.lang.toLowerCase().includes("hi"))
  } else {
    voice =
      voices.find((v) => v.lang.toLowerCase().includes("en-in")) ||
      voices.find((v) => v.lang.toLowerCase().includes("en-us")) ||
      voices.find((v) => v.lang.toLowerCase().includes("en"))
  }

  utterance.lang = selectedLang === "hi" ? "hi-IN" : "en-IN"
  utterance.voice = voice || null
  synth.cancel()
  synth.speak(utterance)
}
