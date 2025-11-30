import { messaging } from "./settingFCM";
import { getToken, onMessage } from "firebase/messaging";

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
   
   // FCM 토큰을 받아오는 함수
   export const requestFCMToken = async (accessToken?: string | null) => {
     try {
       // 브라우저 알림 권한 요청
       console.log("알림 권한 요청 중");
       const permission = await Notification.requestPermission();

       if (permission === "granted") {
         console.log("알림 권한 허용됨");

         // messaging 함수 실행해서 객체 가져오기
         const messagingInstance = await messaging();
         if (!messagingInstance) {
           console.log("브라우저가 알림을 지원하지 않습니다");
           return null;
         }

         // FCM 토큰 발급
         const token = await getToken(messagingInstance, {
           vapidKey: VAPID_KEY,
         });

         if (token) {
           console.log("FCM 토큰:", token);
           await saveTokenToServer(token, accessToken);
           return token;
         } else {
           console.log("토큰 발급 실패");
           return null;
         }
       } else {
         console.log("알림 권한이 거부되었습니다");
         return null;
       }
     } catch (error) {
       console.error("FCM 토큰 요청 오류:", error);
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

    const response = await fetch(`${apiUrl}/v1/notifications/devices`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${accessToken}`,
      },
      credentials: "include", // 쿠키 포함
      body: JSON.stringify({
        deviceId: getOrCreateDeviceId(),
        fcmToken: fcmToken,
        platform: "WEB",
        isPwaInstalled: isPwaInstalled(),
      }),
    });

    if (!response.ok) {
      console.error("FCM 토큰 저장 실패:", response.status);
      const errorData = await response.json().catch(() => ({}));
      console.error("에러 상세:", errorData);
    } else {
      console.log("FCM 토큰 서버 저장 성공");
    }
  } catch (error) {
    console.error("FCM 토큰 서버 저장 오류:", error);
  }
};
   
   // 앱이 켜져있을 때 알림 받는 함수
   export const onForegroundMessage = async () => {
     const messagingInstance = await messaging();
     if (!messagingInstance) return null;

     const unsubscribe = onMessage(messagingInstance, (payload) => {
       console.log("포그라운드 메시지 수신:", payload);

       const notificationTitle = payload.notification?.title || "새 알림";
       const notificationBody = payload.notification?.body || "";

       if (Notification.permission === "granted") {
         new Notification(notificationTitle, {
           body: notificationBody,
           icon: "/icon.png",
         });
       }
     });

     return unsubscribe;
   };