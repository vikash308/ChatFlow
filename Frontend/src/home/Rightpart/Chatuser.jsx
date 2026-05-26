import React, { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import useConversation from "../../zustand/useConversation.js";
import { useSocketContext } from "../../context/SocketContext.jsx";
import { useCall } from "../../context/CallContext.jsx";
import { IoArrowBack, IoCallOutline, IoVideocamOutline } from "react-icons/io5";
import profile from "../../../public/user.jpg";
import axios from "axios";
import server from "../../api";
import toast from "react-hot-toast";

function Chatuser() {
  const { selectedConversation, setSelectedConversation, setMessage } = useConversation();
  const { onlineUsers } = useSocketContext();
  const { startCall } = useCall();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [confirmConfig, setConfirmConfig] = useState({
    title: "",
    message: "",
    confirmText: "",
    isDanger: false,
    onConfirm: () => {},
  });
  
  const dropdownRef = useRef(null);
  const confirmModalRef = useRef(null);

  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  const handleClearChatClick = () => {
    setIsDropdownOpen(false);
    setConfirmConfig({
      title: "Clear Chat?",
      message: "Are you sure you want to clear all messages in this chat? This action cannot be undone.",
      confirmText: "Clear Chat",
      isDanger: true,
      onConfirm: async () => {
        setShowConfirmModal(false);
        try {
          const token = localStorage.getItem("jwt");
          await axios.delete(`${server}/api/message/clear/${selectedConversation._id}`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
          
          // Clear local messages state in Zustand
          setMessage([]);
          toast.success("Chat cleared successfully");
        } catch (error) {
          console.error("Clear chat error:", error);
          toast.error("Failed to clear chat");
        }
      }
    });
    setShowConfirmModal(true);
  };

  const handleBlockClick = () => {
    setIsDropdownOpen(false);
    const action = selectedConversation.isBlocked ? "unblock" : "block";
    setConfirmConfig({
      title: selectedConversation.isBlocked ? "Unblock User?" : "Block User?",
      message: selectedConversation.isBlocked 
        ? `Are you sure you want to unblock ${selectedConversation.fullname}? You will be able to send messages and make calls again.`
        : `Are you sure you want to block ${selectedConversation.fullname}? Blocked users cannot send you messages or make calls.`,
      confirmText: selectedConversation.isBlocked ? "Unblock" : "Block",
      isDanger: !selectedConversation.isBlocked,
      onConfirm: async () => {
        setShowConfirmModal(false);
        try {
          const token = localStorage.getItem("jwt");
          const url = `${server}/api/user/${action}/${selectedConversation._id}`;
          await axios.post(
            url,
            {},
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );

          // Update Zustand selectedConversation
          setSelectedConversation({
            ...selectedConversation,
            isBlocked: !selectedConversation.isBlocked,
          });

          toast.success(`User ${action}ed successfully`);
        } catch (error) {
          console.error(`${action} error:`, error);
          toast.error(`Failed to ${action} user`);
        }
      }
    });
    setShowConfirmModal(true);
  };

  const getOnlineUsersStatus = (userId) => {
    return onlineUsers.includes(userId) ? "Online" : "Offline";
  };

  if (!selectedConversation) return null;

  const isOnline = onlineUsers.includes(selectedConversation._id);

  return (
    <div
      className="
      flex items-center justify-between px-6 h-20
      bg-transparent w-full
      transition-all duration-300
      "
    >
      <div className="flex items-center gap-4">
        {/* Mobile Back Button */}
        <div 
          className="md:hidden cursor-pointer p-2 hover:bg-white/10 rounded-xl transition-all border border-white/5"
          onClick={() => setSelectedConversation(null)}
        >
          <IoArrowBack className="text-white text-xl" />
        </div>

        {/* User info */}
        <div className="flex items-center gap-4">
          {/* Avatar */}
          <div className="relative">
            <div className="p-0.5 rounded-full premium-gradient">
              <img
                src={profile}
                alt="profile"
                className="
                w-10 h-10 rounded-full object-cover
                border-2 border-[#0b1326]
                "
              />
            </div>
            {isOnline && (
              <span
                className="
                absolute bottom-0 right-0 w-3 h-3
                bg-emerald-500 rounded-full
                border-2 border-[#0b1326]
                animate-pulse
                "
              />
            )}
          </div>

          {/* Name & status */}
          <div className="leading-tight">
            <h1 className="text-base font-bold text-white tracking-tight">
              {selectedConversation.fullname}
            </h1>
            <div className="flex items-center gap-1.5 mt-0.5">
               <span className={`w-1.5 h-1.5 rounded-full ${isOnline ? "bg-emerald-500 animate-pulse" : "bg-white/20"}`}></span>
               <span
                className={`text-[10px] font-bold uppercase tracking-widest ${
                  isOnline ? "text-emerald-400" : "text-white/30"
                }`}
              >
                {getOnlineUsersStatus(selectedConversation._id)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-2 relative" ref={dropdownRef}>
        <button 
          onClick={() => {
            if (selectedConversation.isBlocked) {
              toast.error("Unblock this user to make calls");
              return;
            }
            if (selectedConversation.isBlockedByThem) {
              toast.error("Cannot make calls to this user");
              return;
            }
            startCall(selectedConversation, "audio");
          }}
          disabled={selectedConversation.isBlocked || selectedConversation.isBlockedByThem}
          className="w-10 h-10 flex items-center justify-center rounded-xl hover:bg-white/5 border border-white/0 hover:border-white/5 text-white/75 hover:text-white transition-all duration-300 disabled:opacity-30 disabled:cursor-not-allowed"
          title="Audio Call"
        >
          <IoCallOutline className="text-lg" />
        </button>
        <button 
          onClick={() => {
            if (selectedConversation.isBlocked) {
              toast.error("Unblock this user to make calls");
              return;
            }
            if (selectedConversation.isBlockedByThem) {
              toast.error("Cannot make calls to this user");
              return;
            }
            startCall(selectedConversation, "video");
          }}
          disabled={selectedConversation.isBlocked || selectedConversation.isBlockedByThem}
          className="w-10 h-10 flex items-center justify-center rounded-xl hover:bg-white/5 border border-white/0 hover:border-white/5 text-white/75 hover:text-white transition-all duration-300 disabled:opacity-30 disabled:cursor-not-allowed"
          title="Video Call"
        >
          <IoVideocamOutline className="text-lg" />
        </button>
        
        {/* Three dots menu */}
        <div 
          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          className="w-10 h-10 flex items-center justify-center rounded-xl hover:bg-white/5 transition-colors cursor-pointer border border-white/0 hover:border-white/5"
        >
          <div className="w-1.5 h-1.5 rounded-full bg-white/40"></div>
          <div className="w-1.5 h-1.5 rounded-full bg-white/40 mx-0.5"></div>
          <div className="w-1.5 h-1.5 rounded-full bg-white/40"></div>
        </div>

        {/* Dropdown Menu */}
        {isDropdownOpen && (
          <div className="absolute right-0 top-12 w-48 rounded-2xl bg-[#0e172a]/95 border border-white/5 shadow-2xl p-1.5 z-50 backdrop-blur-xl animate-in fade-in duration-200">
            <button
              onClick={handleClearChatClick}
              className="w-full text-left px-4 py-2.5 rounded-xl hover:bg-white/5 text-sm text-white/80 hover:text-white transition-colors"
            >
              🧹 Clear Chat
            </button>
            <button
              onClick={handleBlockClick}
              className={`w-full text-left px-4 py-2.5 rounded-xl hover:bg-white/5 text-sm font-semibold transition-colors ${
                selectedConversation.isBlocked ? "text-emerald-400 hover:text-emerald-300" : "text-rose-400 hover:text-rose-300"
              }`}
            >
              {selectedConversation.isBlocked ? "🔓 Unblock User" : "🚫 Block User"}
            </button>
          </div>
        )}
      </div>

      {/* Custom Confirmation Modal using React Portal */}
      {showConfirmModal && createPortal(
        <div className="fixed inset-0 bg-[#060814]/80 backdrop-blur-sm flex items-center justify-center z-[100] animate-in fade-in duration-200">
          <div 
            ref={confirmModalRef}
            className="w-[360px] p-6 rounded-3xl bg-[#0e172a]/95 border border-white/5 shadow-2xl flex flex-col items-center text-center animate-in scale-in-95 duration-200"
          >
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-2xl mb-4 ${
              confirmConfig.isDanger 
                ? "bg-rose-500/10 border border-rose-500/20 text-rose-400" 
                : "bg-indigo-500/10 border border-indigo-500/20 text-indigo-400"
            }`}>
              {confirmConfig.isDanger ? "⚠️" : "❓"}
            </div>
            <h3 className="text-base font-bold text-white mb-2">{confirmConfig.title}</h3>
            <p className="text-xs text-white/50 leading-relaxed mb-6">
              {confirmConfig.message}
            </p>
            <div className="flex w-full gap-3">
              <button
                onClick={() => setShowConfirmModal(false)}
                className="flex-1 py-2.5 rounded-xl border border-white/5 hover:bg-white/5 text-xs font-semibold text-white/70 hover:text-white transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={confirmConfig.onConfirm}
                className={`flex-1 py-2.5 rounded-xl active:scale-95 text-xs font-semibold text-white shadow-md transition-all cursor-pointer ${
                  confirmConfig.isDanger 
                    ? "bg-rose-500 hover:bg-rose-600 shadow-rose-500/10" 
                    : "bg-indigo-500 hover:bg-indigo-600 shadow-indigo-500/10"
                }`}
              >
                {confirmConfig.confirmText}
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}

export default Chatuser;
