"use client"

import { useEffect, useRef, useCallback } from "react"
import { useRouter } from "next/navigation"
import { QuestionCard } from "@/components/question-card"
import { LoadingSkeleton } from "@/components/loading-skeleton"
import { PullToRefresh } from "@/components/pull-to-refresh"
import { useQuestionsContext } from "@/contexts/questions-context"
import { useAuthContext } from "@/contexts/auth-context"
import { ChatBubbleOvalLeftEllipsisIcon } from "@heroicons/react/24/outline"

export default function QuestionsPage() {
  const router = useRouter()
  const { isLoading: authLoading } = useAuthContext()
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

  const handleQuestionClick = (questionId: string) => {
    router.push(`/questions/${questionId}`)
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
                onDetailClick={() => handleQuestionClick(question.id)}
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
    </PullToRefresh>
  )
}
