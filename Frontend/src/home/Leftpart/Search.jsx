import React, { useState } from "react";
import { FaSearch } from "react-icons/fa";
import useGetAllUsers from "../../context/useGetAllUsers";
import useConversation from "../../zustand/useConversation";
import toast from "react-hot-toast";

function Search() {
  const [search, setSearch] = useState("");
  const [allUsers] = useGetAllUsers();
  const { setSelectedConversation } = useConversation();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!search) return;

    const conversation = allUsers.find((user) =>
      user.fullname?.toLowerCase().includes(search.toLowerCase())
    );

    if (conversation) {
      setSelectedConversation(conversation);
      setSearch("");
    } else {
      toast.error("User not found");
    }
  };

  return (
    <div className="h-[10vh] flex items-center px-6">
      <form onSubmit={handleSubmit} className="w-full">
        <div
          className="
          flex items-center gap-3
          bg-white/5 backdrop-blur-xl
          rounded-2xl px-5 py-3.5
          shadow-lg border border-white/5
          focus-within:ring-2 focus-within:ring-indigo-500/30
          focus-within:border-indigo-500/30
          transition-all duration-300
          "
        >
          {/* Search Icon */}
          <FaSearch className="text-indigo-400/70 text-lg" />

          {/* Input */}
          <input
            type="text"
            placeholder="Search people..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="
            flex-1 bg-transparent outline-none
            text-white placeholder-white/30 text-sm
            "
          />

          {/* Button */}
          <button
            type="submit"
            className="
            px-5 py-1.5 rounded-xl text-xs font-bold text-white
            premium-gradient
            hover:scale-105 hover:shadow-lg hover:shadow-indigo-500/25
            active:scale-95
            transition-all duration-300
            "
          >
            Go
          </button>
        </div>
      </form>
    </div>
  );
}

export default Search;
