"use client"

import { useState, useCallback } from "react"
import { Comment } from "@/types/entities"

// Mock data
const mockCommentsData: Comment[] = [
  {
    id: "1",
    author: "user01",
    date: "25/10/04 20:15",
    text: "AI 기술 발전은 필연적인 흐름이라고 생각해요. 중요한 건 이에 대한 준비입니다.",
    likes: 23,
    replies: [
      {
        id: "r1",
        author: "user02",
        date: "25/10/04 20:30",
        text: "맞아요! 기술 변화에 대비하는 교육이 정말 중요하다고 봅니다.",
        likes: 5,
        replies: [],
        userLiked: false,
      },
      {
        id: "r2",
        author: "user03",
        date: "25/10/04 20:45",
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
    author: "techGuru_2024",
    date: "25/10/04 19:45",
    text: "AI가 단순 반복 업무를 대체하면 우리는 더 창의적인 일에 집중할 수 있습니다.",
    likes: 42,
    replies: [],
    userLiked: false,
  },
  {
    id: "3",
    author: "economistMind",
    date: "25/10/04 19:20",
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
      author: "currentUser",
      date: new Date().toLocaleString("ko-KR"),
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
      author: "currentUser",
      date: new Date().toLocaleString("ko-KR"),
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
  }
}
