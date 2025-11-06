"use client"

import { Settings, LogOut } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useUserProfile } from "@/hooks/use-user-profile"
import { ActivityChart } from "@/components/activity-chart"
import { useState } from "react"

export default function ProfilePage() {
  const { profile, editMode, setEditMode, editedBio, setEditedBio, updateBio, getAverageDaily } = useUserProfile()
  const [showSettings, setShowSettings] = useState(false)

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
    {
      label: "일일 평균",
      value: getAverageDaily(),
      description: "회",
    },
  ]

  return (
    <div className="w-full max-w-2xl mx-auto space-y-6 px-6 pt-8 pb-12 md:px-8 md:pt-10 md:pb-20">
      {/* Header with settings */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl md:text-3xl font-bold text-foreground">마이페이지</h1>
        <button
          onClick={() => setShowSettings(!showSettings)}
          className="p-2 active:bg-muted rounded-lg transition-colors"
          aria-label="설정"
        >
          <Settings size={20} className="text-foreground" />
        </button>
      </div>

      {/* Profile Header */}
      <div className="bg-card rounded-lg border border-border p-6 space-y-4">
        <div className="flex items-start gap-4">
          <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center text-2xl font-bold text-primary flex-shrink-0">
            {profile.username.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1">
            <h2 className="text-xl font-semibold text-foreground">{profile.username}</h2>
            {editMode ? (
              <div className="space-y-2 mt-2">
                <textarea
                  value={editedBio}
                  onChange={(e) => setEditedBio(e.target.value)}
                  className="w-full p-2 rounded border border-border bg-background text-foreground text-sm"
                  rows={3}
                  placeholder="자기소개를 입력하세요"
                />
                <div className="flex gap-2">
                  <Button size="sm" onClick={updateBio}>
                    저장
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => setEditMode(false)}>
                    취소
                  </Button>
                </div>
              </div>
            ) : (
              <>
                <p className="text-sm text-muted-foreground mt-1">{profile.bio || "자기소개가 없습니다"}</p>
                <Button size="sm" variant="ghost" className="mt-2" onClick={() => setEditMode(true)}>
                  수정
                </Button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-4">
        {stats.map((stat, index) => (
          <div key={index} className="bg-card rounded-lg border border-border p-4 space-y-1">
            <p className="text-xs md:text-sm text-muted-foreground">{stat.label}</p>
            <div className="flex items-baseline gap-1">
              <p className="text-xl md:text-2xl font-bold text-foreground">{stat.value}</p>
              <span className="text-xs md:text-sm text-muted-foreground">{stat.description}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Activity */}
      <div className="bg-card rounded-lg border border-border p-6 space-y-4">
        <h3 className="text-base md:text-lg font-semibold text-foreground">최근 활동 (7일)</h3>
        <ActivityChart data={profile.recentActivity} maxValue={10} />
      </div>

      {/* Settings (conditionally rendered) */}
      {showSettings && (
        <div className="bg-card rounded-lg border border-border p-6 space-y-4">
          <h3 className="text-base md:text-lg font-semibold text-foreground">설정</h3>
          <div className="space-y-2">
            <button className="w-full text-left p-3 active:bg-muted rounded-lg transition-colors flex items-center gap-3">
              <Settings size={20} />
              <span>계정 설정</span>
            </button>
            <button className="w-full text-left p-3 active:bg-destructive/10 text-destructive rounded-lg transition-colors flex items-center gap-3">
              <LogOut size={20} />
              <span>로그아웃</span>
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
