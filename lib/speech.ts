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

export async function speakText(text: string) {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return
  const selectedLang = getSignupLanguage()
  const translated = await translateForSpeech(text, selectedLang)
  const utterance = new SpeechSynthesisUtterance(translated || text)
  const voices = window.speechSynthesis.getVoices()
  const hiVoice = voices.find((voice) => voice.lang.toLowerCase().startsWith("hi"))

  if (selectedLang === "hi" && hiVoice) {
    utterance.lang = "hi-IN"
    utterance.voice = hiVoice
  } else {
    utterance.lang = "en-IN"
  }
  window.speechSynthesis.cancel()
  window.speechSynthesis.speak(utterance)
}
