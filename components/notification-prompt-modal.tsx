"use client"

import { useState } from "react"
import { BellIcon } from "@heroicons/react/24/outline"
import { updateDeviceNotificationSettings } from "@/lib/notification-api"
import { getOrCreateDeviceId, requestFCMToken, onForegroundMessage, setupTokenRefreshListener } from "@/src/lib/fcmTokenManager"
import { useAuthContext } from "@/contexts/auth-context"

interface NotificationPromptModalProps {
  isOpen: boolean
  onClose: () => void
}

export function NotificationPromptModal({ isOpen, onClose }: NotificationPromptModalProps) {
  const [isLoading, setIsLoading] = useState(false)
  const { accessToken } = useAuthContext()

  if (!isOpen) return null

  const handleAllow = async () => {
    setIsLoading(true)
    try {
      // 이미 차단된 상태면 브라우저 설정 안내
      if (Notification.permission === "denied") {
        alert("알림이 차단되어 있어요.\n\n브라우저 주소창 왼쪽의 자물쇠를 눌러 알림을 허용해주세요.")
        localStorage.setItem("notification_prompt_shown", "true")
        onClose()
        return
      }

      const permission = await Notification.requestPermission()

      if (permission === "granted") {
        const deviceId = getOrCreateDeviceId()

        // FCM 토큰 요청 및 리스너 설정
        const token = await requestFCMToken(accessToken)
        if (token) {
          await onForegroundMessage()
          await setupTokenRefreshListener(accessToken)
        }

        await updateDeviceNotificationSettings(deviceId, true)
      } else if (permission === "denied") {
        alert("알림이 차단되어 있어요.\n\n브라우저 주소창 왼쪽의 자물쇠를 눌러 알림을 허용해주세요.")
      }

      localStorage.setItem("notification_prompt_shown", "true")
      onClose()
    } catch (error) {
      console.error("알림 설정 실패:", error)
      localStorage.setItem("notification_prompt_shown", "true")
      onClose()
    } finally {
      setIsLoading(false)
    }
  }

  const handleSkip = () => {
    localStorage.setItem("notification_prompt_shown", "true")
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black/40"
        onClick={handleSkip}
      />
      <div className="relative bg-card rounded-2xl border border-border p-6 mx-5 max-w-sm w-full shadow-xl">
        <div className="flex flex-col items-center text-center">
          <div className="w-14 h-14 bg-primary/10 rounded-full flex items-center justify-center mb-4">
            <BellIcon className="w-7 h-7 text-primary" />
          </div>
          <h3 className="text-lg font-semibold text-foreground mb-2">
            오늘의 질문, 놓치지 마세요
          </h3>
          <p className="text-sm text-muted-foreground mb-6">
            새 질문이 올라오면 바로 알려드릴게요
          </p>
          <div className="flex flex-col gap-2 w-full">
            <button
              onClick={handleAllow}
              disabled={isLoading}
              className="w-full py-3 px-4 bg-primary/60 text-white rounded-xl font-medium text-[15px] active:scale-95 transition-transform disabled:opacity-50"
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/60 border-t-transparent rounded-full animate-spin" />
                  설정 중...
                </span>
              ) : (
                "알림 받기"
              )}
            </button>
            <button
              onClick={handleSkip}
              disabled={isLoading}
              className="w-full py-3 px-4 bg-muted text-muted-foreground rounded-xl font-medium text-[15px] active:scale-95 transition-transform"
            >
              다음에 할게요
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
