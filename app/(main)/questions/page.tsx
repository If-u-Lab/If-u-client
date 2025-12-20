"use client"

import { useEffect, useRef, useCallback } from "react"
import { useRouter } from "next/navigation"
import { QuestionCard } from "@/components/question-card"
import { LoadingSkeleton } from "@/components/loading-skeleton"
import { useQuestionsContext } from "@/contexts/questions-context"
import { useAuthContext } from "@/contexts/auth-context"
import { QuestionMarkCircleIcon } from "@heroicons/react/24/outline"

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

  // 오늘의 질문 + 과거 질문을 합쳐서 최신순 정렬
  const allQuestions = todayQuestion
    ? [todayQuestion, ...pastQuestions]
    : pastQuestions

  // 날짜 기준 최신순 정렬 (내림차순)
  const sortedQuestions = [...allQuestions].sort((a, b) => {
    // date 형식: "YY/MM/DD" → 비교를 위해 역순 정렬 (최신이 위로)
    return b.date.localeCompare(a.date)
  })

  const handleQuestionClick = (questionId: string) => {
    router.push(`/questions/${questionId}`)
  }

  if (isLoading && sortedQuestions.length === 0) {
    return <LoadingSkeleton />
  }

  return (
    <div className="w-full max-w-2xl mx-auto px-5 pt-6 pb-12 md:px-8 md:pt-10 md:pb-20">
      <h1 className="text-2xl font-bold text-foreground mb-6">질문</h1>

      <div className="space-y-5">
        {sortedQuestions.map((question) => {
          const hasVoted = hasUserVoted(question.id)
          const isToday = question.isToday

          return (
            <div
              key={question.id}
              onDoubleClick={() => handleQuestionClick(question.id)}
              className={`rounded-lg bg-card border cursor-pointer ${
                isToday
                  ? "border-2 border-primary shadow-sm"
                  : "border-border"
              }`}
            >
              <QuestionCard
                question={question}
                onVote={(optionIndex) => castVote(question.id, optionIndex)}
                showResults={hasVoted}
                selectedOption={getUserVote(question.id) ?? undefined}
                isLoading={loadingId === question.id}
                isToday={isToday}
                showDate={true}
                hasVoted={hasVoted}
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
              <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
              <span>로딩 중...</span>
            </div>
          )}
        </div>
      )}

      {sortedQuestions.length === 0 && !isLoading && (
        <div className="text-center py-16 space-y-4">
          <div className="flex justify-center">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
              <QuestionMarkCircleIcon className="w-8 h-8 text-primary/60" />
            </div>
          </div>
          <div className="space-y-1">
            <p className="text-base font-medium text-foreground">아직 질문이 없습니다</p>
            <p className="text-sm text-muted-foreground">매일 새로운 질문이 올라옵니다</p>
          </div>
        </div>
      )}

    </div>
  )
}
