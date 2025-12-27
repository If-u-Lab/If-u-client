"use client"

import { useState, useRef, useEffect } from "react"
import { UserGroupIcon, ScaleIcon, RocketLaunchIcon, HandThumbUpIcon, ChatBubbleOvalLeftIcon, EllipsisVerticalIcon } from "@heroicons/react/24/outline"
import { HandThumbUpIcon as HandThumbUpSolidIcon } from "@heroicons/react/24/solid"

interface CommentItemProps {
  id: string
  author: string
  date: string
  text: string
  likes: number
  isReply?: boolean
  userLiked?: boolean
  isOwn?: boolean
  onReply?: (commentId: string) => void
  onLike?: (commentId: string) => void
  onDelete?: (commentId: string) => void
  onBlock?: (commentId: string) => void
  onReport?: (commentId: string) => void
}

export function CommentItem({
  id,
  author,
  date,
  text,
  likes,
  isReply = false,
  userLiked = false,
  isOwn = false,
  onReply,
  onLike,
  onDelete,
  onBlock,
  onReport,
}: CommentItemProps) {
  const [showMenu, setShowMenu] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  // 프로필 아이콘 3가지 (author 기반으로 결정)
  const profileIcons = [UserGroupIcon, ScaleIcon, RocketLaunchIcon]
  const iconIndex = author.charCodeAt(0) % 3
  const ProfileIcon = profileIcons[iconIndex]

  // 메뉴 외부 클릭 시 닫기
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowMenu(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  return (
    <div className={`${isReply ? "ml-6 pl-3 border-l-2 border-muted" : ""}`}>
      {/* Header - 프로필 아이콘, 작성자, 액션 버튼들 */}
      <div className="flex items-center justify-between mb-1">
        <div className="flex items-center gap-1.5">
          <div className="w-5 h-5 rounded-full flex items-center justify-center bg-primary/20 text-primary">
            <ProfileIcon className="w-3 h-3" />
          </div>
          <span className="text-[15px] font-medium text-foreground">{author}</span>
        </div>

        {/* 우측 액션 버튼들 */}
        <div className="flex items-center gap-1">
          <button
            onClick={() => onLike?.(id)}
            className={`p-1 ${userLiked ? "text-primary/60" : "text-muted-foreground"}`}
          >
            {userLiked ? (
              <HandThumbUpSolidIcon className="w-4 h-4" />
            ) : (
              <HandThumbUpIcon className="w-4 h-4" />
            )}
          </button>
          {!isReply && onReply && (
            <button
              onClick={() => onReply(id)}
              className="p-1 text-muted-foreground"
            >
              <ChatBubbleOvalLeftIcon className="w-4 h-4" />
            </button>
          )}
          <div className="relative" ref={menuRef}>
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="p-1 text-muted-foreground"
            >
              <EllipsisVerticalIcon className="w-4 h-4" />
            </button>

            {/* 드롭다운 메뉴 */}
            {showMenu && (
              <div className="absolute right-0 top-full mt-1 bg-card border border-border rounded-lg shadow-lg py-1 min-w-[100px] z-10">
                {isOwn ? (
                  <button
                    onClick={() => {
                      onDelete?.(id)
                      setShowMenu(false)
                    }}
                    className="w-full px-3 py-2 text-left text-sm text-destructive hover:bg-muted"
                  >
                    삭제
                  </button>
                ) : (
                  <>
                    <button
                      onClick={() => {
                        onBlock?.(id)
                        setShowMenu(false)
                      }}
                      className="w-full px-3 py-2 text-left text-sm text-foreground hover:bg-muted"
                    >
                      차단
                    </button>
                    <button
                      onClick={() => {
                        onReport?.(id)
                        setShowMenu(false)
                      }}
                      className="w-full px-3 py-2 text-left text-sm text-foreground hover:bg-muted"
                    >
                      신고
                    </button>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 댓글 내용 */}
      <p className="text-base text-foreground leading-relaxed mb-1.5 pl-[26px]">{text}</p>

      {/* 날짜 & 좋아요 수 */}
      <div className="flex items-center gap-2 pl-[26px]">
        <span className="text-sm text-muted-foreground">{date}</span>
        {likes > 0 && (
          <>
            {userLiked ? (
              <HandThumbUpSolidIcon className="w-3 h-3 text-primary/60" />
            ) : (
              <HandThumbUpIcon className="w-3 h-3 text-muted-foreground" />
            )}
            <span className={`text-sm ${userLiked ? "text-primary/60" : "text-muted-foreground"}`}>{likes}</span>
          </>
        )}
      </div>
    </div>
  )
}
