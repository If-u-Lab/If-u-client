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
    let isMounted = true
    let timeoutId: NodeJS.Timeout | null = null

    const handleCallback = async () => {
      if (!access_token) {
        if (isMounted) {
          setError("로그인에 실패했습니다. 토큰이 없습니다.")
        }
        timeoutId = setTimeout(() => {
          if (isMounted) router.push("/")
        }, 2000)
        return
      }

      try {
        await login(access_token)
        if (isMounted) {
          router.push("/home")
        }
      } catch (err) {
        console.error("로그인 처리 실패:", err)
        if (isMounted) {
          setError("로그인 처리 중 오류가 발생했습니다.")
        }
        timeoutId = setTimeout(() => {
          if (isMounted) router.push("/")
        }, 2000)
      }
    }

    handleCallback()

    // cleanup: 컴포넌트 언마운트 시 타이머 정리 및 상태 업데이트 방지
    return () => {
      isMounted = false
      if (timeoutId) {
        clearTimeout(timeoutId)
      }
    }
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