"use client"

import { useState, useCallback } from "react"

export interface UserPreferences {
  interests: string[]
  language: "ko" | "en"
  notificationsEnabled: boolean
}

const categoryOptions = [
  { id: "tech", label: "기술", emoji: "💻" },
  { id: "work", label: "업무", emoji: "💼" },
  { id: "career", label: "커리어", emoji: "🚀" },
  { id: "education", label: "교육", emoji: "📚" },
  { id: "policy", label: "정책", emoji: "🏛️" },
  { id: "lifestyle", label: "라이프스타일", emoji: "🌟" },
  { id: "social", label: "사회", emoji: "🤝" },
  { id: "entertainment", label: "엔터테인먼트", emoji: "🎬" },
]

export function useOnboarding() {
  const [step, setStep] = useState<"initial" | "slides" | "login">("initial")
  const [preferences, setPreferences] = useState<UserPreferences>({
    interests: [],
    language: "ko",
    notificationsEnabled: true,
  })


  const proceed = useCallback(() => {
    if (step === "initial") {
      setStep("slides")
    } else if (step === "slides") {
      setStep("login")
    }
  }, [step])

  const goBack = useCallback(() => {
    if (step === "slides") {
      setStep("initial")
    } else if (step === "login") {
      setStep("slides")
    }
  }, [step])

  const skip = useCallback(() => {
    setStep("login")
  }, [])

  return {
    step,
    preferences,
    proceed,
    goBack,
    skip,
  }
}
