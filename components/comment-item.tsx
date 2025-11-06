"use client"

import { Heart, MessageCircle } from "lucide-react"

interface CommentItemProps {
  id: string
  author: string
  date: string
  text: string
  likes: number
  isReply?: boolean
  userLiked?: boolean
  onReply?: (commentId: string) => void
  onLike?: (commentId: string) => void
}

export function CommentItem({
  id,
  author,
  date,
  text,
  likes,
  isReply = false,
  userLiked = false,
  onReply,
  onLike,
}: CommentItemProps) {
  return (
    <div className={`${isReply ? "ml-6 border-l-2 border-muted pl-4" : ""}`}>
      <div className="flex gap-3">
        {/* Avatar placeholder */}
        <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
          <span className="text-xs font-bold text-primary">{author[0].toUpperCase()}</span>
        </div>

        <div className="flex-1 space-y-2">
          {/* Header with author and date */}
          <div className="flex items-center gap-2">
            <p className="text-sm font-medium text-primary">{author}</p>
            <p className="text-xs text-muted-foreground">{date}</p>
          </div>

          {/* Comment text */}
          <p className="text-sm text-foreground leading-relaxed">{text}</p>

          {/* Actions */}
          <div className="flex items-center gap-4 pt-1">
            <button
              onClick={() => onLike?.(id)}
              className={`flex items-center gap-1 text-xs transition-colors ${
                userLiked ? "text-red-500" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Heart size={16} className={userLiked ? "fill-red-500" : ""} />
              <span>{likes > 0 ? likes : ""}</span>
            </button>

            {!isReply && onReply && (
              <button
                onClick={() => onReply(id)}
                className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
              >
                <MessageCircle size={16} />
                <span>답글</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
