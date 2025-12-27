"use client"

import { Cog6ToothIcon, TicketIcon } from "@heroicons/react/24/outline"
import { FireIcon } from "@heroicons/react/24/solid"
import { UserGroupIcon, ScaleIcon, RocketLaunchIcon } from "@heroicons/react/24/solid"
import { useUserProfile } from "@/hooks/use-user-profile"
import { LoadingSkeleton } from "@/components/loading-skeleton"
import { useRouter } from "next/navigation"

// 투표 성향 타입 정의
type TendencyType = "majority" | "balanced" | "independent"

interface TendencyInfo {
  type: TendencyType
  name: string
  icon: typeof UserGroupIcon
}

// 성향 분류 기준값
const TENDENCY_THRESHOLD = {
  MAJORITY: 71,  // 71% 이상: 대세파
  BALANCED: 31,  // 31% 이상: 균형파, 미만: 소신파
}

// majorityRate에 따른 성향 결정
function getTendency(majorityRate: number): TendencyInfo {
  if (majorityRate >= TENDENCY_THRESHOLD.MAJORITY) {
    return { type: "majority", name: "대중과 통하는 공감자", icon: UserGroupIcon }
  } else if (majorityRate >= TENDENCY_THRESHOLD.BALANCED) {
    return { type: "balanced", name: "균형 잡힌 중재자", icon: ScaleIcon }
  } else {
    return { type: "independent", name: "흔들리지 않는 개척자", icon: RocketLaunchIcon }
  }
}

export default function ProfilePage() {
  const { profile, isLoading } = useUserProfile()
  const router = useRouter()

  if (isLoading) {
    return <LoadingSkeleton />
  }

  const tendency = getTendency(profile.majorityRate)
  const TendencyIcon = tendency.icon

  const stats = [
    {
      label: "참여 투표",
      value: profile.totalVotes.toString(),
      description: "회",
    },
    {
      label: "작성 댓글",
      value: profile.totalComments.toString(),
      description: "개",
    },
    {
      label: "참여도",
      value: profile.engagementRate.toString(),
      description: "%",
    },
  ]

  return (
    <div className="w-full max-w-2xl mx-auto px-5 pt-6 pb-12 md:px-8 md:pt-10 md:pb-20">
      {/* 설정 버튼 */}
      <div className="flex justify-end mb-2">
        <button
          onClick={() => router.push('/settings')}
          className="p-2 active:bg-muted rounded-lg transition-colors"
          aria-label="설정"
        >
          <Cog6ToothIcon className="w-5 h-5 text-muted-foreground" />
        </button>
      </div>

      {/* 프로필 영역 */}
      <div className="text-center mb-8">
        {/* 성향 아바타 */}
        <div className="w-28 h-28 mx-auto mb-4 rounded-full bg-primary/5 flex items-center justify-center border-2 border-primary/20">
          <TendencyIcon className="w-14 h-14 text-primary/70" />
        </div>
        <h2 className="text-2xl font-bold text-foreground mb-2">{profile.username}</h2>
        <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-orange-100 text-orange-600 rounded-full text-sm font-medium">
          <FireIcon className="w-4 h-4" />
          {profile.currentStreak}일 연속 참여 중
        </span>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-2 mb-8">
        {stats.map((stat, index) => (
          <div key={index} className="text-center py-4">
            <p className="text-2xl md:text-3xl font-bold text-foreground">
              {stat.value}<span className="text-base font-normal text-muted-foreground">{stat.description}</span>
            </p>
            <p className="text-sm text-muted-foreground mt-1">{stat.label}</p>
          </div>
        ))}
      </div>

      <div className="space-y-4">
        {/* 나의 투표 성향 */}
        <div className="bg-card rounded-xl border border-border p-5">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-foreground">나의 투표 성향</h3>
            <span className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm font-medium">{tendency.name}</span>
          </div>
          <div className="flex items-end gap-3 mb-4">
            <p className="text-4xl font-bold text-foreground">{profile.majorityRate}<span className="text-lg font-medium">%</span></p>
            <p className="text-sm text-muted-foreground pb-1">다수의 선택과 일치</p>
          </div>
          <div className="h-1.5 bg-muted rounded-full overflow-hidden">
            <div className="h-full bg-primary/60 rounded-full" style={{ width: `${profile.majorityRate}%` }} />
          </div>
        </div>

        {/* 7일 연속 참여 보상 */}
        <div className="bg-card rounded-xl border border-border p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-foreground">7일 연속 참여 보상</h3>
            <div className="flex items-center gap-1.5 px-2.5 py-1 bg-primary/10 rounded-full">
              <TicketIcon className="w-4 h-4 text-primary" />
              <span className="text-sm font-semibold text-primary">1개</span>
            </div>
          </div>

          {/* 프로그레스 */}
          <div className="mb-3">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground">
                {profile.currentStreak >= 7 ? "달성 완료!" : `${profile.currentStreak}/7일`}
              </span>
              {profile.currentStreak >= 7 && (
                <span className="text-xs text-primary font-medium">+1 획득 가능</span>
              )}
            </div>
            <div className="h-2 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-primary/60 rounded-full transition-all duration-300"
                style={{ width: `${Math.min((profile.currentStreak / 7) * 100, 100)}%` }}
              />
            </div>
          </div>

          <p className="text-sm text-muted-foreground">
            7일 연속 참여하면 놓친 투표 결과를 열어볼 수 있어요
          </p>
        </div>

      </div>
    </div>
  )
}
