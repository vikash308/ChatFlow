import { useEffect } from "react";
import { useSocketContext } from "./SocketContext";
import useConversation from "../zustand/useConversation.js";
import sound from "../assets/notification.mp3";

const useGetSocketMessage = () => {
  const { socket } = useSocketContext();
  const { setMessage } = useConversation();

  useEffect(() => {
    if (!socket) return;

    // ✅ New message
    const onNewMessage = (newMessage) => {
      try {
        const notification = new Audio(sound);
        notification.play();
      } catch (e) { }

      setMessage((prev) => [...prev, newMessage]);
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
  }, [socket, setMessage]);
};

export default useGetSocketMessage;
