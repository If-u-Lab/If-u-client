"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { LoadingScreen } from "@/components/loading-screen"
import { LoginPage } from "@/components/login-page"

export default function RootPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Check if user has completed onboarding
    const checkAuth = () => {
      if (typeof window !== "undefined") {
        const hasCompletedOnboarding = localStorage.getItem("onboarding_completed") === "true"
        if (hasCompletedOnboarding) {
          // Redirect to home page
          router.replace("/home")
          return
        }
      }
      setIsLoading(false)
    }

    const timer = setTimeout(checkAuth, 100)
    return () => clearTimeout(timer)
  }, [router])

  const handleLoginSuccess = () => {
    if (typeof window !== "undefined") {
      localStorage.setItem("onboarding_completed", "true")
    }
    // Redirect to home page after onboarding
    router.push("/home")
  }

  if (isLoading) {
    return <LoadingScreen />
  }

  return <LoginPage onLoginSuccess={handleLoginSuccess} />
}
