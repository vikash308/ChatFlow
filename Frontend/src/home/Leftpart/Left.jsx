import React, { useState, useEffect } from "react";
import Search from "./Search";
import Users from "./Users";
import Profile from "./Profile";
import AllUsersModal from "./AllUsersModal";
import { FaUserPlus } from "react-icons/fa";
import { registerFcmToken } from "../../firebase";

function Left() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    if ("Notification" in window) {
      setShowBanner(Notification.permission === "default");
    }
  }, []);

  return (
    <div
      className="w-full h-full flex flex-col text-[#dae2fd] relative"
    >
      <Profile />

      {showBanner && (
        <div className="mx-6 mt-4 p-4 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-[#dae2fd] flex flex-col gap-2.5 shadow-lg animate-in slide-in-from-top-2 duration-300">
          <p className="text-xs font-semibold text-indigo-300">
            🔔 Enable notifications to receive incoming video/audio calls when the browser is closed.
          </p>
          <button
            onClick={async () => {
              await registerFcmToken();
              if (Notification.permission !== "default") {
                setShowBanner(false);
              }
            }}
            className="w-full py-2 bg-indigo-500 hover:bg-indigo-600 active:scale-95 transition-all rounded-xl text-xs font-black uppercase tracking-wider text-white shadow-md cursor-pointer"
          >
            Enable Notifications
          </button>
        </div>
      )}

      
      <div className="flex items-center justify-between px-6 py-4">
        <h2 className="text-xs font-bold text-indigo-400 uppercase tracking-[0.2em]">Recent Chats</h2>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="p-2 bg-indigo-500/10 hover:bg-indigo-500/20 rounded-xl transition-all text-indigo-400 border border-indigo-500/20 group"
          title="New Chat"
        >
          <FaUserPlus size={18} className="group-hover:scale-110 transition-transform" />
        </button>
      </div>

      <Search />
      <div
        className="flex-1 overflow-y-auto px-2"
      >
        <Users />
      </div>

      <AllUsersModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </div>
  );
}

export default Left;
