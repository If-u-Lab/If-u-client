"use client"

import { useState, useCallback } from "react"
import { Question } from "@/types/entities"

// Mock data - in a real app, this would come from an API
const mockQuestionsData: Question[] = [
  {
    id: "1",
    text: "인공지능이 인간의 일자리를 대체하는 것에 찬성하시나요?",
    question: "인공지능이 인간의 일자리를 대체하는 것에 찬성하시나요?",
    category: "기술",
    options: ["찬성하는 입장", "반대하는 입장"],
    totalVotes: 147,
    votes: [87.2, 12.8],
    commentCount: 89,
    date: "25/10/04",
    isToday: true,
    views: 1523,
    status: "PUBLISHED",
    comments: [
      {
        author: "김철수",
        text: "기술 발전은 피할 수 없는 미래입니다. 우리는 적응해야 합니다.",
        likes: 45,
        replies: [],
      },
      {
        author: "이영희",
        text: "일자리를 잃는 사람들에 대한 대책이 필요합니다.",
        likes: 32,
        replies: [],
      },
    ],
  },
  {
    id: "2",
    text: "원격 근무가 미래의 표준이 되어야 한다고 생각하시나요?",
    question: "원격 근무가 미래의 표준이 되어야 한다고 생각하시나요?",
    category: "업무",
    options: ["찬성", "반대"],
    totalVotes: 542,
    votes: [65.3, 34.7],
    commentCount: 234,
    date: "25/10/03",
    isToday: false,
    views: 2156,
    status: "PUBLISHED",
    comments: [
      {
        author: "박지민",
        text: "원격 근무로 워라밸이 크게 개선되었습니다.",
        likes: 67,
        replies: [],
      },
    ],
  },
  {
    id: "3",
    text: "사회 초년생은 큰 회사에 먼저 가야 할까?",
    question: "사회 초년생은 큰 회사에 먼저 가야 할까?",
    category: "커리어",
    options: ["큰 회사 선택", "작은 회사 선택"],
    totalVotes: 823,
    votes: [58.2, 41.8],
    commentCount: 156,
    date: "25/10/02",
    isToday: false,
    views: 1834,
    status: "CLOSED",
    comments: [],
  },
  {
    id: "4",
    text: "대학 등록금 인상에 동의하시나요?",
    question: "대학 등록금 인상에 동의하시나요?",
    category: "교육",
    options: ["동의", "반대"],
    totalVotes: 1234,
    votes: [23.5, 76.5],
    commentCount: 412,
    date: "25/10/01",
    isToday: false,
    views: 3421,
    status: "CLOSED",
    comments: [
      {
        author: "최민수",
        text: "교육의 질을 높이려면 어느 정도 인상은 필요합니다.",
        likes: 28,
        replies: [],
      },
    ],
  },
  {
    id: "5",
    text: "4주 유급휴가가 표준이 되어야 할까요?",
    question: "4주 유급휴가가 표준이 되어야 할까요?",
    category: "정책",
    options: ["찬성", "반대"],
    totalVotes: 678,
    votes: [72.1, 27.9],
    commentCount: 198,
    date: "25/09/30",
    isToday: false,
    views: 1245,
    status: "PUBLISHED",
    comments: [],
  },
]

export function useQuestions() {
  const [questions, setQuestions] = useState<Question[]>(mockQuestionsData)
  const [userVotes, setUserVotes] = useState<Map<string, number>>(new Map())
  const [loadingId, setLoadingId] = useState<string | null>(null)

  const getTodayQuestion = useCallback(() => {
    return questions.find((q) => q.isToday) || questions[0]
  }, [questions])

  const getPastQuestions = useCallback(() => {
    return questions.filter((q) => !q.isToday)
  }, [questions])

  const castVote = useCallback((questionId: string, optionIndex: number, onComplete?: () => void) => {
    setLoadingId(questionId)

    // 즉시 투표 상태 업데이트 (낙관적 업데이트)
    setUserVotes((prev) => new Map(prev).set(questionId, optionIndex))

    // Simulate API call delay
    setTimeout(() => {
      setLoadingId(null)

      // Update vote counts (simulated)
      setQuestions((prev) =>
        prev.map((q) => {
          if (q.id === questionId) {
            const newVotes = [...q.votes]
            newVotes[optionIndex] += Math.random() * 10
            const total = newVotes.reduce((a, b) => a + b, 0)
            newVotes[0] = (newVotes[0] / total) * 100
            newVotes[1] = (newVotes[1] / total) * 100

            return {
              ...q,
              totalVotes: q.totalVotes + 1,
              votes: newVotes,
            }
          }
          return q
        }),
      )

      // 완료 콜백 호출
      onComplete?.()
    }, 300)
  }, [])

  const hasUserVoted = useCallback(
    (questionId: string) => {
      return userVotes.has(questionId)
    },
    [userVotes],
  )

  const getUserVote = useCallback(
    (questionId: string) => {
      return userVotes.get(questionId) ?? null
    },
    [userVotes],
  )

  const getQuestionById = useCallback(
    (questionId: string) => {
      return questions.find((q) => q.id === questionId)
    },
    [questions],
  )

  return {
    questions,
    getTodayQuestion,
    getPastQuestions,
    castVote,
    hasUserVoted,
    getUserVote,
    getQuestionById,
    loadingId,
  }
}
