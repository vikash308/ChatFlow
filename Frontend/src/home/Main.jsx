import React, { useEffect, useRef } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthProvider";
import axios from "axios";
import server from "../api";

import Left from "./Leftpart/Left";
import Right from "./Rightpart/Right";

function Main() {
  const [authUser, setAuthUser] = useAuth();
  const navigate = useNavigate();
  const checkedRef = useRef(false);
  const email = localStorage.getItem("email")

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
    <div className="drawer md:drawer-open bg-slate-900">
      <input id="my-drawer-2" type="checkbox" className="drawer-toggle" />

      <div className="drawer-content flex flex-col">
        <Right />
      </div>

      <div className="drawer-side">
        <label htmlFor="my-drawer-2" className="drawer-overlay"></label>
        <div className="w-80 min-h-full bg-black border-r border-slate-800">
          <Left />
        </div>
      </div>
    </div>
  );
}

export default Main;
