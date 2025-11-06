"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight } from "lucide-react"

interface OnboardingCarouselProps {
  onComplete: () => void
}

const slides = [
  {
    title: "논쟁할수록\n명확해지는 생각",
    description: "매일 새로운 질문에 답하며\n나의 생각을 정리하고\n다른 사람들의 의견을 들어보세요",
    icon: "🗳️",
    color: "from-blue-50 to-blue-100/50",
  },
  {
    title: "토론으로 배우는\n새로운 관점",
    description: "댓글과 대댓글로\n함께하는 토론을 나누고\n다양한 시각을 경험하세요",
    icon: "💬",
    color: "from-purple-50 to-purple-100/50",
  },
  {
    title: "우리로 확인하는\n다수의 선택",
    description: "실시간 투표 결과로\n사회의 다양한 의견을 한눈에\n파악할 수 있습니다",
    icon: "📊",
    color: "from-green-50 to-green-100/50",
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

  return (
    <div
      className={`min-h-screen flex flex-col items-center justify-center bg-gradient-to-br ${slide.color} p-6 transition-all duration-500`}
    >
      <div className="text-center space-y-8 w-full max-w-md">
        <div className="text-7xl animate-bounce">{slide.icon}</div>

        <div className="space-y-4">
          <h2 className="text-2xl md:text-3xl font-bold text-foreground whitespace-pre-line text-balance">{slide.title}</h2>
          <p className="text-base text-muted-foreground whitespace-pre-line leading-relaxed">{slide.description}</p>
        </div>

        {/* Progress indicators */}
        <div className="flex justify-center gap-2 pt-4">
          {slides.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrentSlide(i)}
              className={`h-2 rounded-full transition-all ${
                i === currentSlide ? "w-6 bg-primary" : "w-2 bg-muted hover:bg-muted/60"
              }`}
              aria-label={`Go to slide ${i + 1}`}
            />
          ))}
        </div>

        {/* Navigation buttons */}
        <div className="flex gap-2 pt-6">
          {currentSlide > 0 && (
            <Button onClick={handlePrev} variant="outline" className="flex-1 h-12 bg-transparent flex items-center justify-center gap-2">
              <ChevronLeft size={20} />
              이전
            </Button>
          )}
          <Button onClick={handleNext} className="flex-1 h-12 bg-primary hover:bg-primary/90 text-white font-semibold flex items-center justify-center gap-2">
            {currentSlide === slides.length - 1 ? "다음" : "다음"}
            <ChevronRight size={20} />
          </Button>
        </div>

        {/* Skip button */}
        <button onClick={onComplete} className="text-sm text-muted-foreground hover:text-foreground transition-colors">
          건너뛰기
        </button>
      </div>
    </div>
  )
}
