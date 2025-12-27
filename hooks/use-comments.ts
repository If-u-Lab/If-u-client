"use client"

import { useState, useCallback } from "react"
import { Comment } from "@/types/entities"

// 날짜 포맷 함수 (MM/DD HH:mm)
function formatDate(date: Date): string {
  const month = String(date.getMonth() + 1).padStart(2, "0")
  const day = String(date.getDate()).padStart(2, "0")
  const hours = String(date.getHours()).padStart(2, "0")
  const minutes = String(date.getMinutes()).padStart(2, "0")
  return `${month}/${day} ${hours}:${minutes}`
}

// 랜덤 닉네임 생성용 단어
const adjectives = ["행복한", "빠른", "느긋한", "귀여운", "용감한", "졸린", "배고픈", "신나는", "차분한", "영리한"]
const nouns = ["고양이", "강아지", "토끼", "다람쥐", "펭귄", "코알라", "판다", "여우", "사자", "호랑이"]

function generateNickname(): string {
  const adj = adjectives[Math.floor(Math.random() * adjectives.length)]
  const noun = nouns[Math.floor(Math.random() * nouns.length)]
  return `${adj}${noun}`
}

// 현재 사용자 닉네임 (실제로는 AuthContext에서 가져와야 함)
const CURRENT_USER = "즐거운펭귄"

// Mock data
const mockCommentsData: Comment[] = [
  {
    id: "1",
    author: "행복한고양이",
    date: "12/27 20:15",
    text: "AI 기술 발전은 필연적인 흐름이라고 생각해요. 중요한 건 이에 대한 준비입니다.",
    likes: 23,
    replies: [
      {
        id: "r1",
        author: "빠른토끼",
        date: "12/27 20:30",
        text: "맞아요! 기술 변화에 대비하는 교육이 정말 중요하다고 봅니다.",
        likes: 5,
        replies: [],
        userLiked: false,
      },
      {
        id: "r2",
        author: "용감한사자",
        date: "12/27 20:45",
        text: "하지만 일자리 감소로 인한 사회적 안전망도 필요하지 않을까요?",
        likes: 8,
        replies: [],
        userLiked: false,
      },
    ],
    userLiked: false,
  },
  {
    id: "2",
    author: "귀여운판다",
    date: "12/27 19:45",
    text: "AI가 단순 반복 업무를 대체하면 우리는 더 창의적인 일에 집중할 수 있습니다.",
    likes: 42,
    replies: [],
    userLiked: false,
  },
  {
    id: "3",
    author: "느긋한코알라",
    date: "12/27 19:20",
    text: "역사적으로 기술 발전은 새로운 일자리를 만들어왔습니다. 산업 혁명 때도 그랬죠.",
    likes: 15,
    replies: [],
    userLiked: true,
  },
]

export function useComments(questionId: string) {
  const [comments, setComments] = useState<Comment[]>(mockCommentsData)
  const [newCommentText, setNewCommentText] = useState("")
  const [replyingTo, setReplyingTo] = useState<string | null>(null)
  const [replyText, setReplyText] = useState("")

  const addComment = useCallback((text: string) => {
    if (!text.trim()) return

    const newComment: Comment = {
      id: `comment-${Date.now()}`,
      author: CURRENT_USER,
      date: formatDate(new Date()),
      text,
      likes: 0,
      replies: [],
      userLiked: false,
    }

    setComments((prev) => [newComment, ...prev])
    setNewCommentText("")
  }, [])

  const addReply = useCallback((parentId: string, text: string) => {
    if (!text.trim()) return

    const reply: Comment = {
      id: `reply-${Date.now()}`,
      author: CURRENT_USER,
      date: formatDate(new Date()),
      text,
      likes: 0,
      replies: [],
      userLiked: false,
    }

    setComments((prev) =>
      prev.map((comment) => {
        if (comment.id === parentId) {
          return {
            ...comment,
            replies: [reply, ...comment.replies],
          }
        }
        return comment
      }),
    )
    setReplyingTo(null)
    setReplyText("")
  }, [])

  const toggleLike = useCallback((commentId: string) => {
    setComments((prev) =>
      prev.map((comment) => {
        if (comment.id === commentId) {
          return {
            ...comment,
            likes: comment.userLiked ? comment.likes - 1 : comment.likes + 1,
            userLiked: !comment.userLiked,
          }
        }
        // Also update nested replies
        return {
          ...comment,
          replies: comment.replies.map((reply) => {
            if (reply.id === commentId) {
              return {
                ...reply,
                likes: reply.userLiked ? reply.likes - 1 : reply.likes + 1,
                userLiked: !reply.userLiked,
              }
            }
            return reply
          }),
        }
      }),
    )
  }, [])

  const deleteComment = useCallback((commentId: string) => {
    setComments((prev) =>
      prev
        .filter((comment) => comment.id !== commentId)
        .map((comment) => ({
          ...comment,
          replies: comment.replies.filter((reply) => reply.id !== commentId),
        })),
    )
  }, [])

  const blockUser = useCallback((commentId: string) => {
    // TODO: API 연동 시 실제 차단 기능 구현
    console.log("차단:", commentId)
  }, [])

  const reportComment = useCallback((commentId: string) => {
    // TODO: API 연동 시 실제 신고 기능 구현
    console.log("신고:", commentId)
  }, [])

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
  }
}
