import React, { useState } from "react";
import { useAuth } from "../../context/AuthProvider";
import { BiLogOutCircle } from "react-icons/bi";
import { FaUserCircle } from "react-icons/fa";
import axios from "axios";
import Cookies from "js-cookie";
import toast from "react-hot-toast";
import server from "../../api";

function Profile() {
  const [authUser] = useAuth();
  const [loading, setLoading] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  const handleLogout = async () => {
    setLoading(true);
    try {
      await axios.post(server + "/api/user/logout");
      localStorage.removeItem("ChatApp");
      localStorage.removeItem("email");
      Cookies.remove("jwt");
      setLoading(false);
      toast.success("Logged out successfully");
      window.location.reload();
    } catch (error) {
      console.log("Error in Logout", error);
      toast.error("Error in logging out");
      setLoading(false);
    }
  };

  if (!authUser) return null;

  return (
    <div className="px-6 py-6 border-b border-white/5 bg-white/[0.02] backdrop-blur-md">
      <div 
        className="flex items-center justify-between cursor-pointer group"
        onClick={() => setShowDetails(!showDetails)}
      >
        <div className="flex items-center gap-4">
          <div className="relative">
            <div className="w-12 h-12 rounded-full premium-gradient flex items-center justify-center text-white shadow-lg shadow-indigo-500/20">
              <FaUserCircle className="text-3xl" />
            </div>
            <span className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-emerald-500 border-2 border-[#0b1326] rounded-full animate-pulse"></span>
          </div>
          <div className="leading-tight">
            <h2 className="text-sm font-bold text-white group-hover:text-indigo-300 transition-colors">
              {authUser.user?.fullname || "My Profile"}
            </h2>
            <p className="text-[10px] font-semibold text-emerald-400 uppercase tracking-wider mt-0.5">Online</p>
          </div>
        </div>
        
        <button
          onClick={(e) => {
            e.stopPropagation();
            handleLogout();
          }}
          disabled={loading}
          title="Logout"
          className="p-2.5 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 hover:text-red-300 transition-all duration-300 border border-red-500/10"
        >
          <BiLogOutCircle className={`text-xl ${loading ? "animate-spin" : ""}`} />
        </button>
      </div>

      {showDetails && (
        <div className="mt-4 p-4 glass-card rounded-2xl animate-in fade-in slide-in-from-top-2 duration-300">
          <div className="space-y-3">
            <div>
              <label className="text-[10px] uppercase font-bold text-indigo-400 tracking-[0.15em]">Full Name</label>
              <p className="text-sm text-white font-medium mt-0.5">{authUser.user?.fullname}</p>
            </div>
            <div>
              <label className="text-[10px] uppercase font-bold text-indigo-400 tracking-[0.15em]">Email Address</label>
              <p className="text-sm text-white/70 font-medium break-all mt-0.5">{authUser.user?.email}</p>
            </div>
            <div className="pt-1">
               <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 uppercase tracking-wider">
                Verified Account
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Profile;
