import React, { useEffect, useRef } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthProvider";
import axios from "axios";
import server from "../api";

import Left from "./Leftpart/Left";
import Right from "./Rightpart/Right";
import useGetSocketMessage from "../context/useGetSocketMessage";
import useConversation from "../zustand/useConversation";

function Main() {
  const [authUser, setAuthUser] = useAuth();
  const { selectedConversation } = useConversation();
  const navigate = useNavigate();
  const checkedRef = useRef(false);
  const email = localStorage.getItem("email")

  // Listen to sockets globally for unread counts and notifications
  useGetSocketMessage();

  if (!authUser) {
    return <Navigate to="/login" />;
  }

  if(!email){
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

  return (
    <div className="flex h-screen w-full overflow-hidden bg-slate-900">
      {/* Left Sidebar - Hidden on mobile if a chat is open */}
      <div
        className={`
          ${selectedConversation ? "hidden md:flex" : "flex"}
          w-full md:w-[350px] lg:w-[400px] h-full
        `}
      >
        <Left />
      </div>

      {/* Right Chat Area - Hidden on mobile if no chat is open */}
      <div
        className={`
          ${!selectedConversation ? "hidden md:flex" : "flex"}
          flex-1 h-full
        `}
      >
        <Right />
      </div>
    </div>
  );
}

export default Main;
