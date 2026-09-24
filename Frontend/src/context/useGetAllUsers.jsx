import React, { useEffect, useState } from "react";
import Cookies from "js-cookie";
import axios from "axios";
import server from "../api";
import useConversation from "../zustand/useConversation";

function useGetAllUsers() {
  const { allUsers, setAllUsers, setUnreadCounts, setLastMessageTimes } = useConversation();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const getUsers = async () => {
      if (allUsers && allUsers.length > 0) return;

      setLoading(true);
      try {
        const token = localStorage.getItem("jwt");
        const response = await axios.get(server + "/api/user/allusers", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        
        const counts = {};
        const times = {};
        response.data.forEach(user => {
          counts[user._id] = user.unreadCount || 0;
          times[user._id] = user.lastMessageTime || 0;
        });
        setUnreadCounts(counts);
        setLastMessageTimes(times);
        
        setAllUsers(response.data);
        setLoading(false);
      } catch (error) {
        console.log("Error in useGetAllUsers: " + error);
        if (error.response && error.response.status === 401) {
          localStorage.removeItem("ChatApp");
          localStorage.removeItem("jwt");
          localStorage.removeItem("email");
          Cookies.remove("jwt");
          window.location.reload();
        }
        setLoading(false);
      }
    };
    getUsers();
  }, [allUsers, setAllUsers, setUnreadCounts, setLastMessageTimes]);

  return [allUsers, loading];
}

export default useGetAllUsers;
