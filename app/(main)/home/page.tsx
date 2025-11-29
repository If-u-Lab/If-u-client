"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { QuestionCard } from "@/components/question-card"
import { LoadingSkeleton } from "@/components/loading-skeleton"
import { useQuestionsContext } from "@/contexts/questions-context"
import { EyeIcon, ChatBubbleLeftIcon, HeartIcon, ChatBubbleOvalLeftEllipsisIcon, ExclamationTriangleIcon, UserCircleIcon } from "@heroicons/react/24/solid"

export default function HomePage() {
  const router = useRouter()
  const { getTodayQuestion, castVote, hasUserVoted, getUserVote, loadingId, questions } =
    useQuestionsContext()
  const [isLoading, setIsLoading] = useState(true)
  const [selectedQuestion, setSelectedQuestion] = useState<string | null>(null)

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 500)
    return () => clearTimeout(timer)
  }, [])

  const question = getTodayQuestion()

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
    setSelectedQuestion(question.id)
    castVote(question.id, optionIndex)
  }

  const userVote = getUserVote(question.id)
  const hasVoted = hasUserVoted(question.id)

  const trendingTopics = questions
    .filter((q) => q.views > 100)
    .sort((a, b) => b.views - a.views)
    .slice(0, 10)

  const bestComments = questions
    .flatMap((q) => q.comments?.map((c) => ({ ...c, questionId: q.id })) || [])
    .sort((a, b) => (b.likes || 0) - (a.likes || 0))
    .slice(0, 10)

  const handleTrendingTopicClick = (topicId: string) => {
    if (hasUserVoted(topicId)) {
      router.push(`/questions/${topicId}`)
    }
  }

  const handleQuestionClick = () => {
    if (hasVoted) {
      router.push(`/questions/${question.id}`)
    }
  }

  return (
    <div className="w-full max-w-2xl mx-auto px-5 pt-6 pb-12 md:px-8 md:pt-10 md:pb-20">
      <h1 className="text-2xl font-bold text-foreground mb-6">오늘의 질문</h1>

      {/* 오늘의 질문 */}
      <div className="space-y-6">
        <div onClick={handleQuestionClick} className={hasVoted ? "relative" : ""}>
          <QuestionCard
            question={question}
            onVote={handleVote}
            selectedOption={userVote ?? undefined}
            showResults={hasVoted}
            isLoading={loadingId === question.id}
          />
          {hasVoted && (
            <div className="absolute inset-0 border-2 border-primary/30 rounded-lg pointer-events-none" />
          )}
        </div>
      </div>

      <hr className="my-8 border-border" />

      {/* 월간 반응이 뜨거운 주제 */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold text-foreground">뜨거운 주제</h2>
        <div className="space-y-3">
          {trendingTopics.map((topic) => {
            const hasVotedOnTopic = hasUserVoted(topic.id)
            return (
              <div
                key={topic.id}
                onClick={() => handleTrendingTopicClick(topic.id)}
                className={`rounded-lg p-4 ${
                  hasVotedOnTopic
                    ? "bg-card border-2 border-primary/40 shadow-sm"
                    : "bg-muted/30 border border-border/50"
                }`}
              >
                <p
                  className={`text-base font-medium line-clamp-2 leading-relaxed ${
                    hasVotedOnTopic ? "text-foreground" : "text-muted-foreground"
                  }`}
                >
                  {topic.question}
                </p>
                <div className="flex items-center gap-4 mt-3 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1.5">
                    <EyeIcon className="w-4 h-4" />
                    <span>{topic.views.toLocaleString()}</span>
                  </span>
                  <span className="flex items-center gap-1.5">
                    <ChatBubbleLeftIcon className="w-4 h-4" />
                    <span>{topic.commentCount}</span>
                  </span>
                  {!hasVotedOnTopic && (
                    <span className="ml-auto px-2.5 py-1 bg-primary/10 text-primary rounded-md text-xs font-semibold">
                      투표 후 확인
                    </span>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      <hr className="my-8 border-border" />

      {/* Best 공감 댓글 */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold text-foreground">인기 댓글</h2>
        <div className="space-y-3">
          {bestComments.length > 0 ? (
            bestComments.map((comment, idx) => (
              <div key={idx} className="bg-card border border-border rounded-lg p-4 md:p-5">
                <div className="flex items-start gap-3">
                  <UserCircleIcon className="w-10 h-10 text-primary/60 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm text-foreground">{comment.author}</p>
                    <p className="text-base text-foreground/90 line-clamp-2 mt-1.5 leading-relaxed">
                      {comment.text}
                    </p>
                    <div className="flex items-center gap-4 mt-3 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1.5">
                        <HeartIcon className="w-4 h-4" />
                        <span>{comment.likes || 0}</span>
                      </span>
                      <span className="flex items-center gap-1.5">
                        <ChatBubbleLeftIcon className="w-4 h-4" />
                        <span>{comment.replies?.length || 0}</span>
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-16 space-y-4">
              <div className="flex justify-center">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
                  <ChatBubbleOvalLeftEllipsisIcon className="w-8 h-8 text-primary/60" />
                </div>
              </div>
              <div className="space-y-1">
                <p className="text-base font-medium text-foreground">아직 댓글이 없습니다</p>
                <p className="text-sm text-muted-foreground">첫 번째 댓글을 남겨보세요!</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
