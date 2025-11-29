"use client"

import { QuestionsProvider } from "@/contexts/questions-context"
import { AuthProvider } from "@/contexts/auth-context"

export function ClientProviders({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <QuestionsProvider>{children}</QuestionsProvider>
    </AuthProvider>
  )
}
