import React, { useEffect, useRef } from "react";
import Message from "./Message";
import useGetMessage from "../../context/useGetMessage.js";
import Loading from "../../components/Loading.jsx";
import useGetSocketMessage from "../../context/useGetSocketMessage.js";
import useTypingIndicator from "../../context/useTypingIndicator.js";
import useConversation from "../../zustand/useConversation.js";


function Messages() {
  const { loading, messages } = useGetMessage();
  useGetSocketMessage(); 
  useTypingIndicator();
  const { typingUser } = useConversation();


  const lastMsgRef = useRef();

  useEffect(() => {
    setTimeout(() => {
      if (lastMsgRef.current) {
        lastMsgRef.current.scrollIntoView({
          behavior: "smooth",
        });
      }
    }, 100);
  }, [messages]);

  return (
    <div
      className="
      flex-1 overflow-y-auto px-3 py-2
      bg-gradient-to-br from-pink-100 via-yellow-100 to-green-100
      "
      style={{ minHeight: "calc(92vh - 8vh)" }}
    >
      {loading ? (
        <Loading />
      ) : messages.length > 0 ? (
        messages.map((message) => (
          <div key={message._id} ref={lastMsgRef}>
            <Message message={message} />
          </div>
        ))
      ) : (
        <div className="flex items-center justify-center h-full">
          <div className="bg-white/70 backdrop-blur-xl px-6 py-4 rounded-2xl shadow-md">
            <p className="text-gray-600 text-sm text-center">
              👋 Say hi to start the conversation
            </p>
          </div>
        </div>
      )}
      {typingUser && (
        <div className="px-4 py-2">
          <div className="inline-block bg-white/70 backdrop-blur-xl px-4 py-2 rounded-2xl shadow text-sm text-gray-600">
            Typing...
          </div>
        </div>
      )}
    </div>
  );
}

export default Messages;
