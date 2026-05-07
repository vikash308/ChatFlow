import { useEffect } from "react";
import { useSocketContext } from "./SocketContext";
import useConversation from "../zustand/useConversation.js";
import sound from "../assets/notification.mp3";

const useGetSocketMessage = () => {
  const { socket } = useSocketContext();
  const { setMessage, selectedConversation, incrementUnreadCount, updateLastMessageTime } = useConversation();

  useEffect(() => {
    if (!socket) return;

    // Request notification permissions
    if ("Notification" in window && Notification.permission === "default") {
      Notification.requestPermission();
    }

    // ✅ New message
    const onNewMessage = (newMessage) => {
      try {
        const notification = new Audio(sound);
        notification.play();
      } catch (e) { }

      if (selectedConversation && selectedConversation._id === newMessage.senderId) {
        setMessage((prev) => [...prev, newMessage]);
      } else {
        incrementUnreadCount(newMessage.senderId);
      }
      updateLastMessageTime(newMessage.senderId);

      // 🔔 Native Browser Notification
      if ("Notification" in window && Notification.permission === "granted") {
        // Only show notification if the tab is hidden or we are not in that specific chat
        if (document.hidden || !selectedConversation || selectedConversation._id !== newMessage.senderId) {
          const browserNotification = new Notification("New Message", {
            body: newMessage.message,
            icon: "/user.jpg",
          });

          // Focus the window when clicked
          browserNotification.onclick = () => {
            window.focus();
            browserNotification.close();
          };
        }
      }
    };

    // ✅ Delete message realtime
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

    socket.on("newMessage", onNewMessage);
    socket.on("messageDeleted", onMessageDeleted);

    return () => {
      socket.off("newMessage", onNewMessage);
      socket.off("messageDeleted", onMessageDeleted);
    };
  }, [socket, setMessage, selectedConversation, incrementUnreadCount]);
};

export default useGetSocketMessage;
