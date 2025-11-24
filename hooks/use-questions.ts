"use client"

import { useState, useCallback, useRef } from "react"
import { Question } from "@/types/entities"
import type { QuestionResponse } from "@/types/api"
import * as questionsApi from "@/lib/api/questions"

/**
 * 백엔드 응답을 프론트엔드 Question 타입으로 변환
 */
function toQuestion(response: QuestionResponse, isToday = false): Question {
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
    commentCount: 0, // TODO: 댓글 API 연동 시 업데이트
    date: formatDate(response.publishAt),
    isToday,
    status: response.status,
    hasVoted: response.hasVoted,
    userChoice,
  }
}

/**
 * 날짜 포맷 변환 (ISO -> YY/MM/DD)
 */
function formatDate(isoDate: string): string {
  const date = new Date(isoDate)
  const yy = String(date.getFullYear()).slice(2)
  const mm = String(date.getMonth() + 1).padStart(2, "0")
  const dd = String(date.getDate()).padStart(2, "0")
  return `${yy}/${mm}/${dd}`
}

export function useQuestions() {
  const [todayQuestion, setTodayQuestion] = useState<Question | null>(null)
  const [pastQuestions, setPastQuestions] = useState<Question[]>([])
  const [nextCursor, setNextCursor] = useState<string | null>(null)
  const [isTodayLoading, setIsTodayLoading] = useState(false)
  const [isPastLoading, setIsPastLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

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
    } catch (err) {
      setError(err instanceof Error ? err.message : "오늘의 질문을 불러오지 못했습니다")
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
    if (nextCursor && !isPastLoading) {
      fetchPastQuestions(nextCursor)
    }
  }, [nextCursor, isPastLoading, fetchPastQuestions])

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

  // 질문 ID로 조회 
  const getQuestionById = useCallback(
    (questionId: string) => {
      if (todayQuestion?.id === questionId) {
        return todayQuestion
      }
      return pastQuestions.find((q) => q.id === questionId)
    },
    [todayQuestion, pastQuestions]
  )

  // 전체 질문 목록 (레거시 호환)
  const questions = todayQuestion ? [todayQuestion, ...pastQuestions] : pastQuestions

  // 통합 로딩 상태 (기존 코드 호환)
  const isLoading = isTodayLoading || isPastLoading

  return {
    // 데이터
    todayQuestion,
    pastQuestions,
    questions,

    // 상태
    isLoading,
    isTodayLoading,
    isPastLoading,
    error,
    hasMore: !!nextCursor,

    // 액션
    fetchTodayQuestion,
    fetchPastQuestions,
    fetchQuestionById,
    loadMore,

    // 레거시 호환 (기존 컴포넌트 지원)
    getTodayQuestion: () => todayQuestion,
    getPastQuestions: () => pastQuestions,
    hasUserVoted,
    getUserVote,
    getQuestionById,
    loadingId: null, // TODO: 투표 API 연동 시 구현
    castVote: (_questionId: string, _optionIndex: number) => {}, // TODO: 투표 API 연동 시 구현
  }
}
