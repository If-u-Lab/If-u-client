importScripts('https://www.gstatic.com/firebasejs/9.22.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.22.0/firebase-messaging-compat.js');

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

messaging.onBackgroundMessage((payload) => {
  console.log('백그라운드 메시지 수신:', payload);
  
  const notificationTitle = payload.notification?.title || '새로운 질문';
  const notificationOptions = {
    body: payload.notification?.body || '새로운 질문이 등록되었습니다.',
    icon: '/icon.png',
  };
  
  self.registration.showNotification(notificationTitle, notificationOptions);
});