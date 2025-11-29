"use client"

import { useState, useCallback, useEffect } from "react"
import { UserProfile, ActivityItem } from "@/types/user"
import { useAuthContext } from "@/contexts/auth-context"

// Mock activity data (실제 API 연동 시 제거)
const mockActivityData = {
  totalVotes: 47,
  totalComments: 123,
  engagementRate: 89,
  joinDate: "2024-08-15",
  recentActivity: [
    { date: "10/01", count: 3 },
    { date: "10/02", count: 2 },
    { date: "10/03", count: 5 },
    { date: "10/04", count: 4 },
    { date: "10/05", count: 2 },
    { date: "10/06", count: 4 },
    { date: "10/07", count: 3 },
  ],
  bestComments: [
    {
      id: "c1",
      text: "AI가 단순 반복 업무를 대체하면 우리는 더 창의적인 일에 집중할 수 있습니다.",
      likes: 89,
      questionId: "1",
      date: "25/10/04",
    },
    {
      id: "c2",
      text: "기술 변화에 대비하는 교육이 정말 중요하다고 봅니다.",
      likes: 52,
      questionId: "1",
      date: "25/10/03",
    },
  ],
}

export function useUserProfile() {
  const { user } = useAuthContext()
  const [profile, setProfile] = useState<UserProfile>({
    id: user?.id.toString() || "user-001",
    username: user?.nickname || "게스트",
    bio: "매일의 질문으로 세상을 알아가고 있습니다",
    ...mockActivityData,
  })
  const [editMode, setEditMode] = useState(false)
  const [editedBio, setEditedBio] = useState(profile.bio || "")

  // 로그인한 사용자 정보로 프로필 업데이트
  useEffect(() => {
    if (user) {
      setProfile((prev) => ({
        ...prev,
        id: user.id.toString(),
        username: user.nickname,
      }))
    }
  }, [user])

  const updateBio = useCallback((newBio: string) => {
    setProfile((prev) => ({
      ...prev,
      bio: newBio,
    }))
    setEditMode(false)
  }, [])

  const getDaysSinceJoin = useCallback(() => {
    const joinDate = new Date(profile.joinDate)
    const today = new Date()
    const diff = today.getTime() - joinDate.getTime()
    return Math.floor(diff / (1000 * 60 * 60 * 24))
  }, [profile.joinDate])

  const getAverageDaily = useCallback(() => {
    const days = getDaysSinceJoin()
    return (profile.totalVotes / days).toFixed(1)
  }, [profile.totalVotes, getDaysSinceJoin])

  return {
    profile,
    editMode,
    setEditMode,
    editedBio,
    setEditedBio,
    updateBio,
    getDaysSinceJoin,
    getAverageDaily,
  }
}
