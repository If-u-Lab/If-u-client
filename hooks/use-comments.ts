"use client"

import { useState, useCallback, useEffect, useRef } from "react"
import { Comment } from "@/types/entities"
import type { CommentResponse, CommentReplyResponse } from "@/types/api"
import * as commentsApi from "@/lib/api/comments"

/**
 * 날짜 포맷 함수 (MM/DD HH:mm)
 */
function formatDate(isoDate: string): string {
  const date = new Date(isoDate)
  const month = String(date.getMonth() + 1).padStart(2, "0")
  const day = String(date.getDate()).padStart(2, "0")
  const hours = String(date.getHours()).padStart(2, "0")
  const minutes = String(date.getMinutes()).padStart(2, "0")
  return `${month}/${day} ${hours}:${minutes}`
}

/**
 * API 대댓글 응답을 Comment 엔티티로 변환
 */
function toReplyComment(reply: CommentReplyResponse, parentId: string): Comment {
  return {
    id: String(reply.commentId),
    author: reply.userNickname,
    userId: reply.userId,
    date: formatDate(reply.createdAt),
    text: reply.content,
    likes: reply.likeCount,
    userLiked: reply.isLiked,
    replies: [],
    isDeleted: reply.isDeleted,
    deletedBy: reply.deletedBy,
    parentId,
  }
}

/**
 * API 댓글 응답을 Comment 엔티티로 변환
 */
function toComment(response: CommentResponse): Comment {
  return {
    id: String(response.commentId),
    author: response.userNickname,
    userId: response.userId,
    date: formatDate(response.createdAt),
    text: response.content,
    likes: response.likeCount,
    userLiked: response.isLiked,
    replies: response.replies.map((r) => toReplyComment(r, String(response.commentId))),
    isDeleted: response.isDeleted,
    deletedBy: response.deletedBy,
    parentId: response.parentId ? String(response.parentId) : null,
  }
}

export function useComments(questionId: string) {
  const [comments, setComments] = useState<Comment[]>([])
  const [newCommentText, setNewCommentText] = useState("")
  const [replyingTo, setReplyingTo] = useState<string | null>(null)
  const [replyText, setReplyText] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // 현재 사용자 ID (AuthContext에서 가져와야 하지만 일단 localStorage에서)
  const [currentUserId, setCurrentUserId] = useState<number | null>(null)

  // 중복 호출 방지
  const isLoadingRef = useRef(false)
  const isSubmittingRef = useRef(false)

  // 현재 사용자 ID 로드
  useEffect(() => {
    // TODO: AuthContext에서 실제 userId 가져오기
    const storedUserId = localStorage.getItem("user_id")
    if (storedUserId) {
      setCurrentUserId(Number(storedUserId))
    }
  }, [])

  // 댓글 목록 조회
  const fetchComments = useCallback(async (pageNum = 1, append = false) => {
    if (isLoadingRef.current) return
    isLoadingRef.current = true

    try {
      setIsLoading(true)
      setError(null)
      const response = await commentsApi.getComments(Number(questionId), {
        page: pageNum,
        size: 10,
      })

      const newComments = response.data.items.map(toComment)

      if (append) {
        setComments((prev) => [...prev, ...newComments])
      } else {
        setComments(newComments)
      }

      setPage(pageNum)
      setHasMore(response.data.hasNext)
    } catch (err) {
      setError(err instanceof Error ? err.message : "댓글을 불러오지 못했습니다")
    } finally {
      setIsLoading(false)
      isLoadingRef.current = false
    }
  }, [questionId])

  // 초기 로드
  useEffect(() => {
    fetchComments(1)
  }, [fetchComments])

  // 더 불러오기
  const loadMore = useCallback(() => {
    if (hasMore && !isLoadingRef.current) {
      fetchComments(page + 1, true)
    }
  }, [hasMore, page, fetchComments])

  // 댓글 작성
  const addComment = useCallback(async (text: string) => {
    if (!text.trim() || isSubmittingRef.current) return

    isSubmittingRef.current = true
    setIsSubmitting(true)

    try {
      const response = await commentsApi.createComment({
        questionId: Number(questionId),
        parentId: null,
        content: text,
      })

      const newComment = toComment(response.data)
      setComments((prev) => [newComment, ...prev])
      setNewCommentText("")
    } catch (err) {
      setError(err instanceof Error ? err.message : "댓글 작성에 실패했습니다")
    } finally {
      isSubmittingRef.current = false
      setIsSubmitting(false)
    }
  }, [questionId])

  // 대댓글 작성
  const addReply = useCallback(async (parentId: string, text: string) => {
    if (!text.trim() || isSubmittingRef.current) return

    isSubmittingRef.current = true
    setIsSubmitting(true)

    try {
      const response = await commentsApi.createComment({
        questionId: Number(questionId),
        parentId: Number(parentId),
        content: text,
      })

      const newReply = toComment(response.data)
      // replies 배열이 빈 배열로 오므로, toReplyComment 형태로 변환
      const replyComment: Comment = {
        ...newReply,
        parentId,
      }

      setComments((prev) =>
        prev.map((comment) => {
          if (comment.id === parentId) {
            return {
              ...comment,
              replies: [...comment.replies, replyComment],
            }
          }
          return comment
        })
      )
      setReplyingTo(null)
      setReplyText("")
    } catch (err) {
      setError(err instanceof Error ? err.message : "답글 작성에 실패했습니다")
    } finally {
      isSubmittingRef.current = false
      setIsSubmitting(false)
    }
  }, [questionId])

  // 좋아요 토글
  const toggleLike = useCallback(async (commentId: string) => {
    // 먼저 현재 상태 확인
    let targetComment: Comment | undefined
    let isReply = false
    let parentCommentId: string | undefined

    // 댓글에서 찾기
    for (const comment of comments) {
      if (comment.id === commentId) {
        targetComment = comment
        break
      }
      // 대댓글에서 찾기
      const reply = comment.replies.find((r) => r.id === commentId)
      if (reply) {
        targetComment = reply
        isReply = true
        parentCommentId = comment.id
        break
      }
    }

    if (!targetComment) return

    const isCurrentlyLiked = targetComment.userLiked

    try {
      // 낙관적 업데이트
      setComments((prev) =>
        prev.map((comment) => {
          if (comment.id === commentId) {
            return {
              ...comment,
              likes: isCurrentlyLiked ? comment.likes - 1 : comment.likes + 1,
              userLiked: !isCurrentlyLiked,
            }
          }
          // 대댓글 업데이트
          return {
            ...comment,
            replies: comment.replies.map((reply) => {
              if (reply.id === commentId) {
                return {
                  ...reply,
                  likes: isCurrentlyLiked ? reply.likes - 1 : reply.likes + 1,
                  userLiked: !isCurrentlyLiked,
                }
              }
              return reply
            }),
          }
        })
      )

      // API 호출
      if (isCurrentlyLiked) {
        await commentsApi.unlikeComment(Number(commentId))
      } else {
        await commentsApi.likeComment(Number(commentId))
      }
    } catch (err) {
      // 롤백
      setComments((prev) =>
        prev.map((comment) => {
          if (comment.id === commentId) {
            return {
              ...comment,
              likes: isCurrentlyLiked ? comment.likes + 1 : comment.likes - 1,
              userLiked: isCurrentlyLiked,
            }
          }
          return {
            ...comment,
            replies: comment.replies.map((reply) => {
              if (reply.id === commentId) {
                return {
                  ...reply,
                  likes: isCurrentlyLiked ? reply.likes + 1 : reply.likes - 1,
                  userLiked: isCurrentlyLiked,
                }
              }
              return reply
            }),
          }
        })
      )
      setError(err instanceof Error ? err.message : "좋아요에 실패했습니다")
    }
  }, [comments])

  // 댓글 삭제
  const deleteComment = useCallback(async (commentId: string) => {
    try {
      await commentsApi.deleteComment(Number(commentId))

      // 삭제된 댓글 상태 업데이트 (완전 제거 대신 isDeleted 표시)
      setComments((prev) =>
        prev.map((comment) => {
          if (comment.id === commentId) {
            return {
              ...comment,
              isDeleted: true,
              deletedBy: "USER",
              text: "삭제된 댓글입니다",
            }
          }
          return {
            ...comment,
            replies: comment.replies.map((reply) => {
              if (reply.id === commentId) {
                return {
                  ...reply,
                  isDeleted: true,
                  deletedBy: "USER",
                  text: "삭제된 댓글입니다",
                }
              }
              return reply
            }),
          }
        })
      )
    } catch (err) {
      setError(err instanceof Error ? err.message : "삭제에 실패했습니다")
    }
  }, [])

  // 사용자 차단
  const blockUser = useCallback(async (commentId: string) => {
    try {
      await commentsApi.blockComment(Number(commentId))
      // 차단 후 댓글 목록 새로고침 (백엔드에서 차단된 사용자 댓글은 "차단된 댓글입니다"로 대체됨)
      await fetchComments(1)
    } catch (err) {
      setError(err instanceof Error ? err.message : "차단에 실패했습니다")
    }
  }, [fetchComments])

  // 댓글 신고
  const reportComment = useCallback(async (commentId: string) => {
    try {
      await commentsApi.reportComment(Number(commentId))
      // 신고 성공 알림 (추후 토스트로 대체)
      alert("신고가 접수되었습니다")
    } catch (err) {
      setError(err instanceof Error ? err.message : "신고에 실패했습니다")
    }
  }, [])

  // 본인 댓글 여부 확인
  const isOwnComment = useCallback((userId: number) => {
    return currentUserId === userId
  }, [currentUserId])

  return {
    comments,
    newCommentText,
    setNewCommentText,
    addComment,
    replyingTo,
    setReplyingTo,
    replyText,
    setReplyText,
    addReply,
    toggleLike,
    deleteComment,
    blockUser,
    reportComment,
    isLoading,
    isSubmitting,
    error,
    hasMore,
    loadMore,
    isOwnComment,
    currentUserId,
    refresh: () => fetchComments(1),
  }
}
