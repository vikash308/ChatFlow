# 💬 ChatFlow

ChatFlow is a real-time one-to-one chat application that enables users to communicate instantly with live message delivery, online/offline presence, OTP-based email verification, and a smooth conversation flow — all without page refresh.

---

## 🚀 Features

- 🔐 User Authentication (Signup / Login / Logout)
- 📩 Email OTP Verification (Nodemailer)
- 💬 Real-time one-to-one messaging
- ⚡ Instant message delivery using Socket.IO (WebSockets)
- 🟢 Online / Offline user presence
- ⌨️ Typing indicator (Instagram/WhatsApp style)
- 🗑 WhatsApp-like message delete
  - Delete for me
  - Delete for everyone (real-time)
- 📜 Auto-scrolling chat messages
- ⏱ Message timestamps
- 🧩 Clean and modular React components
- 📱 Fully responsive layout (mobile & desktop)

---

## 🛠 Tech Stack

### Frontend
- React.js
- Tailwind CSS
- Zustand (State Management)
- Axios

### Backend
- Node.js
- Express.js
- MongoDB + Mongoose
- JWT Authentication
- Socket.IO
- Nodemailer (OTP email verification)

---

## ⚙️ How It Works

1. Users sign up and receive an OTP via email using Nodemailer.
2. After OTP verification, users can log in securely using JWT authentication.
3. Socket.IO establishes a persistent connection for real-time messaging.
4. Messages are delivered instantly to both sender and receiver without reload.
5. Online/offline status is tracked using active socket connections.
6. Typing events are emitted in real-time for a smooth chat experience.
7. Users can delete messages (for me / for everyone) similar to WhatsApp.

---

## 🧠 Key Learnings

- Built real-time communication using Socket.IO
- Implemented OTP-based email verification using Nodemailer
- Managed global chat state efficiently with Zustand
- Designed scalable and reusable React components
- Improved UX with auto-scroll, loading states, and empty states
- Implemented real-world chat features (typing indicator + message delete)

---

## 📌 Future Enhancements

- Read / Delivered message status (✔️✔️)
- Unread message count + last message preview
- Image / file sharing
- Dark mode support
- Voice and video calling (WebRTC)
- Push notifications (Web Push / PWA)

---

## 📷 Screenshots / Demo

(Add screenshots or a short demo video link here)

---

## 🧑‍💻 Author

**Vikash Pandey**  
Full Stack Developer (MERN)
