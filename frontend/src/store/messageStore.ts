
import { create } from "zustand";
import api from "../lib/axiosInstance";

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
  loading: boolean;
  messages: Message[];
  setMessages: (messages: Message[]) => void;
  addMessage: (message: Message) => void;
  clearMessages: () => void;
  fetchMessages: (conversationId: string) => Promise<void>;
  sendMessage: (io: any, conversationId: string, content: string, messageType: string, senderId: string) => Promise<void>;
}
  const useMessageStore = create<MessageStore>((set) => ({
    loading: true,
  messages: [] as Message[],
  setMessages: (messages) => set({ messages }),
  addMessage: (message) =>
    set((state) => ({ messages: [...state.messages, message] })),
  clearMessages: () => set({ messages: [] }),
  fetchMessages: async (conversationId) => {
    try {
      const response = await api.get(`/u/get-messages/${conversationId}`);
      if(!response) {
        throw new Error("Failed to fetch messages");
      }
      console.log("Fetched messages:", response.data);
      const data: Message[] = response.data.messages;
      set({ messages: data, loading: false });
    } catch (error) {
      console.error("Error fetching messages:", error);
    }finally {
      set({ loading: false });
    }
  },
  sendMessage: async (io , conversationId, content, messageType , senderId) => {
    try {
      const message: Message = {
        chatId: conversationId,
        senderId: senderId,
        content,
        messageType,
        timestamp: new Date(),
        statuses: [], // or provide appropriate statuses if needed
      };
      set((state) => ({ messages: [...state.messages, message] }));
      await io.emit("NewMessage", message);
    } catch (error) {
      console.error("Error sending message:", error);
    }
  }
}));

export default useMessageStore;
