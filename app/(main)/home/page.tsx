"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { QuestionCard } from "@/components/question-card"
import { LoadingSkeleton } from "@/components/loading-skeleton"
import { useQuestionsContext } from "@/contexts/questions-context"

export default function HomePage() {
  const router = useRouter()
  const { getTodayQuestion, castVote, hasUserVoted, getUserVote, loadingId, questions } =
    useQuestionsContext()
  const [isLoading, setIsLoading] = useState(true)
  const [selectedQuestion, setSelectedQuestion] = useState<string | null>(null)

  useEffect(() => {
    console.log("🏠 HomePage mounted")
    const timer = setTimeout(() => setIsLoading(false), 500)
    return () => clearTimeout(timer)
  }, [])

  const question = getTodayQuestion()

  if (!question) {
    return (
      <div className="w-full max-w-2xl mx-auto px-6 pt-8 pb-12 md:px-8 md:pt-10 md:pb-20 text-center py-12">
        <p className="text-muted-foreground">오늘의 질문을 불러올 수 없습니다</p>
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
    <div className="w-full max-w-2xl mx-auto space-y-6 px-6 pt-8 pb-12 md:px-8 md:pt-10 md:pb-20">
      <h1 className="text-2xl md:text-3xl font-bold text-foreground">오늘의 질문</h1>

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

      <hr className="my-6" />

      {/* 월간 반응이 뜨거운 주제 */}
      <div className="space-y-4">
        <h2 className="text-lg md:text-xl font-bold text-foreground">월간 반응이 뜨거운 주제</h2>
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
                  className={`font-medium line-clamp-2 ${
                    hasVotedOnTopic ? "text-foreground" : "text-muted-foreground"
                  }`}
                >
                  {topic.question}
                </p>
                <div className="flex items-center gap-4 mt-2 text-xs md:text-sm text-muted-foreground">
                  <span>👁 {topic.views.toLocaleString()}</span>
                  <span>💬 {topic.commentCount}</span>
                  {!hasVotedOnTopic && <span className="ml-auto text-xs">투표 후 확인 가능</span>}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      <hr className="my-6" />

      {/* Best 공감 댓글 */}
      <div className="space-y-4">
        <h2 className="text-lg md:text-xl font-bold text-foreground">Best 공감 댓글</h2>
        <div className="space-y-3">
          {bestComments.length > 0 ? (
            bestComments.map((comment, idx) => (
              <div key={idx} className="bg-card border border-border rounded-lg p-3 md:p-4">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-sm font-bold text-primary flex-shrink-0">
                    {comment.author?.charAt(0).toUpperCase() || "U"}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-xs md:text-sm text-foreground">{comment.author}</p>
                    <p className="text-xs md:text-sm text-muted-foreground line-clamp-2 mt-1">
                      {comment.text}
                    </p>
                    <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                      <span>❤ {comment.likes || 0}</span>
                      <span>💬 {comment.replies?.length || 0}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <p className="text-center text-muted-foreground py-8">댓글이 없습니다</p>
          )}
        </div>
      </div>
    </div>
  )
}
