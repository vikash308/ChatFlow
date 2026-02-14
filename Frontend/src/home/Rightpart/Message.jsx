import React, { useMemo, useState } from "react";
import useDeleteMessage from "../../context/useDeleteMessage.js";

function Message({ message }) {
  const authUser = JSON.parse(localStorage.getItem("ChatApp"));
  const myId = authUser?.user?._id;

  const itsMe = message.senderId === myId;

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

  const handleDeleteForMe = async () => {
    setMenuOpen(false);
    await deleteForMe(message._id);
  };

  const handleDeleteForEveryone = async () => {
    setMenuOpen(false);
    await deleteForEveryone(message._id);
  };

  return (
    <div className="px-4 py-1">
      <div className={`flex ${itsMe ? "justify-end" : "justify-start"}`}>
        <div className="relative max-w-[70%]">
          {/* Message bubble */}
          <div
            onContextMenu={(e) => {
              e.preventDefault();
              if (isDeletedForEveryone) return;
              setMenuOpen(true);
            }}
            className={`
              px-4 py-2 rounded-2xl shadow-md backdrop-blur-lg
              cursor-pointer select-text
              ${
                itsMe
                  ? "bg-gradient-to-tl from-pink-300 via-yellow-200 to-green-300 text-gray-800 rounded-br-none"
                  : "bg-white/70 text-gray-700 rounded-bl-none"
              }
            `}
          >
            {/* Message text */}
            <p
              className={`text-sm leading-relaxed ${
                isDeletedForEveryone ? "italic text-gray-500" : ""
              }`}
            >
              {message.message}
            </p>

            {/* Time */}
            <div className="text-[11px] mt-1 text-right text-gray-600">
              {formattedTime}
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
                  absolute z-50 mt-2 w-48 rounded-xl shadow-lg
                  bg-white border border-gray-200 overflow-hidden
                  ${itsMe ? "right-0" : "left-0"}
                `}
              >
                <button
                  onClick={handleDeleteForMe}
                  className="w-full text-left px-4 py-3 text-sm hover:bg-gray-100"
                >
                  Delete for me
                </button>

                {itsMe && (
                  <button
                    onClick={handleDeleteForEveryone}
                    className="w-full text-left px-4 py-3 text-sm hover:bg-gray-100 text-red-500"
                  >
                    Delete for everyone
                  </button>
                )}

                <button
                  onClick={() => setMenuOpen(false)}
                  className="w-full text-left px-4 py-3 text-sm hover:bg-gray-100"
                >
                  Cancel
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
