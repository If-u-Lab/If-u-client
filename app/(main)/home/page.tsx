"use client"

import { useEffect, useCallback, useState } from "react"
import { useRouter } from "next/navigation"
import { QuestionCard } from "@/components/question-card"
import { LoadingSkeleton } from "@/components/loading-skeleton"
import { PullToRefresh } from "@/components/pull-to-refresh"
import { useQuestionsContext } from "@/contexts/questions-context"
import { useAuthContext } from "@/contexts/auth-context"
import { useUserProfile } from "@/hooks/use-user-profile"
import { ERROR_MESSAGES, toQuestion } from "@/hooks/use-questions"
import { BellIcon, ChartBarIcon, TicketIcon } from "@heroicons/react/24/outline"
import Link from "next/link"
import * as questionsApi from "@/lib/api/questions"
import * as ticketsApi from "@/lib/api/tickets"
import type { Question } from "@/types/entities"

export default function HomePage() {
  const router = useRouter()
  const { isLoading: authLoading } = useAuthContext()
  const { profile, fetchProfile } = useUserProfile()
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
  const [showTicketModal, setShowTicketModal] = useState(false)
  const [selectedClosedQuestion, setSelectedClosedQuestion] = useState<Question | null>(null)
  const [isUsingTicket, setIsUsingTicket] = useState(false)
  const ticketCount = profile.ticketCount

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
    const canView = q.canViewResults ?? hasUserVoted(q.id)
    const isClosedWithoutAccess = q.status === "CLOSED" && !canView

    if (isClosedWithoutAccess) {
      setSelectedClosedQuestion(q)
      setShowTicketModal(true)
    } else {
      router.push(`/questions/${q.id}`)
    }
  }

  const handleUseTicket = async () => {
    if (!selectedClosedQuestion || ticketCount === 0) return

    try {
      setIsUsingTicket(true)
      await ticketsApi.useTicket(Number(selectedClosedQuestion.id))
      fetchProfile()
      router.push(`/questions/${selectedClosedQuestion.id}`)
    } catch (error) {
      console.error("열람권 사용 실패:", error)
    } finally {
      setIsUsingTicket(false)
      setShowTicketModal(false)
      setSelectedClosedQuestion(null)
    }
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
                className="h-11 px-8 bg-primary/40 text-white rounded-xl font-medium text-[15px] flex items-center justify-center active:scale-95 transition-transform"
              >
                다시 시도
              </button>
            </>
          ) : (
            <>
              <BellIcon className="w-12 h-12 text-primary/50 mb-4" />
              <p className="text-base font-medium text-foreground mb-1">
                아직 오늘의 질문이 없어요
              </p>
              <p className="text-[13px] text-muted-foreground mb-6">
                알림을 켜두면 새 질문을 바로 받아볼 수 있어요
              </p>
              <Link
                href="/settings"
                className="h-11 px-8 bg-primary/40 text-white rounded-xl font-medium text-[15px] flex items-center justify-center active:scale-95 transition-transform"
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

        {/* 열람권 사용 확인 모달 */}
        {showTicketModal && selectedClosedQuestion && (
          <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div
              className="absolute inset-0 bg-black/40"
              onClick={() => {
                setShowTicketModal(false)
                setSelectedClosedQuestion(null)
              }}
            />
            <div className="relative bg-card rounded-2xl border border-border p-6 mx-5 max-w-sm w-full shadow-xl">
              <div className="flex flex-col items-center text-center">
                <div className="w-14 h-14 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                  <TicketIcon className="w-7 h-7 text-primary" />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  열람권을 사용하시겠어요?
                </h3>
                <p className="text-sm text-muted-foreground mb-1">
                  종료된 질문의 결과를 확인할 수 있어요
                </p>
                <p className="text-sm text-muted-foreground mb-6">
                  보유 열람권: <span className="font-semibold text-primary">{ticketCount}개</span>
                </p>
                <div className="flex flex-col gap-2 w-full">
                  <button
                    onClick={handleUseTicket}
                    disabled={ticketCount === 0 || isUsingTicket}
                    className={`w-full py-3 px-4 rounded-xl font-medium text-[15px] active:scale-95 transition-transform ${
                      ticketCount > 0 && !isUsingTicket
                        ? "bg-primary/60 text-white"
                        : "bg-muted text-muted-foreground cursor-not-allowed"
                    }`}
                  >
                    {isUsingTicket ? (
                      <span className="flex items-center justify-center gap-2">
                        <span className="w-4 h-4 border-2 border-white/60 border-t-transparent rounded-full animate-spin" />
                        사용 중...
                      </span>
                    ) : ticketCount > 0 ? (
                      "열람권 사용하기"
                    ) : (
                      "열람권이 없어요"
                    )}
                  </button>
                  <button
                    onClick={() => {
                      setShowTicketModal(false)
                      setSelectedClosedQuestion(null)
                    }}
                    className="w-full py-3 px-4 bg-muted text-muted-foreground rounded-xl font-medium text-[15px] active:scale-95 transition-transform"
                  >
                    취소
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
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

      {/* 열람권 사용 확인 모달 */}
      {showTicketModal && selectedClosedQuestion && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => {
              setShowTicketModal(false)
              setSelectedClosedQuestion(null)
            }}
          />
          <div className="relative bg-card rounded-2xl border border-border p-6 mx-5 max-w-sm w-full shadow-xl">
            <div className="flex flex-col items-center text-center">
              <div className="w-14 h-14 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                <TicketIcon className="w-7 h-7 text-primary" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">
                열람권을 사용하시겠어요?
              </h3>
              <p className="text-sm text-muted-foreground mb-1">
                종료된 질문의 결과를 확인할 수 있어요
              </p>
              <p className="text-sm text-muted-foreground mb-6">
                보유 열람권: <span className="font-semibold text-primary">{ticketCount}개</span>
              </p>
              <div className="flex flex-col gap-2 w-full">
                <button
                  onClick={handleUseTicket}
                  disabled={ticketCount === 0 || isUsingTicket}
                  className={`w-full py-3 px-4 rounded-xl font-medium text-[15px] active:scale-95 transition-transform ${
                    ticketCount > 0 && !isUsingTicket
                      ? "bg-primary/60 text-white"
                      : "bg-muted text-muted-foreground cursor-not-allowed"
                  }`}
                >
                  {isUsingTicket ? (
                    <span className="flex items-center justify-center gap-2">
                      <span className="w-4 h-4 border-2 border-white/60 border-t-transparent rounded-full animate-spin" />
                      사용 중...
                    </span>
                  ) : ticketCount > 0 ? (
                    "열람권 사용하기"
                  ) : (
                    "열람권이 없어요"
                  )}
                </button>
                <button
                  onClick={() => {
                    setShowTicketModal(false)
                    setSelectedClosedQuestion(null)
                  }}
                  className="w-full py-3 px-4 bg-muted text-muted-foreground rounded-xl font-medium text-[15px] active:scale-95 transition-transform"
                >
                  취소
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
    </PullToRefresh>
  )
}
