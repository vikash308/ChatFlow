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
      className="w-full h-full flex flex-col
     bg-gradient-to-br from-pink-100 via-yellow-100 to-green-100
      border-r border-purple-200
      text-gray-700 relative"
    >
      <Profile />
      
      <div className="flex items-center justify-between px-4 py-2 mt-1">
        <h2 className="text-xs font-bold text-gray-500 uppercase tracking-widest">Recent Chats</h2>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="p-2 bg-white rounded-full shadow-sm hover:shadow-md hover:scale-110 transition-all text-purple-600 border border-purple-100"
          title="New Chat"
        >
          <FaUserPlus size={16} />
        </button>
      </div>

      <Search />
      <div
        className=" flex-1  overflow-y-auto"
        style={{ minHeight: "calc(84vh - 10vh)" }}
      >
        <Users />
      </div>

      <AllUsersModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </div>
  );
}

export default Left;
