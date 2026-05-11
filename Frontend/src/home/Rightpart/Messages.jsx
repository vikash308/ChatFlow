import React, { useEffect, useRef } from "react";
import Message from "./Message";
import useGetMessage from "../../context/useGetMessage.js";
import Loading from "../../components/Loading.jsx";
import useTypingIndicator from "../../context/useTypingIndicator.js";
import useConversation from "../../zustand/useConversation.js";


function Messages() {
  const { loading, messages } = useGetMessage();
  useTypingIndicator();
  const { typingUser } = useConversation();


  const containerRef = useRef();

  useEffect(() => {
    const scrollToBottom = () => {
      if (containerRef.current) {
        containerRef.current.scrollTop = containerRef.current.scrollHeight;
      }
    };
    
    // Scroll immediately and after a short delay for reliability
    scrollToBottom();
    const timeoutId = setTimeout(scrollToBottom, 100);
    
    return () => clearTimeout(timeoutId);
  }, [messages, loading, typingUser]);

  return (
    <div
      ref={containerRef}
      className="h-full w-full overflow-y-auto px-4 py-6 scroll-smooth"
    >
      {loading ? (
        <div className="flex items-center justify-center h-full">
           <Loading />
        </div>
      ) : messages.length > 0 ? (
        messages.map((message) => (
          <div key={message._id}>
            <Message message={message} />
          </div>
        ))
      ) : (
        <div className="flex items-center justify-center h-full">
          <div className="glass-card px-8 py-6 rounded-3xl text-center space-y-3">
            <div className="text-4xl">✨</div>
            <p className="text-white/60 text-sm font-medium">
              Start a new chapter.<br/>Say hi to begin.
            </p>
          </div>
        </div>
      )}
      {typingUser && (
        <div className="px-4 py-2 mt-2 animate-in slide-in-from-bottom-2 duration-300">
          <div className="inline-flex items-center gap-2 glass-card px-4 py-2 rounded-2xl shadow-lg border border-white/5">
            <div className="flex gap-1">
              <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
              <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
              <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce"></span>
            </div>
            <span className="text-[10px] font-bold text-indigo-300 uppercase tracking-widest">Typing</span>
          </div>
        </div>
      )}
    </div>
  );
}

export default Messages;
