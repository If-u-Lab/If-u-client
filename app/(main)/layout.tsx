"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { HomeIcon, ListBulletIcon, UserIcon, ArrowPathIcon } from "@heroicons/react/24/outline"
import { useAuthContext } from "@/contexts/auth-context"
import { useEffect } from "react"

export default function MainLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const router = useRouter()
  const { isAuthenticated, isLoading } = useAuthContext()

  const isActive = (path: string) => {
    return pathname.startsWith(path)
  }

  // 인증 가드: 로그인하지 않은 사용자는 메인 페이지로 리다이렉트
  useEffect(() => {
    let isMounted = true

    if (!isLoading && !isAuthenticated && isMounted) {
      router.replace("/")
    }

    return () => {
      isMounted = false
    }
  }, [isLoading, isAuthenticated, router])

  // 로딩 중이거나, 아직 인증되지 않았다면 리다이렉트 되기 전까지 로딩 화면을 표시합니다.
  if (isLoading || !isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <ArrowPathIcon className="w-12 h-12 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <main className="pb-20 md:pb-24">{children}</main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 bg-background border-t border-border">
        <div className="max-w-2xl mx-auto flex items-center justify-around h-16 md:h-20">
          <Link
            href="/questions"
            className={`flex flex-col items-center justify-center gap-1 flex-1 h-full transition-colors active:opacity-70 ${
              isActive("/questions")
                ? "text-primary"
                : "text-muted-foreground"
            }`}
          >
            <ListBulletIcon className="w-6 h-6" />
            <span className="text-xs font-medium">질문</span>
          </Link>

          <Link
            href="/home"
            className={`flex flex-col items-center justify-center gap-1 flex-1 h-full transition-colors active:opacity-70 ${
              isActive("/home")
                ? "text-primary"
                : "text-muted-foreground"
            }`}
          >
            <HomeIcon className="w-6 h-6" />
            <span className="text-xs font-medium">홈</span>
          </Link>

          <Link
            href="/profile"
            className={`flex flex-col items-center justify-center gap-1 flex-1 h-full transition-colors active:opacity-70 ${
              isActive("/profile")
                ? "text-primary"
                : "text-muted-foreground"
            }`}
          >
            <UserIcon className="w-6 h-6" />
            <span className="text-xs font-medium">마이페이지</span>
          </Link>
        </div>
      </nav>
    </div>
  )
}
