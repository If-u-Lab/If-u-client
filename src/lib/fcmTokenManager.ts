import { messaging } from "./settingFCM";
import { getToken, onMessage } from "firebase/messaging";
import { updateNotificationSettings } from "@/lib/notification-api";

const VAPID_KEY = process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY;

// 디바이스 ID 생성/관리 (localStorage에 저장)
const getOrCreateDeviceId = (): string => {
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

         // 알림 권한 허용 시 서버에 notificationEnabled: true 업데이트
         try {
           await updateNotificationSettings(true);
           console.log("서버 알림 설정 업데이트 완료 (enabled: true)");
         } catch (error) {
           console.error("서버 알림 설정 업데이트 실패:", error);
           // 실패해도 FCM 토큰 발급은 계속 진행
         }

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
           await saveTokenToServer(token, accessToken);
           return token;
         } else {
           console.log("토큰 발급 실패");
           return null;
         }
       } else if (permission === "denied") {
         console.log("알림 권한이 거부되었습니다. 브라우저 설정에서 변경 가능합니다.");

         // 알림 권한 거부 시 서버에 notificationEnabled: false 업데이트
         try {
           await updateNotificationSettings(false);
           console.log("서버 알림 설정 업데이트 완료 (enabled: false)");
         } catch (error) {
           console.error("서버 알림 설정 업데이트 실패:", error);
         }

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
       const redirectPath = data.redirectPath || "/home"; // 백엔드가 보내는 리다이렉트 경로

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