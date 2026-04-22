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

let voiceCache: { hi: SpeechSynthesisVoice | null; en: SpeechSynthesisVoice | null } | null = null
let voicesListenerAttached = false

function attachVoicesListener(synth: SpeechSynthesis) {
  if (voicesListenerAttached) return
  voicesListenerAttached = true
  synth.addEventListener("voiceschanged", () => {
    voiceCache = null
  })
}

function resolveVoices(synth: SpeechSynthesis): { hi: SpeechSynthesisVoice | null; en: SpeechSynthesisVoice | null } {
  if (voiceCache) return voiceCache
  const voices = synth.getVoices()
  const hi =
    voices.find((v) => v.lang.toLowerCase().includes("hi-in")) ||
    voices.find((v) => v.lang.toLowerCase().includes("hi")) ||
    null
  const en =
    voices.find((v) => v.lang.toLowerCase().includes("en-in")) ||
    voices.find((v) => v.lang.toLowerCase().includes("en-us")) ||
    voices.find((v) => v.lang.toLowerCase().includes("en")) ||
    null
  voiceCache = { hi, en }
  return voiceCache
}

async function translateToHindiForSpeech(text: string): Promise<string> {
  const source = (text || "").trim()
  if (!source) return ""
  if (/[\u0900-\u097F]/.test(source)) return source
  try {
    const response = await apiClient.client.post("/onboarding/translate-text", {
      text: source,
      target_language: "hi",
    })
    const out = String(response.data?.translated_text || "").trim()
    if (!out) {
      console.error("Hindi TTS: translate API returned empty Hindi text.")
      return source
    }
    return out
  } catch (err) {
    console.error("Hindi TTS: translate API failed:", err)
    return source
  }
}

async function translateForSpeech(text: string, targetLang: "en" | "hi"): Promise<string> {
  const source = (text || "").trim()
  if (!source || targetLang === "en") return source
  if (/[\u0900-\u097F]/.test(source)) return source
  if (hindiPrompts[source]) return hindiPrompts[source]
  return translateToHindiForSpeech(source)
}

export async function speakText(text: string, lang?: "en" | "hi") {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) {
    console.error("TTS: speechSynthesis is not available in this environment.")
    return
  }
  const selectedLang = lang || getSignupLanguage()
  const synth = window.speechSynthesis
  attachVoicesListener(synth)

  let voices = synth.getVoices()
  if (voices.length === 0) {
    await new Promise<void>((resolve) => {
      const onReady = () => {
        synth.removeEventListener("voiceschanged", onReady)
        voiceCache = null
        resolve()
      }
      synth.addEventListener("voiceschanged", onReady)
      window.setTimeout(() => {
        synth.removeEventListener("voiceschanged", onReady)
        voiceCache = null
        resolve()
      }, 2500)
    })
    voices = synth.getVoices()
  }

  if (voices.length === 0) {
    console.error("TTS: No speech voices loaded after waiting; cannot speak.")
    return
  }

  let textForUtterance = await translateForSpeech(text, selectedLang)

  const { hi, en } = resolveVoices(synth)
  let voice: SpeechSynthesisVoice | undefined

  if (selectedLang === "hi") {
    voice = hi || undefined
    if (!voice) {
      console.warn("Hindi TTS: no hi-IN / Hindi SpeechSynthesis voice found.")
      if (!/[\u0900-\u097F]/.test(textForUtterance)) {
        textForUtterance = await translateToHindiForSpeech(text)
      }
      if (!/[\u0900-\u097F]/.test(textForUtterance)) {
        console.error("Hindi TTS: text is still not Hindi script; browser fallback may sound wrong.")
      }
    }
  } else {
    voice = en || undefined
  }

  const utterance = new SpeechSynthesisUtterance(textForUtterance || text)
  utterance.lang = selectedLang === "hi" ? "hi-IN" : "en-IN"
  utterance.voice = voice || null
  utterance.onerror = (ev) => {
    console.error("TTS: SpeechSynthesisUtterance error:", ev?.error || ev)
  }
  synth.cancel()
  synth.speak(utterance)
}
