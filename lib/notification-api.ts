// 알림 설정 관련 API

import { apiGet, apiPatch } from "./api-client"

/**
 * 디바이스 알림 설정 조회 응답
 */
export interface NotificationSettings {
  notificationEnabled: boolean
}

/**
 * 디바이스 알림 설정 조회
 * GET /api/v1/notifications/devices/{deviceId}/notification-settings
 */
export async function getDeviceNotificationSettings(
  deviceId: string
): Promise<NotificationSettings> {
  try {
    const response = await apiGet<NotificationSettings>(
      `/api/v1/notifications/devices/${deviceId}/notification-settings`
    )
    return response.data
  } catch (error: any) {
    // 404 에러는 디바이스 미등록 상태 (정상 케이스)
    if (error?.status === 404) {
      console.log('디바이스 미등록 - 기본값 사용')
      return { notificationEnabled: false }
    }
    throw error
  }
}

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
