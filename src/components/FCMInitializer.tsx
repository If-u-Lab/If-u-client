'use client';

import { useEffect } from 'react';
import { requestFCMToken, onForegroundMessage } from '@/src/lib/fcmTokenManager';

export default function FCMInitializer() {
  useEffect(() => {
    // Service Worker 등록
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker
        .register('/firebase-messaging-sw.js')
        .then((registration) => {
          console.log('Service Worker 등록 성공:', registration);
        })
        .catch((error) => {
          console.error('Service Worker 등록 실패:', error);
        });
    }

    let unsubscribe: (() => void) | null = null;

    // FCM 초기화
    const initFCM = async () => {
      console.log('FCM 초기화 시작');

      const token = await requestFCMToken();

      if (token) {
        console.log('FCM 초기화 완료');
        unsubscribe = await onForegroundMessage();
      } else {
        console.log('FCM 초기화 실패 (권한 거부 또는 미지원 브라우저)');
      }
    };

    initFCM();

    // Cleanup: 컴포넌트 언마운트 시 리스너 해제
    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, []);

  return null;
}