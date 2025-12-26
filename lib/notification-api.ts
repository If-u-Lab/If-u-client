// 알림 설정 관련 API

import { apiPatch } from "./api-client"

/**
 * 사용자 알림 수신 여부 변경
 * PATCH /api/v1/users/me/notification-settings
 */
export async function updateNotificationSettings(enabled: boolean): Promise<void> {
  await apiPatch("/api/v1/users/me/notification-settings", {
    notificationEnabled: enabled,
  })
}
