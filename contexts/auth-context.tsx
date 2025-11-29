"use client"

import { createContext, useContext } from "react"
import { useAuth } from "@/hooks/use-auth"
import type { User } from "@/lib/auth-api"

interface AuthContextType {
  user: User | null
  isLoading: boolean
  isAuthenticated: boolean
  accessToken: string | null
  login: (token: string) => Promise<void>
  logout: () => Promise<void>
  deleteAccount: () => Promise<void>
  refreshToken: () => Promise<string>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const authState = useAuth()

  return <AuthContext.Provider value={authState}>{children}</AuthContext.Provider>
}

export function useAuthContext() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuthContext must be used within AuthProvider")
  }
  return context
}