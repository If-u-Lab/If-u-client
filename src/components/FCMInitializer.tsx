'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { requestFCMToken, onForegroundMessage, setupTokenRefreshListener } from '@/src/lib/fcmTokenManager';
import { FCM_CUSTOM_EVENTS, FCM_MESSAGE_TYPES } from '@/src/lib/fcmConstants';
import { useAuthContext } from '@/contexts/auth-context';

export default function FCMInitializer() {
  const { accessToken, isAuthenticated } = useAuthContext();
  const router = useRouter();

  // 포그라운드 알림 클릭 시 라우팅 처리
  useEffect(() => {
    const handleFCMNavigate = (event: Event) => {
      const customEvent = event as CustomEvent<string>;
      const redirectPath = customEvent.detail;
      console.log('FCM 알림 클릭 - 페이지 이동:', redirectPath);
      router.push(redirectPath);
    };

    window.addEventListener(FCM_CUSTOM_EVENTS.NAVIGATE, handleFCMNavigate);

    return () => {
      window.removeEventListener(FCM_CUSTOM_EVENTS.NAVIGATE, handleFCMNavigate);
    };
  }, [router]);

  // 백그라운드 알림 클릭 시 라우팅 처리 (Service Worker postMessage)
  useEffect(() => {
    const handleServiceWorkerMessage = (event: MessageEvent) => {
      if (event.data?.type === FCM_MESSAGE_TYPES.NAVIGATE) {
        const redirectPath = event.data.redirectPath;
        console.log('Service Worker 알림 클릭 - 페이지 이동:', redirectPath);
        router.push(redirectPath);
      }
    };

    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.addEventListener('message', handleServiceWorkerMessage);
    }

    return () => {
      if ('serviceWorker' in navigator) {
        navigator.serviceWorker.removeEventListener('message', handleServiceWorkerMessage);
      }
    };
  }, [router]);

  useEffect(() => {
    // 로그인하지 않았으면 FCM 초기화하지 않음
    if (!isAuthenticated) {
      console.log('로그인하지 않아 FCM 초기화를 건너뜁니다');
      return;
    }

    let unsubscribe: (() => void) | null = null;
    let cleanupTokenRefresh: (() => void) | null = null;

    // FCM 초기화 (Service Worker 등록 후 토큰 발급)
    const initFCM = async () => {
      try {
        console.log('FCM 초기화 시작');

        // 1. Service Worker 먼저 등록하고 활성화 대기
        if ('serviceWorker' in navigator) {
          console.log('Service Worker 등록 시도');
          const registration = await navigator.serviceWorker.register('/firebase-messaging-sw.js');
          console.log('Service Worker 등록 성공:', registration);

          // Service Worker가 활성화될 때까지 명시적으로 대기
          if (registration.installing) {
            console.log('Service Worker 설치 중...');
            await new Promise<void>((resolve) => {
              registration.installing!.addEventListener('statechange', (e) => {
                if ((e.target as ServiceWorker).state === 'activated') {
                  console.log('Service Worker 활성화 완료');
                  resolve();
                }
              });
            });
          } else if (registration.waiting) {
            console.log('Service Worker 대기 중...');
            await new Promise<void>((resolve) => {
              registration.waiting!.addEventListener('statechange', (e) => {
                if ((e.target as ServiceWorker).state === 'activated') {
                  console.log('Service Worker 활성화 완료');
                  resolve();
                }
              });
            });
          } else if (registration.active) {
            console.log('Service Worker 이미 활성화됨');
          }

          // Service Worker가 완전히 준비될 때까지 추가 대기
          await navigator.serviceWorker.ready;
          console.log('Service Worker 준비 완료');
        }

        // 2. Service Worker 준비 완료 후 FCM 토큰 요청
        const token = await requestFCMToken(accessToken);

        if (token) {
          console.log('FCM 초기화 완료');

          // 포그라운드 메시지 리스너 등록
          unsubscribe = await onForegroundMessage();

          // 토큰 갱신 리스너 등록
          cleanupTokenRefresh = await setupTokenRefreshListener(accessToken);
        } else {
          console.log('FCM 초기화 실패 (권한 거부 또는 미지원 브라우저)');
        }
      } catch (error: any) {
        const errorMessage = error?.message || "FCM 초기화 중 오류 발생"
        console.error('FCM 초기화 실패:', errorMessage, error);
      }
    };

    initFCM();

    // Cleanup: 컴포넌트 언마운트 시 리스너 해제
    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
      if (cleanupTokenRefresh) {
        cleanupTokenRefresh();
      }
    };
  }, [accessToken, isAuthenticated]);

  return null;
}