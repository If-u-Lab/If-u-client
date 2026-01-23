"use client"

import { useState, useRef, useEffect } from "react"
import { ArrowPathIcon } from "@heroicons/react/24/outline"
import type { Question } from "@/types/entities"

interface QuestionCardProps {
  question: Question
  onVote: (option: number) => void
  onRefresh?: () => void
  onDetailClick?: () => void
  showResults?: boolean
  selectedOption?: number
  isLoading?: boolean
  isRefreshing?: boolean
  showDate?: boolean
  hasVoted?: boolean
  hideVoteAfterMessage?: boolean
  showDescription?: boolean
}

export function QuestionCard({
  question,
  onVote,
  onRefresh,
  onDetailClick,
  showResults = false,
  selectedOption: controlledSelectedOption,
  isLoading = false,
  isRefreshing = false,
  showDate = false,
  hasVoted = false,
  hideVoteAfterMessage = false,
  showDescription = false,
}: QuestionCardProps) {
  const [localSelectedOption, setLocalSelectedOption] = useState<number | null>(null)
  const [isSpinning, setIsSpinning] = useState(false)
  const cardRef = useRef<HTMLDivElement>(null)

  // localSelectedOption이 있으면 우선 사용 (사용자가 새 옵션 선택 중)
  const selectedOption = localSelectedOption !== null ? localSelectedOption : controlledSelectedOption

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
      setLocalSelectedOption(null) // 제출 후 초기화
    }
  }

  // controlledSelectedOption이 변경되면 localSelectedOption 초기화
  useEffect(() => {
    setLocalSelectedOption(null)
  }, [controlledSelectedOption])

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

  // 투표 가능 여부: CLOSED가 아니고, 첫 투표이거나 투표 변경이 허용된 경우
  const isVoteChangeable = question.status !== "CLOSED" && (!hasVoted || (question.canChangeVote ?? true))

  // 참여하지 않고 열람권도 사용 안 한 종료된 질문은 블러 처리
  const canViewResults = question.canViewResults ?? hasVoted
  const isClosedWithoutAccess = question.status === "CLOSED" && !canViewResults

  return (
    <div ref={cardRef} className="w-full bg-white rounded-lg border border-border p-4 md:p-6 space-y-3 relative overflow-hidden">
      {/* 상단: 날짜 + 상태 뱃지 + 상세보기 */}
      {showDate && (
        <div className="flex items-center justify-between text-sm md:text-base text-muted-foreground">
          <div className="flex items-center gap-2">
            <span className="font-medium">{question.date}</span>
            {question.status === "CLOSED" ? (
              <span className="px-2 py-0.5 rounded text-xs font-medium whitespace-nowrap bg-muted text-muted-foreground">
                종료
              </span>
            ) : (
              !hasVoted && !hideVoteAfterMessage && (
                <span className="px-2 py-1 rounded-md text-xs font-semibold whitespace-nowrap bg-primary/10 text-primary/60">
                  투표 후 확인
                </span>
              )
            )}
          </div>
          {onDetailClick && !isClosedWithoutAccess && (
            <button
              onClick={(e) => {
                e.stopPropagation()
                onDetailClick()
              }}
              className="px-2.5 py-0.5 text-xs text-muted-foreground font-medium bg-muted rounded-full active:bg-muted/70 transition-colors"
            >
              질문상세
            </button>
          )}
        </div>
      )}

      <div className="space-y-2">
        <h3 className="text-lg md:text-xl font-bold text-foreground leading-snug">{question.title}</h3>

        {/* Description */}
        {question.description && showDescription && (
          <p className="text-base md:text-[17px] text-foreground/80 leading-relaxed">
            {question.description}
          </p>
        )}
      </div>

      <div className="relative">
        {/* 옵션 버튼들 */}
        <div className={`space-y-3 ${isClosedWithoutAccess ? "blur-sm pointer-events-none" : ""}`}>
          {question.options.map((option, i) => (
            <button
              key={i}
              onClick={(e) => {
                e.stopPropagation()
                handleOptionSelect(i)
              }}
              disabled={isLoading || !isVoteChangeable}
              className={`w-full p-4 md:p-5 rounded-lg border-2 transition-all font-medium text-sm md:text-base ${
                selectedOption === i
                  ? "border-primary/60 bg-primary/10 text-primary"
                  : !isVoteChangeable
                    ? "border-border bg-muted text-foreground cursor-not-allowed opacity-60"
                    : "border-border active:border-primary/60 text-foreground active:bg-primary/5"
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

        {/* 참여하지 않고 열람권도 사용 안 한 종료된 질문 오버레이 */}
        {isClosedWithoutAccess && (
          <button
            onClick={(e) => {
              e.stopPropagation()
              onDetailClick?.()
            }}
            className="absolute inset-0 flex items-center justify-center cursor-pointer"
          >
            <p className="text-sm md:text-base text-muted-foreground text-center leading-relaxed">
              종료된 질문입니다.<br />
              투표에 참여하지 않아 결과를 볼 수 없습니다.
            </p>
          </button>
        )}
      </div>

      {/* 제출 버튼 또는 투표 수 표시 */}
      <div className="pt-1">
        {localSelectedOption !== null && localSelectedOption !== controlledSelectedOption ? (
          <button
            onClick={(e) => {
              e.stopPropagation()
              handleSubmit()
            }}
            disabled={isLoading || !isVoteChangeable}
            className="w-full py-3 bg-primary/80 text-white rounded-lg font-semibold text-base transition-all active:scale-[0.98] active:bg-primary/90 disabled:opacity-60 disabled:cursor-wait"
          >
            {isLoading ? "제출 중..." : hasVoted ? "투표 변경" : "제출"}
          </button>
        ) : (
          <div className="flex items-center justify-center gap-3 py-2">
            <span className="text-sm md:text-base text-muted-foreground">
              {question.totalVotes.toLocaleString()}명 참여 · 댓글 {question.commentCount}개
            </span>
            {onRefresh && question.status !== "CLOSED" && (
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  setIsSpinning(true)
                  onRefresh()
                  setTimeout(() => setIsSpinning(false), 500)
                }}
                disabled={isRefreshing || isSpinning}
                className="p-1.5 text-muted-foreground active:text-primary transition-colors disabled:opacity-50"
                aria-label="새로고침"
              >
                <ArrowPathIcon
                  className={`w-4 h-4 transition-transform duration-500 ${
                    isSpinning || isRefreshing ? "animate-spin" : ""
                  }`}
                />
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
