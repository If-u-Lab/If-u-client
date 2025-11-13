import { initializeApp } from "firebase/app";
import { getAnalytics, isSupported as isAnalyticsSupported } from "firebase/analytics";
import { getMessaging, isSupported as isMessagingSupported } from "firebase/messaging";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID
};

// Firebase 앱 초기화
const app = initializeApp(firebaseConfig);

// Analytics 초기화 (브라우저에서만)
export const analytics = async () => {
  if (typeof window !== "undefined") {
    const supported = await isAnalyticsSupported();
    return supported ? getAnalytics(app) : null;
  }
  return null;
};

// Messaging 인스턴스 캐싱 (싱글톤 패턴)
let messagingInstance: Promise<ReturnType<typeof getMessaging> | null> | null = null;

// Messaging 초기화 (브라우저에서만)
export const messaging = async () => {
  if (typeof window === "undefined") return null;

  if (!messagingInstance) {
    messagingInstance = isMessagingSupported().then((supported) =>
      supported ? getMessaging(app) : null
    );
  }

  return messagingInstance;
};

export { app };