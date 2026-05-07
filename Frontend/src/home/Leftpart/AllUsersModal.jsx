import React, { useState } from "react";
import { FaSearch, FaTimes, FaUserPlus } from "react-icons/fa";
import useGetAllUsers from "../../context/useGetAllUsers";
import useConversation from "../../zustand/useConversation";
import profile from "../../../public/user.jpg";

function AllUsersModal({ isOpen, onClose }) {
  const [allUsers, loading] = useGetAllUsers();
  const { setSelectedConversation } = useConversation();
  const [search, setSearch] = useState("");

  if (!isOpen) return null;

  const filteredUsers = allUsers.filter((user) =>
    user.fullname?.toLowerCase().includes(search.toLowerCase())
  );

  const handleSelect = (user) => {
    setSelectedConversation(user);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 to-pink-600 px-6 py-4 flex items-center justify-between">
          <h2 className="text-white font-bold text-xl flex items-center gap-2">
            <FaUserPlus /> Start New Chat
          </h2>
          <button onClick={onClose} className="text-white/80 hover:text-white transition-colors">
            <FaTimes size={24} />
          </button>
        </div>

        {/* Search */}
        <div className="p-4 border-b border-gray-100">
          <div className="flex items-center gap-3 bg-gray-100 rounded-2xl px-4 py-2 focus-within:ring-2 focus-within:ring-purple-300 transition-all">
            <FaSearch className="text-gray-400" />
            <input
              type="text"
              placeholder="Search by name or email..."
              className="bg-transparent outline-none w-full text-sm py-1"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              autoFocus
            />
          </div>
        </div>

        {/* User List */}
        <div className="max-h-[60vh] overflow-y-auto p-2">
          {loading ? (
            <div className="p-10 text-center text-gray-500">Loading users...</div>
          ) : filteredUsers.length > 0 ? (
            filteredUsers.map((user) => (
              <div
                key={user._id}
                onClick={() => handleSelect(user)}
                className="flex items-center gap-4 p-3 rounded-2xl hover:bg-purple-50 cursor-pointer transition-all group"
              >
                <img
                  src={profile}
                  alt={user.fullname}
                  className="w-12 h-12 rounded-full border-2 border-purple-200"
                />
                <div className="flex-1">
                  <h3 className="font-bold text-gray-800 group-hover:text-purple-700 transition-colors">
                    {user.fullname}
                  </h3>
                  <p className="text-xs text-gray-500">{user.email}</p>
                </div>
              </div>
            ))
          ) : (
            <div className="p-10 text-center text-gray-500 italic">No users found matching "{search}"</div>
          )}
        </div>
      </div>
    </div>
  );
}

export default AllUsersModal;
