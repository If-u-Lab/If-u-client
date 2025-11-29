"use client"

import { use, useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuthContext } from "@/contexts/auth-context"
import { ArrowPathIcon, XCircleIcon } from "@heroicons/react/24/outline"

export default function AuthCallbackPage({
  searchParams,
}: {
  searchParams: Promise<{ access_token?: string }>
}) {
  const { access_token } = use(searchParams)
  const router = useRouter()
  const { login } = useAuthContext()
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const handleCallback = async () => {
      if (!access_token) {
        setError("로그인에 실패했습니다. 토큰이 없습니다.")
        setTimeout(() => router.push("/"), 2000)
        return
      }

      try {
        await login(access_token)
        // 온보딩 완료 상태로 설정
        localStorage.setItem("onboarding_completed", "true")
        router.push("/home")
      } catch (err) {
        console.error("로그인 처리 실패:", err)
        setError("로그인 처리 중 오류가 발생했습니다.")
        setTimeout(() => router.push("/"), 2000)
      }
    }

    handleCallback()
  }, [access_token, login, router])

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center space-y-4">
        {error ? (
          <>
            <div className="flex justify-center">
              <XCircleIcon className="w-16 h-16 text-destructive" />
            </div>
            <p className="text-foreground/80">{error}</p>
            <p className="text-sm text-muted-foreground">잠시 후 로그인 페이지로 이동합니다...</p>
          </>
        ) : (
          <>
            <div className="flex justify-center">
              <ArrowPathIcon className="w-12 h-12 animate-spin text-primary" />
            </div>
            <p className="text-foreground/80">로그인 중...</p>
          </>
        )}
      </div>
    </div>
  )
}