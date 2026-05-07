import { create } from "zustand";

const useConversation = create((set) => ({
  selectedConversation: null,
  setSelectedConversation: (selectedConversation) =>
    set({ selectedConversation }),
  messages: [],
  setMessage: (updater) =>
    set((state) => ({
      messages: typeof updater === "function" ? updater(state.messages) : updater,
    })),

  typingUser: false,
  setTypingUser: (value) => set({ typingUser: value }),

  unreadCounts: {},
  setUnreadCounts: (counts) => set({ unreadCounts: counts }),
  incrementUnreadCount: (userId) => set((state) => ({
    unreadCounts: {
      ...state.unreadCounts,
      [userId]: (state.unreadCounts[userId] || 0) + 1
    }
  })),
  resetUnreadCount: (userId) => set((state) => ({
    unreadCounts: {
      ...state.unreadCounts,
      [userId]: 0
    }
  })),

  lastMessageTimes: {},
  setLastMessageTimes: (times) => set({ lastMessageTimes: times }),
  updateLastMessageTime: (userId) => set((state) => ({
    lastMessageTimes: {
      ...state.lastMessageTimes,
      [userId]: Date.now()
    }
  })),

}));
export default useConversation;
