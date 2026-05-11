import React from "react";
import useConversation from "../../zustand/useConversation.js";
import { useSocketContext } from "../../context/SocketContext.jsx";
import { IoArrowBack } from "react-icons/io5";
import profile from "../../../public/user.jpg";

function Chatuser() {
  const { selectedConversation, setSelectedConversation } = useConversation();
  const { onlineUsers } = useSocketContext();

  const getOnlineUsersStatus = (userId) => {
    return onlineUsers.includes(userId) ? "Online" : "Offline";
  };

  if (!selectedConversation) return null;

  const isOnline = onlineUsers.includes(selectedConversation._id);

  return (
    <div
      className="
      flex items-center justify-between px-6 h-20
      bg-transparent w-full
      transition-all duration-300
      "
    >
      <div className="flex items-center gap-4">
        {/* Mobile Back Button */}
        <div 
          className="md:hidden cursor-pointer p-2 hover:bg-white/10 rounded-xl transition-all border border-white/5"
          onClick={() => setSelectedConversation(null)}
        >
          <IoArrowBack className="text-white text-xl" />
        </div>

        {/* User info */}
        <div className="flex items-center gap-4">
          {/* Avatar */}
          <div className="relative">
            <div className="p-0.5 rounded-full premium-gradient">
              <img
                src={profile}
                alt="profile"
                className="
                w-10 h-10 rounded-full object-cover
                border-2 border-[#0b1326]
                "
              />
            </div>
            {isOnline && (
              <span
                className="
                absolute bottom-0 right-0 w-3 h-3
                bg-emerald-500 rounded-full
                border-2 border-[#0b1326]
                animate-pulse
                "
              />
            )}
          </div>

          {/* Name & status */}
          <div className="leading-tight">
            <h1 className="text-base font-bold text-white tracking-tight">
              {selectedConversation.fullname}
            </h1>
            <div className="flex items-center gap-1.5 mt-0.5">
               <span className={`w-1.5 h-1.5 rounded-full ${isOnline ? "bg-emerald-500 animate-pulse" : "bg-white/20"}`}></span>
               <span
                className={`text-[10px] font-bold uppercase tracking-widest ${
                  isOnline ? "text-emerald-400" : "text-white/30"
                }`}
              >
                {getOnlineUsersStatus(selectedConversation._id)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons (Optional/Placeholder) */}
      <div className="flex items-center gap-2">
         <div className="w-10 h-10 flex items-center justify-center rounded-xl hover:bg-white/5 transition-colors cursor-pointer border border-white/0 hover:border-white/5">
            <div className="w-1.5 h-1.5 rounded-full bg-white/40"></div>
            <div className="w-1.5 h-1.5 rounded-full bg-white/40 mx-0.5"></div>
            <div className="w-1.5 h-1.5 rounded-full bg-white/40"></div>
         </div>
      </div>
    </div>
  );
}

export default Chatuser;
