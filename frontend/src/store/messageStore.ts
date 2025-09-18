
import { create } from "zustand";
import api from "../lib/axiosInstance";
import { Socket } from "socket.io-client";
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
  cursor?: number | string | null;
  setMessages: (messages: Message[]) => void;
  addMessage: (message: Message) => void;
  clearMessages: () => void;
  fetchMessages: (conversationId: string ) => Promise<void>;
  sendMessage: (io: Socket, conversationId: string, content: string, messageType: string, senderId: string) => Promise<void>;
}
  const useMessageStore = create<MessageStore>((set,get) => ({
  loading: true,
  messages: [] as Message[],
  cursor: null,
  setMessages: (messages) => set({ messages }),
  addMessage: (message) =>
  set((state) => ({ messages: [...state.messages, message] })),
  clearMessages: () => set({ messages: [] }),
  fetchMessages: async (conversationId ) => {
    try {
      const response = await api.get(`/messages/get-messages/${conversationId}?${get().cursor ? `cursor=${get().cursor}` : ''}`);
      if(!response) {
        throw new Error("Failed to fetch messages");
      }
      console.log("Fetched messages:", response.data);
      await new Promise(resolve => setTimeout(resolve, 500)); 
      const data: Message[] = response.data.messages;
      set({ messages: data, loading: false , cursor: response.data.nextCursor });
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
        statuses: [], 
      };
      set((state) => ({ messages: [...state.messages, message] }));
      await io.emit("NewMessage", message);
    } catch (error) {
      console.error("Error sending message:", error);
    }
  }
}));

export default useMessageStore;
