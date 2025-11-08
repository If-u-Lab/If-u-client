import { initializeApp } from "firebase/app";
import { getAnalytics, isSupported as isAnalyticsSupported } from "firebase/analytics";
import { getMessaging, isSupported as isMessagingSupported } from "firebase/messaging";

const firebaseConfig = {
  apiKey: "AIzaSyBYCTbV9JmTab7K0_bY-fssMflQ27mXTIU",
  authDomain: "if-u-64213.firebaseapp.com",
  projectId: "if-u-64213",
  storageBucket: "if-u-64213.firebasestorage.app",
  messagingSenderId: "996003659541",
  appId: "1:996003659541:web:8bc920b6438be7e1d5331c",
  measurementId: "G-372EBT2ELV"
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

// Messaging 초기화 (브라우저에서만)
export const messaging = async () => {
  if (typeof window !== "undefined") {
    const supported = await isMessagingSupported();
    return supported ? getMessaging(app) : null;
  }
  return null;
};

export { app };