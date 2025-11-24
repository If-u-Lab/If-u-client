"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { QuestionCard } from "@/components/question-card"
import { useQuestionsContext } from "@/contexts/questions-context"
import { QuestionMarkCircleIcon } from "@heroicons/react/24/outline"

export default function QuestionsPage() {
  const router = useRouter()
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

  // 오늘의 질문 + 질문 목록 로드
  useEffect(() => {
    fetchTodayQuestion()
    fetchPastQuestions()
  }, [fetchTodayQuestion, fetchPastQuestions])

  // 오늘의 질문을 맨 위에, 나머지는 날짜 최신순 정렬
  const sortedPastQuestions = [...pastQuestions].sort((a, b) => {
    // date 형식: "YY/MM/DD" → 비교를 위해 역순 정렬 (최신이 위로)
    return b.date.localeCompare(a.date)
  })

  const allQuestions = todayQuestion
    ? [todayQuestion, ...sortedPastQuestions]
    : sortedPastQuestions

  const handleQuestionClick = (questionId: string) => {
    if (hasUserVoted(questionId)) {
      router.push(`/questions/${questionId}`)
    }
  }

  if (isLoading && allQuestions.length === 0) {
    return (
      <div className="w-full max-w-2xl mx-auto px-6 pt-8 pb-12 md:px-8 md:pt-10 md:pb-20 text-center py-12">
        <p className="text-muted-foreground">로딩 중...</p>
      </div>
    )
  }

  return (
    <div className="w-full max-w-2xl mx-auto px-5 pt-6 pb-12 md:px-8 md:pt-10 md:pb-20">
      <h1 className="text-2xl font-bold text-foreground mb-6">질문</h1>

      <div className="space-y-5">
        {pastQuestions.map((question) => {
          const hasVoted = hasUserVoted(question.id)
          const isToday = question.isToday

          return (
            <div
              key={question.id}
              onClick={() => handleQuestionClick(question.id)}
              className={`rounded-lg bg-card border ${
                isToday
                  ? "border-2 border-primary shadow-sm"
                  : "border-border"
              } ${hasVoted ? "cursor-pointer" : ""}`}
            >
              <QuestionCard
                question={question}
                onVote={(optionIndex) => castVote(question.id, optionIndex)}
                showResults={hasVoted}
                selectedOption={getUserVote(question.id) ?? undefined}
                isLoading={loadingId === question.id}
                isToday={isToday}
              />
              <div
                className={`text-xs md:text-sm px-5 pb-4 pt-3 flex items-center gap-2.5 border-t border-border/50 ${
                  hasVoted ? "text-muted-foreground" : "text-muted-foreground/60"
                }`}
              >
                <span>{question.date}</span>
                <span>·</span>
                <span>댓글 {question.commentCount}개</span>
                {!hasVoted && (
                  <span className="ml-auto px-2.5 py-1 bg-primary/10 text-primary rounded-md text-xs font-semibold">
                    투표 후 확인
                  </span>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {pastQuestions.length === 0 && (
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

      {hasMore && (
        <div className="text-center py-4">
          <button
            onClick={loadMore}
            disabled={isLoading}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-lg disabled:opacity-50"
          >
            {isLoading ? "로딩 중..." : "더 보기"}
          </button>
        </div>
      )}
    </div>
  )
}
