"use client"

import { useRef, useEffect, useCallback } from "react"
import { PaperAirplaneIcon } from "@heroicons/react/24/solid"
import { CommentItem } from "@/components/comment-item"
import { useComments } from "@/hooks/use-comments"

interface CommentSectionProps {
  questionId: string
  commentCount: number
}

export function CommentSection({ questionId, commentCount }: CommentSectionProps) {
  const {
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
    hasMore,
    loadMore,
    isOwnComment,
  } = useComments(questionId)

  // 무한스크롤을 위한 observer
  const observerTarget = useRef<HTMLDivElement>(null)

  const handleObserver = useCallback(
    (entries: IntersectionObserverEntry[]) => {
      const [target] = entries
      if (target.isIntersecting && hasMore && !isLoading) {
        loadMore()
      }
    },
    [hasMore, isLoading, loadMore]
  )

  useEffect(() => {
    const element = observerTarget.current
    if (!element) return

    const observer = new IntersectionObserver(handleObserver, {
      threshold: 0.1,
    })

    observer.observe(element)
    return () => observer.unobserve(element)
  }, [handleObserver])

  const handleSubmitComment = () => {
    if (newCommentText.trim()) {
      addComment(newCommentText)
    }
  }

  const handleSubmitReply = (parentId: string) => {
    if (replyText.trim()) {
      addReply(parentId, replyText)
    }
  }

  return (
    <div className="flex flex-col h-full">
      {/* 댓글 목록 - 스크롤 영역 */}
      <div className="flex-1 overflow-y-auto px-5 md:px-8 py-4">
        <div className="space-y-0">
          {comments.length === 0 && !isLoading ? (
            <p className="text-sm text-muted-foreground text-center py-8">
              첫 번째 댓글을 남겨보세요
            </p>
          ) : (
            comments.map((comment, index) => (
              <div key={comment.id}>
                {/* 댓글 구분선 */}
                {index > 0 && <div className="border-t border-border my-3" />}

                <div className="py-2">
                  <CommentItem
                    id={comment.id}
                    author={comment.author}
                    date={comment.date}
                    text={comment.text}
                    likes={comment.likes}
                    userLiked={comment.userLiked}
                    isOwn={isOwnComment(comment.userId)}
                    isDeleted={comment.isDeleted}
                    deletedBy={comment.deletedBy}
                    onReply={!comment.isDeleted ? () => setReplyingTo(replyingTo === comment.id ? null : comment.id) : undefined}
                    onLike={() => toggleLike(comment.id)}
                    onDelete={() => deleteComment(comment.id)}
                    onBlock={() => blockUser(comment.id)}
                    onReport={() => reportComment(comment.id)}
                  />

                  {/* 대댓글 */}
                  {comment.replies.length > 0 && (
                    <div className="mt-3 space-y-3">
                      {comment.replies.map((reply) => (
                        <CommentItem
                          key={reply.id}
                          id={reply.id}
                          author={reply.author}
                          date={reply.date}
                          text={reply.text}
                          likes={reply.likes}
                          isReply={true}
                          userLiked={reply.userLiked}
                          isOwn={isOwnComment(reply.userId)}
                          isDeleted={reply.isDeleted}
                          deletedBy={reply.deletedBy}
                          onLike={() => toggleLike(reply.id)}
                          onDelete={() => deleteComment(reply.id)}
                          onBlock={() => blockUser(reply.id)}
                          onReport={() => reportComment(reply.id)}
                        />
                      ))}
                    </div>
                  )}

                  {/* 답글 입력 - 삭제된 댓글에는 답글 불가 */}
                  {replyingTo === comment.id && !comment.isDeleted && (
                    <div className="mt-3 ml-6 pl-3 border-l-2 border-muted">
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          value={replyText}
                          onChange={(e) => setReplyText(e.target.value)}
                          placeholder="답글을 입력하세요..."
                          className="flex-1 px-3 py-2 bg-muted/50 rounded-lg text-sm text-foreground placeholder-muted-foreground focus:outline-none focus:bg-muted"
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              handleSubmitReply(comment.id)
                            } else if (e.key === "Escape") {
                              setReplyingTo(null)
                            }
                          }}
                          autoFocus
                        />
                        <button
                          onClick={() => handleSubmitReply(comment.id)}
                          disabled={!replyText.trim() || isSubmitting}
                          className="p-2 text-primary/60 disabled:opacity-40"
                        >
                          <PaperAirplaneIcon className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        {/* 무한스크롤 트리거 & 로딩 */}
        {hasMore && (
          <div ref={observerTarget} className="py-4 text-center">
            {isLoading && (
              <div className="inline-flex items-center gap-2 text-sm text-muted-foreground">
                <div className="w-4 h-4 border-2 border-primary/60 border-t-transparent rounded-full animate-spin" />
                <span>로딩 중...</span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* 댓글 입력 - 하단 고정 */}
      <div className="flex-shrink-0 bg-background border-t border-border px-5 py-3">
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={newCommentText}
            onChange={(e) => setNewCommentText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault()
                handleSubmitComment()
              }
            }}
            placeholder="댓글을 입력하세요..."
            className="flex-1 px-3 py-2.5 bg-muted/50 rounded-lg text-sm text-foreground placeholder-muted-foreground focus:outline-none focus:bg-muted"
          />
          <button
            onClick={handleSubmitComment}
            disabled={!newCommentText.trim() || isSubmitting}
            className="p-2 text-primary/60 disabled:opacity-40"
          >
            <PaperAirplaneIcon className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  )
}
