import { messaging } from "./settingFCM";
import { getToken, onMessage } from "firebase/messaging";

const VAPID_KEY = process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY;

// 디바이스 ID 생성/관리 (localStorage에 저장)
export const getOrCreateDeviceId = (): string => {
  if (typeof window === "undefined") return "";

  let deviceId = localStorage.getItem("deviceId");
  if (!deviceId) {
    deviceId = crypto.randomUUID();
    localStorage.setItem("deviceId", deviceId);
  }
  return deviceId;
};

// PWA 설치 여부 확인
const isPwaInstalled = (): boolean => {
  if (typeof window === "undefined") return false;

  return window.matchMedia("(display-mode: standalone)").matches ||
         (window.navigator as any).standalone === true;
};

// 플랫폼 감지 (ANDROID, IOS, WEB, OTHER)
const getPlatform = (): string => {
  // SSR / Node 환경
  if (typeof window === "undefined") return "OTHER";

  const userAgent = window.navigator.userAgent.toLowerCase();

  // Android
  if (/android/.test(userAgent)) {
    return "ANDROID";
  }

  // iOS (iPhone, iPad, iPod, iPadOS)
  if (
    /iphone|ipad|ipod/.test(userAgent) ||
    (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1)
  ) {
    return "IOS";
  }

  // 브라우저 기반 데스크톱
  if (/windows|macintosh|linux/.test(userAgent)) {
    return "WEB";
  }

  // 그 외 (알 수 없는 환경)
  return "OTHER";
};

// FCM 토큰을 받아오는 함수
export const requestFCMToken = async (accessToken?: string | null) => {
  try {
    // 브라우저 알림 지원 여부 확인
    if (!('Notification' in window)) {
      console.log("브라우저가 알림을 지원하지 않습니다");
      return null;
    }

    // 현재 권한 상태 확인
    let permission = Notification.permission;
    console.log("현재 알림 권한 상태:", permission);

    // 권한이 아직 결정되지 않았으면 요청
    if (permission === "default") {
      console.log("알림 권한 요청 중...");
      permission = await Notification.requestPermission();
      console.log("사용자 선택:", permission);
    }

    if (permission === "granted") {
      console.log("알림 권한 허용됨 - FCM 토큰 발급 시작");

      // messaging 함수 실행해서 객체 가져오기
      const messagingInstance = await messaging();
      if (!messagingInstance) {
        console.log("Firebase Messaging 초기화 실패");
        return null;
      }
      // FCM 토큰 발급
      const token = await getToken(messagingInstance, {
        vapidKey: VAPID_KEY,
      });

      if (token) {
        console.log("FCM 토큰 발급 성공:", token);
        // localStorage에 토큰 저장 (갱신 감지용)
        localStorage.setItem("fcm_token", token);
        await saveTokenToServer(token, accessToken);
        return token;
      } else {
        console.log("토큰 발급 실패");
        return null;
      }
    } else if (permission === "denied") {
      console.log("알림 권한이 거부되었습니다. 브라우저 설정에서 변경 가능합니다.");
      return null;
    } else {
      console.log("알림 권한이 결정되지 않았습니다");
      return null;
    }
  } catch (error: any) {
    const errorMessage = error?.message || "FCM 토큰 요청 중 오류가 발생했습니다"
    console.error("FCM 토큰 요청 오류:", errorMessage, error);
    return null;
  }
};

// 서버에 토큰 저장하는 함수
const saveTokenToServer = async (fcmToken: string, accessToken?: string | null) => {
  try {
    // 인증 토큰이 없으면 저장하지 않음
    if (!accessToken) {
      console.warn("인증 토큰이 없어 FCM 토큰을 서버에 저장하지 않습니다");
      return;
    }

    const apiUrl = process.env.NEXT_PUBLIC_API_URL;
    if (!apiUrl) {
      console.warn("API URL이 설정되지 않았습니다");
      return;
    }

    const response = await fetch(`${apiUrl}/api/v1/notifications/devices`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${accessToken}`,
      },
      credentials: "include", // 쿠키 포함
      body: JSON.stringify({
        deviceId: getOrCreateDeviceId(),
        fcmToken: fcmToken,
        platform: getPlatform(),
        isPwaInstalled: isPwaInstalled(),
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const errorMessage = errorData.message || `HTTP ${response.status} 오류`
      console.error("FCM 토큰 저장 실패:", errorMessage, errorData);
    } else {
      console.log("FCM 토큰 서버 저장 성공");
    }
  } catch (error: any) {
    const errorMessage = error?.message || "FCM 토큰 서버 저장 중 오류가 발생했습니다"
    console.error("FCM 토큰 서버 저장 오류:", errorMessage, error);
  }
};

// 앱이 켜져있을 때 알림 받는 함수
export const onForegroundMessage = async () => {
  const messagingInstance = await messaging();
  if (!messagingInstance) return null;

  const unsubscribe = onMessage(messagingInstance, (payload) => {
    console.log("포그라운드 메시지 수신:", payload);

    // data 필드 우선 사용 (서버가 data 필드만 보내도록 권장)
    const data = payload.data || {};
    const notificationTitle = data.title || payload.notification?.title || "새로운 질문";
    const notificationBody = data.body || payload.notification?.body || "오늘의 질문이 등록되었습니다";
    // 백엔드가 snake_case(redirect_path) 또는 camelCase(redirectPath) 둘 다 지원
    const redirectPath = data.redirect_path || data.redirectPath || "/home";

    if (Notification.permission === "granted") {
      const notification = new Notification(notificationTitle, {
        body: notificationBody,
        icon: "/icon-192.png",
        data: { ...data, redirectPath }, // 클릭 시 사용할 데이터 포함
      });

      // 알림 클릭 시 페이지 이동 (CustomEvent로 React Router에 위임)
      notification.onclick = () => {
        window.focus();
        window.dispatchEvent(new CustomEvent('fcm-navigate', { detail: redirectPath }));
      };
    }
  });

  return unsubscribe;
};

/**
 * FCM 토큰 갱신 리스너 등록
 * 토큰이 자동으로 갱신되는 경우:
 * 1. 앱이 백업에서 복원된 경우
 * 2. 사용자가 앱 데이터를 삭제한 경우
 * 3. 사용자가 앱을 재설치한 경우
 * 4. Firebase에서 보안상의 이유로 토큰을 갱신한 경우
 */
export const setupTokenRefreshListener = async (accessToken?: string | null) => {
  try {
    const messagingInstance = await messaging();
    if (!messagingInstance) {
      console.log("Firebase Messaging 초기화 실패 - 토큰 갱신 리스너 등록 불가");
      return null;
    }

    // Service Worker 메시지 리스너 등록 (토큰 갱신 감지)
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.addEventListener('message', async (event) => {
        if (event.data?.type === 'FCM_TOKEN_REFRESHED') {
          const newToken = event.data.token;
          console.log("FCM 토큰 갱신 감지:", newToken);

          // 서버에 새 토큰 업데이트
          await saveTokenToServer(newToken, accessToken);
        }
      });

      console.log("FCM 토큰 갱신 리스너 등록 완료");
    }

    // 주기적으로 토큰 검증 및 갱신 (10분마다)
    // Firebase onTokenRefresh가 놓칠 수 있는 edge case 대비
    const tokenRefreshInterval = setInterval(async () => {
      try {
        const currentToken = await getToken(messagingInstance, {
          vapidKey: VAPID_KEY,
        });

        if (currentToken) {
          // localStorage에 저장된 마지막 토큰과 비교
          const lastToken = localStorage.getItem("fcm_token");

          if (lastToken !== currentToken) {
            console.log("FCM 토큰 변경 감지 (주기적 검증) - 서버 업데이트");
            localStorage.setItem("fcm_token", currentToken);
            await saveTokenToServer(currentToken, accessToken);
          }
        }
      } catch (error: any) {
        console.error("토큰 갱신 검증 실패:", error?.message || error);
      }
    }, 10 * 60 * 1000); // 10분 (600초)

    // Cleanup 함수 반환
    return () => {
      clearInterval(tokenRefreshInterval);
    };
  } catch (error: any) {
    console.error("토큰 갱신 리스너 등록 실패:", error?.message || error);
    return null;
  }
};
