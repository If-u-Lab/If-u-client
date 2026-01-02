import { apiGet, apiPost, apiDelete } from "@/lib/api-client"
import type {
  CommentResponse,
  CommentsListResponse,
  CreateCommentRequest,
} from "@/types/api"

const BASE_PATH = "/api/v1"

/**
 * 댓글 목록 조회
 */
export async function getComments(
  questionId: number,
  params?: { page?: number; size?: number }
) {
  const searchParams = new URLSearchParams()
  if (params?.page) searchParams.set("page", String(params.page))
  if (params?.size) searchParams.set("size", String(params.size))

  const query = searchParams.toString()
  const endpoint = `${BASE_PATH}/questions/${questionId}/comments${query ? `?${query}` : ""}`

  return apiGet<CommentsListResponse>(endpoint)
}

/**
 * 댓글 작성
 */
export async function createComment(data: CreateCommentRequest) {
  return apiPost<CommentResponse>(`${BASE_PATH}/comments`, data)
}

/**
 * 댓글 삭제
 */
export async function deleteComment(commentId: number) {
  return apiDelete<null>(`${BASE_PATH}/comments/${commentId}`)
}

/**
 * 댓글 좋아요
 */
export async function likeComment(commentId: number) {
  return apiPost<null>(`${BASE_PATH}/comments/${commentId}/like`)
}

/**
 * 댓글 좋아요 취소
 */
export async function unlikeComment(commentId: number) {
  return apiDelete<null>(`${BASE_PATH}/comments/${commentId}/like`)
}

/**
 * 댓글 신고
 */
export async function reportComment(commentId: number) {
  return apiPost<null>(`${BASE_PATH}/comments/${commentId}/report`)
}

/**
 * 댓글 차단
 */
export async function blockComment(commentId: number) {
  return apiPost<null>(`${BASE_PATH}/comments/${commentId}/block`)
}
