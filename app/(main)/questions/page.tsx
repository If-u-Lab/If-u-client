"use client"

import { useEffect, useRef, useCallback, useState } from "react"
import { useRouter } from "next/navigation"
import { QuestionCard } from "@/components/question-card"
import { LoadingSkeleton } from "@/components/loading-skeleton"
import { PullToRefresh } from "@/components/pull-to-refresh"
import { useQuestionsContext } from "@/contexts/questions-context"
import { useAuthContext } from "@/contexts/auth-context"
import { ChatBubbleOvalLeftEllipsisIcon, TicketIcon } from "@heroicons/react/24/outline"
import type { Question } from "@/types/entities"

export default function QuestionsPage() {
  const router = useRouter()
  const { isLoading: authLoading } = useAuthContext()
  const [showTicketModal, setShowTicketModal] = useState(false)
  const [selectedClosedQuestion, setSelectedClosedQuestion] = useState<Question | null>(null)
  const ticketCount = 1 // TODO: 실제 열람권 개수 연동
  const {
    todayQuestion,
    pastQuestions,
    fetchTodayQuestion,
    fetchPastQuestions,
    castVote,
    hasUserVoted,
    getUserVote,
    loadingId,
    isLoading,
    hasMore,
    loadMore,
    refreshQuestion,
    refreshingId,
  } = useQuestionsContext()

  // 무한스크롤을 위한 observer ref
  const observerTarget = useRef<HTMLDivElement>(null)

  // 인증 완료 후 질문 로드
  useEffect(() => {
    if (authLoading) return
    fetchTodayQuestion()
    fetchPastQuestions()
  }, [fetchTodayQuestion, fetchPastQuestions, authLoading])

  // 무한스크롤 구현
  const handleObserver = useCallback(
    (entries: IntersectionObserverEntry[]) => {
      const [target] = entries
      if (target.isIntersecting && hasMore && !isLoading) {
        loadMore()
      }
    },
    [hasMore, isLoading, loadMore]
  )

  useEffect(() => {
    const element = observerTarget.current
    if (!element) return

    const observer = new IntersectionObserver(handleObserver, {
      threshold: 0.1,
    })

    observer.observe(element)
    return () => observer.unobserve(element)
  }, [handleObserver])

  // 오늘의 질문 + 과거 질문 (백엔드에서 이미 최신순으로 정렬됨)
  const allQuestions = todayQuestion
    ? [todayQuestion, ...pastQuestions]
    : pastQuestions

  const handleQuestionClick = (question: Question) => {
    const hasVoted = hasUserVoted(question.id)
    const isClosedWithoutVote = question.status === "CLOSED" && !hasVoted

    if (isClosedWithoutVote) {
      setSelectedClosedQuestion(question)
      setShowTicketModal(true)
    } else {
      router.push(`/questions/${question.id}`)
    }
  }

  const handleUseTicket = () => {
    if (selectedClosedQuestion && ticketCount > 0) {
      // TODO: 열람권 사용 API 호출
      router.push(`/questions/${selectedClosedQuestion.id}`)
    }
    setShowTicketModal(false)
    setSelectedClosedQuestion(null)
  }

  const handlePullRefresh = useCallback(async () => {
    await Promise.all([fetchTodayQuestion(), fetchPastQuestions()])
  }, [fetchTodayQuestion, fetchPastQuestions])

  if (isLoading && allQuestions.length === 0) {
    return <LoadingSkeleton />
  }

  return (
    <PullToRefresh onRefresh={handlePullRefresh}>
      <div className="w-full max-w-2xl mx-auto px-5 pt-6 pb-12 md:px-8 md:pt-10 md:pb-20">
      {/* Header */}
      <h1 className="text-2xl text-foreground text-center mb-5">질문</h1>

      <div className="space-y-5">
        {allQuestions.map((question) => {
          const hasVoted = hasUserVoted(question.id)

          return (
            <div
              key={question.id}
              className={`rounded-lg bg-card transition-all duration-200
                ${
                  question.isToday
                    ? "border-2 border-primary/60"
                    : "border border-border"
                }`}
            >
              <QuestionCard
                question={question}
                onVote={(optionIndex) => castVote(question.id, optionIndex)}
                onRefresh={() => refreshQuestion(question.id)}
                onDetailClick={() => handleQuestionClick(question)}
                showResults={hasVoted}
                selectedOption={getUserVote(question.id) ?? undefined}
                isLoading={loadingId === question.id}
                isRefreshing={refreshingId === question.id}
                showDate={true}
                hasVoted={hasVoted}
                showDescription={true}
              />
            </div>
          )
        })}
      </div>

      {/* 무한스크롤 트리거 */}
      {hasMore && (
        <div ref={observerTarget} className="py-6 text-center">
          {isLoading && (
            <div className="inline-flex items-center gap-2 text-sm text-muted-foreground">
              <div className="w-4 h-4 border-2 border-primary/60 border-t-transparent rounded-full animate-spin" />
              <span>로딩 중...</span>
            </div>
          )}
        </div>
      )}

      {allQuestions.length === 0 && !isLoading && (
        <div className="flex flex-col items-center pt-65">
          <ChatBubbleOvalLeftEllipsisIcon className="w-16 h-16 text-primary/60 mb-4" />
          <p className="text-[15px] text-muted-foreground mb-1">
            질문이 곧 도착해요
          </p>
          <p className="text-[13px] text-muted-foreground/90">
            첫 번째 질문을 준비하고 있어요
          </p>
        </div>
      )}

    </div>

      {/* 열람권 사용 확인 모달 */}
      {showTicketModal && selectedClosedQuestion && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* 배경 오버레이 */}
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => {
              setShowTicketModal(false)
              setSelectedClosedQuestion(null)
            }}
          />

          {/* 모달 */}
          <div className="relative bg-card rounded-2xl border border-border p-6 mx-5 max-w-sm w-full shadow-xl">
            <div className="flex flex-col items-center text-center">
              <div className="w-14 h-14 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                <TicketIcon className="w-7 h-7 text-primary" />
              </div>

              <h3 className="text-lg font-semibold text-foreground mb-2">
                열람권을 사용하시겠어요?
              </h3>
              <p className="text-sm text-muted-foreground mb-1">
                종료된 질문의 결과를 확인할 수 있어요
              </p>
              <p className="text-sm text-muted-foreground mb-6">
                보유 열람권: <span className="font-semibold text-primary">{ticketCount}개</span>
              </p>

              <div className="flex flex-col gap-2 w-full">
                <button
                  onClick={handleUseTicket}
                  disabled={ticketCount === 0}
                  className={`w-full py-3 px-4 rounded-xl font-medium text-[15px] active:scale-95 transition-transform ${
                    ticketCount > 0
                      ? "bg-primary/60 text-white"
                      : "bg-muted text-muted-foreground cursor-not-allowed"
                  }`}
                >
                  {ticketCount > 0 ? "열람권 사용하기" : "열람권이 없어요"}
                </button>
                <button
                  onClick={() => {
                    setShowTicketModal(false)
                    setSelectedClosedQuestion(null)
                  }}
                  className="w-full py-3 px-4 bg-muted text-muted-foreground rounded-xl font-medium text-[15px] active:scale-95 transition-transform"
                >
                  취소
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </PullToRefresh>
  )
}
