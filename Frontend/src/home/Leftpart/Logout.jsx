import React, { useState } from "react";
import { BiLogOutCircle } from "react-icons/bi";
import axios from "axios";
import Cookies from "js-cookie";
import toast from "react-hot-toast";
import server from "../../api";

function Logout() {
  const [loading, setLoading] = useState(false);

  const handleLogout = async () => {
    setLoading(true);
    try {
      await axios.post(server + "/api/user/logout");
      localStorage.removeItem("ChatApp");
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

  return (
    <>
      <hr className="border-purple-200" />

      <div className="h-[10vh] flex items-center justify-center px-3">
        <button
          onClick={handleLogout}
          disabled={loading}
          className="
          group flex items-center gap-3 px-4 py-2 rounded-full
          bg-gradient-to-r from-pink-200 via-yellow-200 to-green-200
          hover:from-pink-300 hover:via-yellow-300 hover:to-green-300
          transition-all duration-300
          shadow-md hover:shadow-lg
          "
        >
          <BiLogOutCircle
            className={`text-3xl text-pink-500
            transition-all duration-300
            ${loading ? "animate-spin" : ""}`}
          />

          <span className="text-sm font-semibold text-gray-700">
            {loading ? "Logging out..." : "Logout"}
          </span>
        </button>
      </div>
    </>
  );
}

export default Logout;
