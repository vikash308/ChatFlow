import { Server } from "socket.io";
import http from "http";
import express from "express";

const app = express();
const server = http.createServer(app);

const users = {}; 
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

  socket.on("disconnect", () => {
    console.log("a user disconnected", socket.id);

    if (socket.userId) delete users[socket.userId];

    io.emit("getOnlineUsers", Object.keys(users));
  });
});

export { app, io, server };
