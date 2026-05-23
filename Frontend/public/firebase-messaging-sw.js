// public/firebase-messaging-sw.js
importScripts('https://www.gstatic.com/firebasejs/9.22.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.22.0/firebase-messaging-compat.js');

// Dynamically read Firebase configuration passed as query parameters on registration
const urlParams = new URL(self.location.href).searchParams;
const firebaseConfig = {
  apiKey: urlParams.get("apiKey"),
  authDomain: urlParams.get("authDomain"),
  projectId: urlParams.get("projectId"),
  storageBucket: urlParams.get("storageBucket"),
  messagingSenderId: urlParams.get("messagingSenderId"),
  appId: urlParams.get("appId")
};

// Initialize Firebase App in service worker if credentials are set
try {
  if (firebaseConfig && firebaseConfig.apiKey) {
    firebase.initializeApp(firebaseConfig);
    const messaging = firebase.messaging();

    messaging.onBackgroundMessage((payload) => {
      console.log('[firebase-messaging-sw.js] Received background message ', payload);
      const notificationTitle = payload.notification?.title || 'Incoming Call';
      const notificationOptions = {
        body: payload.notification?.body || 'Incoming call',
        icon: '/user.jpg',
        badge: '/user.jpg',
        data: payload.data
      };

      self.registration.showNotification(notificationTitle, notificationOptions);
    });
  }
} catch (error) {
  console.warn("Background messaging SDK initialization skipped or failed:", error);
}

// Fallback: Listen for standard push events directly (Web Push protocol)
self.addEventListener('push', function(event) {
  if (event.data) {
    try {
      const payload = event.data.json();
      
      // Prevent showing duplicates if FCM SDK already handles it
      const title = payload.notification?.title || 'Incoming Call';
      const body = payload.notification?.body || 'You have a call request';
      const data = payload.data || {};
      
      const options = {
        body: body,
        icon: '/user.jpg',
        badge: '/user.jpg',
        tag: 'incoming-call',
        renotify: true,
        data: data
      };

      event.waitUntil(self.registration.showNotification(title, options));
    } catch (e) {
      console.log('Error parsing standard push payload:', e);
    }
  }
});

// Handle notification click to redirect/focus application
self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
      // If a window is already open, focus it
      for (var i = 0; i < windowClients.length; i++) {
        var client = windowClients[i];
        if ('focus' in client) {
          return client.focus();
        }
      }
      // Otherwise, open a new window
      if (clients.openWindow) {
        return clients.openWindow('/');
      }
    })
  );
});
