"use client"

import { Button } from "@/components/ui/button"
import { CheckCircle } from "lucide-react"

interface OnboardingCompleteProps {
  onFinish: () => void
}

export function OnboardingComplete({ onFinish }: OnboardingCompleteProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-green-100/50 flex flex-col items-center justify-center p-6">
      <div className="max-w-md w-full text-center space-y-6">
        <CheckCircle size={64} className="mx-auto text-green-600" />

        <div className="space-y-3">
          <h2 className="text-3xl font-bold text-foreground">준비가 되었습니다!</h2>
          <p className="text-muted-foreground">이제 매일의 질문으로 세상을 알아가며 다양한 관점을 만나보세요.</p>
        </div>

        <div className="bg-white rounded-lg border border-border p-4 space-y-2 text-left">
          <p className="text-sm font-medium text-foreground">준비된 기능:</p>
          <ul className="space-y-2">
            {["📊 오늘의 질문에 투표하기", "💬 커뮤니티와 토론하기", "📈 당신의 참여도 확인하기"].map((feature, i) => (
              <li key={i} className="text-sm text-muted-foreground flex items-center gap-2">
                <span className="text-primary">✓</span>
                {feature}
              </li>
            ))}
          </ul>
        </div>

        <Button
          onClick={onFinish}
          className="w-full h-12 bg-primary hover:bg-primary/90 text-white font-semibold text-lg"
        >
          시작하기
        </Button>
      </div>
    </div>
  )
}
