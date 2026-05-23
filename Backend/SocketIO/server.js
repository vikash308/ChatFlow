import { Server } from "socket.io";
import http from "http";
import express from "express";
import { sendPushNotification } from "../utils/firebase.js";
import Message from "../models/message.model.js";
import Conversation from "../models/conversation.model.js";

const app = express();
const server = http.createServer(app);

const users = {}; 
const activeCalls = {}; // callerUserId -> { to, from, fromName, callType, status, connectTime }

const formatDuration = (secs) => {
  const m = Math.floor(secs / 60).toString().padStart(2, "0");
  const s = (secs % 60).toString().padStart(2, "0");
  return `${m}:${s}`;
};

const logCallMessage = async (callerId, receiverId, callType, connectTime) => {
  try {
    let messageText = "";
    if (connectTime) {
      const durationSecs = Math.floor((Date.now() - connectTime) / 1000);
      const durationStr = formatDuration(durationSecs);
      messageText = callType === "video" 
        ? `🎥 Video Call (${durationStr})` 
        : `📞 Voice Call (${durationStr})`;
    } else {
      messageText = callType === "video" 
        ? `🎥 Missed Video Call` 
        : `📞 Missed Voice Call`;
    }

    let conversation = await Conversation.findOne({
      members: { $all: [callerId, receiverId] },
    });
    if (!conversation) {
      conversation = await Conversation.create({
        members: [callerId, receiverId],
      });
    }

    const newMessage = new Message({
      senderId: callerId,
      receiverId,
      message: messageText,
    });

    conversation.messages.push(newMessage._id);
    await Promise.all([conversation.save(), newMessage.save()]);

    const populatedMessage = await newMessage.populate("senderId", "fullname");

    // Emit to both caller and receiver sockets
    const callerSocketId = getReceiverSocketId(callerId);
    const receiverSocketId = getReceiverSocketId(receiverId);

    if (callerSocketId) {
      io.to(callerSocketId).emit("newMessage", populatedMessage);
    }
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("newMessage", populatedMessage);
    }
    
    console.log(`[Socket IO Server] Logged call message to DB: "${messageText}"`);
  } catch (err) {
    console.error("Error logging call message to DB:", err);
  }
};

export const getReceiverSocketId = (receiverId) => {
  return users[receiverId];
};

const io = new Server(server, {
  cors: {
    origin: ["http://localhost:5173", process.env.FRONTEND_URL],
    methods: ["GET", "POST"],
    credentials: true,
  },
});

io.on("connection", (socket) => {
  console.log("a user connected", socket.id);

  const userId = socket.handshake.query.userId;

  if (userId) {
    users[userId] = socket.id;
    socket.userId = userId; 

    // Check if there is a pending call invitation for this user
    const pendingCall = Object.values(activeCalls).find(
      (c) => c.to === userId && c.status === "calling"
    );
    if (pendingCall) {
      socket.emit("incoming-call", {
        from: { _id: pendingCall.from, fullname: pendingCall.fromName },
        callType: pendingCall.callType,
      });
    }
  }

  io.emit("getOnlineUsers", Object.keys(users));

  socket.on("typing", ({ receiverId }) => {
    const receiverSocketId = getReceiverSocketId(receiverId);
    if (receiverSocketId) io.to(receiverSocketId).emit("typing");
  });

  socket.on("stopTyping", ({ receiverId }) => {
    const receiverSocketId = getReceiverSocketId(receiverId);
    if (receiverSocketId) io.to(receiverSocketId).emit("stopTyping");
  });

  socket.on("markAsRead", async ({ senderId, receiverId }) => {
    const senderSocketId = getReceiverSocketId(senderId);
    if (senderSocketId) {
      io.to(senderSocketId).emit("messagesSeen", { receiverId });
    }
  });

  // --- Calling Socket Events ---

  // 1. Call User
  socket.on("call-user", ({ to, from, callType }) => {
    if (!from || !from._id) return;
    
    console.log(`[Socket IO Server] call-user received from caller ${from._id} (${from.fullname}) targeting receiver ${to}`);

    activeCalls[from._id] = {
      to,
      from: from._id,
      fromName: from.fullname,
      callType,
      status: "calling",
    };

    const receiverSocketId = getReceiverSocketId(to);
    if (receiverSocketId) {
      console.log(`[Socket IO Server] Routing incoming-call directly to online receiver socket: ${receiverSocketId}`);
      io.to(receiverSocketId).emit("incoming-call", { from, callType });
    } else {
      console.log(`[Socket IO Server] Receiver offline. Initiating FCM Push Notification fallback.`);
      sendPushNotification(to, from._id, from.fullname, callType);
    }
  });

  // 2. Accept Call
  socket.on("call-accepted", ({ to, from }) => {
    console.log(`[Socket IO Server] call-accepted from receiver ${from} for caller ${to}`);
    if (activeCalls[to]) {
      activeCalls[to].status = "connected";
      activeCalls[to].connectTime = Date.now(); // Record connect time
    }
    const callerSocketId = getReceiverSocketId(to);
    if (callerSocketId) {
      io.to(callerSocketId).emit("call-accepted", { from });
    }
  });

  // 3. Reject Call
  socket.on("call-rejected", ({ to, from }) => {
    console.log(`[Socket IO Server] call-rejected from receiver ${from} for caller ${to}`);
    const call = activeCalls[to];
    if (call) {
      logCallMessage(call.from, call.to, call.callType, null); // Missed call (connectTime = null)
      delete activeCalls[to];
    }
    const callerSocketId = getReceiverSocketId(to);
    if (callerSocketId) {
      io.to(callerSocketId).emit("call-rejected", { from });
    }
  });

  // 4. Send WebRTC Offer
  socket.on("offer", ({ to, from, offer }) => {
    const receiverSocketId = getReceiverSocketId(to);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("offer", { from, offer });
    }
  });

  // 5. Send WebRTC Answer
  socket.on("answer", ({ to, from, answer }) => {
    const callerSocketId = getReceiverSocketId(to);
    if (callerSocketId) {
      io.to(callerSocketId).emit("answer", { from, answer });
    }
  });

  // 6. Send ICE Candidate
  socket.on("ice-candidate", ({ to, from, candidate }) => {
    const otherSocketId = getReceiverSocketId(to);
    if (otherSocketId) {
      io.to(otherSocketId).emit("ice-candidate", { from, candidate });
    }
  });

  // 7. End Call
  socket.on("end-call", ({ to, from }) => {
    console.log(`[Socket IO Server] end-call received: to ${to}, from ${from}`);
    const call = activeCalls[to] || activeCalls[from];
    if (call) {
      logCallMessage(call.from, call.to, call.callType, call.connectTime);
      delete activeCalls[call.from];
    } else {
      delete activeCalls[to];
      delete activeCalls[from];
    }

    const otherSocketId = getReceiverSocketId(to);
    if (otherSocketId) {
      io.to(otherSocketId).emit("end-call", { from });
    }
  });

  socket.on("disconnect", () => {
    console.log("a user disconnected", socket.id);

    if (socket.userId) {
      const disconnectedUserId = socket.userId;

      // Clean up calls where disconnected user was the caller
      if (activeCalls[disconnectedUserId]) {
        const call = activeCalls[disconnectedUserId];
        logCallMessage(call.from, call.to, call.callType, call.connectTime);
        
        const receiverSocketId = getReceiverSocketId(call.to);
        if (receiverSocketId) {
          io.to(receiverSocketId).emit("end-call", { from: disconnectedUserId });
        }
        delete activeCalls[disconnectedUserId];
      }

      // Clean up calls where disconnected user was the receiver
      Object.keys(activeCalls).forEach((callerId) => {
        const call = activeCalls[callerId];
        if (call.to === disconnectedUserId) {
          logCallMessage(call.from, call.to, call.callType, call.connectTime);
          
          const callerSocketId = getReceiverSocketId(callerId);
          if (callerSocketId) {
            io.to(callerSocketId).emit("call-rejected", { from: disconnectedUserId });
          }
          delete activeCalls[callerId];
        }
      });

      delete users[socket.userId];
    }

    io.emit("getOnlineUsers", Object.keys(users));
  });
});

export { app, io, server };
