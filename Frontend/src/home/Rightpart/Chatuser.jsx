import React from "react";
import useConversation from "../../zustand/useConversation.js";
import { useSocketContext } from "../../context/SocketContext.jsx";
import { CiMenuFries } from "react-icons/ci";
import profile from "../../../public/user.jpg";

function Chatuser() {
  const { selectedConversation } = useConversation();
  const { onlineUsers } = useSocketContext();

  const getOnlineUsersStatus = (userId) => {
    return onlineUsers.includes(userId) ? "Online" : "Offline";
  };

  if (!selectedConversation) return null;

  const isOnline = onlineUsers.includes(selectedConversation._id);

  return (
    <div
      className="
      relative flex items-center gap-4 px-5 h-[8vh]
      bg-white/70 backdrop-blur-xl
      border-b border-purple-200
      transition-all duration-300
      "
    >
      {/* Mobile menu */}
      <label htmlFor="my-drawer-2" className="lg:hidden cursor-pointer">
        <CiMenuFries className="text-purple-500 text-2xl" />
      </label>

      {/* User info */}
      <div className="flex items-center gap-3">
        {/* Avatar */}
        <div className="relative">
          <img
            src={profile}
            alt="profile"
            className="
            w-11 h-11 rounded-full object-cover
            border-2 border-purple-300
            "
          />
          {isOnline && (
            <span
              className="
              absolute bottom-0 right-0 w-3 h-3
              bg-green-400 rounded-full
              border-2 border-white
              "
            />
          )}
        </div>

        {/* Name & status */}
        <div className="leading-tight">
          <h1 className="text-base font-semibold text-gray-800">
            {selectedConversation.fullname}
          </h1>
          <span
            className={`text-sm font-medium ${
              isOnline ? "text-green-500" : "text-gray-400"
            }`}
          >
            {getOnlineUsersStatus(selectedConversation._id)}
          </span>
        </div>
      </div>
    </div>
  );
}

export default Chatuser;
