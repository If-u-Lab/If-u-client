"use client"

import { useEffect, useCallback, useState } from "react"
import { useRouter } from "next/navigation"
import { QuestionCard } from "@/components/question-card"
import { LoadingSkeleton } from "@/components/loading-skeleton"
import { PullToRefresh } from "@/components/pull-to-refresh"
import { TicketModal } from "@/components/ticket-modal"
import { NotificationPromptModal } from "@/components/notification-prompt-modal"
import { useQuestionsContext } from "@/contexts/questions-context"
import { useAuthContext } from "@/contexts/auth-context"
import { useTicketModal } from "@/hooks/use-ticket-modal"
import { ERROR_MESSAGES, toQuestion } from "@/hooks/use-questions"
import { BellIcon, ChartBarIcon } from "@heroicons/react/24/outline"
import Link from "next/link"
import * as questionsApi from "@/lib/api/questions"
import type { Question } from "@/types/entities"

export default function HomePage() {
  const router = useRouter()
  const { isLoading: authLoading, isAuthenticated } = useAuthContext()
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

  const {
    showModal,
    isUsing,
    ticketCount,
    closeModal,
    useTicket,
    handleQuestionClick: handleTicketQuestionClick,
  } = useTicketModal()

  const [topQuestions, setTopQuestions] = useState<Question[]>([])
  const [isLoadingTop, setIsLoadingTop] = useState(true)
  const [showNotificationPrompt, setShowNotificationPrompt] = useState(false)

  // 로그인 후 알림 동의 모달 표시 (최초 1회)
  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      const hasSeenPrompt = localStorage.getItem("notification_prompt_shown")
      if (!hasSeenPrompt && typeof window !== "undefined" && "Notification" in window) {
        // 이미 권한이 허용되어 있으면 표시 안 함
        if (Notification.permission !== "granted") {
          setShowNotificationPrompt(true)
        }
      }
    }
  }, [authLoading, isAuthenticated])

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

  const handleTopQuestionClick = (q: Question) => {
    handleTicketQuestionClick(q, hasUserVoted(q.id))
  }

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
        {/* Header - 질문 탭과 동일하게 상단 중앙 */}
        <h1 className="text-2xl text-foreground text-center mb-5">오늘의 질문</h1>

        {/* 상태 메시지 카드 - Top 5 위치 맞추기 위해 높이 설정 */}
        <div className="rounded-lg bg-white border border-border min-h-[55vh] flex flex-col items-center justify-center py-12 px-6 md:py-16 md:px-8 text-center">
          {isError ? (
            <>
              <p className="text-4xl font-bold text-muted-foreground/30 mb-3">
                앗!
              </p>
              <p className="text-base font-medium text-foreground mb-1">
                질문을 불러오지 못했어요
              </p>
              <p className="text-[13px] text-muted-foreground mb-6">
                잠시 후 다시 시도해주세요
              </p>
              <button
                onClick={() => fetchTodayQuestion()}
                className="h-11 px-8 bg-primary/80 text-white rounded-xl font-medium text-[15px] flex items-center justify-center active:scale-95 transition-transform"
              >
                다시 시도
              </button>
            </>
          ) : (
            <>
              <BellIcon className="w-12 h-12 text-primary/60 mb-4" />
              <p className="text-base font-medium text-foreground mb-1">
                아직 오늘의 질문이 없어요
              </p>
              <p className="text-[13px] text-muted-foreground mb-6">
                알림을 켜두면 새 질문을 바로 받아볼 수 있어요
              </p>
              <Link
                href="/settings"
                className="h-11 px-8 bg-primary/60 text-white rounded-xl font-medium text-[15px] flex items-center justify-center active:scale-95 transition-transform"
              >
                알림 설정하기
              </Link>
            </>
          )}
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
                  onDetailClick={() => handleTopQuestionClick(q)}
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

        <TicketModal
          isOpen={showModal}
          ticketCount={ticketCount}
          isUsing={isUsing}
          onUse={useTicket}
          onClose={closeModal}
        />

        <NotificationPromptModal
          isOpen={showNotificationPrompt}
          onClose={() => setShowNotificationPrompt(false)}
        />
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
                onDetailClick={() => handleTopQuestionClick(q)}
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

      <TicketModal
        isOpen={showModal}
        ticketCount={ticketCount}
        isUsing={isUsing}
        onUse={useTicket}
        onClose={closeModal}
      />

      <NotificationPromptModal
        isOpen={showNotificationPrompt}
        onClose={() => setShowNotificationPrompt(false)}
      />
    </div>
    </PullToRefresh>
  )
}
