import React, { useState } from "react";
import { createPortal } from "react-dom";
import { IoSend } from "react-icons/io5";
import useSendMessage from "../../context/useSendMessage.js";
import { useSocketContext } from "../../context/SocketContext.jsx";
import useConversation from "../../zustand/useConversation.js";
import axios from "axios";
import server from "../../api";
import toast from "react-hot-toast";

function Typesend() {
  const [message, setMessage] = useState("");
  const [showUnblockModal, setShowUnblockModal] = useState(false);
  const { loading, sendMessages } = useSendMessage();
  const { socket } = useSocketContext();
  const { selectedConversation, setSelectedConversation } = useConversation();

  const handleSendMessage = async () => {
    await sendMessages(message);
    socket?.emit("stopTyping", { receiverId: selectedConversation?._id });
    setMessage("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!message.trim()) return;

    if (selectedConversation?.isBlocked) {
      setShowUnblockModal(true);
      return;
    }

    await handleSendMessage();
  };

  const handleUnblockAndSend = async () => {
    setShowUnblockModal(false);
    try {
      const token = localStorage.getItem("jwt");
      const url = `${server}/api/user/unblock/${selectedConversation._id}`;
      await axios.post(
        url,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // Update Zustand selectedConversation
      setSelectedConversation({
        ...selectedConversation,
        isBlocked: false,
      });

      toast.success("User unblocked successfully");
      
      // Automatically send the message
      await handleSendMessage();
    } catch (error) {
      console.error("Unblock error:", error);
      toast.error("Failed to unblock user");
    }
  };

  const isBlockedByThem = selectedConversation?.isBlockedByThem;

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
            placeholder={
              isBlockedByThem 
                ? "You cannot send messages to this user." 
                : "Write your message..."
            }
            disabled={isBlockedByThem || loading}
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
            disabled:opacity-30 disabled:cursor-not-allowed
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
          disabled={loading || !message.trim() || isBlockedByThem}
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

      {/* Unblock Modal using React Portal */}
      {showUnblockModal && createPortal(
        <div className="fixed inset-0 bg-[#060814]/80 backdrop-blur-sm flex items-center justify-center z-[100] animate-in fade-in duration-200">
          <div className="w-[340px] p-6 rounded-3xl bg-[#0e172a]/95 border border-white/5 shadow-2xl flex flex-col items-center text-center animate-in scale-in-95 duration-200">
            <div className="w-12 h-12 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400 text-2xl mb-4">
              🚫
            </div>
            <h3 className="text-base font-bold text-white mb-2">Unblock User?</h3>
            <p className="text-xs text-white/50 leading-relaxed mb-6">
              You need to unblock <span className="font-semibold text-white">{selectedConversation?.fullname}</span> to send this message.
            </p>
            <div className="flex w-full gap-3">
              <button
                onClick={() => setShowUnblockModal(false)}
                className="flex-1 py-2.5 rounded-xl border border-white/5 hover:bg-white/5 text-xs font-semibold text-white/70 hover:text-white transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleUnblockAndSend}
                className="flex-1 py-2.5 rounded-xl bg-indigo-500 hover:bg-indigo-600 active:scale-95 text-xs font-semibold text-white shadow-md shadow-indigo-500/10 transition-all cursor-pointer"
              >
                Unblock & Send
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}

export default Typesend;
