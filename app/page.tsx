"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { LoadingScreen } from "@/components/loading-screen"
import { LoginPage } from "@/components/login-page"
import { useAuthContext } from "@/contexts/auth-context"

export default function RootPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const { isAuthenticated, isLoading: authLoading } = useAuthContext()

  useEffect(() => {
    // 인증 로딩이 완료될 때까지 대기
    if (authLoading) {
      return
    }

    // 로그인되어 있으면 바로 홈으로 이동
    if (isAuthenticated) {
      router.replace("/home")
      return
    }

    // 로그인되어 있지 않으면 온보딩 표시
    setIsLoading(false)
  }, [authLoading, isAuthenticated, router])

  const handleLoginSuccess = () => {
    // 로그인 성공 시 처리는 AuthContext에서 담당
    // 여기서는 아무것도 하지 않아도 됨
  }

  if (isLoading || authLoading) {
    return <LoadingScreen />
  }

  return <LoginPage onLoginSuccess={handleLoginSuccess} />
}
