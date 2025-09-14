
import { create } from "zustand";

export interface Message {
  id?: string;
  chatId: string;
  senderId: string;
  content: string;
  timestamp: Date;
  messageType: string;
  statuses: string[];
}

export interface MessageStore {
  messages: Message[];
  setMessages: (messages: Message[]) => void;
  addMessage: (message: Message) => void;
  clearMessages: () => void;
  fetchMessages: (conversationId: string) => Promise<void>;
  sendMessage: (io: any, conversationId: string, content: string, messageType: string, senderId: string) => Promise<void>;
}
  const useMessageStore = create<MessageStore>((set) => ({
  messages: [] as Message[],
  setMessages: (messages) => set({ messages }),
  addMessage: (message) =>
    set((state) => ({ messages: [...state.messages, message] })),
  clearMessages: () => set({ messages: [] }),
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
      set({ messages: data });
    } catch (error) {
      console.error("Error fetching messages:", error);
    }
  },
  sendMessage: async (io , conversationId, content, messageType , senderId) => {
    try {
      const message = {
        chatId: conversationId,
        senderId: senderId,
        content,
        messageType,
        timestamp: new Date(),
      };
      // Emit the message to the server via WebSocket
      // await io.emit("sendMessage", message);
      // Optimistically add the message to the store
      // set((state) => ({ messages: [...state.messages, message] }));
      set((state) => ({ messages: [...state.messages, message] }));
      await io.emit("NewMessage", message);
    } catch (error) {
      console.error("Error sending message:", error);
    }
  }
}));

export default useMessageStore;
