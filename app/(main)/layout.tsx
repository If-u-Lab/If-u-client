"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Home, ListIcon, User } from "lucide-react"

export default function MainLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()

  const isActive = (path: string) => {
    return pathname.startsWith(path)
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
            <ListIcon size={24} />
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
            <Home size={24} />
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
            <User size={24} />
            <span className="text-xs font-medium">마이페이지</span>
          </Link>
        </div>
      </nav>
    </div>
  )
}
