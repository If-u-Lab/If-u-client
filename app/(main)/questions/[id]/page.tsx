"use client"

import { use, useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeftIcon, ExclamationTriangleIcon } from "@heroicons/react/24/outline"
import { QuestionCard } from "@/components/question-card"
import { VotingResults } from "@/components/voting-results"
import { CommentSection } from "@/components/comment-section"
import { LoadingSkeleton } from "@/components/loading-skeleton"
import { useQuestionsContext } from "@/contexts/questions-context"
import type { Question } from "@/types/entities"

export default function QuestionDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter()
  const { fetchQuestionById, castVote, loadingId } = useQuestionsContext()

  // Unwrap params Promise (Next.js 15+ requirement)
  const { id } = use(params)

  const [question, setQuestion] = useState<Question | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // 질문 상세 정보 로드
  useEffect(() => {
    const loadQuestion = async () => {
      setIsLoading(true)
      const data = await fetchQuestionById(id)
      setQuestion(data)
      setIsLoading(false)
    }
    loadQuestion()
  }, [id, fetchQuestionById])

  // API로 불러온 question 객체에서 직접 사용
  const userVote = question?.userChoice ?? null
  const hasVoted = question?.hasVoted ?? false

  if (isLoading) {
    return <LoadingSkeleton />
  }

  if (!question) {
    return (
      <div className="w-full max-w-2xl mx-auto px-5 pt-6 pb-12 md:px-8 md:pt-10 md:pb-20">
        <div className="text-center py-16 space-y-4">
          <div className="flex justify-center">
            <div className="w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center">
              <ExclamationTriangleIcon className="w-8 h-8 text-destructive/60" />
            </div>
          </div>
          <div className="space-y-3">
            <div className="space-y-1">
              <p className="text-base font-medium text-foreground">질문을 찾을 수 없습니다</p>
              <p className="text-sm text-muted-foreground">다른 질문을 확인해보세요</p>
            </div>
            <button
              onClick={() => router.back()}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-lg font-medium active:scale-95 transition-transform"
            >
              돌아가기
            </button>
          </div>
        </div>
      </div>
    )
  }

  // Handle CLOSED questions without user vote - show limited info
  if (question.status === "CLOSED" && !hasVoted) {
    return (
      <div className="w-full max-w-2xl mx-auto px-5 pt-6 pb-12 md:px-8 md:pt-10 md:pb-20">
        {/* Back button */}
        <div className="flex items-center gap-3 mb-6">
          <button
            onClick={() => router.back()}
            className="p-2.5 active:bg-muted rounded-lg transition-colors"
          >
            <ArrowLeftIcon className="w-6 h-6 text-foreground" />
          </button>
          <h1 className="text-2xl font-bold text-foreground">질문 상세</h1>
        </div>

        <div className="space-y-8">
          <QuestionCard
            question={question}
            onVote={() => {}}
            showResults={false}
            isLoading={false}
            isToday={question.isToday}
            showDate={true}
            hasVoted={false}
            hideVoteAfterMessage={true}
            showDescription={true}
          />

          <div className="text-center py-8 bg-card rounded-lg border border-border">
            <p className="text-base text-muted-foreground leading-relaxed">
              종료된 질문입니다. 투표에 참여하지 않아 결과와 댓글을 볼 수 없습니다.
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full max-w-2xl mx-auto px-5 pt-6 pb-12 md:px-8 md:pt-10 md:pb-20">
      {/* Back button */}
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={() => router.back()}
          className="p-2.5 active:bg-muted rounded-lg transition-colors"
        >
          <ArrowLeftIcon className="w-6 h-6 text-foreground" />
        </button>
        <h1 className="text-2xl font-bold text-foreground">질문 상세</h1>
      </div>

      <div className="space-y-8">

      {/* Question Card */}
      <QuestionCard
        question={question}
        onVote={(optionIndex) => castVote(question.id, optionIndex)}
        showResults={hasVoted}
        selectedOption={userVote ?? undefined}
        isLoading={loadingId === question.id}
        isToday={question.isToday}
        showDate={true}
        hasVoted={hasVoted}
        hideVoteAfterMessage={true}
        showDescription={true}
      />

      {/* Show results and comments only if user has voted */}
      {hasVoted && (
        <>
          <VotingResults question={question} />
          <CommentSection questionId={question.id} commentCount={question.commentCount} />
        </>
      )}
      </div>
    </div>
  )
}
