"use client"

import { useEffect, useCallback, useState } from "react"
import { useRouter } from "next/navigation"
import { QuestionCard } from "@/components/question-card"
import { LoadingSkeleton } from "@/components/loading-skeleton"
import { PullToRefresh } from "@/components/pull-to-refresh"
import { useQuestionsContext } from "@/contexts/questions-context"
import { useAuthContext } from "@/contexts/auth-context"
import { ERROR_MESSAGES, toQuestion } from "@/hooks/use-questions"
import { BellIcon, ChartBarIcon } from "@heroicons/react/24/outline"
import Link from "next/link"
import * as questionsApi from "@/lib/api/questions"
import type { Question } from "@/types/entities"

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
    error,
    refreshQuestion,
    refreshingId,
  } = useQuestionsContext()

  const [topQuestions, setTopQuestions] = useState<Question[]>([])
  const [isLoadingTop, setIsLoadingTop] = useState(true)

  // 인증 완료 후 오늘의 질문 & Top 5 로드
  useEffect(() => {
    if (authLoading) return
    fetchTodayQuestion()

    const fetchTopQuestions = async () => {
      try {
        setIsLoadingTop(true)
        const response = await questionsApi.getTopQuestions()
        setTopQuestions(response.data.map((q) => toQuestion(q)))
      } catch {
        // 에러 시 빈 배열 유지
      } finally {
        setIsLoadingTop(false)
      }
    }
    fetchTopQuestions()
  }, [fetchTodayQuestion, authLoading])

  const handlePullRefresh = useCallback(async () => {
    await fetchTodayQuestion()
  }, [fetchTodayQuestion])

  const question = todayQuestion

  if (isLoading && !question) {
    return <LoadingSkeleton />
  }

  // 오늘의 질문이 없는 경우 (에러 vs 아직 없음 구분)
  if (!question) {
    const isNoQuestionToday = error === ERROR_MESSAGES.NO_QUESTION_TODAY
    const isError = error && !isNoQuestionToday

    return (
      <div className="w-full max-w-2xl mx-auto px-5 pt-6 pb-12 md:px-8 md:pt-10 md:pb-20">
        <h1 className="text-2xl font-bold text-foreground mb-6">오늘의 질문</h1>

        <div className="flex flex-col items-center pt-16">
          {isError ? (
            <>
              <p className="text-4xl font-bold text-muted-foreground/40 mb-3">
                앗!
              </p>
              <p className="text-[15px] text-muted-foreground mb-6">
                질문을 불러오지 못했어요
              </p>
              <button
                onClick={() => window.location.reload()}
                className="h-12 w-48 bg-primary/60 text-white rounded-xl font-semibold text-[15px] flex items-center justify-center active:scale-95 transition-transform"
              >
                다시 시도
              </button>
            </>
          ) : (
            <>
              <BellIcon className="w-16 h-16 text-primary/60 mb-4" />
              <p className="text-[15px] text-muted-foreground mb-1">
                아직 오늘의 질문이 없어요
              </p>
              <p className="text-[13px] text-muted-foreground/70 mb-6">
                알림을 켜두면 새 질문을 바로 받아볼 수 있어요
              </p>
              <Link
                href="/settings"
                className="h-12 w-48 bg-primary/60 text-white rounded-xl font-semibold text-[15px] flex items-center justify-center active:scale-95 transition-transform"
              >
                알림 설정하기
              </Link>
            </>
          )}
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
    <PullToRefresh onRefresh={handlePullRefresh}>
      <div className="w-full max-w-2xl mx-auto px-5 pt-6 pb-12 md:px-8 md:pt-10 md:pb-20">
      {/* 오늘의 질문 - 메인 영역 */}
      <div className="min-h-[60vh] flex flex-col justify-center py-8">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-foreground mb-2">오늘의 질문</h1>
          <p className="text-[13px] text-foreground/80 leading-relaxed">
            지금 이 순간에도 누군가 선택하고 있어요
            <br />
            나와 같은 생각을 가진 사람, 몇 %일까요?
          </p>
        </div>
        <QuestionCard
          question={question}
          onVote={handleVote}
          onRefresh={() => refreshQuestion(question.id)}
          onDetailClick={handleQuestionClick}
          selectedOption={userVote ?? undefined}
          showResults={hasVoted}
          isLoading={loadingId === question.id}
          isRefreshing={refreshingId === question.id}
          showDate={true}
          hasVoted={hasVoted}
          showDescription={true}
        />
      </div>

      {/* Top 5 - 스크롤해서 볼 수 있는 영역 */}
      {!isLoadingTop && topQuestions.length > 0 && (
        <div className="mt-8 space-y-4">
          <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
            <ChartBarIcon className="w-5 h-5 text-primary" />
            Top 5
          </h2>
          <div className="space-y-4">
            {topQuestions.map((q) => (
              <QuestionCard
                key={q.id}
                question={q}
                onVote={(optionIndex) => castVote(q.id, optionIndex)}
                onDetailClick={() => router.push(`/questions/${q.id}`)}
                showResults={hasUserVoted(q.id)}
                selectedOption={getUserVote(q.id) ?? undefined}
                isLoading={loadingId === q.id}
                showDate={true}
                hasVoted={hasUserVoted(q.id)}
                showDescription={true}
              />
            ))}
          </div>
        </div>
      )}
    </div>
    </PullToRefresh>
  )
}
