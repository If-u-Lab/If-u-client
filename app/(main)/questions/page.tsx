"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { QuestionCard } from "@/components/question-card"
import { LoadingSkeleton } from "@/components/loading-skeleton"
import { useQuestionsContext } from "@/contexts/questions-context"

export default function QuestionsPage() {
  const router = useRouter()
  const { getPastQuestions, castVote, hasUserVoted, getUserVote, loadingId } = useQuestionsContext()
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 500)
    return () => clearTimeout(timer)
  }, [])

  const pastQuestions = getPastQuestions()

  const handleQuestionClick = (questionId: string) => {
    if (hasUserVoted(questionId)) {
      router.push(`/questions/${questionId}`)
    }
  }

  return (
    <div className="w-full max-w-2xl mx-auto space-y-6 px-6 pt-8 pb-12 md:px-8 md:pt-10 md:pb-20">
      <h1 className="text-2xl md:text-3xl font-bold text-foreground">질문</h1>

      <div className="space-y-6">
        {pastQuestions.map((question) => {
          const hasVoted = hasUserVoted(question.id)
          return (
            <div
              key={question.id}
              onClick={() => handleQuestionClick(question.id)}
              className={`rounded-lg ${
                hasVoted
                  ? "bg-card border-2 border-primary/40 shadow-sm"
                  : "bg-muted/30 border border-border/50"
              }`}
            >
              <QuestionCard
                question={question}
                onVote={(optionIndex) => castVote(question.id, optionIndex)}
                showResults={true}
                selectedOption={getUserVote(question.id) ?? undefined}
                isLoading={loadingId === question.id}
              />
              <div
                className={`text-xs md:text-sm px-4 pb-4 flex items-center gap-2 ${
                  hasVoted ? "text-muted-foreground" : "text-muted-foreground/60"
                }`}
              >
                <span>{question.date}</span>
                <span>·</span>
                <span>댓글 {question.commentCount}</span>
                {!hasVoted && <span className="ml-auto text-xs">투표 후 확인 가능</span>}
              </div>
            </div>
          )
        })}
      </div>

      {pastQuestions.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">질문이 없습니다</p>
        </div>
      )}
    </div>
  )
}
