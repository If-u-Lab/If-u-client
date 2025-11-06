"use client"

import { QuestionsProvider } from "@/contexts/questions-context"

export function ClientProviders({ children }: { children: React.ReactNode }) {
  return <QuestionsProvider>{children}</QuestionsProvider>
}
