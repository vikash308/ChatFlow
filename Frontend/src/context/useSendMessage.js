import { useState } from "react";
import useConversation from "../zustand/useConversation.js";
import axios from "axios";
import server from "../api.js";
import toast from "react-hot-toast";

const useSendMessage = () => {
  const [loading, setLoading] = useState(false);
  const { messages, setMessage, selectedConversation, updateLastMessageTime } = useConversation();
  const token = localStorage.getItem("jwt");

  const sendMessages = async (message) => {
    if (!selectedConversation?._id) return;
    
    setLoading(true);
    try {
      const res = await axios.post(
        `${server}/api/message/send/${selectedConversation._id}`,
        { message },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      
      // Update local state immediately with the response data
      const newMessage = res.data;
      setMessage([...messages, newMessage]);
      
      // Update last message timestamp for the sidebar
      updateLastMessageTime(selectedConversation._id);
      
      setLoading(false);
    } catch (error) {
      console.error("Error in send messages:", error);
      toast.error(error.response?.data?.error || "Failed to send message");
      setLoading(false);
    }
  };

  return { loading, sendMessages };
};

export default useSendMessage;
