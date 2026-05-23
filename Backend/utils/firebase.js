import admin from "firebase-admin";
import User from "../models/user.model.js";

let fcmInitialized = false;

const initializeFirebase = () => {
  if (fcmInitialized) return true;
  try {
    const projectId = process.env.FIREBASE_PROJECT_ID;
    const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
    const privateKey = process.env.FIREBASE_PRIVATE_KEY;

    if (projectId && clientEmail && privateKey) {
      const formattedPrivateKey = privateKey.replace(/\\n/g, '\n');
      admin.initializeApp({
        credential: admin.credential.cert({
          projectId,
          clientEmail,
          privateKey: formattedPrivateKey,
        }),
      });
      fcmInitialized = true;
      console.log("Firebase Admin SDK initialized successfully for FCM");
      return true;
    } else {
      console.log("Firebase credentials (FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY) missing in env. FCM bypass enabled.");
      return false;
    }
  } catch (error) {
    console.error("Failed to initialize Firebase Admin SDK:", error);
    return false;
  }
};


export const sendPushNotification = async (receiverId, callerId, callerName, callType) => {
  if (!initializeFirebase()) {
    console.log(`[FCM Bypass] FCM not initialized. Target: ${receiverId}, Caller: ${callerName} (${callerId}), Type: ${callType}`);
    return;
  }


  try {
    const user = await User.findById(receiverId);
    if (!user || !user.fcmToken) {
      console.log(`[FCM Bypass] User ${receiverId} not found or doesn't have an FCM token.`);
      return;
    }

    const message = {
      notification: {
        title: "Incoming Call",
        body: `${callerName} is calling you`,
      },
      data: {
        type: "call",
        callerId: callerId.toString(),
        callerName: callerName,
        callType: callType,
      },
      android: {
        priority: "high",
      },
      webpush: {
        headers: {
          Urgency: "high",
        },
        notification: {
          title: "Incoming Call",
          body: `${callerName} is calling you`,
          icon: "/user.jpg",
          badge: "/user.jpg",
          tag: "incoming-call",
          renotify: true,
        },
      },
      token: user.fcmToken,
    };

    const response = await admin.messaging().send(message);
    console.log("Successfully sent FCM message:", response);
  } catch (error) {
    console.error("Error sending FCM notification:", error);
  }
};
