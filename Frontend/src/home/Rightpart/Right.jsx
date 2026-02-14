import React, { useEffect } from "react";
import Chatuser from "./Chatuser";
import Messages from "./Messages";
import Typesend from "./Typesend";
import useConversation from "../../zustand/useConversation.js";
import { useAuth } from "../../context/AuthProvider.jsx";
import { CiMenuFries } from "react-icons/ci";

function Right() {
  const { selectedConversation, setSelectedConversation } = useConversation();

 useEffect(() => {
   setSelectedConversation(null);
 }, [setSelectedConversation]);


  return (
    <div
      className="w-full h-screen flex flex-col
      bg-gradient-to-br from-pink-100 via-yellow-100 to-green-100
      text-gray-700"
    >
      {!selectedConversation ? (
        <NoChatSelected />
      ) : (
        <>
          {/* Header */}
          <Chatuser />

          {/* Messages (ONLY scroll here) */}
          <div className="flex-1 overflow-hidden">
            <Messages />
          </div>

          {/* Message input */}
          <div className="shrink-0">
            <Typesend />
          </div>
        </>
      )}
    </div>
  );
}

export default Right;

/* ---------------- Empty State ---------------- */

const NoChatSelected = () => {
  const [authUser] = useAuth();

  return (
    <div
      className="relative w-full h-full
      bg-gradient-to-br from-pink-100 via-yellow-100 to-green-100"
    >
      {/* Mobile menu */}
      <label
        htmlFor="my-drawer-2"
        className="lg:hidden absolute top-4 left-4 cursor-pointer"
      >
        <CiMenuFries className="text-purple-500 text-2xl" />
      </label>

      {/* Center content */}
      <div className="flex h-full items-center justify-center px-4">
        <div
          className="bg-white/70 backdrop-blur-xl
          rounded-3xl px-8 py-6 shadow-lg text-center space-y-2"
        >
          <h1 className="text-xl text-gray-800">
            Welcome{" "}
            <span className="font-semibold text-purple-600">
              {authUser?.user?.fullname || "User"}
            </span>
          </h1>

          <p className="text-gray-600 text-sm">
            No chat selected. Select a user from the left to start a
            conversation.
          </p>
        </div>
      </div>
    </div>
  );
};
