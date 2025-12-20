importScripts('https://www.gstatic.com/firebasejs/12.5.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/12.5.0/firebase-messaging-compat.js');

// PWA 캐시 이름
const CACHE_NAME = 'if-u-v1';
const STATIC_ASSETS = [
  '/',
  '/home',
  '/questions',
  '/profile',
  '/manifest.json',
  '/icon-192.png',
];

// Service Worker 설치 시 정적 파일 캐싱
self.addEventListener('install', (event) => {
  console.log('Service Worker 설치 중...');
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('정적 파일 캐싱 완료');
      return cache.addAll(STATIC_ASSETS);
    })
  );
  self.skipWaiting(); 
});

// 오래된 캐시 삭제
self.addEventListener('activate', (event) => {
  console.log('Service Worker 활성화');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('오래된 캐시 삭제:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim(); // 즉시 제어
});

// 네트워크 요청 가로채기 (캐시 우선 전략)
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      // 캐시에 있으면 캐시 반환, 없으면 네트워크 요청
      return response || fetch(event.request).then((fetchResponse) => {
        // API 요청은 캐싱 안 함
        if (event.request.url.includes('/api/')) {
          return fetchResponse;
        }
        // 정적 리소스는 동적 캐싱
        return caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, fetchResponse.clone());
          return fetchResponse;
        });
      });
    }).catch(() => {
      // 오프라인 시 기본 페이지 반환
      if (event.request.mode === 'navigate') {
        return caches.match('/');
      }
    })
  );
});

// Firebase 초기화
firebase.initializeApp({
  apiKey: "AIzaSyBYCTbV9JmTab7K0_bY-fssMflQ27mXTIU",
  authDomain: "if-u-64213.firebaseapp.com",
  projectId: "if-u-64213",
  storageBucket: "if-u-64213.firebasestorage.app",
  messagingSenderId: "996003659541",
  appId: "1:996003659541:web:8bc920b6438be7e1d5331c",
  measurementId: "G-372EBT2ELV"
});

const messaging = firebase.messaging();

// 백그라운드 푸시 알림 수신
messaging.onBackgroundMessage((payload) => {
  console.log('백그라운드 메시지 수신:', payload);

  const notificationTitle = payload.notification?.title || '새로운 질문';
  const notificationOptions = {
    body: payload.notification?.body || '새로운 질문이 등록되었습니다.',
    icon: '/icon-192.png',
    badge: '/icon-192.png',
    tag: 'if-u-notification',
    requireInteraction: false,
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});