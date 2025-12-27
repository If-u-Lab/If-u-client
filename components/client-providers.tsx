"use client"

import { QuestionsProvider } from "@/contexts/questions-context"
import { AuthProvider } from "@/contexts/auth-context"
import { Toaster } from "sonner"

export function ClientProviders({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <QuestionsProvider>
        {children}
        <Toaster position="bottom-center" richColors />
      </QuestionsProvider>
    </AuthProvider>
  )
}
