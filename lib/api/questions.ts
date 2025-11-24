// Question API 서비스 함수

import { apiGet } from "@/lib/api-client"
import type {
  TodayQuestionResponse,
  PastQuestionsResponse,
  QuestionDetailResponse,
  QuestionResultResponse,
} from "@/types/api"

const BASE_PATH = "/v1/questions"

/**
 * 오늘의 질문 조회
 */
export async function getTodayQuestion() {
  return apiGet<TodayQuestionResponse>(`${BASE_PATH}/today`)
}

/**
 * 지난 질문 목록 조회 (커서 기반 페이지네이션)
 */
export async function getPastQuestions(params?: {
  cursor?: string
  size?: number
}) {
  const searchParams = new URLSearchParams()
  if (params?.cursor) searchParams.set("cursor", params.cursor)
  if (params?.size) searchParams.set("size", params.size.toString())

  const query = searchParams.toString()
  const endpoint = query ? `${BASE_PATH}?${query}` : BASE_PATH

  return apiGet<PastQuestionsResponse>(endpoint)
}

/**
 * 질문 상세 조회
 */
export async function getQuestionById(id: number) {
  return apiGet<QuestionDetailResponse>(`${BASE_PATH}/${id}`)
}

/**
 * 질문 결과 조회
 */
export async function getQuestionResults(id: number) {
  return apiGet<QuestionResultResponse>(`${BASE_PATH}/${id}/results`)
}
