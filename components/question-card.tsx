"use client"

import { useState, useRef, useEffect } from "react"
import type { Question } from "@/types/entities"

interface QuestionCardProps {
  question: Question
  onVote: (option: number) => void
  showResults?: boolean
  selectedOption?: number
  isLoading?: boolean
  showDate?: boolean
  hasVoted?: boolean
  hideVoteAfterMessage?: boolean
  showDescription?: boolean
}

export function QuestionCard({
  question,
  onVote,
  showResults = false,
  selectedOption: controlledSelectedOption,
  isLoading = false,
  showDate = false,
  hasVoted = false,
  hideVoteAfterMessage = false,
  showDescription = false,
}: QuestionCardProps) {
  const [localSelectedOption, setLocalSelectedOption] = useState<number | null>(null)
  const cardRef = useRef<HTMLDivElement>(null)

  // Use controlled prop if provided, otherwise use local state
  const selectedOption = controlledSelectedOption !== undefined ? controlledSelectedOption : localSelectedOption

  const handleOptionSelect = (option: number) => {
    // 선택만 하고 즉시 투표하지 않음
    if (!isLoading && question.status !== "CLOSED") {
      setLocalSelectedOption(option)
    }
  }

  const handleSubmit = () => {
    // 제출 버튼 클릭 시 투표 실행
    if (localSelectedOption !== null && !isLoading && question.status !== "CLOSED") {
      onVote(localSelectedOption)
    }
  }

  // 외부 클릭 시 선택 초기화
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (cardRef.current && !cardRef.current.contains(event.target as Node) && !showResults) {
        setLocalSelectedOption(null)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [showResults])

  // 투표 변경 가능 여부: CLOSED가 아니면 변경 가능
  const isVoteChangeable = question.status !== "CLOSED"

  return (
    <div ref={cardRef} className="w-full bg-white rounded-lg border border-border p-4 md:p-6 space-y-3">
      {/* 상단: 날짜 + 투표 후 확인 */}
      {showDate && (
        <div className="flex items-center justify-between text-sm md:text-base text-muted-foreground">
          <div className="flex items-center gap-2.5">
            <span className="font-medium">{question.date}</span>
            <span>·</span>
            <span>댓글 {question.commentCount}개</span>
          </div>
          {!hasVoted && !hideVoteAfterMessage && (
            <span className={`px-3 py-1.5 rounded-lg text-sm font-semibold whitespace-nowrap ${
              question.status === "CLOSED"
                ? "bg-muted text-muted-foreground"
                : "bg-primary/10 text-primary"
            }`}>
              {question.status === "CLOSED" ? "투표 종료" : "투표 후 확인"}
            </span>
          )}
        </div>
      )}

      <div className="flex items-start justify-between gap-2">
        <h3 className="text-[15px] md:text-lg font-semibold text-foreground line-clamp-3">{question.title}</h3>
        {question.isToday && (
          <span className="text-xs font-semibold text-primary bg-primary/20 px-2 py-1 rounded-full whitespace-nowrap flex-shrink-0">
            오늘의 질문
          </span>
        )}
      </div>

      {/* Description (상세 페이지용) */}
      {question.description && showDescription && (
        <p className="text-sm md:text-base text-muted-foreground leading-relaxed">
          {question.description}
        </p>
      )}

      <div className="space-y-3">
        {question.options.map((option, i) => (
          <button
            key={i}
            onClick={(e) => {
              e.stopPropagation()
              handleOptionSelect(i)
            }}
            disabled={isLoading || !isVoteChangeable || showResults}
            className={`w-full p-4 md:p-5 rounded-lg border-2 transition-all font-medium text-sm md:text-base ${
              selectedOption === i
                ? "border-primary bg-primary/15 text-primary"
                : !isVoteChangeable || showResults
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

      {/* 투표 전: 제출 버튼 또는 투표 수 표시 */}
      {!showResults && (
        <div className="pt-1">
          {selectedOption !== null ? (
            <button
              onClick={(e) => {
                e.stopPropagation()
                handleSubmit()
              }}
              disabled={isLoading}
              className="w-full py-3 bg-primary/90 text-white rounded-lg font-semibold text-base transition-all active:scale-[0.98] hover:bg-primary disabled:opacity-60 disabled:cursor-wait"
            >
              {isLoading ? "제출 중..." : "제출"}
            </button>
          ) : (
            <div className="text-sm md:text-base text-muted-foreground text-center py-2">
              {question.totalVotes}명이 투표했습니다
            </div>
          )}
        </div>
      )}
    </div>
  )
}
