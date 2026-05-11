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
        group cursor-pointer px-4 py-4 rounded-2xl mx-2 my-1
        transition-all duration-300
        ${
          isSelected
            ? "bg-white/10 shadow-lg shadow-indigo-500/5 border border-white/5"
            : "hover:bg-white/[0.05]"
        }
      `}
    >
      <div className="flex items-center gap-4">
        {/* Avatar */}
        <div className="relative">
          <div className={`p-0.5 rounded-full ${isSelected ? "premium-gradient" : "bg-white/10"}`}>
            <img
              src={profile}
              alt="profile"
              className="
                w-12 h-12 rounded-full object-cover
                border-2 border-[#0b1326]
              "
            />
          </div>

          {/* Online indicator */}
          {isOnline && (
            <span
              className="
                absolute bottom-0 right-0 w-3.5 h-3.5
                bg-emerald-500 rounded-full
                border-[3px] border-[#0b1326]
                animate-pulse
              "
            />
          )}
        </div>

        {/* User info */}
        <div className="flex-1">
          <div className="flex justify-between items-center">
            <h1 className={`font-bold transition-colors ${isSelected ? "text-indigo-300" : "text-white/90 group-hover:text-white"}`}>
              {user.fullname}
            </h1>
            {unreadCount > 0 && (
              <div className="bg-indigo-500 text-white text-[10px] font-black w-5 h-5 flex items-center justify-center rounded-lg shadow-lg shadow-indigo-500/30">
                {unreadCount}
              </div>
            )}
          </div>
          <p className="text-xs text-white/40 truncate mt-0.5 font-medium">{user.email}</p>
        </div>

        {/* Selected Indicator */}
        {isSelected && (
          <div className="w-1.5 h-1.5 rounded-full bg-indigo-400 shadow-[0_0_10px_rgba(129,140,248,0.8)]"></div>
        )}
      </div>
    </div>
  );
}

export default User;
