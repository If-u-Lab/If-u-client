"use client"

import { HeartIcon, ChatBubbleLeftIcon } from "@heroicons/react/24/outline"
import { HeartIcon as HeartSolidIcon, UserCircleIcon } from "@heroicons/react/24/solid"

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
        <UserCircleIcon className="w-10 h-10 text-primary/60 flex-shrink-0" />

        <div className="flex-1 space-y-2">
          {/* Header with author and date */}
          <div className="flex items-center gap-2.5">
            <p className="text-sm md:text-base font-semibold text-primary">{author}</p>
            <p className="text-xs md:text-sm text-muted-foreground">{date}</p>
          </div>

          {/* Comment text */}
          <p className="text-sm md:text-base text-foreground leading-relaxed">{text}</p>

          {/* Actions */}
          <div className="flex items-center gap-4 pt-1">
            <button
              onClick={() => onLike?.(id)}
              className={`flex items-center gap-1.5 text-xs md:text-sm transition-colors p-1.5 rounded active:bg-muted ${
                userLiked ? "text-red-500" : "text-muted-foreground active:text-foreground"
              }`}
            >
              {userLiked ? (
                <HeartSolidIcon className="w-4 h-4 md:w-5 md:h-5 text-red-500" />
              ) : (
                <HeartIcon className="w-4 h-4 md:w-5 md:h-5" />
              )}
              <span className="font-medium">{likes > 0 ? likes : ""}</span>
            </button>

            {!isReply && onReply && (
              <button
                onClick={() => onReply(id)}
                className="flex items-center gap-1.5 text-xs md:text-sm text-muted-foreground active:text-foreground transition-colors p-1.5 rounded active:bg-muted"
              >
                <ChatBubbleLeftIcon className="w-4 h-4 md:w-5 md:h-5" />
                <span className="font-medium">답글</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
