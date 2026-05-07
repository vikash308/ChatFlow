import React from "react";
import useConversation from "../../zustand/useConversation.js";
import { useSocketContext } from "../../context/SocketContext.jsx";
import profile from "../../../public/user.jpg";

function User({ user }) {
  const { selectedConversation, setSelectedConversation, unreadCounts, resetUnreadCount } = useConversation();
  const isSelected = selectedConversation?._id === user._id;

  const { onlineUsers } = useSocketContext();
  const isOnline = onlineUsers.includes(user._id);
  const unreadCount = unreadCounts[user._id] || 0;

  const handleClick = () => {
    setSelectedConversation(user);
    resetUnreadCount(user._id);
  };

  return (
    <div
      onClick={handleClick}
      className={`
        group cursor-pointer px-4 py-3 rounded-xl
        transition-all duration-300
        ${
          isSelected
            ? "bg-gradient-to-r from-pink-200 via-yellow-200 to-green-200 shadow-md"
            : "hover:bg-white/60"
        }
      `}
    >
      <div className="flex items-center gap-4">
        {/* Avatar */}
        <div className="relative">
          <img
            src={profile}
            alt="profile"
            className="
              w-12 h-12 rounded-full object-cover
              border-2 border-purple-300
            "
          />

          {/* Online indicator */}
          {isOnline && (
            <span
              className="
                absolute bottom-0 right-0 w-3 h-3
                bg-green-400 rounded-full
                border-2 border-white
                animate-pulse
              "
            />
          )}
        </div>

        {/* User info */}
        <div className="flex-1">
          <div className="flex justify-between items-center">
            <h1 className="font-semibold text-gray-800">{user.fullname}</h1>
            {unreadCount > 0 && (
              <div className="bg-red-500 text-white text-xs font-bold w-5 h-5 flex items-center justify-center rounded-full">
                {unreadCount}
              </div>
            )}
          </div>
          <p className="text-sm text-gray-500 truncate">{user.email}</p>
        </div>

        {/* Selected Indicator */}
        {isSelected && (
          <div className="w-1 h-10 rounded-full bg-gradient-to-b from-purple-400 to-pink-400"></div>
        )}
      </div>
    </div>
  );
}

export default User;
