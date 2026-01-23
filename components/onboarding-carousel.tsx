"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { ChevronLeftIcon, ChevronRightIcon, CheckBadgeIcon, ChatBubbleBottomCenterTextIcon, ChartBarIcon } from "@heroicons/react/24/outline"

interface OnboardingCarouselProps {
  onComplete: () => void
}

const slides = [
  {
    title: "매일, 하나의 질문",
    description: "친구와의 갈등, 연애 고민, 진로 선택까지\n일상의 모든 순간, 너라면 어떻게 할지\n투표하고 다른 사람들의 선택을 확인하세요",
    icon: CheckBadgeIcon,
  },
  {
    title: "생각을 나누는 공간",
    description: "투표만으로는 부족하다면\n댓글로 내 이유를 말해보세요\n비슷한 고민을 한 사람들과 함께 이야기 나눠요",
    icon: ChatBubbleBottomCenterTextIcon,
  },
  {
    title: "나만의 선택 기록",
    description: "내가 어떤 선택을 해왔는지\n다른 사람들은 어떻게 생각했는지\n통계로 확인하고 나를 더 잘 이해해보세요",
    icon: ChartBarIcon,
  },
]

export function OnboardingCarousel({ onComplete }: OnboardingCarouselProps) {
  const [currentSlide, setCurrentSlide] = useState(0)

  const handleNext = () => {
    if (currentSlide < slides.length - 1) {
      setCurrentSlide(currentSlide + 1)
    } else {
      onComplete()
    }
  }

  const handlePrev = () => {
    if (currentSlide > 0) {
      setCurrentSlide(currentSlide - 1)
    }
  }

  const slide = slides[currentSlide]
  const IconComponent = slide.icon

  return (
    <div className="min-h-screen bg-white flex flex-col px-6 pt-20 pb-12">
      {/* 상단 콘텐츠 */}
      <div className="flex-1 flex flex-col items-center justify-center w-full max-w-sm mx-auto">
        {/* 아이콘 */}
        <div className="w-20 h-20 bg-primary/10 rounded-3xl flex items-center justify-center mb-10">
          <IconComponent className="w-10 h-10 text-primary" />
        </div>

        {/* 타이틀 */}
        <h2 className="text-2xl font-bold text-gray-900 leading-tight text-center">
          {slide.title}
        </h2>

        {/* 설명 */}
        <p className="text-gray-500 text-[14px] leading-loose text-center whitespace-pre-line mt-5">
          {slide.description}
        </p>

        {/* Progress indicators */}
        <div className="flex justify-center gap-2 mt-10">
          {slides.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrentSlide(i)}
              className={`h-2 rounded-full transition-all duration-300 ${
                i === currentSlide ? "w-8 bg-primary" : "w-2 bg-gray-200"
              }`}
              aria-label={`Go to slide ${i + 1}`}
            />
          ))}
        </div>
      </div>

      {/* 하단 버튼 영역 */}
      <div className="w-full max-w-sm mx-auto space-y-3">
        <div className="flex gap-3">
          {currentSlide > 0 && (
            <Button
              onClick={handlePrev}
              variant="outline"
              className="flex-1 h-14 flex items-center justify-center gap-2 font-semibold text-[16px] border-2 border-gray-200 rounded-2xl bg-white"
            >
              <ChevronLeftIcon className="w-5 h-5" />
              이전
            </Button>
          )}
          <Button
            onClick={handleNext}
            className="flex-1 h-14 !bg-primary hover:!bg-primary/90 text-white active:scale-[0.98] font-semibold text-[16px] flex items-center justify-center gap-2 transition-all shadow-lg shadow-primary/20 rounded-2xl"
          >
            {currentSlide === slides.length - 1 ? "시작하기" : "다음"}
            <ChevronRightIcon className="w-5 h-5" />
          </Button>
        </div>

        {/* 건너뛰기 */}
        <button
          onClick={onComplete}
          className="w-full text-[14px] text-gray-400 active:text-gray-600 transition-colors py-3"
        >
          건너뛰기
        </button>
      </div>
    </div>
  )
}
