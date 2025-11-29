"use client"

import { Cog6ToothIcon } from "@heroicons/react/24/outline"
import { UserCircleIcon } from "@heroicons/react/24/solid"
import { useUserProfile } from "@/hooks/use-user-profile"
import { ActivityChart } from "@/components/activity-chart"
import { useRouter } from "next/navigation"

export default function ProfilePage() {
  const { profile, getDaysSinceJoin } = useUserProfile()
  const router = useRouter()

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
      {/* Header with settings */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-foreground">프로필</h1>
        <button
          onClick={() => router.push('/settings')}
          className="p-2.5 active:bg-muted rounded-lg transition-colors"
          aria-label="설정"
        >
          <Cog6ToothIcon className="w-6 h-6 text-foreground" />
        </button>
      </div>

      <div className="space-y-8">
      {/* Profile Header */}
      <div className="bg-card rounded-lg border border-border p-6">
        <div className="flex items-center gap-4">
          <div className="w-20 h-20 flex-shrink-0">
            <UserCircleIcon className="w-full h-full text-primary/60" />
          </div>
          <div className="flex-1 space-y-2">
            <h2 className="text-xl md:text-2xl font-semibold text-foreground">{profile.username}</h2>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span className="px-2.5 py-1 bg-primary/10 text-primary rounded-md font-medium">
                {getDaysSinceJoin()}일째 참여 중
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-3 gap-3 md:gap-4">
        {stats.map((stat, index) => (
          <div key={index} className="bg-card rounded-lg border border-border p-4 md:p-5 space-y-2">
            <p className="text-xs md:text-sm text-muted-foreground leading-tight">{stat.label}</p>
            <div className="flex items-baseline gap-1">
              <p className="text-2xl md:text-3xl font-bold text-foreground">{stat.value}</p>
              <span className="text-xs md:text-sm text-muted-foreground">{stat.description}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Activity */}
      <div className="bg-card rounded-lg border border-border p-6 space-y-5">
        <div className="space-y-1.5">
          <h3 className="text-lg md:text-xl font-semibold text-foreground">최근 활동</h3>
          <p className="text-sm text-muted-foreground">지난 7일간의 참여 현황</p>
        </div>
        <ActivityChart data={profile.recentActivity} maxValue={10} />
      </div>
      </div>
    </div>
  )
}
