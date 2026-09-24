import React, { useEffect, useRef } from "react";
import Message from "./Message";
import useGetMessage from "../../context/useGetMessage.js";
import Loading from "../../components/Loading.jsx";
import useTypingIndicator from "../../context/useTypingIndicator.js";
import useConversation from "../../zustand/useConversation.js";


function Messages() {
  const { loading, isFetchingMore, messages, page, setPage, hasMore } = useGetMessage();
  useTypingIndicator();
  const { typingUser } = useConversation();

  const containerRef = useRef();
  const previousScrollHeightRef = useRef(0);

  const handleScroll = () => {
    if (!containerRef.current) return;
    // If scrolled to top, and not currently fetching, and there are more messages
    if (containerRef.current.scrollTop === 0 && hasMore && !isFetchingMore && !loading) {
      previousScrollHeightRef.current = containerRef.current.scrollHeight;
      setPage((prev) => prev + 1);
    }
  };

  useEffect(() => {
    if (!containerRef.current) return;

    if (page === 1) {
      const scrollToBottom = () => {
        if (containerRef.current) {
          containerRef.current.scrollTop = containerRef.current.scrollHeight;
        }
      };
      
      // Scroll immediately and after a short delay for reliability
      scrollToBottom();
      const timeoutId = setTimeout(scrollToBottom, 100);
      return () => clearTimeout(timeoutId);
    } else {
      // Restore scroll position after older messages are prepended
      const newScrollHeight = containerRef.current.scrollHeight;
      const scrollDiff = newScrollHeight - previousScrollHeightRef.current;
      if (scrollDiff > 0) {
        containerRef.current.scrollTop = scrollDiff;
      }
    }
  }, [messages, loading, typingUser, page]);

  return (
    <div
      ref={containerRef}
      onScroll={handleScroll}
      className="h-full w-full overflow-y-auto px-4 py-6"
    >
      {loading && page === 1 ? (
        <div className="flex items-center justify-center h-full">
           <Loading />
        </div>
      ) : messages.length > 0 ? (
        <>
          {isFetchingMore && (
            <div className="flex justify-center w-full my-2">
              <span className="loading loading-spinner loading-sm text-indigo-400"></span>
            </div>
          )}
          {messages.map((message) => (
            <div key={message._id}>
              <Message message={message} />
            </div>
          ))}
        </>
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
