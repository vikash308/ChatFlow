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
    <div className="h-[10vh] flex items-center px-4">
      <form onSubmit={handleSubmit} className="w-full">
        <div
          className="
          flex items-center gap-3
          bg-white/70 backdrop-blur-xl
          rounded-2xl px-4 py-3
          shadow-md border border-purple-200
          focus-within:ring-2 focus-within:ring-purple-300
          transition-all duration-300
          "
        >
          {/* Search Icon */}
          <FaSearch className="text-purple-500 text-lg" />

          {/* Input */}
          <input
            type="text"
            placeholder="Search people..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="
            flex-1 bg-transparent outline-none
            text-gray-700 placeholder-gray-400
            "
          />

          {/* Button */}
          <button
            type="submit"
            className="
            px-4 py-1 rounded-xl text-sm font-semibold text-white
            bg-gradient-to-r from-purple-500 to-pink-500
            hover:scale-105 hover:shadow-lg
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
