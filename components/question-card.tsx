"use client"

import { useState } from "react"

interface QuestionCardProps {
  question: {
    id: string
    title: string
    options: string[]
    totalVotes: number
    votes: number[]
    commentCount: number
    date: string
    status?: "DRAFT" | "PUBLISHED" | "CLOSED"
  }
  onVote: (option: number) => void
  showResults?: boolean
  selectedOption?: number
  isLoading?: boolean
  isToday?: boolean
}

export function QuestionCard({
  question,
  onVote,
  showResults = false,
  selectedOption: controlledSelectedOption,
  isLoading = false,
  isToday = false,
}: QuestionCardProps) {
  const [localSelectedOption, setLocalSelectedOption] = useState<number | null>(null)

  // Use controlled prop if provided, otherwise use local state
  const selectedOption = controlledSelectedOption !== undefined ? controlledSelectedOption : localSelectedOption

  const handleVote = (option: number) => {
    // 같은 선택지 두 번 클릭 방지 (투표 취소 불가)
    if (!isLoading && question.status !== "CLOSED" && selectedOption !== option) {
      setLocalSelectedOption(option)
      onVote(option)
    }
  }

  // 투표 변경 가능 여부: CLOSED가 아니면 변경 가능
  const isVoteChangeable = question.status !== "CLOSED"

  return (
    <div className="w-full bg-white rounded-lg border border-border p-4 md:p-6 space-y-4">
      <div className="flex items-start justify-between gap-2">
        <h3 className="text-base md:text-lg font-semibold text-foreground line-clamp-3">{question.title}</h3>
        {isToday && (
          <span className="text-xs font-semibold text-primary bg-primary/20 px-2 py-1 rounded-full whitespace-nowrap flex-shrink-0">
            오늘의 질문
          </span>
        )}
      </div>

      <div className="space-y-3">
        {question.options.map((option, i) => (
          <button
            key={i}
            onClick={() => handleVote(i)}
            disabled={isLoading || !isVoteChangeable}
            className={`w-full p-4 md:p-5 rounded-lg border-2 transition-all font-medium text-sm md:text-base ${
              selectedOption === i
                ? "border-primary bg-primary/15 text-primary ring-2 ring-primary/30 ring-offset-2"
                : !isVoteChangeable
                  ? "border-border bg-muted text-foreground cursor-not-allowed opacity-60"
                  : "border-border active:border-primary/50 text-foreground active:bg-muted/50"
            } ${isLoading ? "opacity-60 cursor-wait" : ""}`}
          >
            <div className="flex items-center justify-between">
              <span className="truncate leading-relaxed">{option}</span>
              {showResults && (
                <span className="text-sm md:text-base font-bold text-muted-foreground flex-shrink-0 ml-3">
                  {question.votes[i].toFixed(1)}%
                </span>
              )}
            </div>
          </button>
        ))}
      </div>

      {!showResults && selectedOption === null && (
        <div className="text-sm md:text-base text-muted-foreground text-center py-2">
          {question.totalVotes}명이 투표했습니다
        </div>
      )}

      {isLoading && <div className="text-sm md:text-base text-muted-foreground text-center py-2">투표 중...</div>}
    </div>
  )
}
