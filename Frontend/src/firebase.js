import { initializeApp } from "firebase/app";
import { getMessaging, getToken, onMessage } from "firebase/messaging";
import axios from "axios";
import server from "./api";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

let messaging = null;

if (import.meta.env.VITE_FIREBASE_API_KEY) {
  try {
    const app = initializeApp(firebaseConfig);
    messaging = getMessaging(app);
    
    // Log foreground push messages to console for debugging
    onMessage(messaging, (payload) => {
      console.log("FCM Foreground message received:", payload);
    });
  } catch (error) {
    console.error("Firebase initialization failed:", error);
  }
}

export const registerFcmToken = async () => {
  if (!messaging) {
    console.log("Firebase Messaging not initialized (VITE_FIREBASE_API_KEY is missing). Skipping FCM token registration.");
    return;
  }

  try {
    const permission = await Notification.requestPermission();
    if (permission !== "granted") {
      console.log("Notification permission not granted (current status:", permission, ")");
      return;
    }

    // Dynamically register service worker with query params containing configs to prevent Git leaks
    const configParams = new URLSearchParams({
      apiKey: firebaseConfig.apiKey || "",
      authDomain: firebaseConfig.authDomain || "",
      projectId: firebaseConfig.projectId || "",
      storageBucket: firebaseConfig.storageBucket || "",
      messagingSenderId: firebaseConfig.messagingSenderId || "",
      appId: firebaseConfig.appId || "",
    }).toString();

    const registration = await navigator.serviceWorker.register(
      `/firebase-messaging-sw.js?${configParams}`
    );

    const token = await getToken(messaging, {
      serviceWorkerRegistration: registration,
      vapidKey: import.meta.env.VITE_FIREBASE_VAPID_KEY,
    });

    if (token) {
      const jwtToken = localStorage.getItem("jwt");
      if (jwtToken) {
        await axios.post(
          `${server}/api/user/update-fcm`,
          { fcmToken: token },
          {
            headers: {
              Authorization: `Bearer ${jwtToken}`,
            },
          }
        );
        console.log("FCM Token registered and updated on backend successfully.");
      }
    } else {
      console.warn("FCM token retrieved is empty.");
    }
  } catch (error) {
    console.error("Error registering FCM Token:", error);
  }
};
