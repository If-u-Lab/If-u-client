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
    gradient: "from-primary/5 via-primary/10 to-primary/5",
  },
  {
    title: "생각을 나누는 공간",
    description: "투표만으로는 부족하다면\n댓글로 내 이유를 말해보세요\n비슷한 고민을 한 사람들과 함께 이야기 나눠요",
    icon: ChatBubbleBottomCenterTextIcon,
    gradient: "from-primary/5 via-primary/10 to-primary/5",
  },
  {
    title: "나만의 선택 기록",
    description: "내가 어떤 선택을 해왔는지\n다른 사람들은 어떻게 생각했는지\n통계로 확인하고 나를 더 잘 이해해보세요",
    icon: ChartBarIcon,
    gradient: "from-primary/5 via-primary/10 to-primary/5",
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
    <div className={`min-h-screen flex flex-col items-center justify-center bg-gradient-to-br ${slide.gradient} p-6 transition-all duration-700 ease-out`}>
      <div className="text-center space-y-8 w-full max-w-md">
        {/* 아이콘 */}
        <div className="flex justify-center">
          <IconComponent className="w-16 h-16 text-primary" />
        </div>

        {/* 콘텐츠 */}
        <div className="space-y-4 px-2">
          <h2 className="text-2xl font-bold text-foreground whitespace-pre-line leading-tight">
            {slide.title}
          </h2>
          <p className="text-sm text-muted-foreground whitespace-pre-line leading-relaxed">
            {slide.description}
          </p>
        </div>

        {/* Progress indicators */}
        <div className="flex justify-center gap-2 pt-4">
          {slides.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrentSlide(i)}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                i === currentSlide ? "w-8 bg-foreground" : "w-1.5 bg-foreground/20"
              }`}
              aria-label={`Go to slide ${i + 1}`}
            />
          ))}
        </div>

        {/* Navigation buttons */}
        <div className="flex gap-3 pt-6">
          {currentSlide > 0 && (
            <Button
              onClick={handlePrev}
              variant="outline"
              className="flex-1 h-12 flex items-center justify-center gap-2 font-medium border-2"
            >
              <ChevronLeftIcon className="w-5 h-5" />
              이전
            </Button>
          )}
          <Button
            onClick={handleNext}
            className="flex-1 h-12 bg-foreground active:scale-95 text-background font-bold flex items-center justify-center gap-2 transition-transform shadow-lg"
          >
            {currentSlide === slides.length - 1 ? "시작하기" : "다음"}
            <ChevronRightIcon className="w-5 h-5" />
          </Button>
        </div>

        {/* Skip button */}
        <button
          onClick={onComplete}
          className="text-sm text-muted-foreground active:text-foreground transition-colors p-2 font-medium"
        >
          건너뛰기
        </button>
      </div>
    </div>
  )
}
