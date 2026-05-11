import React from "react";
import Search from "./Search";
import Users from "./Users";
import Profile from "./Profile";
import AllUsersModal from "./AllUsersModal";
import { FaUserPlus } from "react-icons/fa";

function Left() {
  const [isModalOpen, setIsModalOpen] = React.useState(false);

  return (
    <div
      className="w-full h-full flex flex-col text-[#dae2fd] relative"
    >
      <Profile />
      
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
