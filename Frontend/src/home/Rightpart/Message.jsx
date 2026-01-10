import React from "react";

function Message({ message }) {
  const authUser = JSON.parse(localStorage.getItem("ChatApp"));
  const itsMe = message.senderId === authUser.user._id;

  const createdAt = new Date(message.createdAt);
  const formattedTime = createdAt.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div className="px-4 py-1">
      <div className={`flex ${itsMe ? "justify-end" : "justify-start"}`}>
        <div
          className={`
          max-w-[70%] px-4 py-2 rounded-2xl
          shadow-md backdrop-blur-lg
          ${
            itsMe
              ? "bg-gradient-to-tl from-pink-300 via-yellow-200 to-green-300 text-gray-800 rounded-br-none"
              : "bg-white/70 text-gray-700 rounded-bl-none"
          }
          `}
        >
          {/* Message text */}
          <p className="text-sm leading-relaxed">{message.message}</p>

          {/* Time */}
          <div
            className={`
            text-[11px] mt-1 text-right
            text-gray-600
            `}
          >
            {formattedTime}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Message;
