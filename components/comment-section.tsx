"use client"

import { ChatBubbleLeftIcon } from "@heroicons/react/24/outline"
import { Button } from "@/components/ui/button"
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
  } = useComments(questionId)

  const handleSubmitComment = () => {
    addComment(newCommentText)
  }

  const handleSubmitReply = (parentId: string) => {
    addReply(parentId, replyText)
  }

  return (
    <div className="bg-card rounded-lg border border-border p-6 space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg md:text-xl font-semibold text-foreground flex items-center gap-2.5">
          <ChatBubbleLeftIcon className="w-5 h-5 md:w-6 md:h-6 text-primary" />
          소통의 장
        </h3>
        <span className="text-sm md:text-base text-muted-foreground font-medium">{commentCount}개</span>
      </div>

      {/* Comments list */}
      <div className="space-y-4 max-h-96 overflow-y-auto">
        {comments.map((comment) => (
          <div key={comment.id} className="space-y-3">
            <CommentItem
              id={comment.id}
              author={comment.author}
              date={comment.date}
              text={comment.text}
              likes={comment.likes}
              userLiked={comment.userLiked}
              onReply={() => setReplyingTo(comment.id)}
              onLike={() => toggleLike(comment.id)}
            />

            {/* Replies */}
            {comment.replies.length > 0 && (
              <div className="space-y-3">
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
                    onLike={() => toggleLike(reply.id)}
                  />
                ))}
              </div>
            )}

            {/* Reply input */}
            {replyingTo === comment.id && (
              <div className="ml-6 border-l-2 border-muted pl-4 py-2 space-y-3">
                <textarea
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  placeholder="답글을 입력하세요..."
                  className="w-full px-4 py-3 rounded-lg bg-muted text-foreground placeholder-muted-foreground text-sm md:text-base focus:outline-none focus:ring-2 focus:ring-primary resize-none leading-relaxed"
                  rows={2}
                />
                <div className="flex gap-2 justify-end">
                  <Button size="sm" variant="outline" onClick={() => setReplyingTo(null)}>
                    취소
                  </Button>
                  <Button
                    size="sm"
                    className="bg-primary active:bg-primary/90 text-white"
                    onClick={() => handleSubmitReply(comment.id)}
                  >
                    답글 등록
                  </Button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* New comment input */}
      <div className="flex flex-col gap-3 pt-4 border-t border-border">
        <textarea
          value={newCommentText}
          onChange={(e) => setNewCommentText(e.target.value)}
          placeholder="댓글을 입력하세요..."
          className="w-full px-4 py-3 rounded-lg bg-muted text-foreground placeholder-muted-foreground text-sm md:text-base focus:outline-none focus:ring-2 focus:ring-primary resize-none leading-relaxed"
          rows={3}
        />
        <div className="flex justify-end">
          <Button
            size="sm"
            className="bg-primary active:bg-primary/90 text-white"
            onClick={handleSubmitComment}
            disabled={!newCommentText.trim()}
          >
            댓글 등록
          </Button>
        </div>
      </div>
    </div>
  )
}
