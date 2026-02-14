import React, { useState } from "react";
import { IoSend } from "react-icons/io5";
import useSendMessage from "../../context/useSendMessage.js";
import { useSocketContext } from "../../context/SocketContext.jsx";
import useConversation from "../../zustand/useConversation.js";


function Typesend() {
  const [message, setMessage] = useState("");
  const { loading, sendMessages } = useSendMessage();
  const { socket } = useSocketContext();
  const { selectedConversation } = useConversation();


  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!message.trim()) return;
    await sendMessages(message);
    socket?.emit("stopTyping", { receiverId: selectedConversation?._id });

    setMessage("");
  };

  return (
    <form onSubmit={handleSubmit}>
      <div
        className="
        flex items-center gap-3 h-[8vh] px-4
        bg-white/70 backdrop-blur-xl
        border-t border-purple-200
        "
      >
        {/* Input */}
        <input
          type="text"
          placeholder="Type a message..."
          value={message}
          onChange={(e) => {
            setMessage(e.target.value);

            if (!socket || !selectedConversation?._id) return;

            socket.emit("typing", { receiverId: selectedConversation._id });
            if (window.typingTimeout) clearTimeout(window.typingTimeout);

            window.typingTimeout = setTimeout(() => {
              socket.emit("stopTyping", {
                receiverId: selectedConversation._id,
              });
            }, 1000);
          }}
          className="
          flex-1 rounded-2xl px-4 py-3
          bg-white/80 text-gray-700 placeholder-gray-400
          border border-purple-200 outline-none
          focus:ring-2 focus:ring-purple-300
          transition-all
          "
        />

        {/* Send button */}
        <button
          type="submit"
          disabled={loading || !message.trim()}
          className="
          p-3 rounded-full
          bg-gradient-to-tr from-pink-400 via-yellow-400 to-green-400
          hover:scale-110 hover:shadow-lg
          disabled:opacity-50 disabled:cursor-not-allowed
          transition-all duration-300
          "
        >
          <IoSend className="text-xl text-white" />
        </button>
      </div>
    </form>
  );
}

export default Typesend;
