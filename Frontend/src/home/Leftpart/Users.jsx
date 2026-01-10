import React from "react";
import User from "./User";
import useGetAllUsers from "../../context/useGetAllUsers";

function Users() {
  const [allUsers, loading] = useGetAllUsers();

  return (
    <div className="flex flex-col h-full ">
      {/* Header */}
      <div
        className="
        px-4 py-3 sticky top-0 z-10
        bg-white/70 backdrop-blur-xl
        border-b border-purple-200
        "
      >
        <h1 className="text-lg font-semibold text-gray-800 tracking-wide">
          💬 Conversations
        </h1>
      </div>

      {/* Users list */}
      <div
        className="
        flex-1 overflow-y-auto py-2
        scrollbar-thin scrollbar-thumb-purple-300 scrollbar-track-transparent
        "
        style={{ maxHeight: "calc(84vh - 10vh)" }}
      >
        {loading && (
          <p className="text-center text-gray-500 py-4">Loading users...</p>
        )}

        {!loading && allUsers.length === 0 && (
          <p className="text-center text-gray-500 py-4">No users found</p>
        )}

        {!loading &&
          allUsers.map((user, index) => <User key={index} user={user} />)}
      </div>
    </div>
  );
}

export default Users;
