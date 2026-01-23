"use client"

import Image from "next/image"
import { Button } from "@/components/ui/button"

interface InitialLoginScreenProps {
  onStartOnboarding: () => void
}

export function InitialLoginScreen({ onStartOnboarding }: InitialLoginScreenProps) {
  return (
    <div className="min-h-screen bg-white flex flex-col px-6 pt-20 pb-12">
      {/* 상단 콘텐츠 */}
      <div className="flex-1 flex flex-col items-center justify-center w-full max-w-sm mx-auto">
        {/* 로고 */}
        <Image
          src="/ifu.png"
          alt="If u?"
          width={100}
          height={40}
          className="mb-10"
          priority
        />

        {/* 메인 카피 */}
        <h1 className="text-[24px] font-bold text-gray-900 leading-tight text-center tracking-tight">
          만약 이 상황에<br />
          <span className="text-primary">너라면</span>,<br />
          어떤 선택을 할까?
        </h1>

        {/* 설명 텍스트 */}
        <p className="text-gray-500 text-[14px] leading-relaxed text-center mt-4">
          논란의 순간, 당신의 선택은?<br />
          두 가지 의견 중 하나를 고르고,<br />
          투표와 댓글로 생각을 나누세요
        </p>
      </div>

      {/* 하단 CTA 영역 */}
      <div className="w-full max-w-sm mx-auto">
        <Button
          onClick={onStartOnboarding}
          className="w-full h-14 !bg-primary hover:!bg-primary/90 text-white active:scale-[0.98] font-semibold text-[16px] shadow-lg shadow-primary/20 transition-all rounded-2xl"
        >
          시작하기
        </Button>

        <p className="text-[12px] text-gray-400 text-center mt-4">
          시작하기를 누르면 이용약관 및 개인정보처리방침에 동의합니다
        </p>
      </div>
    </div>
  )
}
