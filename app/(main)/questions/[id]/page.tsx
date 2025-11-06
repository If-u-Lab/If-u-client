"use client"

import { use } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft } from "lucide-react"
import { QuestionCard } from "@/components/question-card"
import { VotingResults } from "@/components/voting-results"
import { CommentSection } from "@/components/comment-section"
import { useQuestionsContext } from "@/contexts/questions-context"

export default function QuestionDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter()
  const { getQuestionById, getUserVote, hasUserVoted, castVote, loadingId } = useQuestionsContext()

  // Unwrap params Promise (Next.js 15+ requirement)
  const { id } = use(params)

  const question = getQuestionById(id)
  const userVote = getUserVote(id)
  const hasVoted = hasUserVoted(id)

  if (!question) {
    return (
      <div className="w-full max-w-2xl mx-auto px-6 pt-8 pb-12 md:px-8 md:pt-10 md:pb-20 text-center py-12">
        <p className="text-muted-foreground">질문을 찾을 수 없습니다</p>
      </div>
    )
  }

  // Handle CLOSED questions without user vote - show limited info
  if (question.status === "CLOSED" && !hasVoted) {
    return (
      <div className="w-full max-w-2xl mx-auto space-y-6 px-6 pt-8 pb-12 md:px-8 md:pt-10 md:pb-20">
        {/* Back button */}
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft size={20} />
          <span className="text-sm">돌아가기</span>
        </button>

        <h1 className="text-2xl md:text-3xl font-bold text-foreground">질문 상세</h1>

        {/* Limited view for closed questions without vote */}
        <div className="bg-card rounded-lg border border-border p-6 space-y-4">
          <h3 className="text-base md:text-lg font-semibold text-foreground">{question.text}</h3>

          <div className="space-y-2">
            {question.options.map((option, i) => (
              <div
                key={i}
                className="w-full p-3 md:p-4 rounded-lg border-2 border-border bg-muted text-foreground cursor-not-allowed opacity-60"
              >
                <span>{option}</span>
              </div>
            ))}
          </div>

          <div className="text-sm text-muted-foreground text-center border-t border-border pt-4">
            총 {question.totalVotes}명이 투표했습니다
          </div>

          <div className="text-center py-6 border-t border-border">
            <p className="text-muted-foreground">
              종료된 질문입니다. 투표에 참여하지 않아 결과와 댓글을 볼 수 없습니다.
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full max-w-2xl mx-auto space-y-6 px-6 pt-8 pb-12 md:px-8 md:pt-10 md:pb-20">
      {/* Back button */}
      <button
        onClick={() => router.back()}
        className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft size={20} />
        <span className="text-sm">돌아가기</span>
      </button>

      <h1 className="text-2xl md:text-3xl font-bold text-foreground">질문 상세</h1>

      {/* Question Card */}
      <QuestionCard
        question={question}
        onVote={(optionIndex) => castVote(question.id, optionIndex)}
        showResults={hasVoted}
        selectedOption={userVote ?? undefined}
        isLoading={loadingId === question.id}
      />

      {/* Show results and comments only if user has voted */}
      {hasVoted && (
        <>
          <VotingResults question={question} />
          <CommentSection questionId={question.id} commentCount={question.commentCount} />
        </>
      )}
    </div>
  )
}
