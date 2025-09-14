import { create } from "zustand";

export interface Message {
  id: string;
  chatId: string;
  senderId: string;
  content: string;
  messageType: string;
}

export interface MessageStore {
  Messages: Message[];
  setMessages: (messages: Message[]) => void;
  addMessage: (message: Message) => void;
  clearMessages: () => void;
  fetchMessages: (conversationId: string) => Promise<void>;
}
  const useMessageStore = create<MessageStore>((set) => ({
  Messages: [] as Message[],
  setMessages: (messages) => set({ Messages: messages }),
  addMessage: (message) =>
    set((state) => ({ Messages: [...state.Messages, message] })),
  clearMessages: () => set({ Messages: [] }),
  fetchMessages: async (conversationId) => {
    try {
      const response = await fetch(
        `/api/u/conversations/${conversationId}/messages`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
        }
      );
      if (!response.ok) {
        throw new Error("Failed to fetch messages");
      }
      const data = await response.json();
      set({ Messages: data });
    } catch (error) {
      console.error("Error fetching messages:", error);
    }
  },
}));

export default useMessageStore;
