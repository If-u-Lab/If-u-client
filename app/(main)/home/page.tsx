"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { QuestionCard } from "@/components/question-card"
import { LoadingSkeleton } from "@/components/loading-skeleton"
import { useQuestionsContext } from "@/contexts/questions-context"
import { useAuthContext } from "@/contexts/auth-context"
import { ExclamationTriangleIcon } from "@heroicons/react/24/solid"

export default function HomePage() {
  const router = useRouter()
  const { isLoading: authLoading } = useAuthContext()
  const {
    todayQuestion,
    fetchTodayQuestion,
    castVote,
    hasUserVoted,
    getUserVote,
    loadingId,
    isLoading,
  } = useQuestionsContext()

  // 인증 완료 후 오늘의 질문 로드
  useEffect(() => {
    if (authLoading) return
    fetchTodayQuestion()
  }, [fetchTodayQuestion, authLoading])

  const question = todayQuestion

  if (isLoading && !question) {
    return <LoadingSkeleton />
  }

  if (!question) {
    return (
      <div className="w-full max-w-2xl mx-auto px-6 pt-8 pb-12 md:px-8 md:pt-10 md:pb-20">
        <div className="text-center py-16 space-y-4">
          <div className="flex justify-center">
            <div className="w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center">
              <ExclamationTriangleIcon className="w-8 h-8 text-destructive/60" />
            </div>
          </div>
          <div className="space-y-3">
            <div className="space-y-1">
              <p className="text-base font-medium text-foreground">오늘의 질문을 불러올 수 없습니다</p>
              <p className="text-sm text-muted-foreground">잠시 후 다시 시도해주세요</p>
            </div>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-lg font-medium active:scale-95 transition-transform"
            >
              새로고침
            </button>
          </div>
        </div>
      </div>
    )
  }

  const handleVote = (optionIndex: number) => {
    castVote(question.id, optionIndex)
  }

  const userVote = getUserVote(question.id)
  const hasVoted = hasUserVoted(question.id)

  const handleQuestionClick = () => {
    router.push(`/questions/${question.id}`)
  }

  return (
    <div className="w-full max-w-2xl mx-auto px-5 pt-6 pb-12 md:px-8 md:pt-10 md:pb-20">
      <h1 className="text-2xl font-bold text-foreground mb-6">오늘의 질문</h1>

      {/* 오늘의 질문 */}
      <div className="space-y-8">
        <div
          onClick={handleQuestionClick}
          className="rounded-lg bg-card border border-2 border-primary shadow-sm cursor-pointer"
        >
          <QuestionCard
            question={question}
            onVote={handleVote}
            selectedOption={userVote ?? undefined}
            showResults={hasVoted}
            isLoading={loadingId === question.id}
            showDate={true}
            hasVoted={hasVoted}
          />
        </div>

        {/* 월간 반응 뜨거운 질문 */}
        <div className="bg-card rounded-lg border border-border p-4 md:p-6">
          <h2 className="text-lg font-semibold text-foreground mb-4">🔥 월간 반응 뜨거운 질문</h2>
          <p className="text-sm text-muted-foreground text-center py-4">
            준비 중입니다
          </p>
        </div>

        {/* 베스트 공감 댓글 */}
        <div className="bg-card rounded-lg border border-border p-4 md:p-6">
          <h2 className="text-lg font-semibold text-foreground mb-4">💬 베스트 공감 댓글</h2>
          <p className="text-sm text-muted-foreground text-center py-4">
            준비 중입니다
          </p>
        </div>
      </div>
    </div>
  )
}
