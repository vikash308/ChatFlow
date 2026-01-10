import React, { useState } from "react";
import useConversation from "../zustand/useConversation.js";
import axios from "axios";
import server from "../api.js";
const useSendMessage = () => {
  const [loading, setLoading] = useState(false);
  const { messages, setMessage, selectedConversation } = useConversation();
  const token = localStorage.getItem("jwt");
  const sendMessages = async (message) => {
    setLoading(true);
    try {
      const res = await axios.post(
        `${server}/api/message/send/${selectedConversation._id}`,
         {message} , {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
      );
      setMessage([...messages, res.data]);
      setLoading(false);
    } catch (error) {
      console.log("Error in send messages", error);
      setLoading(false);
    }
  };
  return { loading, sendMessages };
};

export default useSendMessage;
