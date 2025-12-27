"use client"

import { useState, useRef, useCallback, type ReactNode } from "react"
import { ArrowPathIcon } from "@heroicons/react/24/outline"

interface PullToRefreshProps {
  onRefresh: () => Promise<void>
  children: ReactNode
}

export function PullToRefresh({ onRefresh, children }: PullToRefreshProps) {
  const [pullDistance, setPullDistance] = useState(0)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const startY = useRef(0)
  const isPulling = useRef(false)

  const THRESHOLD = 80 // 새로고침 트리거 거리

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    const container = containerRef.current
    if (!container || isRefreshing) return

    // 스크롤이 맨 위에 있을 때만 pull-to-refresh 활성화
    if (container.scrollTop === 0) {
      startY.current = e.touches[0].clientY
      isPulling.current = true
    }
  }, [isRefreshing])

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (!isPulling.current || isRefreshing) return

    const currentY = e.touches[0].clientY
    const diff = currentY - startY.current

    if (diff > 0) {
      // 저항감 있는 당김 효과 (로그 스케일)
      const distance = Math.min(diff * 0.5, THRESHOLD * 1.5)
      setPullDistance(distance)
    }
  }, [isRefreshing])

  const handleTouchEnd = useCallback(async () => {
    if (!isPulling.current) return
    isPulling.current = false

    if (pullDistance >= THRESHOLD && !isRefreshing) {
      setIsRefreshing(true)
      setPullDistance(THRESHOLD * 0.6) // 새로고침 중 인디케이터 위치

      try {
        await onRefresh()
      } finally {
        setIsRefreshing(false)
        setPullDistance(0)
      }
    } else {
      setPullDistance(0)
    }
  }, [pullDistance, isRefreshing, onRefresh])

  const progress = Math.min(pullDistance / THRESHOLD, 1)

  return (
    <div
      ref={containerRef}
      className="h-full overflow-auto"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Pull indicator */}
      <div
        className="flex justify-center items-center overflow-hidden transition-all duration-200"
        style={{ height: pullDistance > 0 || isRefreshing ? `${Math.max(pullDistance, isRefreshing ? 48 : 0)}px` : 0 }}
      >
        <div
          className="flex items-center justify-center"
          style={{
            opacity: progress,
            transform: `rotate(${progress * 360}deg)`,
          }}
        >
          <ArrowPathIcon
            className={`w-6 h-6 text-primary/60 ${isRefreshing ? "animate-spin" : ""}`}
          />
        </div>
      </div>

      {children}
    </div>
  )
}
