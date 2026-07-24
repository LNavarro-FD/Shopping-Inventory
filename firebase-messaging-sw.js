/* ============================================================
   firebase-messaging-sw.js
   Must be hosted at the SAME folder level as index.html (i.e. at
   the root of wherever you deploy, e.g. https://yoursite.com/
   firebase-messaging-sw.js — not inside a subfolder), or the
   browser won't find it.

   IMPORTANT: paste the exact same firebaseConfig values you used
   in index.html below. This file can't read that one — they're
   two separate scripts loaded in two separate contexts.
============================================================ */
importScripts('https://www.gstatic.com/firebasejs/10.12.2/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.12.2/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: "AIzaSyCD2GmY-VIH8fyNB4QmHWmWndcF1Yv8Vbo",
  authDomain: "shopping-inventory-40e99.firebaseapp.com",
  databaseURL: "https://shopping-inventory-40e99-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "shopping-inventory-40e99",
  storageBucket: "shopping-inventory-40e99.firebasestorage.app",
  messagingSenderId: "65098224865",
  appId: "1:65098224865:web:2f28c0c4d868d4405853a0"
});

const messaging = firebase.messaging();

// Fires when a push arrives and the app/tab is NOT in the foreground.
messaging.onBackgroundMessage((payload) => {
  const title = (payload.notification && payload.notification.title) || 'La Lista';
  const options = {
    body: (payload.notification && payload.notification.body) || '',
    icon: (payload.notification && payload.notification.icon) || undefined,
    badge: undefined
  };
  self.registration.showNotification(title, options);
});
