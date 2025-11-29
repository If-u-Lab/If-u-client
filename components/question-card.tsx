"use client"

import { useState } from "react"

interface QuestionCardProps {
  question: {
    id: string
    text: string
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
}

export function QuestionCard({
  question,
  onVote,
  showResults = false,
  selectedOption: controlledSelectedOption,
  isLoading = false,
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
    <div className="w-full bg-card rounded-lg border border-border p-5 md:p-6 space-y-5">
      <h3 className="text-lg md:text-xl font-semibold text-foreground line-clamp-3 leading-relaxed">{question.text}</h3>

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
