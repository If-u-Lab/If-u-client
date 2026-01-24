"use client"

import { use, useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { sendGAEvent } from "@next/third-parties/google"
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
  const canViewResults = question?.canViewResults ?? hasVoted

  // GA4 결과 확인 이벤트 추적 (중복 방지)
  const hasTrackedResultView = useRef(false)
  useEffect(() => {
    if (question && canViewResults && !hasTrackedResultView.current) {
      hasTrackedResultView.current = true
      sendGAEvent("event", "result_view", {
        question_id: question.id,
        has_voted: hasVoted,
      })
    }
  }, [question, canViewResults, hasVoted])

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

  // Handle CLOSED questions without access - show limited info
  if (question.status === "CLOSED" && !canViewResults) {
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
    <div className="max-w-2xl mx-auto pb-20">
      {/* 헤더 */}
      <div className="sticky top-0 z-10 bg-background px-5 pt-6 pb-3 md:px-8 md:pt-10 md:pb-4">
        <div className="relative flex items-center justify-center">
          <button
            onClick={() => router.back()}
            className="absolute left-0 p-2.5 active:bg-muted rounded-lg transition-colors"
          >
            <ArrowLeftIcon className="w-6 h-6 text-foreground" />
          </button>
          <span className="text-lg font-medium text-muted-foreground">{question.date}</span>
        </div>
      </div>

      {/* 질문 영역 - 스크롤과 함께 올라감 */}
      <div className="px-5 pb-4 md:px-8 md:pb-6">
        {/* Title & Description */}
        <div className="space-y-2 mb-4">
          <h1 className="text-xl md:text-2xl font-bold text-foreground leading-tight">
            {question.title}
          </h1>
          {question.description && (
            <p className="text-sm md:text-base text-muted-foreground leading-relaxed">
              {question.description}
            </p>
          )}
        </div>

        {/* VS Vote Options */}
        <div className="space-y-2 mb-3">
          {question.options.map((option, i) => {
            const isSelected = userVote === i

            return (
              <button
                key={i}
                onClick={() => question.status !== "CLOSED" && (!hasVoted || (question.canChangeVote ?? true)) && castVote(question.id, i)}
                disabled={loadingId === question.id || question.status === "CLOSED"}
                className={`w-full p-4 md:p-5 rounded-xl border-2 transition-all font-medium text-sm md:text-base relative overflow-hidden ${
                  question.status === "CLOSED"
                    ? "border-border bg-muted text-foreground cursor-not-allowed opacity-60"
                    : canViewResults
                      ? "border-primary/30 text-foreground"
                      : "border-border text-foreground active:border-primary/60 active:bg-primary/5"
                } ${loadingId === question.id ? "opacity-60 cursor-wait" : ""}`}
              >
                {/* 배경 채우기 - 비율만큼 */}
                {canViewResults && (
                  <div className="absolute inset-y-0 left-0 bg-primary/15 transition-all duration-500"
                    style={{ width: `${question.votes[i]}%` }}
                  />
                )}
                <div className="relative flex items-center justify-between">
                  <span className="leading-relaxed">{option}</span>
                  {canViewResults && (
                    <span className="text-base font-bold text-foreground">
                      {question.votes[i].toFixed(1)}%
                    </span>
                  )}
                </div>
              </button>
            )
          })}
        </div>

        {/* Participation info */}
        <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
          <span>{question.totalVotes.toLocaleString()}명 참여</span>
          <span>·</span>
          <span>댓글 {question.commentCount}개</span>
        </div>
      </div>

      {/* 댓글 영역 */}
      {canViewResults && (
        <div className="border-t border-border">
          <CommentSection
            questionId={question.id}
            commentCount={question.commentCount}
            isCommentDisabled={question.status === "CLOSED"}
          />
        </div>
      )}
    </div>
  )
}
