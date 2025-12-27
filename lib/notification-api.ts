// 알림 설정 관련 API

import { apiPatch } from "./api-client"

/**
 * 디바이스별 알림 수신 여부 변경
 * PATCH /api/v1/notifications/devices/{deviceId}/notification-settings
 */
export async function updateDeviceNotificationSettings(
  deviceId: string,
  enabled: boolean
): Promise<void> {
  await apiPatch(`/api/v1/notifications/devices/${deviceId}/notification-settings`, {
    notificationEnabled: enabled,
  })
}
