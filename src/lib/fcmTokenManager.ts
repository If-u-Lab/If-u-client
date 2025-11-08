import { messaging } from "./settingFCM";
import { getToken, onMessage } from "firebase/messaging";
   
   const VAPID_KEY = "BLG-wT3SDdUQGUDROWjycUU-cg_B8eXhGkRrPEHropiMmEEoVVo6zUcfteawgtleJ7I_gjBctaxpIaR97nzpzMY";
   
   // FCM 토큰을 받아오는 함수
   export const requestFCMToken = async () => {
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
           
           // TODO 서버 api 구현 후 주석 해제
           // await saveTokenToServer(token);
           
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
   const saveTokenToServer = async (token: string) => {
     try {
       const response = await fetch("/v1/notifications/devices", {
         method: "POST",
         headers: {
           "Content-Type": "application/json",
           // 인증 토큰이 있다면 추가
         },
         body: JSON.stringify({
            deviceToken: token,
         }),
       });
       
       if (response.ok) {
         console.log("토큰이 서버에 저장되었습니다");
       } else {
         console.error("토큰 저장 실패:", response.status);
       }
     } catch (error) {
       console.error("서버 저장 오류:", error);
     }
   };
   
   // 앱이 켜져있을 때 알림 받는 함수
   export const onForegroundMessage = async () => {
     const messagingInstance = await messaging();
     if (!messagingInstance) return;
     
     onMessage(messagingInstance, (payload) => {
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
   };