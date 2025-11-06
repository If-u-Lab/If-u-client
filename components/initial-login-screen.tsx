"use client"

import { Button } from "@/components/ui/button"

interface InitialLoginScreenProps {
  onStartOnboarding: () => void
}

export function InitialLoginScreen({ onStartOnboarding }: InitialLoginScreenProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 to-blue-500 flex flex-col items-center justify-center p-6">
      <div className="text-center space-y-8 max-w-md">
        <div className="space-y-4">
          <h1 className="text-5xl font-bold text-white">If U?</h1>
          <p className="text-lg text-blue-100">이 상황에 너라면?</p>
        </div>

        <p className="text-blue-50 text-base leading-relaxed">
          매일 새로운 질문에 투표하고, 다른 사람들의 의견을 나누는 커뮤니티
        </p>

        <div className="space-y-3 pt-6">
          <Button
            onClick={onStartOnboarding}
            className="w-full h-12 bg-white text-blue-600 hover:bg-blue-50 font-semibold text-base"
          >
            시작하기
          </Button>

          <button className="w-full h-12 border-2 border-white text-white rounded-lg hover:bg-white/10 font-semibold transition-colors">
            Google로 계속하기
          </button>
        </div>

        <p className="text-xs text-blue-200">
          계속 진행하면 If U? 서비스 이용약관 및 개인정보 처리방침에 동의하는 것으로 간주됩니다
        </p>
      </div>
    </div>
  )
}
