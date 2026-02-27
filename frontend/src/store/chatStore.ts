import { create } from "zustand";
import api from "../lib/axiosInstance";
import type { User } from "./userStore";
import type { Message } from "./messageStore";

export interface Chat {
  id: string;
  name: string;
  lastMessage?: Message;
  updatedAt: string;
  participants: User[];
  isGroup: boolean;
  groupName?: string;
  avatarUrl?: string;
}

type ChatStore = {
  chats: Chat[];
  onlineUsers: string[];
  loading: boolean;
  error: string | null;
  setChats: (chats: Chat[]) => void;
  addOnlineUser: (userId: string) => void;
  removeOnlineUser: (userId: string) => void;
  addChat: (chat: Chat) => void;
  clearChats: () => void;
  fetchChats: () => Promise<void>;
  createChat: (participantIds: string[], isGroup: boolean, groupName?: string) => Promise<void>;
  deleteChat: (chatId: string) => Promise<void>;
  updateLastMessage: (chatId: string, message: Message) => void;
};

const useChatStore = create<ChatStore>((set) => ({
  chats: [],
  onlineUsers: [],
  loading: true,
  error: null,

  setChats: (chats) => set({ chats }),

  addOnlineUser: (userId) =>
    set((state) => ({
      onlineUsers: state.onlineUsers.includes(userId)
        ? state.onlineUsers
        : [...state.onlineUsers, userId],
    })),

  removeOnlineUser: (userId) =>
    set((state) => ({
      onlineUsers: state.onlineUsers.filter((id) => id !== userId),
    })),

  addChat: (chat) => set((state) => ({ chats: [...state.chats, chat] })),
  clearChats: () => set({ chats: [] }),

  updateLastMessage: (chatId, message) =>
    set((state) => ({
      chats: state.chats.map((chat) =>
        chat.id === chatId ? { ...chat, lastMessage: message, updatedAt: new Date().toISOString() } : chat
      ).sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()),
    })),

  fetchChats: async () => {
    set({ loading: true, error: null });
    try {
      const response = await api.get("/chats");
      if (!response.data) throw new Error("Failed to fetch chats");
      set({ chats: response.data as Chat[], loading: false });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : "Unknown error",
        loading: false,
      });
    }
  },

  createChat: async (participantIds, isGroup, groupName) => {
    set({ error: null });
    try {
      const response = await api.post("/chats/create/chat", { participantIds, isGroup, groupName });
      if (!response.data) throw new Error("Failed to create chat");
      const newChat: Chat = response.data;
      set((state) => {
        if (state.chats.some((c) => c.id === newChat.id)) return { chats: state.chats };
        return { chats: [...state.chats, newChat] };
      });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : "Unknown error",
        loading: false,
      });
    }
  },

  deleteChat: async (chatId) => {
    set({ error: null });
    try {
      const deleteRequest = await api.delete(`/chats/delete/${chatId}`);
      if (deleteRequest.status !== 200) throw new Error("Failed to delete chat");
      set((state) => ({
        chats: state.chats.filter((chat) => chat.id !== chatId),
      }));
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  },
}));

export default useChatStore;
