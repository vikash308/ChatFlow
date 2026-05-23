import React, { useEffect, useRef } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthProvider";
import axios from "axios";
import server from "../api";

import Left from "./Leftpart/Left";
import Right from "./Rightpart/Right";
import useGetSocketMessage from "../context/useGetSocketMessage";
import useConversation from "../zustand/useConversation";
import { registerFcmToken } from "../firebase";
import CallInterface from "../components/CallInterface";

function Main() {
  const [authUser, setAuthUser] = useAuth();
  const { selectedConversation } = useConversation();
  const navigate = useNavigate();
  const checkedRef = useRef(false);
  const email = localStorage.getItem("email") || authUser?.user?.email;

  // Listen to sockets globally for unread counts and notifications
  useGetSocketMessage();

  if (!authUser) {
    return <Navigate to="/login" />;
  }

  if (!email) {
    localStorage.removeItem("ChatApp");
    localStorage.removeItem("jwt");
    localStorage.removeItem("email");
    return <Navigate to="/login" />;
  }

  useEffect(() => {
    if (checkedRef.current) return;
    checkedRef.current = true;

    const checkEmailVerification = async () => {
      try {
        const res = await axios.post(`${server}/api/user/isVerified`, {
          email,
        });

        if (!res.data.isVerified) {
          navigate("/verify-otp", { replace: true });
        } else {
          // update only if needed
          if (!authUser.isVerified) {
            setAuthUser((prev) => ({
              ...prev,
              isVerified: true,
            }));
          }
        }
      } catch (err) {
        navigate("/login", { replace: true });
      }
    };

    checkEmailVerification();
  }, [authUser, navigate, setAuthUser]);

  useEffect(() => {
    registerFcmToken();
  }, []);

  return (
    <div className="flex h-[100dvh] w-full overflow-hidden bg-[#060e20] relative items-stretch">
      {/* Dynamic Background Glows */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-500/10 blur-[120px] rounded-full"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-500/10 blur-[120px] rounded-full"></div>

      {/* Left Sidebar */}
      <div
        className={`
          ${selectedConversation ? "hidden md:flex" : "flex"}
          w-full md:w-[350px] lg:w-[400px] h-full z-10
          glass-pane flex-col border-r border-white/5
        `}
      >
        <Left />
      </div>

      {/* Right Chat Area */}
      <div
        className={`
          ${!selectedConversation ? "hidden md:flex" : "flex"}
          flex-1 h-full z-10 overflow-hidden
        `}
      >
        <Right />
      </div>

      {/* Global Call Interface */}
      <CallInterface />
    </div>
  );
}

export default Main;
