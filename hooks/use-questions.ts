"use client"

import { useState, useCallback, useRef } from "react"
import { Question } from "@/types/entities"
import type { QuestionResponse } from "@/types/api"
import * as questionsApi from "@/lib/api/questions"

/**
 * 에러 메시지 상수
 * 컴포넌트에서 에러 타입을 구분할 때 사용
 */
export const ERROR_MESSAGES = {
  NO_QUESTION_TODAY: "오늘의 질문이 아직 없습니다!",
} as const

/**
 * 백엔드 응답을 프론트엔드 Question 타입으로 변환
 */
export function toQuestion(response: QuestionResponse, isToday = false): Question {
  const voteStats = response.voteStats
  const votes = voteStats
    ? [voteStats.choice1Percent, voteStats.choice2Percent]
    : [50, 50]

  // userChoice: 백엔드는 1-based (1=choice1, 2=choice2), 프론트는 0-based로 변환
  const userChoice = response.userChoice !== null ? response.userChoice - 1 : null

  return {
    id: String(response.questionId),
    title: response.title,
    description: response.description,
    category: response.categoryDisplayName,
    options: [response.choice1, response.choice2],
    totalVotes: response.participants,
    votes,
    commentCount: response.commentCount,
    date: formatDate(response.publishAt),
    isToday,
    status: response.status,
    hasVoted: response.hasVoted,
    userChoice,
    canViewResults: response.canViewResults ?? response.hasVoted,
    canChangeVote: response.canChangeVote ?? true,
  }
}

/**
 * 날짜 포맷 변환
 * - 올해 → "M월 D일 (요일)"
 * - 작년 이전 → "YYYY년 M월 D일 (요일)"
 */
function formatDate(isoDate: string): string {
  const date = new Date(isoDate)
  const now = new Date()
  const month = date.getMonth() + 1
  const day = date.getDate()
  const dayNames = ["일", "월", "화", "수", "목", "금", "토"]
  const dayOfWeek = dayNames[date.getDay()]

  if (date.getFullYear() === now.getFullYear()) {
    return `${month}월 ${day}일 (${dayOfWeek})`
  }

  return `${date.getFullYear()}년 ${month}월 ${day}일 (${dayOfWeek})`
}

export function useQuestions() {
  const [todayQuestion, setTodayQuestion] = useState<Question | null>(null)
  const [pastQuestions, setPastQuestions] = useState<Question[]>([])
  const [nextCursor, setNextCursor] = useState<string | null>(null)
  const [isTodayLoading, setIsTodayLoading] = useState(false)
  const [isPastLoading, setIsPastLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [loadingId, setLoadingId] = useState<string | null>(null)

  // useRef로 로딩 상태 추적
  const isTodayLoadingRef = useRef(false)
  const isPastLoadingRef = useRef(false)

  // 오늘의 질문 조회
  const fetchTodayQuestion = useCallback(async () => {
    // 이미 로딩 중이면 중복 호출 방지
    if (isTodayLoadingRef.current) return
    isTodayLoadingRef.current = true

    try {
      setIsTodayLoading(true)
      setError(null)
      const response = await questionsApi.getTodayQuestion()
      setTodayQuestion(toQuestion(response.data, true))
    } catch (err: any) {
      // 404 에러 (오늘의 질문이 없음)
      if (err.status === 404) {
        setError(ERROR_MESSAGES.NO_QUESTION_TODAY)
      } else {
        setError(err instanceof Error ? err.message : "오늘의 질문을 불러오지 못했습니다")
      }
    } finally {
      setIsTodayLoading(false)
      isTodayLoadingRef.current = false
    }
  }, [])

  // 지난 질문 목록 조회
  const fetchPastQuestions = useCallback(async (cursor?: string) => {
    // 이미 로딩 중이면 중복 호출 방지
    if (isPastLoadingRef.current) return
    isPastLoadingRef.current = true

    try {
      setIsPastLoading(true)
      setError(null)
      const response = await questionsApi.getPastQuestions({ cursor, size: 20 })
      const questions = response.data.items.map((item) => toQuestion(item, false))

      if (cursor) {
        // 추가 로드 
        setPastQuestions((prev) => [...prev, ...questions])
      } else {
        // 초기 로드
        setPastQuestions(questions)
      }
      setNextCursor(response.data.nextCursor)
    } catch (err) {
      setError(err instanceof Error ? err.message : "질문 목록을 불러오지 못했습니다")
    } finally {
      setIsPastLoading(false)
      isPastLoadingRef.current = false
    }
  }, [])

  // 더 불러오기 (무한 스크롤용)
  const loadMore = useCallback(() => {
    if (nextCursor && !isPastLoadingRef.current) {
      fetchPastQuestions(nextCursor)
    }
  }, [nextCursor, fetchPastQuestions])

  // 질문 상세 조회
  const fetchQuestionById = useCallback(async (questionId: string) => {
    try {
      setError(null)
      const response = await questionsApi.getQuestionById(Number(questionId))
      return toQuestion(response.data, false)
    } catch (err) {
      setError(err instanceof Error ? err.message : "질문을 불러오지 못했습니다")
      return null
    }
  }, [])

  // 투표 여부 확인 (백엔드 응답의 hasVoted 사용)
  const hasUserVoted = useCallback(
    (questionId: string) => {
      if (todayQuestion?.id === questionId) {
        return todayQuestion.hasVoted
      }
      const question = pastQuestions.find((q) => q.id === questionId)
      return question?.hasVoted ?? false
    },
    [todayQuestion, pastQuestions]
  )

  // 사용자 투표 조회
  const getUserVote = useCallback(
    (questionId: string) => {
      if (todayQuestion?.id === questionId) {
        return todayQuestion.userChoice
      }
      const question = pastQuestions.find((q) => q.id === questionId)
      return question?.userChoice ?? null
    },
    [todayQuestion, pastQuestions]
  )

  // 투표하기
  const castVote = useCallback(
    async (questionId: string, optionIndex: number) => {
      // optionIndex는 0-based, API는 1-based
      const choice = optionIndex + 1

      setLoadingId(questionId)
      try {
        const response = await questionsApi.vote(Number(questionId), choice)
        const { userChoice, participants, voteStats } = response.data

        // 질문 상태 업데이트 헬퍼
        const updateQuestion = (q: Question): Question => ({
          ...q,
          hasVoted: true,
          userChoice: userChoice - 1, // API는 1-based, 프론트는 0-based
          totalVotes: participants,
          votes: [voteStats.choice1Percent, voteStats.choice2Percent],
        })

        // 오늘의 질문 업데이트
        if (todayQuestion?.id === questionId) {
          setTodayQuestion(updateQuestion(todayQuestion))
        }

        // 과거 질문 업데이트
        setPastQuestions((prev) =>
          prev.map((q) => (q.id === questionId ? updateQuestion(q) : q))
        )
      } catch (err) {
        setError(err instanceof Error ? err.message : "투표에 실패했습니다")
      } finally {
        setLoadingId(null)
      }
    },
    [todayQuestion]
  )

  // 질문 새로고침 (참여 수, 댓글 수 업데이트)
  const [refreshingId, setRefreshingId] = useState<string | null>(null)

  const refreshQuestion = useCallback(
    async (questionId: string) => {
      setRefreshingId(questionId)
      try {
        const response = await questionsApi.getQuestionById(Number(questionId))
        const updatedQuestion = toQuestion(response.data, todayQuestion?.id === questionId)

        // 오늘의 질문 업데이트
        if (todayQuestion?.id === questionId) {
          setTodayQuestion(updatedQuestion)
        }

        // 과거 질문 업데이트
        setPastQuestions((prev) =>
          prev.map((q) => (q.id === questionId ? updatedQuestion : q))
        )
      } catch (err) {
        setError(err instanceof Error ? err.message : "새로고침에 실패했습니다")
      } finally {
        setRefreshingId(null)
      }
    },
    [todayQuestion]
  )

  // 통합 로딩 상태
  const isLoading = isTodayLoading || isPastLoading

  return {
    // 데이터
    todayQuestion,
    pastQuestions,

    // 상태
    isLoading,
    isTodayLoading,
    isPastLoading,
    error,
    hasMore: !!nextCursor,
    loadingId,
    refreshingId,

    // 액션
    fetchTodayQuestion,
    fetchPastQuestions,
    fetchQuestionById,
    loadMore,
    hasUserVoted,
    getUserVote,
    castVote,
    refreshQuestion,
  }
}
