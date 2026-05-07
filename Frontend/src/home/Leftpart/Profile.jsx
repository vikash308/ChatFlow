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
    <div className="px-4 py-3 border-t border-purple-200 bg-white/50 backdrop-blur-sm">
      <div 
        className="flex items-center justify-between cursor-pointer group"
        onClick={() => setShowDetails(!showDetails)}
      >
        <div className="flex items-center gap-3">
          <div className="relative">
            <FaUserCircle className="text-4xl text-purple-500" />
            <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></span>
          </div>
          <div className="leading-tight">
            <h2 className="text-sm font-bold text-gray-800 group-hover:text-purple-600 transition-colors">
              {authUser.user?.fullname || "My Profile"}
            </h2>
            <p className="text-xs text-gray-500">Active Now</p>
          </div>
        </div>
        
        <button
          onClick={(e) => {
            e.stopPropagation();
            handleLogout();
          }}
          disabled={loading}
          title="Logout"
          className="p-2 rounded-full hover:bg-red-50 text-red-400 hover:text-red-600 transition-all duration-300"
        >
          <BiLogOutCircle className={`text-2xl ${loading ? "animate-spin" : ""}`} />
        </button>
      </div>

      {showDetails && (
        <div className="mt-3 p-3 bg-white/80 rounded-xl shadow-inner animate-in fade-in slide-in-from-bottom-2 duration-300">
          <div className="space-y-2">
            <div>
              <label className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Full Name</label>
              <p className="text-sm text-gray-700 font-medium">{authUser.user?.fullname}</p>
            </div>
            <div>
              <label className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Email Address</label>
              <p className="text-sm text-gray-700 font-medium break-all">{authUser.user?.email}</p>
            </div>
            <div className="pt-1">
               <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
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
