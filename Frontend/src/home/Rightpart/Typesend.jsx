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
    <div className="px-6 py-4 bg-transparent relative">
      <form onSubmit={handleSubmit} className="flex items-center gap-3">
        {/* Attachment Icon (Visual Only) */}
        <div className="w-11 h-11 flex items-center justify-center rounded-2xl bg-white/[0.03] hover:bg-white/[0.08] transition-colors cursor-pointer border border-white/5 text-white/40 hover:text-white/70">
           <span className="text-xl">📎</span>
        </div>

        {/* Input Container */}
        <div className="flex-1 relative group">
          <input
            type="text"
            placeholder="Write your message..."
            value={message}
            onChange={(e) => {
              setMessage(e.target.value);
              if (!socket || !selectedConversation?._id) return;
              socket.emit("typing", { receiverId: selectedConversation._id });
              if (window.typingTimeout) clearTimeout(window.typingTimeout);
              window.typingTimeout = setTimeout(() => {
                socket.emit("stopTyping", { receiverId: selectedConversation._id });
              }, 1000);
            }}
            className="
            w-full rounded-2xl px-6 py-3.5
            bg-white/[0.03] text-white placeholder-white/20
            border border-white/5 outline-none
            focus:border-indigo-500/30 focus:bg-white/[0.05]
            transition-all duration-300 text-[15px]
            "
          />
          {/* Emoji trigger placeholder */}
          <div className="absolute right-4 top-1/2 -translate-y-1/2 text-xl opacity-30 hover:opacity-100 cursor-pointer transition-opacity">
            😊
          </div>
        </div>

        {/* Send button */}
        <button
          type="submit"
          disabled={loading || !message.trim()}
          className="
          w-12 h-12 flex items-center justify-center rounded-2xl
          premium-gradient shadow-lg shadow-indigo-500/20
          hover:scale-105 active:scale-95
          disabled:opacity-30 disabled:grayscale disabled:cursor-not-allowed
          transition-all duration-300
          "
        >
          <IoSend className="text-xl text-white ml-0.5" />
        </button>
      </form>
    </div>
  );
}

export default Typesend;
