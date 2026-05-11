import { useEffect } from "react";
import { useSocketContext } from "./SocketContext";
import useConversation from "../zustand/useConversation.js";
import sound from "../assets/notification.mp3";

const useGetSocketMessage = () => {
  const { socket } = useSocketContext();
  const { setMessage, selectedConversation, incrementUnreadCount, updateLastMessageTime } = useConversation();
  const authUser = JSON.parse(localStorage.getItem("ChatApp"));

  useEffect(() => {
    if (!socket || !authUser) return;

    // Request notification permissions
    if ("Notification" in window && Notification.permission === "default") {
      Notification.requestPermission();
    }

    const showNotification = (newMessage, senderId, senderName) => {
      if (document.hidden || !selectedConversation || selectedConversation._id !== senderId) {
        const browserNotification = new Notification(senderName, {
          body: newMessage.message,
          icon: "/user.jpg",
          badge: "/user.jpg",
          tag: senderId,
          renotify: true
        });

        browserNotification.onclick = () => {
          window.focus();
          browserNotification.close();
        };
      }
    };

    // ✅ New message
    const onNewMessage = (newMessage) => {
      const senderId = newMessage.senderId._id || newMessage.senderId;
      const senderName = newMessage.senderId.fullname || "New Message";

      try {
        const audio = new Audio(sound);
        audio.play().catch(e => console.log("Autoplay blocked"));
      } catch (e) { }

      if (selectedConversation && selectedConversation._id === senderId) {
        newMessage.isRead = true;
        socket.emit("markAsRead", { senderId, receiverId: authUser.user._id });
        setMessage((prev) => [...prev, newMessage]);
      } else {
        incrementUnreadCount(senderId);
      }
      updateLastMessageTime(senderId);

      if ("Notification" in window) {
        if (Notification.permission === "granted") {
          showNotification(newMessage, senderId, senderName);
        } else if (Notification.permission !== "denied") {
          Notification.requestPermission().then(permission => {
            if (permission === "granted") showNotification(newMessage, senderId, senderName);
          });
        }
      }
    };

    // ✅ Messages Seen Realtime
    const onMessagesSeen = ({ receiverId }) => {
      if (selectedConversation && selectedConversation._id === receiverId) {
        setMessage((prev) =>
          prev.map((m) => ({ ...m, isRead: true }))
        );
      }
    };

    // ✅ Message Deleted Realtime
    const onMessageDeleted = ({ messageId, deleteType }) => {
      if (deleteType === "everyone") {
        setMessage((prev) =>
          prev.map((m) =>
            m._id === messageId
              ? { ...m, isDeleted: true, message: "This message was deleted" }
              : m
          )
        );
      }
    };

    // Emit markAsRead when opening a conversation
    if (selectedConversation) {
      socket.emit("markAsRead", {
        senderId: selectedConversation._id,
        receiverId: authUser.user._id
      });
    }

    socket.on("newMessage", onNewMessage);
    socket.on("messageDeleted", onMessageDeleted);
    socket.on("messagesSeen", onMessagesSeen);

    return () => {
      socket.off("newMessage", onNewMessage);
      socket.off("messageDeleted", onMessageDeleted);
      socket.off("messagesSeen", onMessagesSeen);
    };
  }, [socket, setMessage, selectedConversation, incrementUnreadCount, authUser?.user?._id]);
};

export default useGetSocketMessage;
