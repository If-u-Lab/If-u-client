// 백엔드 API 응답 타입 정의

/**
 * 질문 상태
 */
export type QuestionStatus = "DRAFT" | "PUBLISHED" | "CLOSED"

/**
 * 질문 카테고리
 */
export type QuestionCategory =
  | "RELATIONSHIP"
  | "FAMILY"
  | "ROMANCE"
  | "WORKPLACE"
  | "SCHOOL"
  | "VALUES"
  | "SOCIAL"
  | "MONEY"
  | "LEISURE"
  | "TECHNOLOGY"

/**
 * 투표 통계
 */
export interface VoteStats {
  choice1Percent: number
  choice2Percent: number
}

/**
 * 질문 API 응답 (공통 필드)
 */
export interface QuestionResponse {
  questionId: number
  title: string
  description?: string
  category: QuestionCategory
  categoryDisplayName: string
  choice1: string
  choice2: string
  status: QuestionStatus
  publishAt: string
  closeAt?: string
  participants: number
  hasVoted: boolean
  userChoice: number | null
  canVote?: boolean
  canChangeVote?: boolean
  voteStats: VoteStats | null
}

/**
 * 오늘의 질문 조회 응답
 */
export interface TodayQuestionResponse extends QuestionResponse {
  canVote: boolean
  canChangeVote: boolean
}

/**
 * 지난 질문 목록 아이템
 */
export interface PastQuestionItem extends QuestionResponse {}

/**
 * 지난 질문 목록 조회 응답 (커서 기반 페이지네이션)
 */
export interface PastQuestionsResponse {
  items: PastQuestionItem[]
  nextCursor: string | null
}

/**
 * 질문 상세 조회 응답
 */
export interface QuestionDetailResponse extends QuestionResponse {
  canVote: boolean
  canChangeVote: boolean
}

/**
 * 질문 결과 조회 응답
 */
export interface QuestionResultResponse {
  questionId: number
  participants: number
  voteStats: VoteStats | null
  updatedAt: string
}

/**
 * 투표 응답
 */
export interface VoteResponse {
  questionId: number
  userChoice: number
  isChanged: boolean
  participants: number
  voteStats: VoteStats
}

/**
 * 참여율 Top 5 질문 조회 응답
 */
export type TopQuestionsResponse = QuestionResponse[]

/**
 * 사용자 역할
 */
export type UserRole = "USER" | "ADMIN"

/**
 * 사용자 통계
 */
export interface UserStats {
  totalVotes: number
  totalComments: number
  participationRate: number
  majorityRate: number
  currentStreak: number
  weeklyActivity: boolean[]
}

/**
 * 내 정보 조회 응답
 */
export interface UserResponse {
  id: number
  nickname: string
  email: string
  providerId: string
  role: UserRole
  isDeleted: boolean
  notificationEnabled: boolean
  stats: UserStats
}
