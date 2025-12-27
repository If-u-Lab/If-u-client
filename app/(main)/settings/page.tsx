"use client"

import { ArrowLeftIcon, ArrowLeftStartOnRectangleIcon, TrashIcon } from "@heroicons/react/24/outline"
import { Switch } from "@/components/ui/switch"
import { useState, useEffect } from "react"
import { useAuthContext } from "@/contexts/auth-context"
import { useRouter } from "next/navigation"
import { updateDeviceNotificationSettings } from "@/lib/notification-api"
import { getOrCreateDeviceId } from "@/src/lib/fcmTokenManager"

export default function SettingsPage() {
  const { logout, deleteAccount, isAuthenticated, user } = useAuthContext()
  const router = useRouter()
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [notificationsEnabled, setNotificationsEnabled] = useState(false)
  const [isUpdating, setIsUpdating] = useState(false)

  // 페이지 로드 시 브라우저 알림 권한 상태로 초기화
  useEffect(() => {
    if (typeof window !== "undefined" && "Notification" in window) {
      setNotificationsEnabled(Notification.permission === "granted")
    }
  }, [])

  // 알림 설정 토글 변경 핸들러
  const handleNotificationToggle = async (enabled: boolean) => {
    setIsUpdating(true)

    try {
      const deviceId = getOrCreateDeviceId()

      if (enabled) {
        // 알림 켜기: 브라우저 권한 확인 후 서버 업데이트
        console.log("알림 권한 확인 중...")
        const currentPermission = Notification.permission

        if (currentPermission === "granted") {
          // 이미 권한이 허용되어 있으면 바로 API 호출
          setNotificationsEnabled(true)
          await updateDeviceNotificationSettings(deviceId, true)
          console.log("알림 설정 업데이트 성공: true (기존 권한 사용)")
        } else if (currentPermission === "denied") {
          // 권한이 차단된 경우 - 브라우저 설정에서 변경하도록 안내
          setNotificationsEnabled(false)
          alert("브라우저 알림이 차단되어 있습니다.\n\n브라우저 주소창 왼쪽의 자물쇠 아이콘을 클릭하여 알림 권한을 허용해주세요.")
          console.log("알림 권한이 차단되어 있음 (denied)")
        } else {
          // 권한이 아직 결정되지 않은 경우 (default) - 권한 요청
          const permission = await Notification.requestPermission()
          console.log("사용자 선택:", permission)

          if (permission === "granted") {
            // 권한 허용 시
            setNotificationsEnabled(true)
            await updateDeviceNotificationSettings(deviceId, true)
            console.log("알림 설정 업데이트 성공: true (새 권한 허용)")
          } else {
            // 권한 거부 시
            setNotificationsEnabled(false)
            console.log("사용자가 알림 권한을 거부했습니다")
          }
        }
      } else {
        // 알림 끄기: 서버에 알림 비활성화 요청
        setNotificationsEnabled(false)
        await updateDeviceNotificationSettings(deviceId, false)
        console.log("알림 설정 업데이트 성공: false")
      }
    } catch (error: any) {
      const errorMessage = error?.message || "알림 설정 업데이트에 실패했습니다"
      console.error("알림 설정 업데이트 실패:", errorMessage, error)
      // 실패 시 브라우저 권한 상태로 복구
      setNotificationsEnabled(Notification.permission === "granted")
      alert(`알림 설정 업데이트에 실패했습니다: ${errorMessage}`)
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
            <p className="font-medium text-sm md:text-base text-foreground">오늘의 질문</p>
            <p className="text-xs md:text-sm text-muted-foreground leading-relaxed">매일 새 질문이 올라오면 알려드립니다</p>
          </div>
          <Switch
            checked={notificationsEnabled}
            onCheckedChange={handleNotificationToggle}
            disabled={isUpdating}
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
