"use client"

import { ArrowLeftIcon, ArrowLeftStartOnRectangleIcon, TrashIcon, ArrowRightOnRectangleIcon, BellIcon, DevicePhoneMobileIcon, ArrowUpOnSquareIcon, PlusIcon, LockClosedIcon, CheckIcon, QuestionMarkCircleIcon } from "@heroicons/react/24/outline"
import { Switch } from "@/components/ui/switch"
import { useState, useEffect } from "react"
import { useAuthContext } from "@/contexts/auth-context"
import { useRouter } from "next/navigation"
import { getDeviceNotificationSettings, updateDeviceNotificationSettings } from "@/lib/notification-api"
import { getOrCreateDeviceId, requestFCMToken, onForegroundMessage, setupTokenRefreshListener } from "@/src/lib/fcmTokenManager"
import { toast } from "sonner"

// iOS 감지
function isIOS(): boolean {
  if (typeof window === "undefined") return false
  return /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as unknown as { MSStream?: unknown }).MSStream
}

// PWA(standalone) 모드 감지
function isStandalone(): boolean {
  if (typeof window === "undefined") return false
  return window.matchMedia("(display-mode: standalone)").matches || (navigator as unknown as { standalone?: boolean }).standalone === true
}

export default function SettingsPage() {
  const { logout, deleteAccount, isAuthenticated, user, accessToken } = useAuthContext()
  const router = useRouter()
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [notificationsEnabled, setNotificationsEnabled] = useState(false)
  const [isUpdating, setIsUpdating] = useState(false)
  const [showPermissionModal, setShowPermissionModal] = useState(false)
  const [isCheckingPermission, setIsCheckingPermission] = useState(false)
  const [showIOSGuideModal, setShowIOSGuideModal] = useState(false)

  // iOS 비PWA 감지
  const [isiOSNonPWA, setIsiOSNonPWA] = useState(false)

  useEffect(() => {
    setIsiOSNonPWA(isIOS() && !isStandalone())
  }, [])

  // 서버에서 알림 설정 조회 및 토글 동기화
  const loadNotificationSettings = async () => {
    try {
      const deviceId = getOrCreateDeviceId()
      const settings = await getDeviceNotificationSettings(deviceId)

      // 서버의 실제 설정값으로 토글 동기화
      setNotificationsEnabled(settings.notificationEnabled)
      console.log("알림 설정 조회 성공:", settings.notificationEnabled)
      return settings
    } catch (error: any) {
      const errorMessage = error?.message || "알림 설정 조회 실패"
      console.error("알림 설정 조회 오류:", errorMessage, error)

      // 실패 시 브라우저 권한 상태로 폴백
      if (typeof window !== "undefined" && "Notification" in window) {
        setNotificationsEnabled(Notification.permission === "granted")
      }
      return null
    }
  }

  // 페이지 로드 시 초기 조회
  useEffect(() => {
    loadNotificationSettings()
  }, [])

  // 브라우저 권한 동기화 
  useEffect(() => {
    let isSyncing = false
    let lastBrowserPermission = Notification.permission

    const syncBrowserPermission = async () => {
      if (!('Notification' in window) || isSyncing) return

      isSyncing = true
      try {
        const deviceId = getOrCreateDeviceId()
        const currentBrowserPermission = Notification.permission
        const permissionChanged = lastBrowserPermission !== currentBrowserPermission

        console.log('[권한 동기화] 브라우저 권한:', currentBrowserPermission, permissionChanged ? '(변경됨)' : '')

        const serverSettings = await loadNotificationSettings()
        if (!serverSettings) return

        // 브라우저 권한 차단 + DB true → DB false로 업데이트
        if (currentBrowserPermission === 'denied' && serverSettings.notificationEnabled) {
          console.log('[권한 동기화] 브라우저 차단 → DB false 업데이트')
          await updateDeviceNotificationSettings(deviceId, false)
          setNotificationsEnabled(false)
        }

        // 브라우저 권한 허용 + DB false + 권한 변경됨 → DB true로 업데이트
        if (currentBrowserPermission === 'granted' && !serverSettings.notificationEnabled && permissionChanged) {
          console.log('[권한 동기화] 브라우저 허용 감지 → DB true 업데이트')
          await updateDeviceNotificationSettings(deviceId, true)
          setNotificationsEnabled(true)

          if (showPermissionModal) {
            setShowPermissionModal(false)
            setIsCheckingPermission(false)
            toast.success('알림이 활성화되었습니다')
          }
        }

        lastBrowserPermission = currentBrowserPermission
      } catch (error: any) {
        console.error('[권한 동기화 실패]', error?.message || error)
      } finally {
        isSyncing = false
      }
    }

    // 초기 동기화
    syncBrowserPermission()

    // 이벤트 리스너: 탭 전환, 창 포커스, Permissions API
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') syncBrowserPermission()
    }
    const handleWindowFocus = () => syncBrowserPermission()

    document.addEventListener('visibilitychange', handleVisibilityChange)
    window.addEventListener('focus', handleWindowFocus)

    if ('permissions' in navigator && 'query' in navigator.permissions) {
      navigator.permissions.query({ name: 'notifications' as PermissionName })
        .then((status) => status.addEventListener('change', syncBrowserPermission))
        .catch(() => {})
    }

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      window.removeEventListener('focus', handleWindowFocus)
    }
  }, [showPermissionModal, accessToken])

  // 모달 열려있을 때 폴링 (폴백)
  useEffect(() => {
    if (!showPermissionModal) {
      setIsCheckingPermission(false)
      return
    }

    setIsCheckingPermission(true)

    const pollInterval = setInterval(() => {
      if (Notification.permission === 'granted') {
        clearInterval(pollInterval)
        setIsCheckingPermission(false)
        loadNotificationSettings()
      }
    }, 200)

    return () => clearInterval(pollInterval)
  }, [showPermissionModal])

  // 알림 설정 토글 변경 핸들러
  const handleNotificationToggle = async (enabled: boolean) => {
    setIsUpdating(true)

    try {
      const deviceId = getOrCreateDeviceId()

      if (enabled) {
        // iOS 비PWA인 경우 홈화면 추가 안내
        if (isiOSNonPWA) {
          setShowIOSGuideModal(true)
          setIsUpdating(false)
          return
        }

        const currentPermission = Notification.permission

        if (currentPermission === "granted") {
          // 권한 허용됨 → DB 업데이트
          await updateDeviceNotificationSettings(deviceId, true)
          setNotificationsEnabled(true)
        } else if (currentPermission === "denied") {
          // 권한 차단됨 → 안내 모달 표시
          setShowPermissionModal(true)
        } else {
          // 권한 미결정 → 권한 요청
          const permission = await Notification.requestPermission()

          if (permission === "granted") {
            const token = await requestFCMToken(accessToken)
            if (token) {
              await onForegroundMessage()
              await setupTokenRefreshListener(accessToken)
            }
            await updateDeviceNotificationSettings(deviceId, true)
            setNotificationsEnabled(true)
          }
        }
      } else {
        // 알림 끄기
        await updateDeviceNotificationSettings(deviceId, false)
        setNotificationsEnabled(false)
      }
    } catch (error: any) {
      const errorMessage = error?.message || "알림 설정 업데이트에 실패했습니다"
      console.error("알림 설정 업데이트 실패:", errorMessage, error)
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
          <button
            onClick={() => setShowIOSGuideModal(true)}
            className="flex items-center gap-1.5 text-xs text-muted-foreground active:opacity-70"
          >
            <QuestionMarkCircleIcon className="w-4 h-4 shrink-0" />
            <span>iOS의 경우, 홈화면에 추가해야 알림을 받을 수 있어요</span>
          </button>
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

      {/* 알림 권한 안내 모달 */}
      {showPermissionModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setShowPermissionModal(false)}
          />
          <div className="relative bg-card rounded-2xl border border-border p-6 mx-5 max-w-sm w-full shadow-xl">
            <div className="flex flex-col items-center text-center">
              <div className="w-14 h-14 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                <BellIcon className="w-7 h-7 text-primary" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">
                알림 권한이 차단되어 있어요
              </h3>
              <p className="text-sm text-muted-foreground mb-6">
                아래 단계를 따라 알림을 허용해주세요
              </p>
              <div className="w-full space-y-3 mb-6">
                <div className="flex items-center gap-3 text-left">
                  <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center shrink-0">
                    <LockClosedIcon className="w-4 h-4 text-primary" />
                  </div>
                  <p className="text-sm text-foreground">
                    주소창 왼쪽의 <span className="font-semibold">자물쇠</span>를 눌러주세요
                  </p>
                </div>
                <div className="flex items-center gap-3 text-left">
                  <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center shrink-0">
                    <BellIcon className="w-4 h-4 text-primary" />
                  </div>
                  <p className="text-sm text-foreground">
                    <span className="font-semibold">알림</span>을 <span className="font-semibold">허용</span>으로 변경해주세요
                  </p>
                </div>
                <div className="flex items-center gap-3 text-left">
                  <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center shrink-0">
                    <CheckIcon className="w-4 h-4 text-primary" />
                  </div>
                  <p className="text-sm text-foreground">
                    이 페이지로 돌아오면 자동으로 적용돼요
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowPermissionModal(false)}
                className="w-full py-3 px-4 bg-primary/80 text-white rounded-xl font-medium text-[15px] active:scale-95 transition-transform"
              >
                확인했어요
              </button>
            </div>
          </div>
        </div>
      )}

      {/* iOS 홈화면 추가 가이드 모달 */}
      {showIOSGuideModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setShowIOSGuideModal(false)}
          />
          <div className="relative bg-card rounded-2xl border border-border p-6 mx-5 max-w-sm w-full shadow-xl">
            <div className="flex flex-col items-center text-center">
              <div className="w-14 h-14 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                <DevicePhoneMobileIcon className="w-7 h-7 text-primary" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">
                홈화면에 추가해주세요
              </h3>
              <p className="text-sm text-muted-foreground mb-6">
                아이폰에서 알림을 받으려면<br />
                홈화면에 앱을 추가해야 해요
              </p>
              <div className="w-full space-y-3 mb-6">
                <div className="flex items-center gap-3 text-left">
                  <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center shrink-0">
                    <ArrowUpOnSquareIcon className="w-4 h-4 text-primary" />
                  </div>
                  <p className="text-sm text-foreground">
                    하단의 <span className="font-semibold">공유 버튼</span>을 눌러주세요
                  </p>
                </div>
                <div className="flex items-center gap-3 text-left">
                  <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center shrink-0">
                    <PlusIcon className="w-4 h-4 text-primary" />
                  </div>
                  <p className="text-sm text-foreground">
                    <span className="font-semibold">홈 화면에 추가</span>를 선택해주세요
                  </p>
                </div>
                <div className="flex items-center gap-3 text-left">
                  <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center shrink-0">
                    <BellIcon className="w-4 h-4 text-primary" />
                  </div>
                  <p className="text-sm text-foreground">
                    추가 후 앱을 열면 알림을 받을 수 있어요
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowIOSGuideModal(false)}
                className="w-full py-3 px-4 bg-primary/80 text-white rounded-xl font-medium text-[15px] active:scale-95 transition-transform"
              >
                확인했어요
              </button>
            </div>
          </div>
        </div>
      )}

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
                  className="w-full py-3 px-4 bg-primary/80 text-white rounded-xl font-medium text-[15px] active:opacity-70 transition-opacity disabled:opacity-50"
                >
                  계속 함께하기
                </button>
                <button
                  onClick={handleDeleteAccount}
                  disabled={isDeleting}
                  className="w-full py-3 px-4 bg-muted text-muted-foreground rounded-xl font-medium text-[15px] active:opacity-70 transition-opacity disabled:opacity-50"
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
