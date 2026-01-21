"use client"

import { Button } from "@/components/ui/button"

interface InitialLoginScreenProps {
  onStartOnboarding: () => void
}

export function InitialLoginScreen({ onStartOnboarding }: InitialLoginScreenProps) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-[oklch(0.55_0.22_264)] via-[oklch(0.51_0.24_266)] to-[oklch(0.47_0.26_268)] flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* 배경 패턴 */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-20 left-10 w-40 h-40 bg-white rounded-full blur-3xl" />
        <div className="absolute bottom-32 right-10 w-48 h-48 bg-white rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-white/30 rounded-full blur-3xl" />
      </div>

      <div className="text-center space-y-12 max-w-sm relative z-10">
        {/* 로고 & 타이틀 */}
        <div className="space-y-6">
          <div className="inline-block">
            <h1 className="text-6xl font-black text-white tracking-tighter mb-2">
              If U?
            </h1>
            <div className="h-1 bg-white/40 rounded-full" />
          </div>
          <p className="text-lg text-white font-medium tracking-wide">
            너라면 어떻게 할래?
          </p>
        </div>

        {/* 설명 */}
        <div className="space-y-3">
          <p className="text-white/90 text-base leading-relaxed">
            매일 하나의 선택
          </p>
          <p className="text-white/75 text-sm leading-relaxed px-4">
            수많은 사람들과 함께 고민하고<br />
            투표하고, 의견을 나눠보세요
          </p>
        </div>

        {/* CTA */}
        <div className="pt-4">
          <Button
            onClick={onStartOnboarding}
            className="w-full h-14 bg-white text-primary hover:!bg-white/90 active:scale-95 font-bold text-lg shadow-2xl shadow-black/20 transition-all"
          >
            시작하기
          </Button>
        </div>

        <p className="text-xs text-white/90 px-6 leading-relaxed -mt-7">
          서비스 이용약관 및 개인정보 처리방침에 동의합니다
        </p>
      </div>
    </div>
  )
}
