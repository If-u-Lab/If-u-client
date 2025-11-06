// 사용자 관련 타입 정의

import { Comment } from "./entities"

/**
 * 사용자 프로필
 */
export interface UserProfile {
  id: string
  username: string
  bio?: string
  totalVotes: number
  totalComments: number
  engagementRate: number
  joinDate: string
  recentActivity: ActivityItem[]
  bestComments: Comment[]
}

/**
 * 활동 통계 항목
 */
export interface ActivityItem {
  date: string
  count: number
}
