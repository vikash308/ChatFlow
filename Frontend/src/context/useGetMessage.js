import React, { useEffect, useState } from "react";
import useConversation from "../zustand/useConversation.js";
import axios from "axios";
import server from "../api.js";
const useGetMessage = () => {
  const [loading, setLoading] = useState(false);
  const [isFetchingMore, setIsFetchingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const { messages, setMessage, selectedConversation } = useConversation();
  let token = localStorage.getItem("jwt");

  // Reset pagination when conversation changes
  useEffect(() => {
    setPage(1);
    setHasMore(true);
    setMessage([]);
  }, [selectedConversation, setMessage]);

  useEffect(() => {
    const getMessages = async () => {
      if (!selectedConversation || !selectedConversation._id) return;
      if (!hasMore) return;

      if (page === 1) setLoading(true);
      else setIsFetchingMore(true);

      try {
        const res = await axios.get(
          `${server}/api/message/get/${selectedConversation._id}?page=${page}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (res.data.length < 50) {
          setHasMore(false);
        }

        if (page === 1) {
          setMessage(res.data);
        } else {
          // Prepend older messages when fetching next page
          setMessage((prev) => [...res.data, ...prev]);
        }
      } catch (error) {
        console.log("Error in getting messages", error);
      } finally {
        setLoading(false);
        setIsFetchingMore(false);
      }
    };
    
    getMessages();
  }, [selectedConversation, page]);

  return { loading, isFetchingMore, messages, page, setPage, hasMore };
};

export default useGetMessage;
