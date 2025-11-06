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
    <div className="w-full bg-white rounded-lg border border-border p-4 md:p-6 space-y-4">
      <h3 className="text-base md:text-lg font-semibold text-foreground line-clamp-3">{question.text}</h3>

      <div className="space-y-2 md:space-y-3">
        {question.options.map((option, i) => (
          <button
            key={i}
            onClick={() => handleVote(i)}
            disabled={isLoading || !isVoteChangeable}
            className={`w-full p-3 md:p-4 rounded-lg border-2 transition-all font-medium text-sm md:text-base ${
              selectedOption === i
                ? "border-primary bg-primary/10 text-primary"
                : !isVoteChangeable
                  ? "border-border bg-muted text-foreground cursor-not-allowed"
                  : "border-border hover:border-primary/50 text-foreground hover:bg-muted/50"
            } ${isLoading ? "opacity-60 cursor-wait" : ""}`}
          >
            <div className="flex items-center justify-between">
              <span className="truncate">{option}</span>
              {showResults && (
                <span className="text-xs md:text-sm font-semibold text-muted-foreground flex-shrink-0 ml-2">
                  {question.votes[i].toFixed(1)}%
                </span>
              )}
            </div>
          </button>
        ))}
      </div>

      {!showResults && selectedOption === null && (
        <div className="text-xs md:text-sm text-muted-foreground text-center py-2">
          {question.totalVotes}명이 투표했습니다
        </div>
      )}

      {isLoading && <div className="text-xs md:text-sm text-muted-foreground text-center py-2">투표 중...</div>}
    </div>
  )
}
