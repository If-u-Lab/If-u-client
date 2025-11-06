"use client"

import { createContext, useContext, type ReactNode } from "react"
import { useQuestions } from "@/hooks/use-questions"

type QuestionsContextType = ReturnType<typeof useQuestions>

const QuestionsContext = createContext<QuestionsContextType | undefined>(undefined)

export function QuestionsProvider({ children }: { children: ReactNode }) {
  const questionsState = useQuestions()

  return <QuestionsContext.Provider value={questionsState}>{children}</QuestionsContext.Provider>
}

export function useQuestionsContext() {
  const context = useContext(QuestionsContext)
  if (context === undefined) {
    throw new Error("useQuestionsContext must be used within a QuestionsProvider")
  }
  return context
}
