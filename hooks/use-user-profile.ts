"use client"

import { useState, useCallback, useEffect, useRef } from "react"
import { UserProfile, ActivityItem } from "@/types/user"
import { useAuthContext } from "@/contexts/auth-context"
import * as usersApi from "@/lib/api/users"

// weeklyActivity 배열을 ActivityItem 배열로 변환
// API 순서: [오늘, 어제, 그제, ..., 6일전] → 그대로 사용 (1일차=오늘)
function convertWeeklyActivity(weeklyActivity: boolean[]): ActivityItem[] {
  // weeklyActivity가 7개 미만이면 뒤에 false로 채움 (오래된 날짜)
  const paddedActivity = [...weeklyActivity, ...Array(7 - weeklyActivity.length).fill(false)]

  return paddedActivity.map((participated, i) => ({
    date: `${i + 1}일차`,
    participated,
    isToday: i === 0,
  }))
}

// 기본 활동 데이터 생성 (API 실패 시 사용)
function generateDefaultActivity(): ActivityItem[] {
  return Array.from({ length: 7 }, (_, i) => ({
    date: `${i + 1}일차`,
    participated: false,
    isToday: i === 0,
  }))
}

export function useUserProfile() {
  const { user } = useAuthContext()
  const [profile, setProfile] = useState<UserProfile>({
    id: "",
    username: "로딩 중...",
    totalVotes: 0,
    totalComments: 0,
    engagementRate: 0,
    majorityRate: 0,
    currentStreak: 0,
    ticketCount: 0,
    recentActivity: generateDefaultActivity(),
    bestComments: [],
  })
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // 중복 호출 방지
  const isFetchingRef = useRef(false)

  // 내 정보 조회
  const fetchProfile = useCallback(async () => {
    if (isFetchingRef.current) return
    isFetchingRef.current = true

    try {
      setIsLoading(true)
      setError(null)
      const response = await usersApi.getMe()
      const data = response.data

      setProfile({
        id: data.id.toString(),
        username: data.nickname,
        totalVotes: data.stats.totalVotes,
        totalComments: data.stats.totalComments,
        engagementRate: Math.round(data.stats.participationRate),
        majorityRate: Math.round(data.stats.majorityRate),
        currentStreak: data.stats.currentStreak,
        ticketCount: data.stats.ticketCount,
        recentActivity: convertWeeklyActivity(data.stats.weeklyActivity),
        bestComments: [],
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : "프로필을 불러오지 못했습니다")
      // 에러 시 auth context의 기본 정보 사용
      if (user) {
        setProfile((prev) => ({
          ...prev,
          id: user.id.toString(),
          username: user.nickname,
        }))
      }
    } finally {
      setIsLoading(false)
      isFetchingRef.current = false
    }
  }, [user])

  // 인증된 사용자일 때 프로필 로드
  useEffect(() => {
    if (user) {
      fetchProfile()
    }
  }, [user, fetchProfile])

  return {
    profile,
    isLoading,
    error,
    fetchProfile,
  }
}
