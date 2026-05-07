import React from "react";
import User from "./User";
import useGetAllUsers from "../../context/useGetAllUsers";
import useConversation from "../../zustand/useConversation";
import { FaUserPlus } from "react-icons/fa";

function Users() {
  const [allUsers, loading] = useGetAllUsers();
  const { lastMessageTimes } = useConversation();

  // Filter users to only show those with active conversations (recent chats)
  const recentChatUsers = allUsers.filter(user => (lastMessageTimes[user._id] || 0) > 0);

  // Sort these active users
  const sortedUsers = [...recentChatUsers].sort((a, b) => {
    const timeA = lastMessageTimes[a._id] || 0;
    const timeB = lastMessageTimes[b._id] || 0;
    
    if (timeB !== timeA) {
      return timeB - timeA;
    }
    return a.fullname.localeCompare(b.fullname);
  });

  return (
    <div className="flex flex-col h-full ">


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

        {!loading && sortedUsers.length === 0 && (
          <div className="flex flex-col items-center justify-center py-10 px-4 text-center">
            <div className="bg-purple-100 p-4 rounded-full mb-3">
              <FaUserPlus className="text-purple-500 text-2xl" />
            </div>
            <p className="text-gray-500 text-sm font-medium">No recent chats yet</p>
            <p className="text-gray-400 text-xs mt-1">Click the + icon to start a new conversation!</p>
          </div>
        )}

        {!loading &&
          sortedUsers.map((user, index) => <User key={index} user={user} />)}
      </div>
    </div>
  );
}

export default Users;
