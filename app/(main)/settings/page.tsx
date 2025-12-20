"use client"

import { ArrowLeftIcon, ArrowLeftStartOnRectangleIcon, TrashIcon } from "@heroicons/react/24/outline"
import { Switch } from "@/components/ui/switch"
import { useState } from "react"
import { useAuthContext } from "@/contexts/auth-context"
import { useRouter } from "next/navigation"

export default function SettingsPage() {
  const { logout, deleteAccount, isAuthenticated, user } = useAuthContext()
  const router = useRouter()
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [notificationsEnabled, setNotificationsEnabled] = useState(true)

  const handleLogout = async () => {
    try {
      await logout()
      router.push("/")
    } catch (error: any) {
      const errorMessage = error?.message || "로그아웃에 실패했습니다"
      console.error("로그아웃 실패:", errorMessage, error)
      alert(`로그아웃에 실패했습니다: ${errorMessage}`)
    }
  }

  const handleDeleteAccount = async () => {
    if (!showDeleteConfirm) {
      setShowDeleteConfirm(true)
      return
    }

    try {
      await deleteAccount()
      router.push("/")
    } catch (error: any) {
      const errorMessage = error?.message || "회원 탈퇴에 실패했습니다"
      console.error("회원 탈퇴 실패:", errorMessage, error)
      alert(`회원 탈퇴에 실패했습니다: ${errorMessage}`)
    }
  }

  return (
    <div className="w-full max-w-2xl mx-auto px-5 pt-6 pb-12 md:px-8 md:pt-10 md:pb-20">
      {/* Header with back button */}
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={() => router.back()}
          className="p-2.5 active:bg-muted rounded-lg transition-colors"
          aria-label="뒤로가기"
        >
          <ArrowLeftIcon className="w-6 h-6 text-foreground" />
        </button>
        <h1 className="text-2xl font-bold text-foreground">설정</h1>
      </div>

      <div className="space-y-8">
      {/* Login Info */}
      {isAuthenticated && (
        <div className="bg-card rounded-lg border border-border p-6 space-y-5">
          <div className="space-y-1.5">
            <h3 className="text-lg md:text-xl font-semibold text-foreground">로그인 정보</h3>
            <p className="text-sm text-muted-foreground">현재 연결된 계정</p>
          </div>
          <div className="p-4 bg-muted/50 rounded-lg">
            {user?.email ? (
              <p className="text-sm md:text-base font-medium text-foreground">{user.email}</p>
            ) : (
              <p className="text-sm md:text-base text-muted-foreground">Google 계정으로 로그인됨</p>
            )}
          </div>
        </div>
      )}

      {/* Notification Settings */}
      <div className="bg-card rounded-lg border border-border p-6 space-y-5">
        <div className="space-y-1.5">
          <h3 className="text-lg md:text-xl font-semibold text-foreground">알림 설정</h3>
        </div>

        <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
          <div className="space-y-1 flex-1 pr-4">
            <p className="font-medium text-sm md:text-base text-foreground">오늘의 질문 알림</p>
            <p className="text-xs md:text-sm text-muted-foreground leading-relaxed">매일 새 질문이 올라오면 알려드립니다</p>
          </div>
          <Switch
            checked={notificationsEnabled}
            onCheckedChange={setNotificationsEnabled}
          />
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-sm md:text-base text-blue-900 leading-relaxed">알림을 비활성화해도 앱에서 언제든지 새로운 질문에 참여할 수 있습니다.</p>
        </div>
      </div>

      {/* Account Actions */}
      {isAuthenticated && (
        <div className="bg-card rounded-lg border border-border p-6 space-y-3">
          <div className="space-y-1.5 mb-4">
            <h3 className="text-lg md:text-xl font-semibold text-foreground">계정 관리</h3>
            <p className="text-sm text-muted-foreground">로그아웃 및 탈퇴</p>
          </div>

          <button
            onClick={handleLogout}
            className="w-full text-left p-4 active:bg-destructive/10 text-destructive rounded-lg transition-colors flex items-center gap-3"
          >
            <ArrowLeftStartOnRectangleIcon className="w-5 h-5 md:w-6 md:h-6" />
            <span className="text-sm md:text-base font-medium">로그아웃</span>
          </button>

          <button
            onClick={handleDeleteAccount}
            className={`w-full text-left p-4 rounded-lg transition-colors flex items-center gap-3 ${
              showDeleteConfirm
                ? "bg-red-600 text-white"
                : "active:bg-destructive/10 text-destructive"
            }`}
          >
            <TrashIcon className="w-5 h-5 md:w-6 md:h-6" />
            <span className="text-sm md:text-base font-medium">{showDeleteConfirm ? "탈퇴하시겠습니까?" : "회원 탈퇴"}</span>
          </button>

          {showDeleteConfirm && (
            <button
              onClick={() => setShowDeleteConfirm(false)}
              className="w-full text-left p-4 active:bg-muted rounded-lg transition-colors text-sm md:text-base text-muted-foreground"
            >
              취소
            </button>
          )}
        </div>
      )}

      {!isAuthenticated && (
        <div className="bg-card rounded-lg border border-border p-8 text-center">
          <p className="text-sm md:text-base text-muted-foreground">로그인되지 않았습니다</p>
        </div>
      )}
      </div>
    </div>
  )
}
