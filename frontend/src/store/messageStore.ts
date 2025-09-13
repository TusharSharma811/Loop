import { create } from "zustand";

const useMessageStore = create((set) => ({
    Messages : [],
    setMessages: (messages) => set({ Messages: messages }),
    addMessage: (message) => set((state) => ({ Messages: [...state.Messages, message] })),
    clearMessages: () => set({ Messages: [] }),
    fetchMessages: async (conversationId) => {
      try {
        const response = await fetch(`/api/u/conversations/${conversationId}/messages`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
        });
        if (!response.ok) {
          throw new Error('Failed to fetch messages');
        }
        const data = await response.json();
        set({ Messages: data });
      } catch (error) {
        console.error('Error fetching messages:', error);
      }
    },
}));

export default useMessageStore;
