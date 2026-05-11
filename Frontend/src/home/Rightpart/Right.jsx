import React, { useEffect } from "react";
import Chatuser from "./Chatuser";
import Messages from "./Messages";
import Typesend from "./Typesend";
import useConversation from "../../zustand/useConversation.js";
import { useAuth } from "../../context/AuthProvider.jsx";

function Right() {
  const { selectedConversation, setSelectedConversation } = useConversation();

  useEffect(() => {
    setSelectedConversation(null);
  }, [setSelectedConversation]);

  return (
    <div
      className="w-full h-full grid grid-rows-[80px_1fr_auto] text-white overflow-hidden relative bg-[#0b1326]/20"
    >
      {!selectedConversation ? (
        <div className="row-span-3">
          <NoChatSelected />
        </div>
      ) : (
        <>
          {/* Header Row */}
          <div className="z-50 bg-[#0b1326]/95 backdrop-blur-md border-b border-white/10 shadow-lg">
            <Chatuser />
          </div>

          {/* Messages Row */}
          <div className="relative overflow-hidden z-10">
            <Messages />
          </div>

          {/* Input Row */}
          <div className="z-50 bg-[#0b1326]/95 backdrop-blur-md border-t border-white/10 shadow-[0_-10px_30px_rgba(0,0,0,0.3)]">
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
      className="relative w-full h-full flex items-center justify-center px-4"
    >
      <div
        className="glass-card
        rounded-[2.5rem] px-12 py-10 text-center space-y-6 max-w-md
        animate-in zoom-in-95 duration-700
        relative overflow-hidden group
        "
      >
        <div className="absolute top-0 left-0 w-full h-1 premium-gradient opacity-50"></div>
        
        <div className="w-24 h-24 premium-gradient rounded-3xl mx-auto flex items-center justify-center shadow-2xl shadow-indigo-500/30 group-hover:rotate-12 transition-transform duration-500">
           <span className="text-4xl text-white font-black italic">CF</span>
        </div>

        <div className="space-y-2">
          <h1 className="text-2xl font-bold text-white tracking-tight">
            Welcome,{" "}
            <span className="premium-text-gradient">
              {authUser?.user?.fullname || "User"}
            </span>
          </h1>

          <p className="text-white/50 text-sm leading-relaxed font-medium">
            Your conversations are waiting. Select a friend from the left to dive back in or start something new.
          </p>
        </div>

        <div className="pt-4">
          <span className="inline-flex items-center px-4 py-1.5 rounded-full text-[10px] font-black bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 uppercase tracking-[0.2em]">
            End-to-End Encrypted
          </span>
        </div>
      </div>
    </div>
  );
};
