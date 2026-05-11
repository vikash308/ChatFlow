import React, { useMemo, useState } from "react";
import useDeleteMessage from "../../context/useDeleteMessage.js";
import { IoCheckmarkDoneSharp } from "react-icons/io5";

function Message({ message }) {
  const authUser = JSON.parse(localStorage.getItem("ChatApp"));
  const myId = authUser?.user?._id;

  const senderId = message.senderId?._id || message.senderId;
  const itsMe = senderId.toString() === myId.toString();

  const { deleteForMe, deleteForEveryone } = useDeleteMessage();

  const [menuOpen, setMenuOpen] = useState(false);

  const createdAt = useMemo(
    () => new Date(message.createdAt),
    [message.createdAt],
  );

  const formattedTime = createdAt.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });

  const isDeletedForEveryone = message.isDeleted;

  return (
    <div className="px-4 py-1.5 animate-in slide-in-from-bottom-1 duration-300">
      <div className={`flex ${itsMe ? "justify-end" : "justify-start"}`}>
        <div className="relative max-w-[75%] md:max-w-[60%]">
          {/* Message bubble */}
          <div
            onContextMenu={(e) => {
              e.preventDefault();
              if (isDeletedForEveryone) return;
              setMenuOpen(true);
            }}
            className={`
              px-5 py-3 shadow-xl
              cursor-pointer select-text transition-all duration-300
              ${
                itsMe
                  ? "chat-bubble-outgoing"
                  : "chat-bubble-incoming text-white/90"
              }
            `}
          >
            {/* Message text */}
            <p
              className={`text-[15px] leading-relaxed font-medium ${
                isDeletedForEveryone ? "italic text-white/40" : ""
              }`}
            >
              {message.message}
            </p>

            {/* Footer with time */}
            <div className={`text-[10px] mt-1.5 flex items-center gap-1.5 font-bold uppercase tracking-widest ${itsMe ? "text-white/60 justify-end" : "text-white/30 justify-start"}`}>
              {formattedTime}
              {itsMe && (
                <IoCheckmarkDoneSharp 
                  className={`text-sm ${message.isRead ? "text-sky-400" : "text-white/30"}`} 
                />
              )}
            </div>
          </div>

          {/* Context Menu */}
          {menuOpen && (
            <>
              {/* overlay click close */}
              <div
                className="fixed inset-0 z-40"
                onClick={() => setMenuOpen(false)}
              />

              <div
                className={`
                  absolute z-50 mt-3 w-56 rounded-[20px] shadow-2xl
                  glass-card overflow-hidden border border-white/10
                  animate-in fade-in zoom-in-95 duration-200
                  ${itsMe ? "right-0" : "left-0"}
                `}
              >
                <div className="px-4 py-2 border-b border-white/5 bg-white/[0.02]">
                   <span className="text-[10px] font-black uppercase text-indigo-400 tracking-[0.2em]">Message Actions</span>
                </div>
                <button
                  onClick={async () => {
                    setMenuOpen(false);
                    await deleteForMe(message._id);
                  }}
                  className="w-full text-left px-5 py-4 text-sm font-semibold text-white/70 hover:text-white hover:bg-white/5 transition-all flex items-center justify-between group"
                >
                  Delete for me
                  <span className="opacity-0 group-hover:opacity-100 transition-opacity">🗑️</span>
                </button>

                {itsMe && (
                  <button
                    onClick={async () => {
                      setMenuOpen(false);
                      await deleteForEveryone(message._id);
                    }}
                    className="w-full text-left px-5 py-4 text-sm font-semibold text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-all border-t border-white/5 flex items-center justify-between group"
                  >
                    Delete for everyone
                    <span className="opacity-0 group-hover:opacity-100 transition-opacity">🔥</span>
                  </button>
                )}

                <button
                  onClick={() => setMenuOpen(false)}
                  className="w-full text-center py-4 text-[10px] font-black uppercase tracking-[0.3em] text-white/20 hover:text-white/40 transition-all bg-black/20"
                >
                  Close Menu
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default Message;
