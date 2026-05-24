# 💬 ChatFlow

ChatFlow is a premium, real-time one-to-one chat application built with the MERN stack. It features a modern glassmorphic dark interface, real-time message delivery, and advanced chat features like read receipts and typing indicators.

**🔗 [Live Demo](https://chatflow-y9f1.onrender.com)**

---

## 🚀 Features

- **🔐 Secure Auth**: Signup/Login with JWT and OTP-based email verification (Nodemailer).
- **📞 Audio & Video Calls**: WebMeet-style peer-to-peer audio/video calling using WebRTC with real-time UI controls (mute audio, toggle camera) and network connection recovery.
- **🖥 Screen Share**: Share your browser tab or entire screen directly mid-video call utilizing dynamic track replacement (`replaceTrack`).
- **🔔 Call Push Notifications**: Integrated FCM (Firebase Cloud Messaging) to trigger system-level push notifications for backgrounded or locked devices.
- **⚡ Call State Automation**: Automated 45-second timeout for unanswered calls, auto-busy signals if called while active, and full connection cleanups.
- **✔️ Read Receipts**: Real-time "Seen" status with blue double-ticks.
- **⚡ Instant Messaging**: Sub-millisecond message delivery via Socket.IO.
- **🟢 Live Presence**: Real-time online/offline status tracking.
- **⌨️ Interactive Typing**: WhatsApp-style typing indicators.
- **🗑 Message Control**: "Delete for me" and real-time "Delete for everyone".
- **📱 Fully Responsive**: Optimized for mobile (h-[100dvh]) and desktop screens.

---

## 🛠 Tech Stack

### Frontend
- **React.js** (Vite)
- **Tailwind CSS** (Custom Glassmorphism)
- **Zustand** (Global State Management)
- **Framer Motion** (Subtle UI Animations)
- **WebRTC API** (MediaStreams, RTCPeerConnection)
- **Firebase SDK** (FCM Token Registration & Foreground notifications)

### Backend
- **Node.js & Express.js**
- **MongoDB + Mongoose**
- **Socket.IO** (Real-time Engine)
- **JWT** (Stateless Authentication)
- **Nodemailer** (Security & Verification)
- **Firebase Admin SDK** (Push Notification Engine)

---

## ⚙️ Configuration & Deployment (FCM Push Notifications)

To enable push notifications for WebRTC calls in local development and production, the following variables must be configured:

### 1. Backend Environment Variables (`Backend/.env`)
Create a Firebase project, generate a **Service Account JSON**, and configure these keys:
```env
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_CLIENT_EMAIL=your-service-account-email
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYOUR_KEY_HERE\n-----END PRIVATE KEY-----\n"
```
> [!IMPORTANT]
> When deploying to **Render**, make sure to add these three variables in your Render Service Dashboard. Ensure the private key wraps its `\n` characters in quotes so the backend can parse them properly.

### 2. Frontend Environment Variables (`Frontend/.env`)
Enable client-side messaging with your Firebase Web Config:
```env
VITE_FIREBASE_API_KEY=your-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-auth-domain
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-storage-bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
VITE_FIREBASE_APP_ID=your-app-id
VITE_FIREBASE_VAPID_KEY=your-vapid-public-key
```

---

## 🧠 Architecture
For detailed technical documentation, refer to:
- [Frontend Documentation (DFD)](./Frontend/FRONTEND_DOCS.md)
- [Backend Documentation (ER Diagram)](./Backend/BACKEND_DOCS.md)

---

## 🧑‍💻 Author

**Vikash Pandey**  
Full Stack Developer (MERN)

