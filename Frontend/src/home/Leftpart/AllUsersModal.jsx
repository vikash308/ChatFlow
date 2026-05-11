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
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-[#060e20]/80 backdrop-blur-md animate-in fade-in duration-300">
      <div className="glass-card w-full max-w-md rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 border border-white/10">
        {/* Header */}
        <div className="px-8 py-6 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
          <div className="space-y-1">
            <h2 className="text-white font-black text-xl tracking-tight flex items-center gap-2">
              <FaUserPlus className="text-indigo-400" /> Start New Chat
            </h2>
            <p className="text-[10px] font-bold text-white/30 uppercase tracking-[0.2em]">Find your friends</p>
          </div>
          <button onClick={onClose} className="w-10 h-10 flex items-center justify-center rounded-xl bg-white/5 hover:bg-white/10 text-white/50 hover:text-white transition-all border border-white/5">
            <FaTimes size={18} />
          </button>
        </div>

        {/* Search */}
        <div className="p-6">
          <div className="flex items-center gap-4 bg-white/[0.03] rounded-2xl px-6 py-4 border border-white/5 focus-within:border-indigo-500/30 focus-within:bg-white/[0.05] transition-all">
            <FaSearch className="text-white/20" />
            <input
              type="text"
              placeholder="Search by name or email..."
              className="bg-transparent outline-none w-full text-white placeholder-white/20 text-sm font-medium"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              autoFocus
            />
          </div>
        </div>

        {/* User List */}
        <div className="max-h-[50vh] overflow-y-auto px-4 pb-6 space-y-1">
          {loading ? (
            <div className="p-10 text-center text-white/30 font-bold uppercase tracking-widest text-[10px]">Loading users...</div>
          ) : filteredUsers.length > 0 ? (
            filteredUsers.map((user) => (
              <div
                key={user._id}
                onClick={() => handleSelect(user)}
                className="flex items-center gap-4 p-4 rounded-2xl hover:bg-white/[0.05] cursor-pointer transition-all group border border-transparent hover:border-white/5"
              >
                <div className="p-0.5 rounded-full bg-white/10 group-hover:premium-gradient transition-all">
                  <img
                    src={profile}
                    alt={user.fullname}
                    className="w-11 h-11 rounded-full border-2 border-[#0b1326]"
                  />
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-white group-hover:text-indigo-300 transition-colors">
                    {user.fullname}
                  </h3>
                  <p className="text-xs text-white/30 font-medium">{user.email}</p>
                </div>
                <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                   <div className="w-8 h-8 flex items-center justify-center rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                      <FaUserPlus size={14} />
                   </div>
                </div>
              </div>
            ))
          ) : (
            <div className="p-10 text-center text-white/20 italic text-sm">No users found matching "{search}"</div>
          )}
        </div>
      </div>
    </div>
  );
}

export default AllUsersModal;
