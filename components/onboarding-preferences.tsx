"use client"

import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { ChevronLeft } from "lucide-react"

interface OnboardingPreferencesProps {
  notificationsEnabled: boolean
  onToggleNotifications: () => void
  onNext: () => void
  onBack: () => void
}

export function OnboardingPreferences({
  notificationsEnabled,
  onToggleNotifications,
  onNext,
  onBack,
}: OnboardingPreferencesProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 to-primary/10 flex flex-col items-center justify-center p-6">
      <div className="max-w-md w-full space-y-6">
        <div className="space-y-2">
          <h2 className="text-3xl font-bold text-foreground">알림 설정</h2>
          <p className="text-muted-foreground">언제든지 나중에 변경할 수 있습니다</p>
        </div>

        <div className="bg-white rounded-lg border border-border p-4 space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <p className="font-medium text-foreground">오늘의 질문 알림</p>
              <p className="text-sm text-muted-foreground">매일 새 질문이 올라오면 알려드립니다</p>
            </div>
            <Switch checked={notificationsEnabled} onCheckedChange={onToggleNotifications} />
          </div>

          <div className="border-t border-border pt-4 flex items-center justify-between opacity-50">
            <div className="space-y-1">
              <p className="font-medium text-foreground">댓글 알림</p>
              <p className="text-sm text-muted-foreground">내 댓글에 답글이 달리면 알려드립니다</p>
            </div>
            <Switch disabled checked={true} />
          </div>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-sm text-blue-900">알림을 비활성화해도 앱에서 언제든지 새로운 질문에 참여할 수 있습니다.</p>
        </div>

        <div className="flex gap-3 pt-4">
          <Button onClick={onBack} variant="outline" className="flex-1 h-12 bg-transparent">
            <ChevronLeft size={20} />
            이전
          </Button>
          <Button onClick={onNext} className="flex-1 h-12 bg-primary hover:bg-primary/90 text-white">
            완료
          </Button>
        </div>
      </div>
    </div>
  )
}
