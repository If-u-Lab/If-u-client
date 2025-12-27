"use client"

import { ArrowLeftIcon, ArrowLeftStartOnRectangleIcon, TrashIcon, ArrowRightOnRectangleIcon } from "@heroicons/react/24/outline"
import { Switch } from "@/components/ui/switch"
import { useState, useEffect } from "react"
import { useAuthContext } from "@/contexts/auth-context"
import { useRouter } from "next/navigation"
import { updateNotificationSettings } from "@/lib/notification-api"
import { toast } from "sonner"

export default function SettingsPage() {
  const { logout, deleteAccount, isAuthenticated, user } = useAuthContext()
  const router = useRouter()
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [notificationsEnabled, setNotificationsEnabled] = useState(false)
  const [isUpdating, setIsUpdating] = useState(false)

  // 페이지 로드 시 user.notificationEnabled 값으로 초기화
  useEffect(() => {
    if (user?.notificationEnabled !== undefined) {
      setNotificationsEnabled(user.notificationEnabled)
    }
  }, [user?.notificationEnabled])

  // 알림 설정 토글 변경 핸들러
  const handleNotificationToggle = async (enabled: boolean) => {
    setIsUpdating(true)
    setNotificationsEnabled(enabled) // 낙관적 UI 업데이트

    try {
      await updateNotificationSettings(enabled)
      console.log("알림 설정 업데이트 성공:", enabled)
    } catch (error: any) {
      const errorMessage = error?.message || "알림 설정 업데이트에 실패했습니다"
      console.error("알림 설정 업데이트 실패:", errorMessage, error)
      // 실패 시 원래 상태로 복구
      setNotificationsEnabled(!enabled)
      toast.error(errorMessage)
    } finally {
      setIsUpdating(false)
    }
  }

  const handleLogout = async () => {
    try {
      await logout()
      router.push("/")
    } catch (error: any) {
      const errorMessage = error?.message || "로그아웃에 실패했습니다"
      console.error("로그아웃 실패:", errorMessage, error)
      toast.error(errorMessage)
    }
  }

  const handleDeleteAccount = async () => {
    setIsDeleting(true)
    try {
      await deleteAccount()
      router.push("/")
    } catch (error: any) {
      const errorMessage = error?.message || "회원 탈퇴에 실패했습니다"
      console.error("회원 탈퇴 실패:", errorMessage, error)
      toast.error(errorMessage)
    } finally {
      setIsDeleting(false)
      setShowDeleteModal(false)
    }
  }

  return (
    <div className="w-full max-w-2xl mx-auto px-5 pt-6 pb-12 md:px-8 md:pt-10 md:pb-20">
      {/* Header */}
      <div className="relative flex items-center justify-center mb-4">
        <button
          onClick={() => router.back()}
          className="absolute left-0 p-2.5 active:bg-muted rounded-lg transition-colors"
          aria-label="뒤로가기"
        >
          <ArrowLeftIcon className="w-6 h-6 text-foreground" />
        </button>
        <h1 className="text-lg font-semibold text-foreground">환경설정</h1>
      </div>

      <div className="divide-y divide-border">
        {/* Login Info */}
        {isAuthenticated && (
          <div className="py-6 space-y-3">
            <div className="space-y-1">
              <h3 className="text-sm font-medium text-muted-foreground">로그인 정보</h3>
            </div>
            <p className="text-base font-medium text-foreground">
              {user?.email || "Google 계정으로 로그인됨"}
            </p>
          </div>
        )}

        {/* Notification Settings */}
        <div className="py-6 space-y-4">
          <h3 className="text-sm font-medium text-muted-foreground">알림 설정</h3>
          <div className="flex items-center justify-between">
            <div className="space-y-0.5 flex-1 pr-4">
              <p className="text-base text-foreground">오늘의 질문</p>
              <p className="text-sm text-muted-foreground">매일 새 질문이 올라오면 알려드려요</p>
            </div>
            <Switch
              checked={notificationsEnabled}
              onCheckedChange={handleNotificationToggle}
              disabled={isUpdating}
            />
          </div>
        </div>

        {/* Account Actions */}
        {isAuthenticated && (
          <div className="py-6 space-y-2">
            <h3 className="text-sm font-medium text-muted-foreground mb-4">계정 관리</h3>

            <button
              onClick={handleLogout}
              className="w-full text-left py-3 text-destructive transition-colors flex items-center gap-3 active:opacity-70"
            >
              <ArrowLeftStartOnRectangleIcon className="w-5 h-5" />
              <span className="text-base">로그아웃</span>
            </button>

            <button
              onClick={() => setShowDeleteModal(true)}
              className="w-full text-left py-3 text-destructive transition-colors flex items-center gap-3 active:opacity-70"
            >
              <TrashIcon className="w-5 h-5" />
              <span className="text-base">회원 탈퇴</span>
            </button>
          </div>
        )}

        {!isAuthenticated && (
          <div className="py-8 text-center">
            <p className="text-base text-muted-foreground">로그인되지 않았습니다</p>
          </div>
        )}
      </div>

      {/* 회원탈퇴 확인 모달 */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* 배경 오버레이 */}
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => !isDeleting && setShowDeleteModal(false)}
          />

          {/* 모달 */}
          <div className="relative bg-card rounded-2xl border border-border p-6 mx-5 max-w-sm w-full shadow-xl">
            <div className="flex flex-col items-center text-center">
              <div className="w-14 h-14 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                <ArrowRightOnRectangleIcon className="w-7 h-7 text-primary" />
              </div>

              <h3 className="text-lg font-semibold text-foreground mb-2">
                잠깐, 정말 떠나시나요?
              </h3>
              <p className="text-sm text-muted-foreground mb-6">
                지금까지의 투표 기록과 댓글이 모두 사라져요
              </p>

              <div className="flex flex-col gap-2 w-full">
                <button
                  onClick={() => setShowDeleteModal(false)}
                  disabled={isDeleting}
                  className="w-full py-3 px-4 bg-primary/60 text-white rounded-xl font-medium text-[15px] active:scale-95 transition-transform disabled:opacity-50"
                >
                  계속 함께하기
                </button>
                <button
                  onClick={handleDeleteAccount}
                  disabled={isDeleting}
                  className="w-full py-3 px-4 bg-muted text-muted-foreground rounded-xl font-medium text-[15px] active:scale-95 transition-transform disabled:opacity-50"
                >
                  {isDeleting ? "탈퇴 중..." : "그래도 탈퇴할게요"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
