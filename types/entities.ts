// 핵심 도메인 엔티티 타입 정의

/**
 * 댓글 삭제 주체
 */
export type CommentDeletedBy = "USER" | "ADMIN" | null

/**
 * 댓글 엔티티
 */
export interface Comment {
  id: string
  author: string
  userId: number
  avatar?: string
  date: string
  text: string
  likes: number
  replies: Comment[]
  userLiked?: boolean
  questionId?: string  // 프로필 베스트 댓글용
  isDeleted: boolean
  deletedBy: CommentDeletedBy
  parentId: string | null
}

/**
 * 질문 엔티티
 */
export interface Question {
  id: string
  title: string
  description?: string
  category?: string
  options: string[]
  totalVotes: number
  votes: number[]
  commentCount: number
  date: string
  isToday?: boolean
  status: "DRAFT" | "PUBLISHED" | "CLOSED"
  comments?: Comment[]
  hasVoted: boolean
  userChoice: number | null
  canViewResults?: boolean
  canChangeVote?: boolean
}
