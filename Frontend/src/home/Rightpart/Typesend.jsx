import React, { useState } from "react";
import { IoSend } from "react-icons/io5";
import useSendMessage from "../../context/useSendMessage.js";

function Typesend() {
  const [message, setMessage] = useState("");
  const { loading, sendMessages } = useSendMessage();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!message.trim()) return;
    await sendMessages(message);
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
          onChange={(e) => setMessage(e.target.value)}
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
