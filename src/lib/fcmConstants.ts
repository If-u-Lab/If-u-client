/**
 * FCM(Firebase Cloud Messaging) 관련 상수 정의
 */

// LocalStorage 키
export const FCM_TOKEN_STORAGE_KEY = 'fcm_token';

// Service Worker 메시지 타입
export const FCM_MESSAGE_TYPES = {
  TOKEN_REFRESHED: 'FCM_TOKEN_REFRESHED',
  NAVIGATE: 'FCM_NAVIGATE',
} as const;

// CustomEvent 타입
export const FCM_CUSTOM_EVENTS = {
  NAVIGATE: 'fcm-navigate',
} as const;

// 토큰 갱신 주기 (밀리초)
export const FCM_TOKEN_REFRESH_INTERVAL = 10 * 60 * 1000; // 10분
