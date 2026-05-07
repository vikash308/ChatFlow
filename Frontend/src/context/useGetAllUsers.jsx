import React, { useEffect, useState } from "react";
import Cookies from "js-cookie";
import axios from "axios";
import server from "../api";
import useConversation from "../zustand/useConversation";

function useGetAllUsers() {
  const [allUsers, setAllUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const { setUnreadCounts, setLastMessageTimes } = useConversation();
  useEffect(() => {
    const getUsers = async () => {
      setLoading(true);
      try {
       const token =localStorage.getItem("jwt");
        const response = await axios.get(server+"/api/user/allusers", {
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
      }
    };
    getUsers();
  }, []);
  return [allUsers, loading];
}

export default useGetAllUsers;
