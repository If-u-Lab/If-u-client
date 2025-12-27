"use client"

import { use, useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeftIcon, ExclamationTriangleIcon } from "@heroicons/react/24/outline"
import { QuestionCard } from "@/components/question-card"
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
        <div className="mb-4">
          <button
            onClick={() => router.back()}
            className="p-2.5 active:bg-muted rounded-lg transition-colors"
          >
            <ArrowLeftIcon className="w-6 h-6 text-foreground" />
          </button>
        </div>

        <div className="space-y-8">
          <QuestionCard
            question={question}
            onVote={() => {}}
            showResults={false}
            isLoading={false}
            showDate={true}
            hasVoted={false}
            hideVoteAfterMessage={true}
            showDescription={true}
          />

          <div className="text-center py-8 bg-card rounded-lg border border-border space-y-2">
            <p className="text-base font-medium text-foreground">
              종료된 질문입니다.
            </p>
            <p className="text-sm text-muted-foreground">
              투표에 참여하지 않아 결과와 댓글을 볼 수 없습니다.
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full max-w-2xl mx-auto px-5 pt-6 pb-12 md:px-8 md:pt-10 md:pb-20">
      {/* Header */}
      <div className="relative flex items-center justify-center mb-6">
        <button
          onClick={() => router.back()}
          className="absolute left-0 p-2.5 active:bg-muted rounded-lg transition-colors"
        >
          <ArrowLeftIcon className="w-6 h-6 text-foreground" />
        </button>
        <span className="text-lg font-medium text-muted-foreground">{question.date}</span>
      </div>

      <div className="space-y-8">
        {/* Title & Description */}
        <div className="space-y-3">
          <h1 className="text-2xl md:text-3xl font-bold text-foreground leading-tight">
            {question.title}
          </h1>
          {question.description && (
            <p className="text-base md:text-lg text-muted-foreground leading-relaxed">
              {question.description}
            </p>
          )}
        </div>

        {/* VS Vote Options */}
        <div className="relative">
          <div className="space-y-3">
            {question.options.map((option, i) => {
              const isSelected = userVote === i

              return (
                <button
                  key={i}
                  onClick={() => !hasVoted && question.status !== "CLOSED" && castVote(question.id, i)}
                  disabled={loadingId === question.id || question.status === "CLOSED"}
                  className={`w-full p-5 md:p-6 rounded-xl border-2 transition-all font-medium text-base md:text-lg relative overflow-hidden ${
                    question.status === "CLOSED"
                      ? "border-border bg-muted text-foreground cursor-not-allowed opacity-60"
                      : hasVoted
                        ? "border-primary/30 text-foreground"
                        : "border-border text-foreground active:border-primary/60 active:bg-primary/5"
                  } ${loadingId === question.id ? "opacity-60 cursor-wait" : ""}`}
                >
                  {/* 배경 채우기 - 비율만큼 */}
                  {hasVoted && (
                    <div className="absolute top-0 left-0 bottom-0 bg-primary/15 transition-all duration-500 rounded-l-lg"
                      style={{ width: `${question.votes[i]}%` }}
                    />
                  )}
                  <div className="relative flex items-center justify-between">
                    <span className="leading-relaxed">{option}</span>
                    {hasVoted && (
                      <span className="text-lg font-bold text-foreground">
                        {question.votes[i].toFixed(1)}%
                      </span>
                    )}
                  </div>
                </button>
              )
            })}
          </div>

        </div>

        {/* Participation info */}
        <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
          <span>{question.totalVotes.toLocaleString()}명 참여</span>
          <span>·</span>
          <span>댓글 {question.commentCount}개</span>
        </div>

        {/* Show comments only if user has voted */}
        {hasVoted && (
          <CommentSection questionId={question.id} commentCount={question.commentCount} />
        )}
      </div>
    </div>
  )
}
